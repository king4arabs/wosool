<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SponsorResource extends JsonResource
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
            'tier' => $this->tier,
            'is_active' => (bool) $this->is_active,
            'contact_name' => $this->when($request->user()?->hasRole('admin'), $this->contact_name),
            'contact_email' => $this->when($request->user()?->hasRole('admin'), $this->contact_email),
            'contract_start' => $this->contract_start?->toDateString(),
            'contract_end' => $this->contract_end?->toDateString(),
            'display_order' => $this->display_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
