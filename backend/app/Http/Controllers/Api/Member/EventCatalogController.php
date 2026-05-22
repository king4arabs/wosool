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

        $query = Event::query()
            ->withCount('attendees');

        $hasVisibility = Schema::hasColumn('events', 'visibility');
        $hasStatusFlow = Schema::hasColumn('events', 'status_flow');

        if ($hasVisibility && $hasStatusFlow) {
            $query->where(function ($builder) {
                $builder
                    ->where(function ($q) {
                        $q->whereIn('visibility', ['public', 'members_only', 'founder_only'])
                            ->whereIn('status_flow', ['published', 'registration_closed', 'live_now']);
                    })
                    ->orWhere(function ($q) {
                        $q->whereNull('status_flow')
                            ->whereIn('status', ['upcoming', 'live'])
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
                ->whereIn('status', ['upcoming', 'live']);
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

        $events = $query->orderBy('starts_at')->paginate($request->integer('per_page', 20))->withQueryString();
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

        return EventResource::collection($events)->response();
    }
}
