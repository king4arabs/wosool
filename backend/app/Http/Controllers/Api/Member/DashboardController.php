<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Http\Resources\MatchResource;
use App\Http\Resources\NewsItemResource;
use App\Http\Resources\ProgramResource;
use App\Models\Application;
use App\Models\Appointment;
use App\Models\Event;
use App\Models\FounderMatch;
use App\Models\FounderProfile;
use App\Models\IntroductionLedger;
use App\Models\NewsItem;
use App\Models\Program;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

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
            ->whereIn('events.status', ['upcoming', 'live'])
            ->orderBy('events.starts_at')
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

        $recommendedProgramsQuery = Program::query()->where('is_open', true);
        if ($profile?->stage) {
            $recommendedProgramsQuery->where(function ($builder) use ($profile) {
                $builder
                    ->whereJsonContains('target_stages', $profile->stage)
                    ->orWhereNull('target_stages');
            });
        }
        $recommendedPrograms = $recommendedProgramsQuery
            ->latest()
            ->limit(3)
            ->get();

        $recommendedMatches = collect();
        $introRequests = ['pending_count' => 0, 'inbound_count' => 0, 'outbound_count' => 0];
        if ($profile) {
            $recommendedMatches = FounderMatch::query()
                ->with(['founderA.user', 'founderA.companies', 'founderB.user', 'founderB.companies'])
                ->where(function ($builder) use ($profile) {
                    $builder
                        ->where('founder_a_id', $profile->id)
                        ->orWhere('founder_b_id', $profile->id);
                })
                ->where('status', 'suggested')
                ->orderByDesc('match_score')
                ->limit(3)
                ->get();

            if (Schema::hasTable('introductions_ledger')) {
                $introRequests = [
                    'pending_count' => IntroductionLedger::query()
                        ->where('routing_status', 'INTRO_PENDING')
                        ->where(function ($builder) use ($profile) {
                            $builder
                                ->where('source_founder_id', $profile->id)
                                ->orWhere('target_founder_id', $profile->id);
                        })
                        ->count(),
                    'inbound_count' => IntroductionLedger::query()
                        ->where('target_founder_id', $profile->id)
                        ->where('routing_status', 'INTRO_PENDING')
                        ->count(),
                    'outbound_count' => IntroductionLedger::query()
                        ->where('source_founder_id', $profile->id)
                        ->where('routing_status', 'INTRO_PENDING')
                        ->count(),
                ];
            }
        }

        $upcomingAppointments = Appointment::query()
            ->where(function ($builder) use ($user) {
                $builder->where('host_id', $user->id)->orWhere('guest_id', $user->id);
            })
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('scheduled_at', '>', now())
            ->with(['host:id,name', 'guest:id,name'])
            ->orderBy('scheduled_at')
            ->limit(3)
            ->get();

        // Treat explicit member/admin access as approved, then fall back to applications table.
        $hasMemberRole = method_exists($user, 'hasRole') && ($user->hasRole('member') || $user->hasRole('admin'));
        $hasMemberToken = in_array((string) ($user->role_token ?? ''), ['founder', 'admin'], true);
        $hasFounderProfile = $profile !== null;
        $accountApproved = $hasMemberRole || $hasMemberToken || $hasFounderProfile;

        if (! $accountApproved && Schema::hasTable('applications')) {
            $accountApproved = Application::query()
                ->where(function ($query) use ($user) {
                    $query
                        ->where('user_id', $user->id)
                        ->orWhere('email', $user->email);
                })
                ->where('status', 'approved')
                ->exists();
        }

        return response()->json([
            'data' => [
                'account_approved' => $accountApproved,
                'profile' => $profile ? [
                    'id' => $profile->id,
                    'name' => $user->name,
                    'tagline' => $profile->tagline,
                    'profile_completeness' => $this->profileCompleteness($profile),
                    'score_snapshot' => $profile->scorecard?->aggregate_score,
                    'companies_count' => $profile->companies->count(),
                ] : null,
                'profile_completion' => $this->profileCompleteness($profile),
                'company_completion' => $this->companyCompleteness($profile),
                'founder_score_summary' => [
                    'aggregate_score' => $profile?->scorecard?->aggregate_score,
                    'momentum_score' => $profile?->scorecard?->momentum,
                    'growth_score' => $profile?->scorecard?->growth,
                    'readiness_score' => $profile?->scorecard?->readiness,
                    'support_delta' => $profile?->scorecard?->support_delta,
                ],
                'companies' => $profile?->companies->map(fn ($company) => [
                    'id' => $company->id,
                    'name' => $this->modelAttr($company, ['name', 'legal_name']),
                    'stage' => $this->modelAttr($company, ['stage', 'operational_stage']),
                    'sector' => $this->modelAttr($company, ['sector']),
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
                'recommended_programs' => ProgramResource::collection($recommendedPrograms),
                'recommended_matches' => MatchResource::collection($recommendedMatches),
                'intro_requests' => $introRequests,
                'upcoming_appointments' => $upcomingAppointments->map(fn ($appointment) => [
                    'id' => $appointment->id,
                    'scheduled_at' => $appointment->scheduled_at?->toIso8601String(),
                    'duration_minutes' => $appointment->duration_minutes,
                    'type' => $appointment->type,
                    'status' => $appointment->status,
                    'meeting_link' => $appointment->meeting_link,
                    'host_name' => $appointment->host?->name,
                    'guest_name' => $appointment->guest?->name,
                ]),
                'latest_community_updates' => NewsItemResource::collection($news),
                'ai_assistant_panel' => [
                    'enabled' => true,
                    'title' => 'AI Assistant',
                    'description' => 'Get help drafting introductions, preparing meetings, and finding next best actions.',
                    'quick_prompts' => [
                        'Summarize my founder profile gaps.',
                        'Draft an intro request based on my current goals.',
                        'Suggest three high-impact actions for this week.',
                    ],
                ],
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

    private function companyCompleteness(?FounderProfile $profile): int
    {
        if (! $profile || $profile->companies->isEmpty()) {
            return 0;
        }

        $scores = $profile->companies->map(function ($company): int {
            // Base completion on fields members actually fill in the current company wizard.
            $fields = [
                $this->modelAttr($company, ['legal_name', 'name']),
                $this->modelAttr($company, ['domain_url', 'website_url']),
                $this->modelAttr($company, ['operational_stage', 'stage']),
                $this->modelAttr($company, ['sector']),
                $this->modelAttr($company, ['hq_location', 'location']),
                $this->modelAttr($company, ['description']),
                $this->modelAttr($company, ['founded_year']),
                $this->modelAttr($company, ['team_size']),
            ];
            $completed = collect($fields)->filter(fn ($value) => filled($value))->count();

            return (int) round(($completed / count($fields)) * 100);
        });

        return (int) round($scores->avg() ?? 0);
    }

    private function modelAttr(Model $model, array $keys, mixed $default = null): mixed
    {
        $attributes = $model->getAttributes();
        foreach ($keys as $key) {
            if (array_key_exists($key, $attributes)) {
                return $attributes[$key];
            }
        }

        return $default;
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
