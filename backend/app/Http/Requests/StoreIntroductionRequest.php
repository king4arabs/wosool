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

        // Approved community members (or admins) with an active founder profile may request
        // introductions; each request is still reviewed by the target founder before connecting.
        if (! $user->hasAnyRole(['member', 'admin']) && ! in_array($user->roleToken(), ['founder', 'admin'], true)) {
            return false;
        }

        $founderProfile = $user->founderProfile;

        return $founderProfile instanceof FounderProfile
            && ($founderProfile->communityActive() || $founderProfile->vetted_status === true);
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
            'target_founder_id.required' => __('messages.validation.introduction.target_required'),
            'target_founder_id.exists' => __('messages.validation.introduction.target_exists'),
            'payload_context_brief.required' => __('messages.validation.introduction.brief_required'),
            'payload_context_brief.min' => __('messages.validation.introduction.brief_min'),
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
                    'Only approved members with an active founder profile can request introductions.',
                ],
            ],
        ], 403));
    }
}
