<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
        $data = $request->validate([
            'account.name' => ['required', 'string', 'max:255'],
            'account.email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'account.current_password' => ['nullable', 'string', 'required_with:account.new_password'],
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
        ]);

        if (! empty($data['account']['new_password'])) {
            $current = (string) ($data['account']['current_password'] ?? '');
            if (! Hash::check($current, $user->getAuthPassword())) {
                return response()->json([
                    'message' => 'The current password is incorrect.',
                    'errors' => ['account.current_password' => ['The current password is incorrect.']],
                ], 422);
            }
        }

        $user->name = $data['account']['name'];
        $user->email = $data['account']['email'];
        if (! empty($data['account']['new_password'])) {
            $passwordField = $user->getAuthPasswordName();
            $user->{$passwordField} = $data['account']['new_password'];
        }
        $user->save();

        $settings = UserSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'privacy' => $data['privacy'],
                'notifications' => $data['notifications'],
                'visibility' => $data['visibility'],
            ]
        );

        return response()->json([
            'message' => 'Settings updated.',
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

