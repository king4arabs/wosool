<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->category,
            'duration' => $this->duration,
            'target_stages' => $this->target_stages ?? [],
            'cohort_size' => $this->cohort_size,
            'benefits' => $this->benefits ?? [],
            'is_open' => (bool) $this->is_open,
            'application_deadline' => $this->application_deadline?->toIso8601String(),
            'cohorts_count' => $this->whenCounted('cohorts'),
            'applications_count' => $this->whenCounted('applications'),
            'cohorts' => $this->whenLoaded('cohorts', fn () => $this->cohorts->map(fn ($cohort) => [
                'id' => $cohort->id,
                'name' => $cohort->name,
                'status' => $cohort->status,
                'starts_at' => $cohort->starts_at?->toIso8601String(),
                'ends_at' => $cohort->ends_at?->toIso8601String(),
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
