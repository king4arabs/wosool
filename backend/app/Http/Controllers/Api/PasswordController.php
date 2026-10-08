<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $credentials = $request->validate(['email' => 'required|email|max:255']);
        Password::sendResetLink($credentials);

        // Keep unknown addresses and broker throttling indistinguishable.
        return response()->json(['message' => __('passwords.sent')]);
    }

    public function reset(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'token' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()],
        ]);

        $status = Password::reset($credentials, function (User $user, string $password): void {
            $user->forceFill([
                $user->getAuthPasswordName() => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();

            // Revoke existing database-backed sessions after account recovery.
            if (config('session.driver') === 'database') {
                DB::connection(config('session.connection'))
                    ->table(config('session.table', 'sessions'))
                    ->where('user_id', $user->id)->delete();
            }

            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__('passwords.token')]]);
        }

        return response()->json(['message' => __('passwords.reset')]);
    }
}
