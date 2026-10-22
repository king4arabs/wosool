<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntroductionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'routing_status' => $this->routing_status,
            'payload_context_brief' => $this->payload_context_brief,
            'tracking_notes' => $this->tracking_notes,
            'source_founder_id' => $this->source_founder_id,
            'target_founder_id' => $this->target_founder_id,
            'source_founder' => $this->whenLoaded('sourceFounder', function (): array {
                return [
                    'id' => $this->sourceFounder->id,
                    'legal_name' => $this->founderName($this->sourceFounder),
                    'title' => $this->founderAttr($this->sourceFounder, ['title', 'tagline']),
                    'slug' => $this->founderAttr($this->sourceFounder, ['slug']),
                ];
            }),
            'target_founder' => $this->whenLoaded('targetFounder', function (): array {
                return [
                    'id' => $this->targetFounder->id,
                    'legal_name' => $this->founderName($this->targetFounder),
                    'title' => $this->founderAttr($this->targetFounder, ['title', 'tagline']),
                    'slug' => $this->founderAttr($this->targetFounder, ['slug']),
                ];
            }),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    private function founderAttr(object $founder, array $keys, mixed $default = null): mixed
    {
        if (! method_exists($founder, 'getAttributes')) {
            return $default;
        }

        $attributes = $founder->getAttributes();
        foreach ($keys as $key) {
            if (filled($attributes[$key] ?? null)) {
                return $attributes[$key];
            }
        }

        return $default;
    }

    /** Human name for a founder: legal → display → account name → slug. */
    private function founderName(object $founder): ?string
    {
        $name = $this->founderAttr($founder, ['legal_name', 'display_name']);
        if (filled($name)) {
            return (string) $name;
        }
        if (method_exists($founder, 'relationLoaded') && $founder->relationLoaded('user') && $founder->user) {
            return $founder->user->name;
        }

        return $this->founderAttr($founder, ['slug']);
    }
}
