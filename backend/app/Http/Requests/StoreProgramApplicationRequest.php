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
        ];
    }

    public function messages(): array
    {
        return [
            'motivation.required' => 'Please tell us why you want to join this program.',
            'motivation.min' => 'Please provide at least 20 characters of motivation.',
        ];
    }
}
