<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'category' => ['required', Rule::in([
                'general', 'partnerships', 'sponsorship',
                'founder-support', 'media', 'office-hours',
            ])],
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:3000',
            'company' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'category.required' => 'Please select a category.',
            'subject.required' => 'Please enter a subject.',
            'message.required' => 'Please enter your message.',
        ];
    }
}
