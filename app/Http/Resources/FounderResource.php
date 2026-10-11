<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FounderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primaryCompany = $this->relationLoaded('companies')
            ? ($this->companies->first(fn ($company) => (bool) $company->pivot->is_primary) ?? $this->companies->first())
            : null;

        return [
            'id' => $this->id,
            'position' => isset($this->pivot) ? $this->pivot->role : null,
            'slug' => $this->slug,
            'tagline' => $this->tagline,
            'bio' => $this->bio,
            'location' => $this->location,
            'country_code' => $this->country_code,
            'sector' => $this->sector,
            'stage' => $this->stage,
            'linkedin_url' => $this->linkedin_url,
            'twitter_url' => $this->twitter_url,
            'website_url' => $this->website_url,
            'needs' => $this->needs ?? [],
            'offers' => $this->offers ?? [],
            'skills' => $this->skills ?? [],
            'is_verified' => (bool) $this->is_verified,
            'is_featured' => (bool) $this->is_featured,
            'is_public' => (bool) $this->is_public,
            'status' => $this->status,
            'avatar_url' => $this->avatar_url,
            'name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $request->user()?->hasRole('admin') ? $this->user?->email : null,
            ]),
            'primary_company_name' => $primaryCompany?->name,
            'companies' => CompanyResource::collection($this->whenLoaded('companies')),
            'scorecard' => new ScorecardResource($this->whenLoaded('scorecard')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
