<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\AnalyticsEvent;
use App\Models\Event;
use App\Models\EventBookmark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()
            ->withCount('attendees');

        $hasVisibility = Schema::hasColumn('events', 'visibility');
        $hasStatusFlow = Schema::hasColumn('events', 'status_flow');

        if ($hasVisibility && $hasStatusFlow) {
            $query
                ->where(function ($builder) {
                    $builder
                        ->where('visibility', 'public')
                        ->orWhere('is_public', true);
                })
                ->where(function ($builder) {
                    $builder
                        ->whereIn('status_flow', ['published', 'registration_closed', 'live_now'])
                        ->orWhere(function ($sub) {
                            $sub->whereNull('status_flow')->whereIn('status', ['upcoming', 'live']);
                        });
                });
        } else {
            $query
                ->where('is_public', true)
                ->whereIn('status', ['upcoming', 'live']);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('mode')) {
            $mode = (string) $request->input('mode');
            $query->where(function ($builder) use ($mode) {
                $builder->where('mode', $mode)->orWhere('format', $mode === 'online' ? 'virtual' : 'in-person');
            });
        } elseif ($request->filled('format')) {
            $query->where('format', $request->string('format'));
        }

        if ($request->has('period')) {
            $now = now();
            match ($request->period) {
                'today' => $query->whereDate('starts_at', $now->toDateString()),
                'this_week' => $query->whereBetween('starts_at', [$now->startOfWeek(), $now->endOfWeek()]),
                'this_month' => $query->whereMonth('starts_at', $now->month)->whereYear('starts_at', $now->year),
                default => null,
            };
        }        

        if ($request->filled('q')) {
            $q = trim((string) $request->input('q'));
            $query->where(function ($builder) use ($q) {
                $builder
                    ->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('short_description', 'like', "%{$q}%")
                    ->orWhere('category', 'like', "%{$q}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('tag')) {
            $tag = (string) $request->input('tag');
            $query->whereJsonContains('tags', $tag);
        }

        $events = $query
            ->orderBy('starts_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        $authUser = $request->user();
        $savedIds = [];
        if ($authUser && Schema::hasTable('event_bookmarks')) {
            $savedIds = EventBookmark::query()
                ->where('user_id', $authUser->id)
                ->pluck('event_id')
                ->all();
        }

        $events->getCollection()->transform(function (Event $event) use ($savedIds) {
            $event->is_saved = in_array($event->id, $savedIds, true);
            $event->relevance_score = $this->computeRelevanceScore($event);
            $event->why_recommended = $this->buildRecommendationReason($event);
            return $event;
        });

        return EventResource::collection($events)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::query()
            ->with(['agendaItems', 'speakers', 'resources'])
            ->where('slug', $slug)
            ->where(function ($builder) {
                if (Schema::hasColumn('events', 'visibility')) {
                    $builder->where('visibility', 'public')->orWhere('is_public', true);
                    return;
                }
                $builder->where('is_public', true);
            })
            ->firstOrFail();

        $event->relevance_score = $this->computeRelevanceScore($event);
        $event->why_recommended = $this->buildRecommendationReason($event);

        AnalyticsEvent::track(
            eventName: 'event.viewed',
            userId: request()->user()?->id,
            entityType: 'event',
            entityId: $event->id,
            properties: ['slug' => $event->slug],
        );

        return response()->json([
            'data' => new EventResource($event),
        ]);
    }

    public function calendarIcs(string $slug): Response
    {
        $event = Event::query()->where('slug', $slug)->firstOrFail();

        $start = optional($event->starts_at)->utc()->format('Ymd\THis\Z');
        $end = optional($event->ends_at ?: $event->starts_at?->copy()->addHour())->utc()->format('Ymd\THis\Z');
        $title = addcslashes((string) $event->title, ",;");
        $description = addcslashes((string) ($event->short_description ?: $event->description ?: ''), ",;");
        $location = addcslashes((string) ($event->location ?: $event->venue_name ?: ''), ",;");

        $content = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Wosool//Events//EN\r\nBEGIN:VEVENT\r\nUID:event-{$event->id}@wosool\r\nDTSTAMP:" . now()->utc()->format('Ymd\THis\Z') . "\r\nDTSTART:{$start}\r\nDTEND:{$end}\r\nSUMMARY:{$title}\r\nDESCRIPTION:{$description}\r\nLOCATION:{$location}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";

        AnalyticsEvent::track(
            eventName: 'event.calendar.synced',
            userId: request()->user()?->id,
            entityType: 'event',
            entityId: $event->id,
            properties: ['slug' => $event->slug, 'provider' => 'ics'],
        );

        return response($content, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $event->slug . '.ics"',
        ]);
    }

    private function computeRelevanceScore(Event $event): int
    {
        $score = 50;
        $tags = collect($event->tags ?? [])->map(fn ($tag) => strtolower((string) $tag));

        if ($tags->contains('networking') || $tags->contains('founders')) {
            $score += 20;
        }
        if (in_array($event->type, ['Founder Circle', 'Founder-led Session', 'Investor Session'], true)) {
            $score += 15;
        }
        if ($event->starts_at && $event->starts_at->isFuture() && $event->starts_at->diffInDays(now()) <= 14) {
            $score += 10;
        }

        return max(0, min(100, $score));
    }

    private function buildRecommendationReason(Event $event): string
    {
        if (in_array($event->type, ['Founder Circle', 'Founder Dinner', 'Networking Event'], true)) {
            return 'Recommended for peer connections and founder introductions.';
        }

        if (in_array($event->type, ['Workshop', 'Office Hours', 'Investor Session'], true)) {
            return 'Recommended for tactical execution and direct support.';
        }

        return 'Recommended based on your member activity and ecosystem relevance.';
    }
}
