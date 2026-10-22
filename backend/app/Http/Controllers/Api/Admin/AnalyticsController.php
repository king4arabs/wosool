<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Event;
use App\Models\FounderProfile;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $foundersBySector = FounderProfile::query()
            ->selectRaw('sector, COUNT(*) as count')
            ->whereNotNull('sector')
            ->groupBy('sector')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn ($row) => [
                'sector' => $row->sector,
                'count' => (int) $row->count,
            ]);

        return response()->json([
            'data' => [
                'kpis' => [
                    'total_members' => User::role('member')->count(),
                    'active_founders' => FounderProfile::where('status', 'active')->count(),
                    'companies' => CompanyProfile::where('status', 'active')->count(),
                    'events_hosted' => Event::count(),
                    'applications' => Application::count(),
                    'approved_applications' => Application::where('status', 'approved')->count(),
                    'total_rsvps' => \DB::table('event_rsvps')->count(),
                    'open_programs' => Program::where('is_open', true)->count(),
                ],
                'monthly_signups' => collect(range(5, 0))->map(function (int $monthsAgo) {
                    $date = now()->subMonths($monthsAgo);
                    return [
                        'month' => $date->format('M'),
                        'value' => User::whereBetween('created_at', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])->count(),
                    ];
                })->values(),
                'sector_distribution' => $foundersBySector,
                'recent_activity' => [
                    ['metric' => 'New signups this week', 'value' => User::where('created_at', '>=', now()->startOfWeek())->count()],
                    ['metric' => 'Applications submitted', 'value' => Application::where('created_at', '>=', now()->startOfWeek())->count()],
                    ['metric' => 'Event RSVPs', 'value' => \DB::table('event_rsvps')->where('created_at', '>=', now()->startOfWeek())->count()],
                    ['metric' => 'Published news', 'value' => \App\Models\NewsItem::where('status', 'published')->count()],
                    ['metric' => 'Analytics events', 'value' => AnalyticsEvent::where('created_at', '>=', now()->startOfWeek())->count()],
                ],
            ],
        ]);
    }
}
