<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attributes = $this->resource->getAttributes();

        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $attributes['email'] ?? null,
            'phone' => $attributes['phone'] ?? null,
            'company_name' => $attributes['company_name'] ?? null,
            'company_website' => $attributes['company_website'] ?? null,
            'sector' => $attributes['sector'] ?? null,
            'stage' => $attributes['stage'] ?? null,
            'location' => $attributes['location'] ?? null,
            'motivation' => $attributes['motivation'] ?? null,
            'what_you_offer' => $attributes['what_you_offer'] ?? null,
            'what_you_need' => $attributes['what_you_need'] ?? null,
            'linkedin_url' => $attributes['linkedin_url'] ?? null,
            'referral_source' => $attributes['referral_source'] ?? null,
            'referrer_name' => $attributes['referrer_name'] ?? null,
            'status' => $this->status,
            'admin_notes' => $attributes['admin_notes'] ?? null,
            'reviewed_at' => isset($attributes['reviewed_at']) && $this->reviewed_at
                ? $this->reviewed_at->toIso8601String()
                : null,
            'reviewer' => $this->whenLoaded('reviewer', fn () => [
                'id' => $this->reviewer?->id,
                'name' => $this->reviewer?->name,
            ]),
            'created_at' => isset($attributes['created_at']) && $this->created_at
                ? $this->created_at->toIso8601String()
                : null,
            'updated_at' => isset($attributes['updated_at']) && $this->updated_at
                ? $this->updated_at->toIso8601String()
                : null,
        ];
    }
}
