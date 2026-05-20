<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'location' => $this->location,
            'type' => $this->type,
            'format' => $this->format,
            'virtual_link' => $this->virtual_link,
            'image_url' => $this->image_url,
            'max_attendees' => $this->max_attendees,
            'is_public' => (bool) $this->is_public,
            'requires_rsvp' => (bool) $this->requires_rsvp,
            'status' => $this->status,
            'tags' => $this->tags ?? [],
            'rsvp_count' => $this->whenCounted('attendees'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
