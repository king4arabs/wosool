<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    public function csrf(Request $request): JsonResponse
    {
        if ($request->hasSession()) {
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => __('messages.auth.csrf_initialized'),
        ]);
    }

    /**
     * Authenticate user and start a session.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => [__('messages.auth.invalid_credentials')],
            ]);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $user = Auth::user();

        return response()->json([
            'message' => __('messages.auth.login_success'),
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'invite_token' => 'nullable|string|max:150',
        ]);

        $inviteToken = trim((string) $request->input('invite_token', ''));

        $application = Application::query()
            ->whereRaw('LOWER(email) = ?', [strtolower($request->input('email'))])
            ->latest('id')
            ->first();

        if (! $application || $application->status !== 'approved') {
            throw ValidationException::withMessages([
                'email' => [__('messages.auth.email_not_approved')],
            ]);
        }

        if ($inviteToken !== '') {
            if (! hash_equals((string) ($application->invite_token ?? ''), $inviteToken)) {
                throw ValidationException::withMessages([
                    'invite_token' => [__('messages.auth.invalid_invite_token')],
                ]);
            }
        }

        $passwordHash = Hash::make($request->input('password'));

        $payload = [
            'email' => $request->input('email'),
        ];

        if (Schema::hasColumn('users', 'name')) {
            $payload['name'] = $request->input('name');
        }
        if (Schema::hasColumn('users', 'role_token')) {
            $payload['role_token'] = 'founder';
        }
        if (Schema::hasColumn('users', 'password_hash')) {
            $payload['password_hash'] = $passwordHash;
        }
        if (Schema::hasColumn('users', 'password')) {
            $payload['password'] = $passwordHash;
        }

        $user = User::create($payload);

        if (method_exists($user, 'assignRole') && ! $user->hasRole('member')) {
            try {
                $user->assignRole('member');
            } catch (Throwable) {
                // Role seeding might not be initialized in some environments.
            }
        }

        if (is_null($application->user_id)) {
            $application->update(['user_id' => $user->id]);
        }

        if ($inviteToken !== '' && ! is_null($application->invite_token)) {
            $application->forceFill(['invite_token' => null])->save();
        }

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'message' => __('messages.auth.account_created'),
            'user' => $this->formatUser($user),
        ], 201);
    }

    /**
     * Log out the authenticated user.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => __('messages.auth.logout_success'),
        ]);
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    /**
     * Format a user for API responses.
     */
    private function formatUser(User $user): array
    {
        $attributes = $user->getAttributes();
        $name = (string) ($attributes['name'] ?? '');
        if ($name === '') {
            $name = (string) strstr($user->email, '@', true) ?: 'Member';
        }

        $roles = method_exists($user, 'getRoleNames')
            ? $user->getRoleNames()->toArray()
            : [];

        $roleToken = (string) ($attributes['role_token'] ?? '');
        $isAdmin = in_array('admin', $roles, true) || $roleToken === 'admin';

        $data = [
            'id' => $user->id,
            'name' => $name,
            'email' => $user->email,
            'role_token' => $roleToken !== '' ? $roleToken : null,
            'is_admin' => $isAdmin,
            'is_accelerator_applicant' => (bool) $user->is_accelerator_applicant,
            'email_verified_at' => array_key_exists('email_verified_at', $attributes)
                ? $user->email_verified_at?->toIso8601String()
                : null,
            'created_at' => $user->created_at?->toIso8601String(),
            'roles' => $roles,
        ];

        return $data;
    }
}
