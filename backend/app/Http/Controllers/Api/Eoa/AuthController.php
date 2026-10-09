<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\EoaVerifyEmail;
use App\Services\Eoa\ProgramService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->merge(['email' => mb_strtolower(trim((string) $request->email))]);
        $data = $request->validate([
            'name' => 'required|string|max:255', 'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()],
            'privacy_consent' => 'required|accepted', 'website_confirm' => 'nullable|max:0',
        ]);
        abort_unless(ProgramService::collectionReady(), 503, 'Account registration awaits approval of the local data notice / إنشاء الحسابات بانتظار اعتماد إشعار البيانات المحلي.');
        $user = DB::transaction(function () use ($data) {
            $payload = [
                'name' => $data['name'], 'email' => $data['email'],
                'password' => $data['password'],
            ];
            if (Schema::hasColumn('users', 'password_hash')) {
                $payload['password_hash'] = $data['password'];
            }
            $user = User::create($payload);
            $user->assignRole(Role::findOrCreate('eoa_applicant', 'web'));
            $user->notify((new EoaVerifyEmail)->afterCommit());

            return $user;
        });
        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json(['message' => 'Account created. Verify your email before applying.', 'email_queued' => ProgramService::mailConfigured()], 201);
    }

    public function resend(Request $request)
    {
        if (! $request->user()->hasVerifiedEmail()) {
            $request->user()->notify(new EoaVerifyEmail);
        }

        return response()->json(['email_queued' => ProgramService::mailConfigured()]);
    }

    public function verify(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);
        abort_unless(hash_equals(sha1($user->getEmailForVerification()), $hash), 403);
        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->away(rtrim(config('app.frontend_url'), '/').'/EOA/account?verified=1');
    }
}
