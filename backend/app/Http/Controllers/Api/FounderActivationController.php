<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FounderProfile;
use App\Models\User;
use App\Services\FounderInvitationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class FounderActivationController extends Controller
{
    public function preview(Request $request, FounderInvitationService $service)
    {
        $data = $request->validate(['token' => ['required', 'string', 'size:64']]);
        $invite = $service->resolve($data['token']);
        $founder = $invite->founder;
        abort_unless($founder && $founder->user_id === null && $founder->status === 'active', 409, 'This profile is unavailable for activation.');
        [$local, $domain] = explode('@', $invite->email);
        return response()->json(['data' => [
            'name' => $founder->display_name, 'slug' => $founder->slug,
            'email_hint' => mb_substr($local, 0, 1).'***@'.$domain,
            'existing_account' => User::whereRaw('LOWER(email) = ?', [$invite->email])->exists(),
            'expires_at' => $invite->expires_at->toIso8601String(),
        ]])->header('Cache-Control', 'no-store');
    }

    public function activate(Request $request, FounderInvitationService $service)
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'size:64'], 'password' => ['required', 'string', 'max:128'],
            'code' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'privacy_accepted' => ['accepted'],
        ]);
        $founder = DB::transaction(function () use ($data, $request, $service) {
            $initial = $service->resolve($data['token']);
            $founder = FounderProfile::lockForUpdate()->findOrFail($initial->founder_profile_id);
            $invite = $service->resolve($data['token'], true);
            abort_if($founder->user_id !== null || $founder->status !== 'active', 409, 'This profile is unavailable for activation.');
            if ($invite->otp_attempts >= 5 || ! $invite->otp_hash ||
                ! hash_equals($invite->otp_hash, hash_hmac('sha256', $data['code'], config('app.key')))) {
                if ($invite->otp_attempts < 5) {
                    $invite->increment('otp_attempts');
                }
                return null;
            }
            $user = User::whereRaw('LOWER(email) = ?', [$invite->email])->lockForUpdate()->first();
            if ($user) {
                if (! Hash::check($data['password'], $user->getAuthPassword())) {
                    throw ValidationException::withMessages(['password' => ['Enter the current password for the invited account. You can reset it on the sign-in page.']]);
                }
                abort_if($user->founderProfile()->exists(), 409, 'This account already owns a founder profile. Contact Wosool to review ownership.');
            } else {
                $request->validate(['password' => ['confirmed', Password::min(12)->mixedCase()->numbers()]]);
                $payload = ['name' => $founder->display_name, 'email' => $invite->email];
                foreach (['password', 'password_hash'] as $field) {
                    if (Schema::hasColumn('users', $field)) { $payload[$field] = $data['password']; }
                }
                if (Schema::hasColumn('users', 'role_token')) { $payload['role_token'] = 'founder'; }
                $user = User::create($payload);
            }
            $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now(), 'privacy_accepted_at' => now(),
                'community_registration_started_at' => $user->community_registration_started_at ?? now()])->save();
            $invite->update(['status' => 'accepted', 'accepted_at' => now()]);
            $founder->invitations()->where('id', '!=', $invite->id)->whereIn('status', ['sent', 'pending'])->update(['status' => 'revoked']);
            app(\App\Services\FounderIdentityService::class)->refresh($user);
            return $founder;
        });
        if (! $founder) {
            throw ValidationException::withMessages(['code' => ['Invalid activation code or too many attempts. Ask Wosool for a new invitation if needed.']]);
        }
        return response()->json(['message' => 'Email verified. Sign in and complete your details for administrator verification.', 'data' => ['slug' => $founder->slug, 'next' => '/onboarding', 'admin_verification' => 'pending']])->header('Cache-Control', 'no-store');
    }
}
