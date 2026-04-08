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
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Please enter your full name.',
            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'phone.required' => 'Please enter your phone number.',
            'company_name.required' => 'Please enter your company name.',
            'sector.required' => 'Please select your sector.',
            'stage.required' => 'Please select your company stage.',
            'location.required' => 'Please enter your location.',
            'motivation.required' => 'Please tell us why you want to join Wosool.',
        ];
    }
}
