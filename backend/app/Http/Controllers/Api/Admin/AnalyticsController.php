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
    public function __invoke(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate(['days' => ['nullable', \Illuminate\Validation\Rule::in([7, 30, 90])]]);
        $days = $request->integer('days', 30);
        $end = now()->endOfDay();
        $start = now()->startOfDay()->subDays($days - 1);
        $previousStart = $start->copy()->subDays($days);
        $previousEnd = $start->copy()->subMicrosecond();
        $foundersBySector = FounderProfile::query()
            ->selectRaw('sector, COUNT(*) as count')
            ->where('status', 'active')->whereNotNull('user_id')
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
                'period' => ['days' => $days, 'start' => $start->toDateString(), 'end' => $end->toDateString(), 'timezone' => config('app.timezone')],
                'comparison' => ['current' => $this->periodMetrics($start, $end), 'previous' => $this->periodMetrics($previousStart, $previousEnd)],
                'trend' => $this->trend($start, $end),
                'operations' => \App\Services\AdminOperations::summary(),
                'kpis' => [
                    'total_members' => User::role('member')->count(),
                    'active_founders' => FounderProfile::where('status', 'active')->whereNotNull('user_id')->count(),
                    'companies' => CompanyProfile::where('status', 'active')->count(),
                    'events_hosted' => Event::count(),
                    'applications' => Application::count(),
                    'approved_applications' => Application::where('status', 'approved')->count(),
                    'total_rsvps' => \DB::table('event_rsvps')->count(),
                    'open_programs' => Program::where('is_open', true)->count(),
                ],
                'monthly_signups' => collect(range(5, 0))->map(function (int $monthsAgo) {
                    $date = now()->startOfMonth()->subMonths($monthsAgo);
                    return [
                        'month' => $date->format('Y-m'),
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
    private function periodMetrics($start, $end): array
    {
        $applications = Application::whereBetween('created_at', [$start, $end]);
        $total = (clone $applications)->count();
        $approved = (clone $applications)->where('status', 'approved')->count();
        return [
            'signups' => User::whereBetween('created_at', [$start, $end])->count(),
            'applications' => $total,
            'approved_applications' => $approved,
            'approval_rate' => $total ? round($approved * 100 / $total, 1) : null,
            'rsvps' => \DB::table('event_rsvps')->whereBetween('created_at', [$start, $end])->count(),
            'messages' => \App\Models\ContactMessage::whereBetween('created_at', [$start, $end])->count(),
            'relationships' => \App\Models\RelationshipRecord::whereBetween('created_at', [$start, $end])->count(),
        ];
    }

    private function trend($start, $end): array
    {
        $users = User::whereBetween('created_at', [$start, $end])->selectRaw('DATE(created_at) as day, COUNT(*) as total')->groupByRaw('DATE(created_at)')->pluck('total', 'day');
        $applications = Application::whereBetween('created_at', [$start, $end])->selectRaw('DATE(created_at) as day, COUNT(*) as total')->groupByRaw('DATE(created_at)')->pluck('total', 'day');
        $rows = [];
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $key = $date->toDateString();
            $rows[] = ['date' => $key, 'signups' => (int) ($users[$key] ?? 0), 'applications' => (int) ($applications[$key] ?? 0)];
        }
        return $rows;
    }

}
