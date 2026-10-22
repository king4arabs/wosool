<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'motivation' => 'required|string|min:20|max:2000',
            'relevant_experience' => 'nullable|string|max:2000',
            'cohort_id' => 'nullable|integer|exists:cohorts,id',
            'why_join' => 'nullable|string|max:2000',
            'current_challenge' => 'nullable|string|max:2000',
            'expected_outcome' => 'nullable|string|max:2000',
            'company_stage' => 'nullable|string|max:120',
            'sector' => 'nullable|string|max:120',
            'team_size' => 'nullable|string|max:60',
            'current_traction' => 'nullable|string|max:2000',
            'fundraising_status' => 'nullable|string|max:120',
            'availability_confirmed' => 'nullable|boolean',
            'consent_share_profile' => 'nullable|boolean',
            'attachment_path' => 'nullable|string|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'motivation.required' => 'يرجى توضيح سبب رغبتك في الانضمام.',
            'motivation.min' => 'يرجى كتابة 20 حرفًا على الأقل في حقل الدافع.',
        ];
    }
}
