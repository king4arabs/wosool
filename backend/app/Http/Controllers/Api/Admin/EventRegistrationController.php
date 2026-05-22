<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EventRegistrationController extends Controller
{
    private ?array $pivotColumnsCache = null;

    public function index(Request $request, Event $event): JsonResponse
    {
        $status = (string) $request->input('status', '');
        $query = $event->attendees()->with('founderProfile.companies');

        if ($status !== '') {
            $query->wherePivot('status', $status);
        }

        $rows = $query->orderBy('event_rsvps.created_at', 'desc')->get();

        return response()->json([
            'data' => $rows->map(function (User $user): array {
                $company = $user->founderProfile?->companies?->first();
                return [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'company' => $company?->name,
                    'role' => $user->role_token ?: ($user->roles[0] ?? 'member'),
                    'attendance_type' => $this->pivotValue($user, 'attendance_type'),
                    'registration_status' => $user->pivot->status,
                    'relevance_score' => 70,
                    'rsvp_date' => $user->pivot->created_at?->toIso8601String(),
                    'checkin_status' => ! is_null($this->pivotValue($user, 'checked_in_at')) ? 'checked_in' : (! is_null($this->pivotValue($user, 'no_show_at')) ? 'no_show' : 'not_checked_in'),
                    'allow_ai_networking_suggestions' => (bool) ($this->pivotValue($user, 'allow_ai_networking_suggestions') ?? true),
                    'what_user_is_looking_for' => $this->pivotValue($user, 'what_user_is_looking_for'),
                ];
            })->values(),
        ]);
    }

    public function updateStatus(Request $request, Event $event, int $userId): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:approve,reject,waitlist,cancel,checkin,no_show,mark_vip'],
            'rejection_reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $attendee = $event->attendees()->where('users.id', $userId)->firstOrFail();
        $action = (string) $data['action'];

        $pivotUpdate = match ($action) {
            'approve' => ['status' => 'approved', 'approved_by_user_id' => $request->user()->id, 'decision_at' => now()],
            'reject' => ['status' => 'rejected', 'approved_by_user_id' => $request->user()->id, 'decision_at' => now(), 'rejection_reason' => $data['rejection_reason'] ?? null],
            'waitlist' => ['status' => 'waitlisted'],
            'cancel' => ['status' => 'cancelled_by_user', 'cancelled_by_user' => false],
            'checkin' => ['status' => 'checked_in', 'checked_in_at' => now(), 'no_show_at' => null],
            'no_show' => ['status' => 'no_show', 'no_show_at' => now(), 'checked_in_at' => null],
            'mark_vip' => ['status' => $attendee->pivot->status],
            default => ['status' => $attendee->pivot->status],
        };

        $event->attendees()->updateExistingPivot($userId, $this->sanitizePivotPayload($pivotUpdate));

        AnalyticsEvent::track(
            eventName: 'approval_decision',
            userId: $request->user()->id,
            entityType: 'event',
            entityId: $event->id,
            properties: [
                'action' => $action,
                'target_user_id' => $userId,
            ],
        );

        return response()->json(['message' => 'Registration updated.']);
    }

    public function exportCsv(Event $event): StreamedResponse
    {
        $rows = $event->attendees()->get();

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['name', 'email', 'status', 'attendance_type', 'rsvp_date']);
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->name,
                    $row->email,
                    $row->pivot->status,
                    $this->pivotValue($row, 'attendance_type'),
                    $row->pivot->created_at?->toDateTimeString(),
                ]);
            }
            fclose($out);
        }, "event-{$event->id}-registrations.csv", ['Content-Type' => 'text/csv']);
    }

    private function sanitizePivotPayload(array $payload): array
    {
        $allowed = $this->pivotColumns();

        return collect($payload)
            ->filter(fn ($_value, $key) => in_array($key, $allowed, true))
            ->all();
    }

    private function pivotColumns(): array
    {
        if ($this->pivotColumnsCache !== null) {
            return $this->pivotColumnsCache;
        }

        if (! Schema::hasTable('event_rsvps')) {
            return $this->pivotColumnsCache = [];
        }

        return $this->pivotColumnsCache = Schema::getColumnListing('event_rsvps');
    }

    private function pivotValue(User $user, string $key, mixed $default = null): mixed
    {
        if (! $user->pivot) {
            return $default;
        }

        if (! in_array($key, $this->pivotColumns(), true)) {
            return $default;
        }

        return $user->pivot->{$key} ?? $default;
    }
}
