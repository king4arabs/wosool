<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendWowRegistrationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Bus, DB, Hash, Log, Schema};
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class WowRegistrationController extends Controller
{
    private const URL = 'https://luma.com/8fccrqkx';

    public function show(Request $request)
    {
        $record = DB::table('wow_event_registrations')->where('user_id', $request->user()->id)->first();
        return $this->response($record);
    }

    /** Create the account and attendee record together; never wait for SMTP. */
    public function signup(Request $request)
    {
        $this->ensureOpen();
        abort_if($request->user(), 409, __('messages.auth.invalid_credentials'));
        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
        $account = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'account_consent' => 'accepted',
        ]);
        $details = $this->details($request);
        if (User::whereRaw('LOWER(email) = ?', [$account['email']])->exists()) {
            throw ValidationException::withMessages(['email' => [__('messages.registration.email_taken')]]);
        }
        [$user, $record] = DB::transaction(function () use ($account, $details) {
            $payload = [
                'name' => $account['name'], 'email' => $account['email'],
                'password' => Hash::make($account['password']),
                'privacy_accepted_at' => now(), 'community_registration_started_at' => now(),
            ];
            if (Schema::hasColumn('users', 'password_hash')) $payload['password_hash'] = $payload['password'];
            $user = User::create($payload);
            return [$user, $this->persist($user, $details)];
        });
        Auth::guard('web')->login($user);
        if ($request->hasSession()) $request->session()->regenerate();

        $this->queueMail($user->id, 'otp');
        $this->queueMail($user->id, 'ticket');
        return $this->response($record, 201);
    }

    public function store(Request $request)
    {
        $this->ensureOpen();
        $details = $this->details($request);
        $user = $request->user();
        $record = DB::transaction(function () use ($user, $details) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            return $this->persist($user, $details);
        });
        if (! $record->ticket_email_sent_at) $this->queueMail($user->id, 'ticket');
        return $this->response($record);
    }

    private function ensureOpen(): void
    {
        abort_if(now()->gte(\Carbon\Carbon::parse('2026-12-12T00:00:00+03:00')), 410, 'Registration is closed.');
    }

    private function details(Request $request): array
    {
        $data = $request->validate([
            'phone' => 'required|string|max:50', 'company' => 'nullable|string|max:255',
            'eo_interest' => 'required|boolean', 'eoa_interest' => 'required|boolean',
            'consent' => 'accepted',
        ]);
        unset($data['consent']);
        $data['company'] = $data['company'] ?? '';
        return $data;
    }

    private function persist(User $user, array $details): object
    {
        $existing = DB::table('wow_event_registrations')->where('user_id', $user->id)->first();
        if ($existing) return $existing;
        $id = DB::table('wow_event_registrations')->insertGetId([
            ...$details, 'user_id' => $user->id, 'consented_at' => now(),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        return DB::table('wow_event_registrations')->where('id', $id)->first();
    }

    private function response(?object $record, int $status = 200)
    {
        return response()->json(['registration' => $record, 'ticket_url' => $record ? self::URL : null], $status)
            ->header('Cache-Control', 'private, no-store');
    }

    private function queueMail(int $userId, string $kind): void
    {
        // Queue only identifiers, never passwords or OTP values. The database queue
        // is the production default; never perform an SMTP call in the request.
        $job = new SendWowRegistrationMail($userId, $kind);
        $connection = (string) config('queue.default', 'database');
        try {
            Bus::dispatch($job->onConnection(in_array($connection, ['sync', 'null', ''], true) ? 'deferred' : $connection));
        } catch (\Throwable) {
            Log::warning('WOW mail queue unavailable.', ['user_id' => $userId, 'kind' => $kind]);
            // A queue outage must not roll back a saved registration. Best-effort
            // delivery after the response; a user can still request another OTP.
            app()->terminating(function () use ($job, $userId, $kind) {
                try { $job->handle(); }
                catch (\Throwable) { Log::warning('Deferred WOW mail unavailable.', ['user_id' => $userId, 'kind' => $kind]); }
            });
        }
    }
}
