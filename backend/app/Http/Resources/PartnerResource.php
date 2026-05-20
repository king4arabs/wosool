<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
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
            'type' => $this->type,
            'status' => $this->status,
            'sector' => $this->sector,
            'contact_name' => $this->when($request->user()?->hasRole('admin'), $this->contact_name),
            'contact_email' => $this->when($request->user()?->hasRole('admin'), $this->contact_email),
            'is_public' => (bool) $this->is_public,
            'display_order' => $this->display_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
