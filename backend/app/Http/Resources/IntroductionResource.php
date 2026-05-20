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
                    'legal_name' => $this->sourceFounder->legal_name,
                    'title' => $this->sourceFounder->title,
                ];
            }),
            'target_founder' => $this->whenLoaded('targetFounder', function (): array {
                return [
                    'id' => $this->targetFounder->id,
                    'legal_name' => $this->targetFounder->legal_name,
                    'title' => $this->targetFounder->title,
                ];
            }),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
