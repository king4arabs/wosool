<?php

namespace App\Http\Controllers\Api\Gateway;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\User;
use App\Notifications\VerifyApplicantEmail;
use App\Services\AcceleratorGateway;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;

class AccountController extends Controller
{
    public function register(Request $request)
    {
        abort_unless(AcceleratorGateway::settings()['intake_enabled'] && Program::where('slug', AcceleratorGateway::SLUG)->exists(), 503, 'Applicant registration is not yet available.');
        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate(['name' => 'required|string|max:255', 'email' => 'required|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()], 'consent' => 'accepted']);
        $user = DB::transaction(function () use ($data) {
            $values = ['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password']),
                'is_accelerator_applicant' => true, 'privacy_accepted_at' => now()];
            if (Schema::hasColumn('users', 'password_hash')) {
                $values['password_hash'] = $values['password'];
            }
            $user = User::create($values);
            $user->notify(new VerifyApplicantEmail);

            return $user;
        });
        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json(['message' => 'Account created. Check your email. تم إنشاء الحساب، تحقق من بريدك.', 'user' => $user->only('id', 'name', 'email', 'email_verified_at')], 201);
    }

    public function resend(Request $request)
    {
        if (! $request->user()->hasVerifiedEmail()) {
            $request->user()->notify(new VerifyApplicantEmail);
        }

        return response()->json(['message' => 'Verification email queued. تم طلب إرسال رابط التأكيد.']);
    }

    public function verify(Request $request, string $id, string $hash)
    {
        $user = $request->user();
        abort_unless((string) $user->id === $id && hash_equals(sha1($user->getEmailForVerification()), $hash), 403);
        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified. تم تأكيد البريد الإلكتروني.']);
    }

    public function privacy(Request $request)
    {
        $data = $request->validate(['type' => 'required|in:access,correction,deletion,withdraw_consent', 'message' => 'nullable|string|max:2000']);
        $id = DB::transaction(function () use ($request, $data) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $existing = DB::table('privacy_requests')->where('user_id', $request->user()->id)->where('type', $data['type'])->where('status', 'received')->first();

            return $existing?->id ?? DB::table('privacy_requests')->insertGetId($data + ['user_id' => $request->user()->id, 'status' => 'received', 'created_at' => now(), 'updated_at' => now()]);
        });

        return response()->json(['id' => $id, 'message' => 'Request received for review. تم استلام طلبك للمراجعة.'], 201);
    }
}
