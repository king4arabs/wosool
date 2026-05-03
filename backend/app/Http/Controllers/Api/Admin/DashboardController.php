<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Event;
use App\Models\FounderProfile;
use App\Models\NewsItem;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $recentApplications = Application::query()
            ->latest()
            ->limit(5)
            ->get([
                'id',
                'full_name',
                'company_name',
                'sector',
                'stage',
                'status',
                'created_at',
            ]);

        $activity = AdminAction::query()
            ->with('admin:id,name')
            ->latest()
            ->limit(8)
            ->get();

        return response()->json([
            'stats' => [
                'total_members' => User::role('member')->count(),
                'active_founders' => FounderProfile::where('status', 'active')->count(),
                'companies' => CompanyProfile::where('status', 'active')->count(),
                'events_this_month' => Event::whereBetween('starts_at', [
                    now()->copy()->startOfMonth(),
                    now()->copy()->endOfMonth(),
                ])->count(),
                'pending_applications' => Application::whereIn('status', ['submitted', 'reviewing', 'waitlisted'])->count(),
                'published_news' => NewsItem::where('status', 'published')->count(),
                'open_programs' => Program::where('is_open', true)->count(),
            ],
            'recent_applications' => $recentApplications,
            'activity' => $activity->map(fn (AdminAction $action) => [
                'id' => $action->id,
                'action' => $action->action,
                'entity_type' => $action->entity_type,
                'entity_id' => $action->entity_id,
                'notes' => $action->notes,
                'admin_name' => $action->admin?->name,
                'created_at' => $action->created_at?->toIso8601String(),
            ]),
        ]);
    }
}
