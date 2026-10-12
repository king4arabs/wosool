<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $localized = ($this->translations ?? [])[app()->getLocale()] ?? [];
        return [
            'id' => $this->id,
            'source_urls' => $this->source_urls ?? [],
            'source_reviewed_at' => $this->source_reviewed_at?->toDateString(),
            'name' => $localized['name'] ?? $this->name,
            'slug' => $this->slug,
            'description' => $localized['description'] ?? $this->description,
            'logo_url' => $this->logo_url,
            'website' => $this->website,
            'sector' => $localized['sector'] ?? $this->sector,
            'stage' => $this->stage,
            'location' => $localized['location'] ?? $this->location,
            'country_code' => $this->country_code,
            'founded_year' => $this->founded_year,
            'traction' => $this->tractionSignal(),
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

    /** Localized, sourced traction signal imported from the reviewed founder directory. */
    private function tractionSignal(): ?array
    {
        $metrics = $this->metrics_summary;
        if (! is_array($metrics) || empty($metrics['en']) || empty($metrics['source_url'])) {
            return null;
        }

        return [
            'text' => (app()->getLocale() === 'ar' && ! empty($metrics['ar'])) ? $metrics['ar'] : $metrics['en'],
            'source_url' => $metrics['source_url'],
            'reviewed_at' => $metrics['reviewed_at'] ?? null,
        ];
    }
}
