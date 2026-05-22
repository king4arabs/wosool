<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\AnalyticsEvent;
use App\Models\Event;
use App\Models\User;
use App\Services\ChatRoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class EventRsvpController extends Controller
{
    public function __construct(private readonly ChatRoomService $rooms)
    {
    }

    private const REGISTRATION_STATES = [
        'open',
        'requires_approval',
        'registered',
        'pending_approval',
        'approved',
        'rejected',
        'waitlisted',
        'cancelled_by_user',
        'registration_closed',
        'full_capacity',
        'invite_only',
        'checked_in',
        'no_show',
    ];

    /**
     * List the authenticated user's event RSVPs.
     */
    public function index(Request $request): JsonResponse
    {
        $rsvps = $request->user()
            ->eventRsvps()
            ->orderBy('starts_at')
            ->get();

        return response()->json([
            'data' => $rsvps->map(function (Event $event): array {
                $pivot = $event->pivot;
                return [
                    'event' => (new EventResource($event))->toArray(request()),
                    'registration' => [
                        'status' => (string) ($pivot->status ?? 'open'),
                        'attendance_type' => $this->pivotValue($event, 'attendance_type'),
                        'reason_to_attend' => $this->pivotValue($event, 'reason_to_attend'),
                        'what_user_is_looking_for' => $this->pivotValue($event, 'what_user_is_looking_for'),
                        'allow_ai_networking_suggestions' => (bool) ($this->pivotValue($event, 'allow_ai_networking_suggestions') ?? true),
                        'calendar_sync_option' => $this->pivotValue($event, 'calendar_sync_option'),
                        'checked_in' => ! is_null($this->pivotValue($event, 'checked_in_at')),
                        'no_show' => ! is_null($this->pivotValue($event, 'no_show_at')),
                        'registered_at' => $pivot->created_at?->toIso8601String(),
                    ],
                ];
            })->values(),
        ]);
    }

    public function registrationStatus(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();
        $existing = $event->attendees()->where('users.id', $user->id)->first();

        $eventState = $this->computeEventRegistrationState($event);
        if (! $existing) {
            return response()->json([
                'data' => [
                    'event_state' => $eventState,
                    'registration_state' => in_array($eventState, self::REGISTRATION_STATES, true) ? $eventState : 'open',
                ],
            ]);
        }

        $registrationState = $this->mapPivotStatusToState((string) $existing->pivot->status, $eventState);

        return response()->json([
            'data' => [
                'event_state' => $eventState,
                'registration_state' => $registrationState,
                'registration' => [
                    'status' => (string) $existing->pivot->status,
                    'attendance_type' => $this->pivotValue($existing, 'attendance_type'),
                    'calendar_sync_option' => $this->pivotValue($existing, 'calendar_sync_option'),
                    'checked_in' => ! is_null($this->pivotValue($existing, 'checked_in_at')),
                    'no_show' => ! is_null($this->pivotValue($existing, 'no_show_at')),
                ],
            ],
        ]);
    }

    /**
     * RSVP to an event.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();
        $payload = $request->validate([
            'attendance_type' => ['required', 'in:in_person,online,hybrid'],
            'reason_to_attend' => ['nullable', 'string', 'max:2000'],
            'what_user_is_looking_for' => ['nullable', 'string', 'max:2000'],
            'allow_ai_networking_suggestions' => ['nullable', 'boolean'],
            'calendar_sync_option' => ['nullable', 'in:none,google,outlook,ics'],
        ]);
        $hasStatusFlow = Schema::hasColumn('events', 'status_flow');
        $hasRequiresApproval = Schema::hasColumn('events', 'requires_approval');
        $hasRegistrationDeadline = Schema::hasColumn('events', 'registration_deadline');
        $hasCapacityLimit = Schema::hasColumn('events', 'capacity_limit');
        $hasWaitlistEnabled = Schema::hasColumn('events', 'waitlist_enabled');
        $hasRsvpRequired = Schema::hasColumn('events', 'rsvp_required');

        $statusFlow = $hasStatusFlow ? ((string) ($event->status_flow ?: '')) : '';
        $lifecycleStatus = $statusFlow !== '' ? $statusFlow : (string) $event->status;
        $requiresApproval = $hasRequiresApproval ? (bool) ($event->requires_approval ?? false) : false;
        $registrationDeadline = $hasRegistrationDeadline ? $event->registration_deadline : null;
        $rsvpRequired = $hasRsvpRequired ? (bool) ($event->rsvp_required ?? $event->requires_rsvp) : (bool) $event->requires_rsvp;
        $capacity = $hasCapacityLimit ? ($event->capacity_limit ?: $event->max_attendees) : $event->max_attendees;
        $waitlistEnabled = $hasWaitlistEnabled ? (bool) ($event->waitlist_enabled ?? true) : true;

        if (! in_array($lifecycleStatus, ['published', 'live_now', 'registration_closed', 'upcoming', 'live'], true)) {
            throw ValidationException::withMessages([
                'event' => ['This event is not available for RSVP in its current status.'],
            ]);
        }

        if ($this->isInviteOnly($event)) {
            throw ValidationException::withMessages([
                'event' => ['This event is invite only.'],
            ]);
        }

        if (! $event->requires_rsvp && ! $rsvpRequired) {
            throw ValidationException::withMessages([
                'event' => ['This event does not require RSVP.'],
            ]);
        }

        if (in_array($lifecycleStatus, ['completed', 'cancelled', 'archived', 'registration_closed'], true)) {
            throw ValidationException::withMessages([
                'event' => ['This event is no longer accepting RSVPs.'],
            ]);
        }

        if ($registrationDeadline && now()->greaterThan($registrationDeadline)) {
            throw ValidationException::withMessages([
                'event' => ['Registration deadline has passed for this event.'],
            ]);
        }

        $existing = $event->attendees()->where('users.id', $user->id)->first();

        if ($existing && ! in_array((string) $existing->pivot->status, ['cancelled', 'cancelled_by_user'], true)) {
            return response()->json([
                'message' => 'You are already registered for this event.',
                'status' => $existing->pivot->status,
            ]);
        }

        $status = $requiresApproval ? 'pending_approval' : 'approved';

        if ($capacity) {
            $confirmedCount = $event->attendees()->wherePivotIn('status', ['confirmed', 'approved', 'checked_in'])->count();
            if ($confirmedCount >= $capacity) {
                if ($waitlistEnabled === false) {
                    throw ValidationException::withMessages([
                        'event' => ['Event capacity has been reached.'],
                    ]);
                }
                $status = 'waitlisted';
            }
        }

        $pivotPayload = [
            'status' => $status,
            'attendance_type' => $payload['attendance_type'],
            'reason_to_attend' => $payload['reason_to_attend'] ?? null,
            'what_user_is_looking_for' => $payload['what_user_is_looking_for'] ?? null,
            'allow_ai_networking_suggestions' => (bool) ($payload['allow_ai_networking_suggestions'] ?? true),
            'calendar_sync_option' => $payload['calendar_sync_option'] ?? 'none',
            'cancelled_by_user' => false,
        ];

        $pivotPayload = $this->sanitizePivotPayload($pivotPayload);

        if ($existing) {
            $event->attendees()->updateExistingPivot($user->id, $pivotPayload);
        } else {
            $event->attendees()->attach($user->id, $pivotPayload);
        }

        $eventRoom = $this->rooms->ensureRoom([
            'type' => 'event_room',
            'title' => 'نقاش فعالية: ' . $event->title,
            'description' => 'غرفة نقاش المشاركين في الفعالية.',
            'created_by_user_id' => $user->id,
            'owner_user_id' => $user->id,
            'related_type' => 'event',
            'related_id' => $event->id,
            'visibility' => 'private',
            'is_ai_assisted' => true,
        ]);
        $this->rooms->addParticipant($eventRoom->id, $user->id, 'participant');

        AnalyticsEvent::track(
            eventName: 'event.rsvp.completed',
            userId: $user->id,
            entityType: 'event',
            entityId: $event->id,
            properties: [
                'slug' => $event->slug,
                'status' => $status,
                'attendance_type' => $payload['attendance_type'],
            ],
        );

        AnalyticsEvent::track(
            eventName: 'event.calendar.synced',
            userId: $user->id,
            entityType: 'event',
            entityId: $event->id,
            properties: [
                'slug' => $event->slug,
                'calendar_sync_option' => $payload['calendar_sync_option'] ?? 'none',
            ],
        );

        return response()->json([
            'message' => $status === 'waitlisted'
                ? 'Event is full — you have been waitlisted.'
                : ($status === 'pending_approval' ? 'RSVP submitted and pending approval.' : 'RSVP confirmed.'),
            'status' => $status,
            'registration_state' => $this->mapPivotStatusToState($status, $this->computeEventRegistrationState($event)),
            'calendar' => [
                'ics_url' => "/api/v1/events/{$event->slug}/calendar.ics",
            ],
            'networking' => [
                'ai_recommendations_triggered' => (bool) ($payload['allow_ai_networking_suggestions'] ?? true),
            ],
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

        $event->attendees()->updateExistingPivot($user->id, $this->sanitizePivotPayload([
            'status' => 'cancelled_by_user',
            'cancelled_by_user' => true,
        ]));

        AnalyticsEvent::track(
            eventName: 'event.rsvp.cancelled',
            userId: $user->id,
            entityType: 'event',
            entityId: $event->id,
            properties: [
                'slug' => $event->slug,
            ],
        );

        $this->promoteWaitlistedAttendeeIfPossible($event);

        return response()->json(['message' => 'RSVP cancelled.']);
    }

    private function isInviteOnly(Event $event): bool
    {
        $visibility = method_exists($event, 'getAttributes') && array_key_exists('visibility', $event->getAttributes())
            ? (string) ($event->visibility ?? '')
            : '';
        return $visibility === 'invite_only';
    }

    private function computeEventRegistrationState(Event $event): string
    {
        $statusFlow = method_exists($event, 'getAttributes') && array_key_exists('status_flow', $event->getAttributes())
            ? (string) ($event->status_flow ?? '')
            : '';
        $status = $statusFlow !== '' ? $statusFlow : (string) $event->status;

        if ($this->isInviteOnly($event)) {
            return 'invite_only';
        }
        if (in_array($status, ['registration_closed', 'completed', 'cancelled', 'archived'], true)) {
            return 'registration_closed';
        }
        $requiresApproval = method_exists($event, 'getAttributes') && array_key_exists('requires_approval', $event->getAttributes())
            ? (bool) ($event->requires_approval ?? false)
            : false;
        return $requiresApproval ? 'requires_approval' : 'open';
    }

    private function mapPivotStatusToState(string $pivotStatus, string $eventState): string
    {
        return match ($pivotStatus) {
            'approved' => 'approved',
            'pending_approval' => 'pending_approval',
            'rejected' => 'rejected',
            'waitlisted' => 'waitlisted',
            'cancelled', 'cancelled_by_user' => 'cancelled_by_user',
            'checked_in' => 'checked_in',
            'no_show' => 'no_show',
            default => $eventState === 'requires_approval' ? 'pending_approval' : 'registered',
        };
    }

    private function promoteWaitlistedAttendeeIfPossible(Event $event): void
    {
        $capacity = (method_exists($event, 'getAttributes') && array_key_exists('capacity_limit', $event->getAttributes()))
            ? ($event->capacity_limit ?: $event->max_attendees)
            : $event->max_attendees;
        if (! $capacity) {
            return;
        }

        $confirmedCount = $event->attendees()->wherePivotIn('status', ['approved', 'checked_in'])->count();
        if ($confirmedCount >= $capacity) {
            return;
        }

        $next = $event->attendees()
            ->wherePivot('status', 'waitlisted')
            ->orderBy('event_rsvps.created_at')
            ->first();

        if (! $next) {
            return;
        }

        $event->attendees()->updateExistingPivot($next->id, $this->sanitizePivotPayload([
            'status' => 'approved',
            'waitlist_promoted_at' => now(),
            'waitlist_confirmation_deadline' => now()->addHours(24),
        ]));

        AnalyticsEvent::track(
            eventName: 'waitlist_promoted',
            userId: $next->id,
            entityType: 'event',
            entityId: $event->id,
            properties: ['slug' => $event->slug],
        );
    }

    private function sanitizePivotPayload(array $payload): array
    {
        static $columns = null;

        if ($columns === null) {
            $columns = Schema::hasTable('event_rsvps')
                ? array_flip(Schema::getColumnListing('event_rsvps'))
                : [];
        }

        $filtered = [];
        foreach ($payload as $key => $value) {
            if (isset($columns[$key])) {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }

    private function pivotValue(Event|User $model, string $key, mixed $default = null): mixed
    {
        if (! $model->pivot) {
            return $default;
        }

        static $columns = null;
        if ($columns === null) {
            $columns = Schema::hasTable('event_rsvps')
                ? array_flip(Schema::getColumnListing('event_rsvps'))
                : [];
        }

        if (! isset($columns[$key])) {
            return $default;
        }

        return $model->pivot->{$key} ?? $default;
    }
}
