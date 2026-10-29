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
use Spatie\Permission\Models\Role;
use Throwable;
use App\Services\{MembershipRegistration, RegistrationOtp};
use Illuminate\Support\Facades\DB;

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

        if (! Auth::guard('web')->attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => [__('messages.auth.invalid_credentials')],
            ]);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $user = Auth::guard('web')->user();
        app(MembershipRegistration::class)->linkVerifiedApplications($user);

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
        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate([
            'name' => 'required|string|max:255', 'email' => 'required|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'invite_token' => 'nullable|string|max:150', 'consent' => 'accepted',
        ]);
        if (User::whereRaw('LOWER(email) = ?', [$data['email']])->exists()) throw ValidationException::withMessages(['email' => [__('messages.registration.email_taken')]]);
        if (! empty($data['invite_token'])) {
            $application = Application::whereRaw('LOWER(email) = ?', [$data['email']])->where('status', 'approved')->latest('id')->first();
            if (! $application?->invite_token || ! hash_equals($application->invite_token, $data['invite_token'])) throw ValidationException::withMessages(['invite_token' => [__('messages.auth.invalid_invite_token')]]);
        }
        $user = DB::transaction(function () use ($data) {
            $payload = ['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password']), 'privacy_accepted_at' => now(), 'community_registration_started_at' => now()];
            if (Schema::hasColumn('users', 'password_hash')) $payload['password_hash'] = $payload['password'];
            $user = User::create($payload);
            app(RegistrationOtp::class)->send($user);
            return $user;
        });
        Auth::login($user);
        if ($request->hasSession()) $request->session()->regenerate();
        return response()->json(['message' => __('messages.registration.code_sent'), 'user' => $this->formatUser($user)], 201);
    }

    public function verifyRegistration(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'regex:/^[0-9]{6}$/']]);
        app(RegistrationOtp::class)->verify($request->user(), $data['code']);
        $user = $request->user()->fresh();
        app(MembershipRegistration::class)->linkVerifiedApplications($user);
        if ($request->hasSession()) $request->session()->regenerate();
        return response()->json(['message' => __('messages.registration.email_verified'), 'user' => $this->formatUser($user)]);
    }

    public function resendRegistration(Request $request): JsonResponse
    {
        app(RegistrationOtp::class)->send($request->user());
        return response()->json(['message' => __('messages.registration.code_resent')]);
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
            'registration_step' => MembershipRegistration::state($user),
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
