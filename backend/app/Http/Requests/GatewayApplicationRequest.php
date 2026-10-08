<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GatewayApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasVerifiedEmail() ?? false;
    }

    public static function payloadRules(bool $submit = false): array
    {
        $required = $submit ? 'required' : 'nullable';

        return [
            'founder_role' => [$required, 'string', 'max:120'],
            'founder_bio' => [$required, 'string', 'max:2000'],
            'city' => [$required, 'string', 'max:120'],
            'company_name' => [$required, 'string', 'max:255'],
            'company_description' => [$required, 'string', 'max:3000'],
            'company_website' => ['nullable', 'url:https', 'max:255'],
            'sector' => [$required, 'string', 'max:120'],
            'company_stage' => [$required, 'in:pre-seed,seed,series-a,growth,established'],
            'team_size' => [$required, 'integer', 'min:1', 'max:1000000'],
            'annual_revenue_usd' => [$required, 'numeric', 'min:0', 'max:999999999999'],
            'private_funding_usd' => ['nullable', 'numeric', 'min:0', 'max:999999999999'],
            'venture_backed' => ['sometimes', 'boolean'],
            'is_owner' => [$submit ? 'accepted' : 'boolean'],
            'is_operating' => [$submit ? 'accepted' : 'boolean'],
            'motivation' => [$required, 'string', 'max:4000'],
            'current_challenge' => [$required, 'string', 'max:3000'],
            'expected_outcome' => [$required, 'string', 'max:3000'],
            'availability_confirmed' => [$submit ? 'accepted' : 'boolean'],
            'consent' => [$submit ? 'accepted' : 'boolean'],
        ];
    }

    public function rules(): array
    {
        $rules = ['revision' => ['required', 'integer', 'min:0'], 'payload' => ['required', 'array:'.implode(',', array_keys(self::payloadRules()))]];
        foreach (self::payloadRules() as $key => $value) {
            $rules['payload.'.$key] = $value;
        }

        return $rules;
    }
}
