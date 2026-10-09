<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use App\Models\AnalyticsEvent;
use App\Models\Cohort;
use App\Models\Program;
use App\Models\ProgramApplication;
use App\Models\ProgramParticipant;
use App\Models\ProgramSession;
use App\Models\ProgramSessionAttendance;
use App\Services\AcceleratorGateway;
use App\Services\ChatRoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProgramManagementController extends Controller
{
    public function __construct(private readonly ChatRoomService $rooms) {}

    public function dashboard(Program $program): JsonResponse
    {
        $applications = $program->applications()->count();
        $participants = $program->participants()->count();
        $cohorts = $program->cohorts()->count();
        $sessions = $program->sessions()->count();

        return response()->json([
            'data' => [
                'program' => new ProgramResource($program->loadCount(['applications', 'participants', 'cohorts', 'sessions'])),
                'kpis' => [
                    'applications' => $applications,
                    'participants' => $participants,
                    'cohorts' => $cohorts,
                    'sessions' => $sessions,
                    'accepted' => $program->applications()->where('status', 'accepted')->count(),
                    'pending_review' => $program->applications()->whereIn('status', ['submitted', 'pending_review'])->count(),
                    'completed' => $program->participants()->where('status', 'completed')->count(),
                ],
            ],
        ]);
    }

    public function applications(Request $request, Program $program): JsonResponse
    {
        $query = $program->applications()->with(['user:id,name,email', 'cohort:id,name'])->latest();

        if ($status = $request->input('status')) {
            $query->where('status', (string) $status);
        }

        $rows = $query->get();

        return response()->json([
            'data' => $rows->map(fn (ProgramApplication $application) => [
                'id' => $application->id,
                'applicant_name' => $application->user?->name,
                'email' => $application->user?->email,
                'company_stage' => $application->company_stage,
                'sector' => $application->sector,
                'role' => $application->user?->role_token,
                'scorecard_fit' => null,
                'status' => $application->status,
                'submitted_at' => $application->created_at?->toIso8601String(),
                'why_join' => $application->why_join,
                'current_challenge' => $application->current_challenge,
                'expected_outcome' => $application->expected_outcome,
                'admin_notes' => $application->admin_notes,
                'internal_note' => $application->internal_note,
                'decision_reason' => $application->decision_reason,
                'cohort' => $application->cohort ? ['id' => $application->cohort->id, 'name' => $application->cohort->name] : null,
                'user_id' => $application->user_id,
            ])->values(),
        ]);
    }

    public function updateApplication(Request $request, Program $program, ProgramApplication $application): JsonResponse
    {
        abort_unless($application->program_id === $program->id, 404);
        abort_if($program->slug === AcceleratorGateway::SLUG, 409, 'Use the audited accelerator review workspace.');
        abort_if($program->slug === \App\Services\Eoa\ProgramService::SLUG, 409, 'Use the EOA workspace to preserve review and enrollment controls.');

        $data = $request->validate([
            'action' => ['required', 'in:accept,reject,waitlist,request_more_info,withdraw,enroll,assign_to_cohort,add_internal_note'],
            'cohort_id' => ['nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $program->id)],
            'note' => ['nullable', 'string', 'max:4000'],
            'decision_reason' => ['nullable', 'string', 'max:4000'],
        ]);

        $action = (string) $data['action'];

        if ($action === 'add_internal_note') {
            $application->update(['internal_note' => $data['note'] ?? null]);
        } elseif ($action === 'assign_to_cohort') {
            $application->update(['cohort_id' => $data['cohort_id'] ?? null]);
        } else {
            $statusMap = [
                'accept' => 'accepted',
                'reject' => 'rejected',
                'waitlist' => 'waitlisted',
                'request_more_info' => 'pending_review',
                'withdraw' => 'withdrawn',
                'enroll' => 'enrolled',
            ];
            $newStatus = $statusMap[$action] ?? $application->status;
            $application->update([
                'status' => $newStatus,
                'decision_reason' => $data['decision_reason'] ?? $application->decision_reason,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            if (in_array($newStatus, ['accepted', 'enrolled'], true)) {
                $participant = ProgramParticipant::updateOrCreate(
                    ['program_id' => $program->id, 'user_id' => $application->user_id],
                    [
                        'cohort_id' => $application->cohort_id,
                        'application_id' => $application->id,
                        'status' => $newStatus === 'accepted' ? 'in_progress' : 'enrolled',
                        'enrolled_at' => now(),
                    ]
                );

                $programRoom = $this->rooms->ensureRoom([
                    'type' => 'program_room',
                    'title' => 'برنامج: '.($program->title ?: $program->name),
                    'description' => 'غرفة البرنامج للمشاركين.',
                    'created_by_user_id' => $request->user()->id,
                    'owner_user_id' => $request->user()->id,
                    'related_type' => 'program',
                    'related_id' => $program->id,
                    'visibility' => 'private',
                    'is_ai_assisted' => true,
                ]);
                $this->rooms->addParticipant($programRoom->id, $application->user_id, 'participant');

                if ($participant->cohort_id) {
                    $cohort = Cohort::find($participant->cohort_id);
                    if ($cohort) {
                        $cohortRoom = $this->rooms->ensureRoom([
                            'type' => 'cohort_room',
                            'title' => 'دفعة: '.$cohort->name,
                            'description' => 'غرفة تواصل أعضاء الدفعة.',
                            'created_by_user_id' => $request->user()->id,
                            'owner_user_id' => $request->user()->id,
                            'related_type' => 'cohort',
                            'related_id' => $cohort->id,
                            'visibility' => 'private',
                            'is_ai_assisted' => true,
                        ]);
                        $this->rooms->addParticipant($cohortRoom->id, $application->user_id, 'participant');
                    }
                }
            }

            AnalyticsEvent::track(
                eventName: $newStatus === 'accepted' ? 'program_application_accepted' : ($newStatus === 'rejected' ? 'program_application_rejected' : 'program_application_updated'),
                userId: $request->user()->id,
                entityType: 'program',
                entityId: $program->id,
                properties: ['application_id' => $application->id, 'status' => $newStatus]
            );
        }

        return response()->json(['message' => 'تم تحديث الطلب بنجاح.']);
    }

    public function cohorts(Program $program): JsonResponse
    {
        $rows = $program->cohorts()->withCount(['programApplications as applications_count'])->latest()->get();

        return response()->json([
            'data' => $rows->map(fn (Cohort $cohort) => [
                'id' => $cohort->id,
                'name' => $cohort->name,
                'code' => $cohort->code,
                'status' => $cohort->status,
                'starts_at' => $cohort->starts_at?->toIso8601String(),
                'ends_at' => $cohort->ends_at?->toIso8601String(),
                'capacity' => $cohort->capacity,
                'city_region' => $cohort->city_region,
                'format' => $cohort->format,
                'applications_count' => $cohort->applications_count,
            ])->values(),
        ]);
    }

    public function createCohort(Request $request, Program $program): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:80'],
            'status' => ['required', 'in:draft,open,full,active,completed,cancelled'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'city_region' => ['nullable', 'string', 'max:120'],
            'format' => ['nullable', 'in:online,in-person,hybrid,self-paced,cohort-based'],
            'program_manager_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $cohort = $program->cohorts()->create($data);

        return response()->json(['message' => 'تم إنشاء الدفعة.', 'data' => $cohort], 201);
    }

    public function sessions(Program $program): JsonResponse
    {
        $rows = $program->sessions()->with('mentor:id,name')->latest('starts_at')->get();

        return response()->json([
            'data' => $rows->map(fn (ProgramSession $session) => [
                'id' => $session->id,
                'title' => $session->title,
                'description' => $session->description,
                'session_type' => $session->session_type,
                'starts_at' => $session->starts_at?->toIso8601String(),
                'duration_minutes' => $session->duration_minutes,
                'location' => $session->location,
                'online_link' => $session->online_link,
                'is_required' => (bool) $session->is_required,
                'attendance_required' => (bool) $session->attendance_required,
                'recording_link' => $session->recording_link,
                'mentor' => $session->mentor ? ['id' => $session->mentor->id, 'name' => $session->mentor->name] : null,
            ])->values(),
        ]);
    }

    public function createSession(Request $request, Program $program): JsonResponse
    {
        $data = $request->validate([
            'cohort_id' => ['nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $program->id)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'session_type' => ['required', 'in:workshop,office_hour,mentorship,lecture,roundtable,demo,review,check_in'],
            'starts_at' => ['required', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:15'],
            'location' => ['nullable', 'string', 'max:255'],
            'online_link' => ['nullable', 'url:https', 'max:2048'],
            'mentor_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'is_required' => ['nullable', 'boolean'],
            'materials' => ['nullable', 'array'],
            'recording_link' => ['nullable', 'url:https', 'max:2048'],
            'attendance_required' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:scheduled,live,completed,cancelled'],
        ]);

        $data['starts_at'] = Carbon::parse($data['starts_at'])->utc();
        $session = $program->sessions()->create($data);

        return response()->json(['message' => 'تم إنشاء الجلسة.', 'data' => $session], 201);
    }

    public function participants(Program $program): JsonResponse
    {
        $rows = $program->participants()->with(['user:id,name,email', 'cohort:id,name'])->latest()->get();

        return response()->json([
            'data' => $rows->map(fn (ProgramParticipant $participant) => [
                'id' => $participant->id,
                'user_id' => $participant->user_id,
                'name' => $participant->user?->name,
                'email' => $participant->user?->email,
                'status' => $participant->status,
                'completion_percentage' => $participant->completion_percentage,
                'at_risk' => (bool) $participant->at_risk,
                'cohort' => $participant->cohort ? ['id' => $participant->cohort->id, 'name' => $participant->cohort->name] : null,
            ])->values(),
        ]);
    }

    public function updateParticipantProgress(Request $request, Program $program, ProgramParticipant $participant): JsonResponse
    {
        abort_unless($participant->program_id === $program->id, 404);

        $data = $request->validate([
            'completion_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['nullable', 'in:not_started,in_progress,at_risk,completed,dropped,enrolled'],
            'at_risk' => ['nullable', 'boolean'],
            'manager_notes' => ['nullable', 'string', 'max:4000'],
        ]);

        $participant->update($data);

        AnalyticsEvent::track(
            eventName: 'progress_updated',
            userId: $request->user()->id,
            entityType: 'program',
            entityId: $program->id,
            properties: ['participant_id' => $participant->id]
        );

        return response()->json(['message' => 'تم تحديث تقدم المشارك.']);
    }

    public function markAttendance(Request $request, Program $program, ProgramSession $session): JsonResponse
    {
        abort_unless($session->program_id === $program->id, 404);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'status' => ['required', 'in:not_started,attended,absent,no_show'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $participant = ProgramParticipant::where('program_id', $program->id)->where('user_id', $data['user_id'])->first();
        abort_unless($participant && (! $session->cohort_id || $participant->cohort_id === $session->cohort_id), 422, 'The participant is not enrolled in this session cohort.');

        ProgramSessionAttendance::updateOrCreate(
            ['program_session_id' => $session->id, 'user_id' => (int) $data['user_id']],
            [
                'status' => (string) $data['status'],
                'attended_at' => $data['status'] === 'attended' ? now() : null,
                'note' => $data['note'] ?? null,
            ]
        );

        AnalyticsEvent::track(
            eventName: 'session_attended',
            userId: $request->user()->id,
            entityType: 'program_session',
            entityId: $session->id,
            properties: ['user_id' => (int) $data['user_id'], 'status' => $data['status']]
        );

        return response()->json(['message' => 'تم تحديث الحضور.']);
    }

    public function exportApplicationsCsv(Program $program): StreamedResponse
    {
        $rows = $program->applications()->with('user:id,name,email')->latest()->get();

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['applicant_name', 'email', 'status', 'sector', 'stage', 'submitted_at']);
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->user?->name,
                    $row->user?->email,
                    $row->status,
                    $row->sector,
                    $row->company_stage,
                    $row->created_at?->toDateTimeString(),
                ]);
            }
            fclose($out);
        }, "program-{$program->id}-applications.csv", ['Content-Type' => 'text/csv']);
    }
}
