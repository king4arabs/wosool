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
            'category' => ['required', Rule::in(array_keys(\App\Models\ContactMessage::CATEGORIES))],
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:3000',
            'company' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __('messages.validation.contact.name_required'),
            'email.required' => __('messages.validation.contact.email_required'),
            'email.email' => __('messages.validation.contact.email_email'),
            'category.required' => __('messages.validation.contact.category_required'),
            'subject.required' => __('messages.validation.contact.subject_required'),
            'message.required' => __('messages.validation.contact.message_required'),
        ];
    }
}
