<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => $this->settingsPayload(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'general.site_name' => ['required', 'string', 'max:255'],
            'general.site_url' => ['required', 'url', 'max:255'],
            'general.site_description' => ['nullable', 'string'],
            'general.timezone' => ['required', 'string', 'max:100'],
            'general.default_language' => ['required', 'string', 'max:20'],
            'general.maintenance_mode' => ['required', 'boolean'],
            'general.registration_open' => ['required', 'boolean'],
            'email.from_name' => ['required', 'string', 'max:255'],
            'email.from_email' => ['required', 'email', 'max:255'],
            'email.reply_to' => ['nullable', 'email', 'max:255'],
            'email.smtp_host' => ['nullable', 'string', 'max:255'],
            'email.notifications' => ['required', 'array'],
            'security.require_2fa' => ['required', 'boolean'],
            'security.session_timeout_minutes' => ['required', 'integer', 'min:5', 'max:1440'],
            'security.password_policy' => ['required', 'string', 'max:255'],
            'security.api_rate_limit' => ['required', 'integer', 'min:1', 'max:100000'],
        ]);

        $before = $this->settingsPayload();

        foreach ($data as $group => $value) {
            Setting::updateOrCreate(
                ['key' => $group],
                ['group' => $group, 'value' => $value]
            );
        }

        $after = $this->settingsPayload();

        AdminAction::log(
            $request->user()->id,
            'settings.updated',
            'settings',
            0,
            'Platform settings updated',
            $before,
            $after
        );

        return response()->json([
            'message' => 'Settings updated.',
            'data' => $after,
        ]);
    }

    private function settingsPayload(): array
    {
        $stored = Setting::query()->get()->mapWithKeys(fn (Setting $setting) => [
            $setting->key => $setting->value,
        ])->all();

        return array_replace_recursive([
            'general' => [
                'site_name' => 'Wosool',
                'site_url' => 'https://wosool.org',
                'site_description' => 'The premier founder community for the GCC startup ecosystem.',
                'timezone' => 'Asia/Riyadh',
                'default_language' => 'en',
                'maintenance_mode' => false,
                'registration_open' => true,
            ],
            'email' => [
                'from_name' => 'Wosool',
                'from_email' => 'hello@wosool.org',
                'reply_to' => 'support@wosool.org',
                'smtp_host' => 'smtp.resend.com',
                'notifications' => [
                    'new_application' => true,
                    'application_status_changed' => true,
                    'new_event_rsvp' => false,
                    'weekly_digest' => true,
                    'sponsor_contract_expiring' => true,
                ],
            ],
            'security' => [
                'require_2fa' => true,
                'session_timeout_minutes' => 30,
                'password_policy' => 'Minimum 12 characters, mixed case, numbers, and symbols.',
                'api_rate_limit' => 100,
            ],
        ], $stored);
    }
}
