<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'company_name' => 'required|string|max:255',
            'company_website' => 'nullable|url|max:255',
            'sector' => 'required|string|max:100',
            'stage' => ['required', Rule::in(['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Scale-up', 'Exited'])],
            'location' => 'required|string|max:255',
            'motivation' => 'required|string|max:2000',
            'what_you_offer' => 'nullable|string|max:1000',
            'what_you_need' => 'nullable|string|max:1000',
            'linkedin_url' => 'nullable|url|max:255',
            'referral_source' => 'nullable|string|max:255',
            'referrer_name' => 'nullable|string|max:255',
            'bot_field' => 'nullable|string|max:0',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => __('messages.validation.application.full_name_required'),
            'email.required' => __('messages.validation.application.email_required'),
            'email.email' => __('messages.validation.application.email_email'),
            'phone.required' => __('messages.validation.application.phone_required'),
            'company_name.required' => __('messages.validation.application.company_name_required'),
            'sector.required' => __('messages.validation.application.sector_required'),
            'stage.required' => __('messages.validation.application.stage_required'),
            'location.required' => __('messages.validation.application.location_required'),
            'motivation.required' => __('messages.validation.application.motivation_required'),
        ];
    }
}
