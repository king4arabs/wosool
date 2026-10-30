<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFounderProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'display_name' => 'sometimes|required|string|max:255',
            'position' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:5000',
            'location' => 'nullable|string|max:255',
            'country_code' => 'nullable|string|size:2',
            'sector' => 'nullable|string|max:100',
            'stage' => 'nullable|string|max:50',
            'linkedin_url' => 'nullable|url:http,https|max:255',
            'twitter_url' => 'nullable|url:http,https|max:255',
            'website_url' => 'nullable|url:http,https|max:255',
            'needs' => 'nullable|array',
            'needs.*' => 'string|max:255',
            'offers' => 'nullable|array',
            'offers.*' => 'string|max:255',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:100',
            'is_public' => 'nullable|boolean',
            'avatar_url' => ['nullable', 'string', 'max:500', function ($attribute, $value, $fail) {
                $local = preg_match('~^/startup-directory/[a-zA-Z0-9_.-]+$~', $value) || preg_match('~^/storage/founders/avatars/[a-f0-9-]+\.(?:jpg|png|webp)$~', $value);
                $web = filter_var($value, FILTER_VALIDATE_URL) && in_array(parse_url($value, PHP_URL_SCHEME), ['http', 'https'], true);
                if (! $local && ! $web) { $fail(__('messages.validation.founder_profile.avatar_url_format')); }
            }],
        ];
    }

    /**
     * List items are reported as "skills.1"; name the item in words instead of the request key.
     */
    public function messages(): array
    {
        return [
            'skills.*.max' => __('messages.validation.founder_profile.skill_max'),
            'needs.*.max' => __('messages.validation.founder_profile.need_max'),
            'offers.*.max' => __('messages.validation.founder_profile.offer_max'),
            'skills.*.string' => __('messages.validation.founder_profile.item_text'),
            'needs.*.string' => __('messages.validation.founder_profile.item_text'),
            'offers.*.string' => __('messages.validation.founder_profile.item_text'),
        ];
    }
}
