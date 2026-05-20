<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Http\Resources\NewsItemResource;
use App\Http\Resources\ProgramResource;
use App\Models\Event;
use App\Models\FounderProfile;
use App\Models\NewsItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = FounderProfile::with(['companies', 'scorecard'])
            ->where('user_id', $user->id)
            ->first();

        $programApplications = $user->programApplications()
            ->with('program')
            ->latest()
            ->limit(3)
            ->get();

        $upcomingRsvps = $user->eventRsvps()
            ->whereIn('status', ['upcoming', 'live'])
            ->orderBy('starts_at')
            ->limit(3)
            ->get();

        $news = NewsItem::query()
            ->where('status', 'published')
            ->where('is_public', true)
            ->latest('published_at')
            ->limit(3)
            ->get();

        $events = Event::query()
            ->where('is_public', true)
            ->whereIn('status', ['upcoming', 'live'])
            ->orderBy('starts_at')
            ->limit(3)
            ->get();

        return response()->json([
            'data' => [
                'profile' => $profile ? [
                    'id' => $profile->id,
                    'name' => $user->name,
                    'tagline' => $profile->tagline,
                    'profile_completeness' => $this->profileCompleteness($profile),
                    'score_snapshot' => $profile->scorecard?->aggregate_score,
                    'companies_count' => $profile->companies->count(),
                ] : null,
                'companies' => $profile?->companies->map(fn ($company) => [
                    'id' => $company->id,
                    'name' => $company->name,
                    'stage' => $company->stage,
                    'sector' => $company->sector,
                    'is_primary' => (bool) ($company->pivot?->is_primary ?? false),
                ]) ?? [],
                'upcoming_rsvps' => EventResource::collection($upcomingRsvps),
                'program_applications' => $programApplications->map(fn ($application) => [
                    'id' => $application->id,
                    'status' => $application->status,
                    'created_at' => $application->created_at?->toIso8601String(),
                    'program' => new ProgramResource($application->program),
                ]),
                'recommended_actions' => $this->recommendedActions($profile),
                'recent_news' => NewsItemResource::collection($news),
                'upcoming_events' => EventResource::collection($events),
                'phase2_modules' => [
                    'scorecard' => (bool) $profile?->scorecard,
                    'matches' => false,
                    'messages' => false,
                    'community' => false,
                ],
            ],
        ]);
    }

    private function profileCompleteness(?FounderProfile $profile): int
    {
        if (! $profile) {
            return 0;
        }

        $fields = [
            $profile->tagline,
            $profile->bio,
            $profile->location,
            $profile->sector,
            $profile->stage,
            $profile->linkedin_url,
            $profile->website_url,
            ! empty($profile->needs),
            ! empty($profile->offers),
        ];

        $completed = collect($fields)->filter(fn ($value) => filled($value))->count();

        return (int) round(($completed / count($fields)) * 100);
    }

    private function recommendedActions(?FounderProfile $profile): array
    {
        $actions = [];

        if (! $profile) {
            $actions[] = [
                'key' => 'create-profile',
                'label' => 'Complete your founder profile',
                'href' => '/dashboard/profile',
            ];
        } elseif ($this->profileCompleteness($profile) < 80) {
            $actions[] = [
                'key' => 'complete-profile',
                'label' => 'Add missing profile details to improve visibility',
                'href' => '/dashboard/profile',
            ];
        }

        if (! $profile || $profile->companies()->count() === 0) {
            $actions[] = [
                'key' => 'add-company',
                'label' => 'Add your primary company profile',
                'href' => '/dashboard/company',
            ];
        }

        $actions[] = [
            'key' => 'join-event',
            'label' => 'Register for an upcoming event',
            'href' => '/dashboard/events',
        ];

        return $actions;
    }
}
