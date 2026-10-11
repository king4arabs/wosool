<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\ProgramParticipant;
use App\Models\ProgramProgress;
use App\Services\Eoa\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParticipantController extends Controller
{
    private function participant(Request $request): ProgramParticipant
    {
        return ProgramService::program()->participants()->where('user_id', $request->user()->id)->firstOrFail();
    }

    public function show(Request $request)
    {
        $program = ProgramService::program();
        $participant = $program->participants()->where('user_id', $request->user()->id)->first();
        $notifications = DB::table('eoa_notifications')->where('user_id', $request->user()->id)->latest('id')->limit(50)->get(['id', 'message', 'event', 'read_at', 'created_at']);
        if (! $participant) {
            return response()->json(['data' => null, 'notifications' => $notifications]);
        }
        $scoped = fn ($q) => $q->whereNull('cohort_id')->orWhere('cohort_id', $participant->cohort_id ?? 0);
        $active = $participant->status === 'enrolled' && ($participant->eoa_finance['global_confirmed'] ?? false);
        $group = $participant->eoa_group_id ? DB::table('eoa_groups')->leftJoin('users', 'users.id', '=', 'eoa_groups.coach_id')->where('eoa_groups.id', $participant->eoa_group_id)->first(['eoa_groups.name', 'eoa_groups.meeting_link', 'users.name as coach_name']) : null;

        return response()->json(['notifications' => $notifications, 'data' => [
            'id' => $participant->id, 'status' => $participant->status, 'onboarding' => $participant->eoa_onboarding ?? [],
            'finance' => array_intersect_key($participant->eoa_finance ?? [], array_flip(['fee_status', 'global_confirmed', 'participant_amount_usd', 'sponsor_amount_usd'])),
            'group' => $active ? $group : null,
            'track' => $participant->eoa_track_id ? DB::table('eoa_tracks')->where('id', $participant->eoa_track_id)->first(['id', 'name_ar', 'name_en']) : null,
            'sessions' => $active ? $program->sessions()->where($scoped)->where('status', 'scheduled')->orderBy('starts_at')->get(['id', 'title', 'description', 'starts_at', 'duration_minutes', 'location', 'online_link', 'session_type', 'is_required']) : [],
            'registrations' => DB::table('eoa_registrations')->where('user_id', $request->user()->id)->pluck('program_session_id'),
            'resources' => $active ? $program->resources()->where($scoped)->where('is_archived', false)->get(['id', 'title', 'description', 'url', 'category']) : [],
            'progress' => ProgramProgress::where('program_id', $program->id)->where('user_id', $request->user()->id)->first(),
            'attendance' => DB::table('program_session_attendance')->join('program_sessions', 'program_sessions.id', '=', 'program_session_attendance.program_session_id')->where('program_sessions.program_id', $program->id)->where('user_id', $request->user()->id)->get(['program_sessions.title', 'program_session_attendance.status', 'attended_at']),
            'announcements' => $active ? DB::table('program_messages')->where('program_id', $program->id)->where('scope', 'program')->where($scoped)->latest('id')->limit(30)->get(['id', 'subject', 'body', 'created_at']) : [],
        ]]);
    }

    public function onboarding(Request $request)
    {
        $data = $request->validate(['participation_agreed' => 'required|accepted', 'profile_confirmed' => 'required|accepted']);
        $participant = $this->participant($request);
        abort_unless(in_array($participant->status, ['onboarding', 'enrolled']), 409);
        $participant->update(['eoa_onboarding' => $data + ['completed_at' => now()->toIso8601String()]]);

        return response()->json(['message' => 'Onboarding checklist saved.']);
    }

    public function progress(Request $request)
    {
        $participant = $this->participant($request);
        abort_unless($participant->status === 'enrolled' && ($participant->eoa_finance['global_confirmed'] ?? false), 403);
        $data = $request->validate([
            'self_assessment' => 'nullable|string|max:4000', 'milestones' => 'required|array|max:20',
            'milestones.*.title' => 'required|string|max:255', 'milestones.*.due_date' => 'nullable|date_format:Y-m-d',
            'milestones.*.completed' => 'required|boolean',
        ]);
        $milestones = collect($data['milestones'])->map(fn ($m) => array_intersect_key($m, array_flip(['title', 'due_date', 'completed'])))->all();
        ProgramProgress::updateOrCreate(['program_id' => $participant->program_id, 'user_id' => $request->user()->id], [
            'cohort_id' => $participant->cohort_id, 'self_assessment' => $data['self_assessment'] ?? null,
            'milestones' => $milestones, 'tasks_completed' => collect($milestones)->where('completed', true)->count(),
        ]);

        return response()->json(['message' => 'Progress saved.']);
    }

    public function register(Request $request, int $session)
    {
        $participant = $this->participant($request);
        abort_unless($participant->status === 'enrolled' && ($participant->eoa_finance['global_confirmed'] ?? false), 403);
        $item = ProgramService::program()->sessions()->findOrFail($session);
        abort_unless($item->cohort_id === null || $item->cohort_id === $participant->cohort_id, 403);
        abort_unless($item->status === 'scheduled' && $item->starts_at?->isFuture(), 422, 'Session registration is unavailable.');
        DB::table('eoa_registrations')->updateOrInsert(['program_session_id' => $session, 'user_id' => $request->user()->id], ['created_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Session registered.']);
    }

    public function feedback(Request $request)
    {
        $participant = $this->participant($request);
        abort_unless($participant->status === 'enrolled', 403);
        $data = $request->validate(['satisfaction_score' => 'required|integer|min:1|max:5', 'what_improved' => 'nullable|string|max:2000', 'what_missing' => 'nullable|string|max:2000']);
        DB::table('program_feedback')->insert($data + ['program_id' => $participant->program_id, 'cohort_id' => $participant->cohort_id, 'user_id' => $request->user()->id, 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Feedback recorded.']);
    }

    public function read(Request $request, int $notification)
    {
        abort_unless(DB::table('eoa_notifications')->where('id', $notification)->where('user_id', $request->user()->id)->update(['read_at' => now()]), 404);

        return response()->noContent();
    }
}
