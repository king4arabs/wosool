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

        $localized = ($this->translations ?? [])[app()->getLocale()] ?? [];
        // Public founder/company directory APIs must not expose private member fields.
        // Member and admin endpoints retain their authorized full resource.
        $publicCompanyDirectory = (bool) preg_match('#^(?:api/)?v1/companies(?:/|$)#', $request->decodedPath());
        $publicDirectory = $publicCompanyDirectory
            || (bool) preg_match('#^(?:api/)?v1/founders(?:/|$)#', $request->decodedPath());
        $publicName = $this->display_name ?? $this->user?->name ?? $this->slug;

        return [
            'id' => $this->id,
            'position' => $localized['position'] ?? $this->position ?? (isset($this->pivot) ? $this->pivot->role : null),
            'slug' => $this->slug,
            'display_name' => $this->display_name ?? $this->user?->name,
            'legal_name' => $publicDirectory ? $publicName : ($this->legal_name ?? $publicName),
            'skills_tags' => $publicDirectory ? [] : ($this->skills_tags ?? $this->skills ?? []),
            'skills' => $publicDirectory ? [] : ($this->skills ?? []),
            'tagline' => $localized['tagline'] ?? $this->tagline,
            'bio' => $localized['bio'] ?? $this->bio,
            'location' => $localized['location'] ?? $this->location,
            'country_code' => $this->country_code,
            'sector' => $localized['sector'] ?? $this->sector,
            'stage' => $this->stage,
            'linkedin_url' => $publicDirectory ? null : $this->linkedin_url,
            'twitter_url' => $publicDirectory ? null : $this->twitter_url,
            'website_url' => $this->website_url,
            'needs' => $publicDirectory ? [] : ($this->needs ?? []),
            'offers' => $publicDirectory ? [] : ($this->offers ?? []),
            'is_verified' => (bool) $this->is_verified,
            'is_featured' => (bool) $this->is_featured,
            'is_public' => (bool) $this->is_public,
            'status' => $this->status,
            'avatar_url' => $this->avatar_url,
            'name' => $localized['name'] ?? $this->display_name ?? $this->user?->name,
            'activation_status' => $this->communityActive() ? 'active' : ($this->status === 'suspended' ? 'suspended' : 'unclaimed'),
            'can_communicate' => $this->communityActive(),
            'community_engagement_score' => \App\Support\CommunityEngagement::score($this->resource),
            'source_urls' => $this->source_urls ?? [],
            'source_reviewed_at' => $this->source_reviewed_at?->toDateString(),
            'claimed_at' => $publicDirectory ? null : $this->claimed_at?->toIso8601String(),
            'outreach' => $this->when($request->user()?->hasRole('admin') && ! $publicDirectory && $this->relationLoaded('outreach'), fn () => $this->outreach?->adminData()),
            'invitation' => $this->when($request->user()?->hasRole('admin') && $this->relationLoaded('latestInvitation'), function () {
                $invite = $this->latestInvitation;
                return $invite ? ['status' => $invite->status === 'sent' && $invite->expires_at->isPast() ? 'expired' : $invite->status, 'email' => $invite->email, 'sent_at' => $invite->sent_at?->toIso8601String(), 'expires_at' => $invite->expires_at->toIso8601String()] : null;
            }),
            'user' => $this->whenLoaded('user', fn () => $publicDirectory ? null : [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $request->user()?->hasRole('admin') ? $this->user?->email : null,
            ]),
            'primary_company_name' => $primaryCompany?->name,
            'companies' => CompanyResource::collection($this->whenLoaded('companies')),
            'scorecard' => $this->when(! $publicCompanyDirectory, $publicDirectory ? null : new ScorecardResource($this->whenLoaded('scorecard'))),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
