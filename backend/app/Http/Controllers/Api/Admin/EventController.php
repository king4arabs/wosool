<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\Event;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->withCount(['attendees as rsvp_count']);

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($format = $request->input('format')) {
            $query->where('format', $format);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $events = $query->orderBy('starts_at')->get();

        return response()->json([
            'data' => $events,
            'meta' => [
                'total' => $events->count(),
                'upcoming' => $events->where('status', 'upcoming')->count(),
                'in_person' => $events->where('format', 'in-person')->count(),
                'virtual' => $events->where('format', 'virtual')->count(),
                'total_rsvps' => $events->sum('rsvp_count'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['title'], 'event', Event::class);
        $data['created_by'] = $request->user()->id;

        $event = Event::create($data);

        AdminAction::log($request->user()->id, 'event.created', 'event', $event->id, $event->title, null, $event->toArray());

        return response()->json([
            'message' => 'Event created.',
            'data' => $event,
        ], 201);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $this->validated($request, $event);
        $beforeState = $event->toArray();

        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'event', Event::class, $event->id)
            : $event->slug;

        $event->update($data);

        AdminAction::log($request->user()->id, 'event.updated', 'event', $event->id, $event->title, $beforeState, $event->fresh()->toArray());

        return response()->json([
            'message' => 'Event updated.',
            'data' => $event->fresh(),
        ]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $beforeState = $event->toArray();
        $event->delete();

        AdminAction::log($request->user()->id, 'event.deleted', 'event', $event->id, $event->title, $beforeState, null);

        return response()->json(['message' => 'Event deleted.']);
    }

    private function validated(Request $request, ?Event $event = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('events', 'slug')->ignore($event?->id)],
            'description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'location' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'format' => ['required', Rule::in(['virtual', 'in-person'])],
            'virtual_link' => ['nullable', 'url', 'max:255'],
            'image_url' => ['nullable', 'url', 'max:255'],
            'max_attendees' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'is_public' => ['sometimes', 'boolean'],
            'requires_rsvp' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(['draft', 'upcoming', 'live', 'completed', 'cancelled'])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);
    }
}
