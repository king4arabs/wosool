<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\ContactMessage;
use App\Models\ProgramProgress;
use App\Models\User;
use App\Services\Eoa\Access;
use App\Services\Eoa\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OperationsController extends Controller
{
    public function show(Request $request)
    {
        abort_unless(Access::staff($request->user()), 403);
        $p = ProgramService::program();

        return response()->json(['data' => [
            'program_id' => $p->id, 'settings' => ProgramService::settings($p), 'is_open' => $p->is_open,
            'starts_at' => $p->starts_at, 'application_deadline' => $p->application_deadline,
            'cohorts' => $p->cohorts()->get(), 'sessions' => $p->sessions()->orderBy('starts_at')->get(),
            'groups' => DB::table('eoa_groups')->where('program_id', $p->id)->get(),
            'resources' => $p->resources()->get(), 'announcements' => DB::table('program_messages')->where('program_id', $p->id)->where('scope', 'program')->latest()->limit(50)->get(),
            'participants' => $p->participants()->with('user:id,name,email')->get()->map(fn ($r) => [
                'id' => $r->id, 'user_id' => $r->user_id, 'name' => $r->user->name, 'status' => $r->status,
                'cohort_id' => $r->cohort_id, 'group_id' => $r->eoa_group_id, 'onboarding' => $r->eoa_onboarding,
                'finance' => $r->eoa_finance,
            ]),
            'people' => User::role(['eoa_coach', 'eoa_reviewer', 'eoa_lead', 'eoa_staff'])->with('roles:id,name')->get(['id', 'name', 'email'])->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'roles' => $u->getRoleNames()]),
            'organizations' => DB::table('ecosystem_organizations')->orderBy('sort_order')->get(),
            'report' => ['applications' => $p->applications()->whereNotNull('eoa_submitted_at')->count(), 'participants' => $p->participants()->where('status', 'enrolled')->count(), 'waitlisted' => $p->applications()->where('status', 'waitlisted')->count()],
            'audit' => AdminAction::where('action', 'like', 'eoa.%')->latest()->limit(50)->get(['id', 'admin_id', 'action', 'entity_type', 'entity_id', 'before_state', 'after_state', 'created_at']),
            'mail_configured' => ProgramService::mailConfigured(),
            'inquiries' => DB::table('contact_messages')->where('subject', 'like', 'EO Accelerator — %')->latest('id')->limit(100)->get(['id', 'name', 'email', 'category', 'subject', 'message', 'responded_at', 'created_at']),
            'feedback' => DB::table('program_feedback')->where('program_id', $p->id)->latest('id')->limit(50)->get(['id', 'satisfaction_score', 'what_improved', 'what_missing', 'created_at']),
        ]]);
    }

    public function settings(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);
        $data = $request->validate([
            'privacy_status' => 'required|in:draft,approved', 'privacy_approval_reference' => 'required_if:privacy_status,approved|nullable|string|max:2000',
            'privacy_notice_ar' => 'required_if:privacy_status,approved|nullable|string|max:8000', 'privacy_notice_en' => 'required_if:privacy_status,approved|nullable|string|max:8000', 'privacy_notice_version' => 'required_if:privacy_status,approved|nullable|string|max:100',
            'approval_status' => 'required|in:draft,approved', 'approval_reference' => 'required_if:approval_status,approved|nullable|string|max:2000',
            'is_open' => 'required|boolean', 'starts_at' => 'nullable|date', 'application_deadline' => 'nullable|date',
            'local_fee_status' => 'required|in:draft,approved', 'local_fee_usd' => 'nullable|numeric|min:0|max:1000000',
            'sponsor_contribution_usd' => 'nullable|numeric|min:0|max:1000000', 'participant_contribution_usd' => 'nullable|numeric|min:0|max:1000000',
            'participation_terms_en' => 'nullable|string|max:6000', 'participation_terms_ar' => 'nullable|string|max:6000', 'contact_email' => 'nullable|email|max:255', 'public_message_en' => 'nullable|string|max:2000', 'public_message_ar' => 'nullable|string|max:2000',
        ]);
        abort_if($data['is_open'] && ($data['approval_status'] !== 'approved' || $data['privacy_status'] !== 'approved' || ! ProgramService::mailConfigured()), 422, 'Opening intake requires program and data-notice approval and a configured email transport.');
        if ($data['local_fee_status'] === 'approved') {
            abort_unless(isset($data['local_fee_usd'],$data['sponsor_contribution_usd'],$data['participant_contribution_usd']), 422, 'Complete all local fee fields.');
            abort_unless(abs(1750 + (float) $data['local_fee_usd'] - (float) $data['sponsor_contribution_usd'] - (float) $data['participant_contribution_usd']) < 0.01, 422, 'Participant and sponsor contributions must cover global and local fees.');
        }
        $p = ProgramService::program();
        DB::transaction(function () use ($request, $p, $data) {
            $before = ProgramService::settings($p);
            $p->update(['is_open' => $data['is_open'], 'starts_at' => $data['starts_at'] ?? null, 'application_deadline' => $data['application_deadline'] ?? null,
                'settings' => array_replace($p->settings ?? [], ['eoa' => array_diff_key($data, array_flip(['is_open', 'starts_at', 'application_deadline']))])]);
            AdminAction::log($request->user()->id, 'eoa.settings', 'program', $p->id, null, $before, ProgramService::settings($p));
        });

        return response()->json(['message' => 'Program settings saved.']);
    }

    public function create(Request $request, string $type, ?int $record = null)
    {
        abort_unless(Access::staff($request->user()), 403);
        $p = ProgramService::program();
        $cohort = ['nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $p->id)];
        $rules = match ($type) {
            'cohorts' => ['name' => 'required|string|max:255', 'starts_at' => 'nullable|date', 'ends_at' => 'nullable|date|after_or_equal:starts_at', 'capacity' => 'required|integer|min:1|max:200', 'status' => 'nullable|in:forming,active,completed,cancelled'],
            'sessions' => ['title' => 'required|string|max:255', 'description' => 'nullable|string|max:2000', 'cohort_id' => $cohort, 'starts_at' => 'required|date', 'duration_minutes' => 'required|integer|min:15|max:600', 'location' => 'nullable|string|max:255', 'online_link' => 'nullable|url:https|max:255', 'session_type' => 'required|in:learning_day,accountability,mentoring', 'status' => 'nullable|in:scheduled,completed,cancelled'],
            'groups' => ['name' => 'required|string|max:255', 'cohort_id' => $cohort, 'coach_id' => 'nullable|integer|exists:users,id', 'meeting_link' => 'nullable|url:https|max:255'],
            'resources' => ['title' => 'required|string|max:255', 'description' => 'nullable|string|max:2000', 'cohort_id' => $cohort, 'url' => 'required|url:https|max:255', 'category' => 'nullable|string|max:80', 'is_archived' => 'nullable|boolean'],
            'announcements' => ['subject' => 'required|string|max:255', 'body' => 'required|string|max:8000', 'cohort_id' => $cohort],
            default => abort(404),
        };
        $data = $request->validate($rules);
        foreach (['starts_at', 'ends_at'] as $date) {
            if (! empty($data[$date])) {
                $data[$date] = Carbon::parse($data[$date])->utc()->format('Y-m-d H:i:s');
            }
        }
        if (! empty($data['coach_id'])) {
            abort_unless(User::findOrFail($data['coach_id'])->hasRole('eoa_coach'), 422, 'Choose an EOA coach.');
        }

        return DB::transaction(function () use ($request, $type, $p, $data, $record) {
            if ($record) {
                $table = ['cohorts' => 'cohorts', 'sessions' => 'program_sessions', 'groups' => 'eoa_groups', 'resources' => 'program_resources', 'announcements' => 'program_messages'][$type];
                abort_unless(DB::table($table)->where('program_id', $p->id)->where('id', $record)->exists(), 404);
                DB::table($table)->where('id', $record)->update($data + ['updated_at' => now()]);
                AdminAction::log($request->user()->id, 'eoa.update_'.$type, $type, $record);

                return response()->json(['id' => $record]);
            }
            $row = match ($type) {
                'cohorts' => $p->cohorts()->create($data + ['status' => 'forming']),
                'sessions' => $p->sessions()->create($data + ['status' => 'scheduled', 'is_required' => true]),
                'resources' => $p->resources()->create($data + ['visibility' => 'enrolled_only']),
                default => null,
            };
            $id = $row?->id;
            if ($type === 'groups') {
                $id = DB::table('eoa_groups')->insertGetId($data + ['program_id' => $p->id, 'created_at' => now(), 'updated_at' => now()]);
            }
            if ($type === 'announcements') {
                $id = DB::table('program_messages')->insertGetId($data + ['program_id' => $p->id, 'sender_user_id' => $request->user()->id, 'scope' => 'program', 'created_at' => now(), 'updated_at' => now()]);
            }
            AdminAction::log($request->user()->id, 'eoa.create_'.$type, $type, $id);

            return response()->json(['id' => $id], 201);
        });
    }

    public function participant(Request $request, int $participant)
    {
        abort_unless(Access::staff($request->user()), 403);
        $p = ProgramService::program();
        $data = $request->validate([
            'cohort_id' => ['nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $p->id)],
            'group_id' => ['nullable', 'integer', Rule::exists('eoa_groups', 'id')->where('program_id', $p->id)],
            'fee_status' => 'required|in:pending,paid,sponsored', 'global_confirmed' => 'required|boolean',
            'official_reference' => 'required_if:global_confirmed,true|nullable|string|max:255',
            'fee_reference' => 'required_unless:fee_status,pending|nullable|string|max:255',
            'participant_amount_usd' => 'nullable|numeric|min:0|max:1000000', 'sponsor_amount_usd' => 'nullable|numeric|min:0|max:1000000',
        ]);
        abort_unless(Access::lead($request->user()), 403); // only leadership confirms global admission and money

        return DB::transaction(function () use ($request, $p, $participant, $data) {
            $row = $p->participants()->lockForUpdate()->findOrFail($participant);
            if (! empty($data['group_id'])) {
                $g = DB::table('eoa_groups')->where('id', $data['group_id'])->first();
                abort_if($g->cohort_id && $g->cohort_id !== ($data['cohort_id'] ?? null), 422, 'Group must belong to the selected cohort.');
            }
            if (! empty($data['cohort_id'])) {
                $cohort = $p->cohorts()->lockForUpdate()->findOrFail($data['cohort_id']);
                abort_if($cohort->capacity && $p->participants()->where('cohort_id', $cohort->id)->where('id', '!=', $row->id)->count() >= $cohort->capacity, 422, 'Cohort is full.');
            }
            $active = $data['global_confirmed'] && $data['fee_status'] !== 'pending' && ! empty($row->eoa_onboarding['completed_at']);
            $before = $row->status;
            $row->update(['cohort_id' => $data['cohort_id'] ?? null, 'eoa_group_id' => $data['group_id'] ?? null,
                'eoa_finance' => array_diff_key($data, array_flip(['cohort_id', 'group_id'])), 'status' => $active ? 'enrolled' : 'onboarding', 'enrolled_at' => $active ? now() : null]);
            if ($row->application_id) {
                $p->applications()->where('id', $row->application_id)->update(['status' => $active ? 'enrolled' : 'accepted']);
            }
            AdminAction::log($request->user()->id, 'eoa.enrollment', 'program_participant', $row->id, null, ['status' => $before], ['status' => $row->status, 'fee_status' => $data['fee_status'], 'global_confirmed' => $data['global_confirmed']]);
            ProgramService::notify($row->user()->firstOrFail(), 'onboarding_updated', 'Your onboarding status has changed / تم تحديث حالة انضمامك.');

            return response()->json(['message' => 'Enrollment confirmation saved.']);
        });
    }

    public function organization(Request $request, int $organization)
    {
        abort_unless(Access::lead($request->user()), 403);
        $data = $request->validate(['relationship_status' => 'required|in:ecosystem,prospective,confirmed', 'relationship_evidence' => 'required_if:relationship_status,confirmed|nullable|string|max:2000']);
        abort_unless(DB::table('ecosystem_organizations')->where('id', $organization)->exists(), 404);
        DB::transaction(function () use ($request, $organization, $data) {
            $before = DB::table('ecosystem_organizations')->where('id', $organization)->first(['relationship_status']);
            DB::table('ecosystem_organizations')->where('id', $organization)->update($data + ['updated_at' => now()]);
            AdminAction::log($request->user()->id, 'eoa.partner_status', 'ecosystem_organization', $organization, null, (array) $before, ['relationship_status' => $data['relationship_status']]);
        });

        return response()->json(['message' => 'Relationship status saved.']);
    }

    public function inquiry(Request $request, int $inquiry)
    {
        abort_unless(Access::staff($request->user()), 403);
        $request->validate(['handled' => 'required|boolean']);
        $row = ContactMessage::where('subject', 'like', 'EO Accelerator — %')->findOrFail($inquiry);
        DB::transaction(function () use ($request, $row) {
            $row->update(['responded_at' => $request->boolean('handled') ? now() : null, 'responded_by' => $request->boolean('handled') ? $request->user()->id : null]);
            AdminAction::log($request->user()->id, 'eoa.inquiry_handled', 'contact_message', $row->id, null, null, ['handled' => $request->boolean('handled')]);
        });

        return response()->json(['message' => 'Inquiry status updated. No email has been sent.']);
    }

    public function coach(Request $request)
    {
        abort_unless($request->user()->hasRole('eoa_coach') || Access::staff($request->user()), 403);
        $p = ProgramService::program();
        $groups = DB::table('eoa_groups')->where('program_id', $p->id);
        if (! Access::staff($request->user())) {
            $groups->where('coach_id', $request->user()->id);
        }
        $rows = $p->participants()->whereIn('eoa_group_id', $groups->select('id'))->where('status', 'enrolled')->with('user:id,name')->get();

        return response()->json(['data' => $rows->map(fn ($r) => ['participant_id' => $r->id, 'user_id' => $r->user_id, 'name' => $r->user->name,
            'cohort_id' => $r->cohort_id, 'progress' => ProgramProgress::where('program_id', $p->id)->where('user_id', $r->user_id)->first(['milestones', 'self_assessment', 'mentor_feedback']),
        ]), 'sessions' => $p->sessions()->get(['id', 'title', 'cohort_id'])]);
    }

    public function coachUpdate(Request $request, int $participant)
    {
        $p = ProgramService::program();
        $row = $p->participants()->findOrFail($participant);
        abort_unless(Access::staff($request->user()) || ($request->user()->hasRole('eoa_coach') && DB::table('eoa_groups')->where('id', $row->eoa_group_id)->where('coach_id', $request->user()->id)->exists()), 403);
        $data = $request->validate(['mentor_feedback' => 'nullable|string|max:4000', 'session_id' => ['nullable', 'integer', Rule::exists('program_sessions', 'id')->where('program_id', $p->id)], 'attendance' => 'required_with:session_id|in:attended,absent,excused']);
        if (! empty($data['session_id'])) {
            $s = $p->sessions()->findOrFail($data['session_id']);
            abort_unless($s->cohort_id === null || $s->cohort_id === $row->cohort_id, 422);
            abort_if($s->starts_at?->isFuture(), 422, 'Attendance can be recorded after a session starts.');
        }
        DB::transaction(function () use ($request, $p, $row, $data) {
            if (array_key_exists('mentor_feedback', $data)) {
                ProgramProgress::updateOrCreate(['program_id' => $p->id, 'user_id' => $row->user_id], ['mentor_feedback' => $data['mentor_feedback'], 'cohort_id' => $row->cohort_id]);
            }
            if (! empty($data['session_id'])) {
                DB::table('program_session_attendance')->updateOrInsert(['program_session_id' => $data['session_id'], 'user_id' => $row->user_id], ['status' => $data['attendance'], 'attended_at' => $data['attendance'] === 'attended' ? now() : null, 'created_at' => now(), 'updated_at' => now()]);
            }
            AdminAction::log($request->user()->id, 'eoa.coach_update', 'program_participant', $row->id);
        });

        return response()->json(['message' => 'Coach update recorded.']);
    }
}
