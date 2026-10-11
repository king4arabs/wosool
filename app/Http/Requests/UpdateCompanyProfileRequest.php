<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'logo_url' => 'nullable|url|max:500',
            'website' => 'nullable|url|max:255',
            'sector' => 'nullable|string|max:100',
            'stage' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'country_code' => 'nullable|string|size:2',
            'founded_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'team_size' => 'nullable|integer|min:1|max:1000000',
            'is_hiring' => 'nullable|boolean',
            'is_fundraising' => 'nullable|boolean',
            'is_collaborating' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
        ];
    }
}
