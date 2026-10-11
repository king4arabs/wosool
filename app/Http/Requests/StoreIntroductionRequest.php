<?php

namespace App\Http\Requests;

use App\Models\FounderProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreIntroductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        if ($user->role_token !== 'founder') {
            return false;
        }

        $founderProfile = $user->founderProfile;

        return $founderProfile instanceof FounderProfile
            && $founderProfile->vetted_status === true;
    }

    public function rules(): array
    {
        return [
            'target_founder_id' => [
                'required',
                'integer',
                'different:source_founder_id',
                Rule::exists('founder_profiles', 'id'),
            ],
            'payload_context_brief' => [
                'required',
                'string',
                'min:20',
                'max:4000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'target_founder_id.required' => 'A target founder is required to create an introduction route.',
            'target_founder_id.exists' => 'The selected target founder does not exist.',
            'payload_context_brief.required' => 'A context brief is required.',
            'payload_context_brief.min' => 'The context brief must be at least 20 characters.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'source_founder_id' => $this->user()?->founderProfile?->id,
        ]);
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'You are not authorized to create introduction routes.',
            'errors' => [
                'authorization' => [
                    'Only vetted founders can create introduction routes.',
                ],
            ],
        ], 403));
    }
}
