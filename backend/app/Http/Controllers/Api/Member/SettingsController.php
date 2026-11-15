<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use App\Models\{FounderIdentityReview, FounderProfile, User};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\{Rule, ValidationException};
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $settings = UserSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            UserSetting::defaults()
        );

        return response()->json([
            'data' => $this->payload($request, $settings),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $accountInput = (array) $request->input('account', []);
        $email = mb_strtolower(trim((string) ($accountInput['email'] ?? '')));
        $request->merge(['account' => array_replace($accountInput, ['email' => $email])]);
        $emailChanging = $email !== mb_strtolower(trim($user->email));
        $data = $request->validate([
            'account.name' => ['required', 'string', 'max:255'],
            'account.email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'account.current_password' => ['nullable', 'string', 'required_with:account.new_password', Rule::requiredIf($emailChanging)],
            'account.new_password' => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'privacy.profile_visibility' => ['required', 'boolean'],
            'privacy.show_founder_score' => ['required', 'boolean'],
            'privacy.activity_visibility' => ['required', 'boolean'],
            'privacy.appear_in_directory' => ['required', 'boolean'],
            'notifications.new_match_suggestions' => ['required', 'boolean'],
            'notifications.direct_messages' => ['required', 'boolean'],
            'notifications.event_reminders' => ['required', 'boolean'],
            'notifications.program_updates' => ['required', 'boolean'],
            'notifications.community_activity' => ['required', 'boolean'],
            'notifications.weekly_digest' => ['required', 'boolean'],
            'visibility.allow_intro_requests' => ['required', 'boolean'],
            'visibility.show_email_to_matches' => ['required', 'boolean'],
            'visibility.discoverable_for_matching' => ['required', 'boolean'],
        ], [], [
            'account.name' => __('messages.validation.settings.attributes.name'),
            'account.email' => __('messages.validation.settings.attributes.email'),
            'account.current_password' => __('messages.validation.settings.attributes.current_password'),
            'account.new_password' => __('messages.validation.settings.attributes.new_password'),
        ]);

        [$settings, $emailChanged] = DB::transaction(function () use ($request, $user, $data) {
            $user = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $emailChanged = $data['account']['email'] !== mb_strtolower(trim($user->email));
            if (($emailChanged || ! empty($data['account']['new_password']))
                && ! Hash::check((string) ($data['account']['current_password'] ?? ''), $user->getAuthPassword())) {
                throw ValidationException::withMessages(['account.current_password' => [__('messages.validation.settings.current_password_incorrect')]]);
            }
            if (User::where('id', '!=', $user->id)->whereRaw('LOWER(email) = ?', [$data['account']['email']])->exists()) {
                throw ValidationException::withMessages(['account.email' => [__('messages.registration.email_taken')]]);
            }
            $user->name = $data['account']['name'];
            $user->email = $data['account']['email'];
            if ($emailChanged) {
                $user->email_verified_at = null;
                DB::table('registration_email_otps')->where('user_id', $user->id)->delete();
                FounderIdentityReview::where('user_id', $user->id)->whereNull('reviewed_at')->update(['candidates' => '[]']);
                FounderProfile::where('user_id', $user->id)->update(['is_verified' => false, 'vetted_status' => false, 'admin_verified_at' => null, 'admin_verified_by' => null]);
            }
            if (! empty($data['account']['new_password'])) {
                $user->{$user->getAuthPasswordName()} = $data['account']['new_password'];
            }
            $user->save();
            $request->setUserResolver(fn () => $user);
            $settings = UserSetting::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'privacy' => $data['privacy'],
                    'notifications' => $data['notifications'],
                    'visibility' => $data['visibility'],
                ]
            );
            return [$settings, $emailChanged];
        }, 3);

        return response()->json([
            'message' => 'Settings updated.',
            'verification_required' => $emailChanged,
            'data' => $this->payload($request, $settings),
        ]);
    }

    private function payload(Request $request, UserSetting $settings): array
    {
        $defaults = UserSetting::defaults();

        return [
            'account' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ],
            'privacy' => array_replace($defaults['privacy'], $settings->privacy ?? []),
            'notifications' => array_replace($defaults['notifications'], $settings->notifications ?? []),
            'visibility' => array_replace($defaults['visibility'], $settings->visibility ?? []),
        ];
    }
}

