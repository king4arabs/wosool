<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class ProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attributes = method_exists($this->resource, 'getAttributes') ? $this->resource->getAttributes() : [];
        $get = function (string $key, mixed $fallback = null) use ($attributes) {
            if (! array_key_exists($key, $attributes)) {
                return $fallback;
            }
            return $this->resource->{$key} ?? $fallback;
        };

        $startsAt = $get('starts_at');
        $endsAt = $get('ends_at');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'title' => $get('title', $this->name),
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $get('short_description', $this->description),
            'full_description' => $get('full_description', $this->description),
            'program_type' => $get('program_type', $this->category),
            'category' => $this->category,
            'duration' => $this->duration,
            'format' => $get('format', 'cohort-based'),
            'language' => $get('language', 'ar'),
            'city_region' => $get('city_region'),
            'target_stages' => $this->target_stages ?? [],
            'cohort_size' => $this->cohort_size,
            'capacity' => $get('capacity', $this->cohort_size),
            'benefits' => $this->benefits ?? [],
            'tags' => $get('tags', []),
            'is_open' => (bool) $this->is_open,
            'visibility' => $get('visibility', 'members_only'),
            'status_flow' => $get('status_flow', $this->is_open ? 'applications_open' : 'draft'),
            'application_deadline' => $this->application_deadline?->toIso8601String(),
            'starts_at' => $startsAt ? (is_string($startsAt) ? Carbon::parse($startsAt)->toIso8601String() : $startsAt->toIso8601String()) : null,
            'ends_at' => $endsAt ? (is_string($endsAt) ? Carbon::parse($endsAt)->toIso8601String() : $endsAt->toIso8601String()) : null,
            'cover_image_url' => $get('cover_image_url'),
            'objective' => $get('objective'),
            'who_it_is_for' => $get('who_it_is_for'),
            'expected_outcomes' => $get('expected_outcomes'),
            'eligibility_criteria' => $get('eligibility_criteria', []),
            'application_process' => $get('application_process', []),
            'faqs' => $get('faqs', []),
            'targeting_rules' => $get('targeting_rules', []),
            'ai_settings' => $get('ai_settings', []),
            'settings' => $get('settings', []),
            'cohorts_count' => $this->whenCounted('cohorts'),
            'applications_count' => $this->whenCounted('applications'),
            'cohorts' => $this->whenLoaded('cohorts', fn () => $this->cohorts->map(fn ($cohort) => [
                'id' => $cohort->id,
                'name' => $cohort->name,
                'code' => $cohort->code ?? null,
                'status' => $cohort->status,
                'starts_at' => $cohort->starts_at?->toIso8601String(),
                'ends_at' => $cohort->ends_at?->toIso8601String(),
                'capacity' => $cohort->capacity ?? null,
                'city_region' => $cohort->city_region ?? null,
                'format' => $cohort->format ?? null,
            ])),
            'sessions' => $this->whenLoaded('sessions', fn () => $this->sessions->map(fn ($session) => [
                'id' => $session->id,
                'title' => $session->title,
                'description' => $session->description,
                'session_type' => $session->session_type,
                'starts_at' => $session->starts_at?->toIso8601String(),
                'duration_minutes' => $session->duration_minutes,
                'location' => $session->location,
                'online_link' => $session->online_link,
                'is_required' => (bool) $session->is_required,
                'attendance_required' => (bool) $session->attendance_required,
                'recording_link' => $session->recording_link,
            ])),
            'resources' => $this->whenLoaded('resources', fn () => $this->resources->map(fn ($resource) => [
                'id' => $resource->id,
                'title' => $resource->title,
                'resource_type' => $resource->resource_type,
                'category' => $resource->category,
                'url' => $resource->url,
                'file_path' => $resource->file_path,
                'description' => $resource->description,
                'visibility' => $resource->visibility,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
