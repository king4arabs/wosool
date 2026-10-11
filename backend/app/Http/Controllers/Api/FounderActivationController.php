<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\FounderProfile;
use App\Models\User;
use App\Services\FounderInvitationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

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
            'privacy_accepted' => ['accepted'],
        ]);
        $founder = DB::transaction(function () use ($data, $request, $service) {
            $initial = $service->resolve($data['token']);
            $founder = FounderProfile::lockForUpdate()->findOrFail($initial->founder_profile_id);
            $invite = $service->resolve($data['token'], true);
            abort_if($founder->user_id !== null || $founder->status !== 'active', 409, 'This profile is unavailable for activation.');
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
            $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now(), 'privacy_accepted_at' => now()])->save();
            Role::findOrCreate('member', 'web');
            $user->assignRole('member');
            $founder->update(['user_id' => $user->id, 'claimed_at' => now()]);
            Application::query()->whereRaw('LOWER(email) = ?', [strtolower($user->email)])
                ->where('status', 'approved')->whereNull('user_id')
                ->update(['user_id' => $user->id, 'invite_token' => null]);
            $invite->update(['status' => 'accepted', 'accepted_at' => now()]);
            $founder->invitations()->where('id', '!=', $invite->id)->whereIn('status', ['sent', 'pending'])->update(['status' => 'revoked']);
            return $founder;
        });
        return response()->json(['message' => 'Profile activated. Sign in to manage your profile and connect with the community.', 'data' => ['slug' => $founder->slug]])->header('Cache-Control', 'no-store');
    }
}
