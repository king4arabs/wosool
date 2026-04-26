<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EventRsvpController extends Controller
{
    /**
     * List the authenticated user's event RSVPs.
     */
    public function index(Request $request): JsonResponse
    {
        $rsvps = $request->user()
            ->eventRsvps()
            ->orderBy('starts_at')
            ->get();

        return response()->json(['data' => $rsvps]);
    }

    /**
     * RSVP to an event.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if (! $event->is_public) {
            throw ValidationException::withMessages([
                'event' => ['This event is not open for public RSVP.'],
            ]);
        }

        if (! $event->requires_rsvp) {
            throw ValidationException::withMessages([
                'event' => ['This event does not require RSVP.'],
            ]);
        }

        if (in_array($event->status, ['completed', 'cancelled'], true)) {
            throw ValidationException::withMessages([
                'event' => ['This event is no longer accepting RSVPs.'],
            ]);
        }

        $existing = $event->attendees()->where('users.id', $user->id)->first();

        if ($existing && $existing->pivot->status !== 'cancelled') {
            return response()->json([
                'message' => 'You are already registered for this event.',
                'status' => $existing->pivot->status,
            ]);
        }

        $status = 'confirmed';
        if ($event->max_attendees) {
            $confirmedCount = $event->attendees()->wherePivot('status', 'confirmed')->count();
            if ($confirmedCount >= $event->max_attendees) {
                $status = 'waitlisted';
            }
        }

        if ($existing) {
            $event->attendees()->updateExistingPivot($user->id, ['status' => $status]);
        } else {
            $event->attendees()->attach($user->id, ['status' => $status]);
        }

        return response()->json([
            'message' => $status === 'waitlisted'
                ? 'Event is full — you have been waitlisted.'
                : 'RSVP confirmed.',
            'status' => $status,
        ], 201);
    }

    /**
     * Cancel an RSVP.
     */
    public function destroy(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        $existing = $event->attendees()->where('users.id', $user->id)->first();
        if (! $existing) {
            return response()->json(['message' => 'You are not registered for this event.'], 404);
        }

        $event->attendees()->updateExistingPivot($user->id, ['status' => 'cancelled']);

        return response()->json(['message' => 'RSVP cancelled.']);
    }
}
