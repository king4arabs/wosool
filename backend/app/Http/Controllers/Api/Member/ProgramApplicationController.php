<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramApplicationRequest;
use App\Http\Resources\ProgramResource;
use App\Models\AnalyticsEvent;
use App\Models\ProgramParticipant;
use App\Models\ProgramProgress;
use App\Models\ProgramSession;
use App\Models\Program;
use App\Models\ProgramApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class ProgramApplicationController extends Controller
{
    public function myPrograms(Request $request): JsonResponse
    {
        $user = $request->user();

        $applications = ProgramApplication::with('program')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $participants = ProgramParticipant::with(['program', 'cohort'])
            ->where('user_id', $user->id)
            ->orderByDesc('updated_at')
            ->get();

        $recommendedQuery = Program::query()->where('is_open', true);
        if (Schema::hasColumn('programs', 'language')) {
            $recommendedQuery->where('language', 'ar');
        }
        $recommended = $recommendedQuery->latest()->limit(6)->get();

        return response()->json([
            'data' => [
                'applied_programs' => $applications->map(fn (ProgramApplication $application) => [
                    'id' => $application->id,
                    'status' => $application->status,
                    'submitted_at' => $application->created_at?->toIso8601String(),
                    'program' => new ProgramResource($application->program),
                ])->values(),
                'enrolled_programs' => $participants->map(function (ProgramParticipant $participant): array {
                    $nextSession = ProgramSession::query()
                        ->where('program_id', $participant->program_id)
                        ->when($participant->cohort_id, fn ($q) => $q->where(function ($inner) use ($participant) {
                            $inner->whereNull('cohort_id')->orWhere('cohort_id', $participant->cohort_id);
                        }))
                        ->where('starts_at', '>=', now())
                        ->orderBy('starts_at')
                        ->first();

                    $progress = ProgramProgress::query()
                        ->where('program_id', $participant->program_id)
                        ->where('user_id', $participant->user_id)
                        ->first();

                    return [
                        'participant_id' => $participant->id,
                        'status' => $participant->status,
                        'progress' => $progress?->completion_percentage ?? $participant->completion_percentage,
                        'at_risk' => (bool) ($progress?->at_risk ?? $participant->at_risk),
                        'mentor_assigned' => false,
                        'required_actions' => [],
                        'next_session' => $nextSession ? [
                            'id' => $nextSession->id,
                            'title' => $nextSession->title,
                            'starts_at' => $nextSession->starts_at?->toIso8601String(),
                        ] : null,
                        'cohort' => $participant->cohort ? [
                            'id' => $participant->cohort->id,
                            'name' => $participant->cohort->name,
                        ] : null,
                        'program' => new ProgramResource($participant->program),
                    ];
                })->values(),
                'completed_programs' => $participants->where('status', 'completed')->values()->map(fn ($participant) => [
                    'participant_id' => $participant->id,
                    'completed_at' => $participant->completed_at?->toIso8601String(),
                    'program' => new ProgramResource($participant->program),
                ])->values(),
                'recommended_programs' => ProgramResource::collection($recommended),
            ],
        ]);
    }

    /**
     * List the authenticated user's program applications.
     */
    public function index(Request $request): JsonResponse
    {
        $applications = ProgramApplication::with('program')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $applications->map(fn (ProgramApplication $application) => [
                'id' => $application->id,
                'status' => $application->status,
                'motivation' => $application->motivation,
                'relevant_experience' => $application->relevant_experience,
                'why_join' => $application->why_join,
                'current_challenge' => $application->current_challenge,
                'expected_outcome' => $application->expected_outcome,
                'company_stage' => $application->company_stage,
                'sector' => $application->sector,
                'created_at' => $application->created_at?->toIso8601String(),
                'updated_at' => $application->updated_at?->toIso8601String(),
                'program' => new ProgramResource($application->program),
            ]),
        ]);
    }

    /**
     * Apply to a program.
     */
    public function store(StoreProgramApplicationRequest $request, string $slug): JsonResponse
    {
        $program = Program::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if (! $program->is_open) {
            throw ValidationException::withMessages([
                'program' => ['This program is not currently accepting applications.'],
            ]);
        }

        if ($program->application_deadline && $program->application_deadline->isPast()) {
            throw ValidationException::withMessages([
                'program' => ['The application deadline has passed.'],
            ]);
        }

        $existing = ProgramApplication::where('program_id', $program->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'program' => ['You have already applied to this program.'],
            ]);
        }

        $data = $request->validated();
        $application = ProgramApplication::create([
            'program_id' => $program->id,
            'user_id' => $user->id,
            'cohort_id' => $data['cohort_id'] ?? null,
            'motivation' => $data['motivation'],
            'relevant_experience' => $data['relevant_experience'] ?? null,
            'why_join' => $data['why_join'] ?? null,
            'current_challenge' => $data['current_challenge'] ?? null,
            'expected_outcome' => $data['expected_outcome'] ?? null,
            'company_stage' => $data['company_stage'] ?? null,
            'sector' => $data['sector'] ?? null,
            'team_size' => $data['team_size'] ?? null,
            'current_traction' => $data['current_traction'] ?? null,
            'fundraising_status' => $data['fundraising_status'] ?? null,
            'availability_confirmed' => (bool) ($data['availability_confirmed'] ?? false),
            'consent_share_profile' => (bool) ($data['consent_share_profile'] ?? false),
            'attachment_path' => $data['attachment_path'] ?? null,
            'status' => 'pending_review',
        ]);

        AnalyticsEvent::track(
            eventName: 'program_application_submitted',
            userId: $user->id,
            entityType: 'program',
            entityId: $program->id,
            properties: ['slug' => $program->slug]
        );

        return response()->json([
            'message' => 'تم إرسال طلب الانضمام للبرنامج، وسيتم مراجعته قريبًا.',
            'data' => $application,
        ], 201);
    }
}
