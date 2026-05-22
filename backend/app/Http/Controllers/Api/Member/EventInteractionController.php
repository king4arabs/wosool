<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\Event;
use App\Models\EventBookmark;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class EventInteractionController extends Controller
{
    public function save(Request $request, string $slug): JsonResponse
    {
        $event = Event::query()->where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if (! Schema::hasTable('event_bookmarks')) {
            return response()->json(['message' => 'Bookmark feature is not enabled on this environment yet.'], 200);
        }

        EventBookmark::query()->firstOrCreate([
            'event_id' => $event->id,
            'user_id' => $user->id,
        ]);

        AnalyticsEvent::track(
            eventName: 'event.saved',
            userId: $user->id,
            entityType: 'event',
            entityId: $event->id,
            properties: ['slug' => $slug],
        );

        return response()->json(['message' => 'Event saved.']);
    }

    public function unsave(Request $request, string $slug): JsonResponse
    {
        $event = Event::query()->where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if (! Schema::hasTable('event_bookmarks')) {
            return response()->json(['message' => 'Bookmark feature is not enabled on this environment yet.'], 200);
        }

        EventBookmark::query()
            ->where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['message' => 'Event unsaved.']);
    }

    public function discussion(Request $request, string $slug): JsonResponse
    {
        $event = Event::query()->where('slug', $slug)->firstOrFail();
        $threadId = $event->discussion_thread_id ?: "event:{$event->id}";

        $messages = Message::query()
            ->with(['sender:id,name,email', 'recipient:id,name,email'])
            ->where('thread_id', $threadId)
            ->orderBy('created_at')
            ->limit(200)
            ->get();

        return response()->json([
            'data' => [
                'thread_id' => $threadId,
                'messages' => $messages,
            ],
        ]);
    }

    public function sendDiscussion(Request $request, string $slug): JsonResponse
    {
        $payload = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $event = Event::query()->where('slug', $slug)->firstOrFail();
        $user = $request->user();
        $threadId = $event->discussion_thread_id ?: "event:{$event->id}";

        if (! $event->discussion_thread_id) {
            $event->discussion_thread_id = $threadId;
            $event->save();
        }

        // Use self-recipient records for open thread stream compatibility.
        $message = Message::query()->create([
            'thread_id' => $threadId,
            'sender_id' => $user->id,
            'recipient_id' => $user->id,
            'body' => $payload['body'],
        ]);

        AnalyticsEvent::track(
            eventName: 'event.discussion.comment',
            userId: $user->id,
            entityType: 'event',
            entityId: $event->id,
            properties: [
                'slug' => $slug,
                'thread_id' => $threadId,
                'message_id' => $message->id,
            ],
        );

        return response()->json([
            'message' => 'Discussion message posted.',
            'data' => $message->load(['sender', 'recipient']),
        ], 201);
    }

    public function share(Request $request, string $slug): JsonResponse
    {
        $event = Event::query()->where('slug', $slug)->firstOrFail();

        AnalyticsEvent::track(
            eventName: 'event.shared',
            userId: $request->user()->id,
            entityType: 'event',
            entityId: $event->id,
            properties: ['slug' => $slug],
        );

        return response()->json([
            'message' => 'Share tracked.',
            'data' => [
                'share_url' => rtrim((string) config('app.frontend_url'), '/') . '/events/' . $event->slug,
            ],
        ]);
    }

    public function track(Request $request, string $slug): JsonResponse
    {
        $payload = $request->validate([
            'action' => ['required', 'string', 'max:120'],
            'meta' => ['nullable', 'array'],
        ]);
        $event = Event::query()->where('slug', $slug)->firstOrFail();
        $action = (string) $payload['action'];

        $mappedEvent = match ($action) {
            'intro_requested' => 'event.intro.requested',
            'calendar_synced' => 'event.calendar.synced',
            'resource_downloaded' => 'event.resource.downloaded',
            'speaker_clicked' => 'event.speaker.clicked',
            'sponsor_clicked' => 'event.sponsor.clicked',
            'follow_up_completed' => 'event.follow_up.completed',
            default => 'event.interaction',
        };

        AnalyticsEvent::track(
            eventName: $mappedEvent,
            userId: $request->user()->id,
            entityType: 'event',
            entityId: $event->id,
            properties: array_merge(['slug' => $slug, 'action' => $action], $payload['meta'] ?? []),
        );

        return response()->json(['message' => 'Event interaction tracked.']);
    }
}
