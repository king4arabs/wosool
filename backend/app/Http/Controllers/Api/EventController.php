<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::where('is_public', true)
            ->whereIn('status', ['upcoming', 'live']);

        if ($request->has('period')) {
            $now = now();
            match ($request->period) {
                'today' => $query->whereDate('starts_at', $now->toDateString()),
                'this_week' => $query->whereBetween('starts_at', [$now->startOfWeek(), $now->endOfWeek()]),
                'this_month' => $query->whereMonth('starts_at', $now->month)->whereYear('starts_at', $now->year),
                default => null,
            };
        }

        $events = $query->orderBy('starts_at')->paginate($request->integer('per_page', 10));

        return response()->json($events);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->where('is_public', true)->firstOrFail();
        return response()->json($event);
    }
}
