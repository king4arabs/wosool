<?php

namespace App\Http\Requests\Eoa;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\Eoa\ProgramService;

class ApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasVerifiedEmail() ?? false;
    }

    public function rules(): array
    {
        return ['version' => 'required|integer|min:0'] + self::fields(false);
    }

    public static function fields(bool $complete): array
    {
        $r = $complete ? 'required' : 'nullable';

        return [
            'preferred_track_id' => [$r, 'integer', Rule::exists('eoa_tracks', 'id')->where('program_id', ProgramService::program()->id)->where('is_active', true)],
            'founder_name' => "$r|string|max:255", 'phone' => "$r|string|max:40",
            'founder_role' => "$r|in:founder,owner,cofounder",
            'company_name' => "$r|string|max:255", 'company_website' => 'nullable|url:https|max:255',
            'city' => "$r|string|max:120", 'country' => "$r|string|max:120",
            'sector' => "$r|string|max:120", 'stage' => "$r|in:operating,growing,scaling",
            'revenue_amount' => "$r|numeric|min:0|max:999999999999.99",
            'revenue_currency' => "$r|in:USD,SAR", 'revenue_year' => "$r|integer|min:2000|max:".now()->year,
            'growth_objectives' => "$r|string|".($complete ? 'min:30|' : '').'max:4000',
            'support_needs' => "$r|string|max:4000",
            'privacy_consent' => $complete ? 'required|accepted' : 'nullable|boolean',
            'accuracy_confirmed' => $complete ? 'required|accepted' : 'nullable|boolean',
            'attendance_commitment' => $complete ? 'required|accepted' : 'nullable|boolean',
            'locale' => 'nullable|in:ar,en',
        ];
    }
}
