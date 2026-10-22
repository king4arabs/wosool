<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\EventBookmark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class EventCatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $past = $request->input('period') === 'past';
        $statuses = $past ? ['published', 'registration_closed', 'live_now', 'completed'] : ['published', 'registration_closed', 'live_now'];
        $legacyStatuses = $past ? ['upcoming', 'live', 'completed'] : ['upcoming', 'live'];

        $query = Event::query()
            ->inPeriod($past)
            ->withCount('attendees');

        $hasVisibility = Schema::hasColumn('events', 'visibility');
        $hasStatusFlow = Schema::hasColumn('events', 'status_flow');

        if ($hasVisibility && $hasStatusFlow) {
            $query->where(function ($builder) use ($statuses, $legacyStatuses) {
                $builder
                    ->where(function ($q) use ($statuses) {
                        $q->whereIn('visibility', ['public', 'members_only', 'founder_only'])
                            ->whereIn('status_flow', $statuses);
                    })
                    ->orWhere(function ($q) use ($legacyStatuses) {
                        $q->whereNull('status_flow')
                            ->whereIn('status', $legacyStatuses)
                            ->where(function ($legacyVisibility) {
                                $legacyVisibility
                                    ->where('is_public', true)
                                    ->orWhereIn('visibility', ['members_only', 'founder_only']);
                            });
                    });
            });
        } else {
            $query
                ->where('is_public', true)
                ->whereIn('status', $legacyStatuses);
        }

        if ($request->filled('period')) {
            $now = now();
            match ($request->period) {
                'today' => $query->whereDate('starts_at', $now->toDateString()),
                'this_week' => $query->whereBetween('starts_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()]),
                'this_month' => $query->whereMonth('starts_at', $now->month)->whereYear('starts_at', $now->year),
                default => null,
            };
        }

        $events = $query->orderBy('starts_at', $past ? 'desc' : 'asc')->paginate(max(1, min(100, $request->integer('per_page', 20))))->withQueryString();
        $savedIds = [];
        if (Schema::hasTable('event_bookmarks')) {
            $savedIds = EventBookmark::query()->where('user_id', $user->id)->pluck('event_id')->all();
        }

        $events->getCollection()->transform(function (Event $event) use ($savedIds) {
            $event->is_saved = in_array($event->id, $savedIds, true);
            $event->relevance_score = 70;
            $event->why_recommended = 'Recommended by member visibility and your activity context.';
            return $event;
        });

        return EventResource::collection($events)->response()->header('Cache-Control', 'private, no-store');
    }
}
