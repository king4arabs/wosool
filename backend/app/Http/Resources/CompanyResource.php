<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'website' => $this->website,
            'sector' => $this->sector,
            'stage' => $this->stage,
            'location' => $this->location,
            'country_code' => $this->country_code,
            'founded_year' => $this->founded_year,
            'team_size' => $this->team_size,
            'is_hiring' => (bool) $this->is_hiring,
            'is_fundraising' => (bool) $this->is_fundraising,
            'is_collaborating' => (bool) $this->is_collaborating,
            'is_featured' => (bool) $this->is_featured,
            'is_public' => (bool) $this->is_public,
            'status' => $this->status,
            'founders_count' => $this->whenCounted('founders'),
            'founders' => FounderResource::collection($this->whenLoaded('founders')),
            'pivot' => $this->when(isset($this->pivot), fn () => [
                'role' => $this->pivot?->role ?? null,
                'is_primary' => (bool) ($this->pivot?->is_primary ?? false),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
