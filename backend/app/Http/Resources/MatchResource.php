<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'match_score' => (float) $this->match_score,
            'match_reasons' => $this->match_reasons ?? [],
            'status' => $this->status,
            'is_ai_generated' => (bool) $this->is_ai_generated,
            'founder_a' => new FounderResource($this->whenLoaded('founderA')),
            'founder_b' => new FounderResource($this->whenLoaded('founderB')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
