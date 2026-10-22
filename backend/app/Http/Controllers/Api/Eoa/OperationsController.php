<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\ContactMessage;
use App\Models\Program;
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
            'delivery_model' => ProgramService::deliveryModel(),
            'management' => \App\Services\Eoa\ManagementSummary::forProgram($p),
            'program_id' => $p->id, 'settings' => ProgramService::settings($p), 'is_open' => $p->is_open,
            'starts_at' => $p->starts_at, 'application_deadline' => $p->application_deadline,
            'tracks' => DB::table('eoa_tracks')->where('program_id', $p->id)->orderBy('id')->get(),
            'cohorts' => $p->cohorts()->get(), 'sessions' => $p->sessions()->orderBy('starts_at')->get(),
            'groups' => DB::table('eoa_groups')->where('program_id', $p->id)->get(),
            'resources' => $p->resources()->get(), 'announcements' => DB::table('program_messages')->where('program_id', $p->id)->where('scope', 'program')->latest()->limit(50)->get(),
            'participants' => $p->participants()->with('user:id,name,email')->get()->map(fn ($r) => [
                'id' => $r->id, 'user_id' => $r->user_id, 'name' => $r->user->name, 'status' => $r->status,
                'track_id' => $r->eoa_track_id, 'cohort_id' => $r->cohort_id, 'group_id' => $r->eoa_group_id, 'onboarding' => $r->eoa_onboarding,
                'finance' => Access::lead($request->user()) ? $r->eoa_finance : null,
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
            abort_unless(abs((float) $data['local_fee_usd'] - (ProgramService::ANNUAL_JOURNEY_USD - ProgramService::facts()['annual_global_fee_usd'])) < 0.01
                && abs((float) $data['sponsor_contribution_usd'] - ProgramService::SPONSOR_SHARE_USD) < 0.01
                && abs((float) $data['participant_contribution_usd'] - ProgramService::SPONSOR_SHARE_USD) < 0.01, 422, 'Approved annual journey must total US$4,000, split equally between participant and confirmed sponsor.');
        }
        $p = ProgramService::program();
        DB::transaction(function () use ($request, $p, $data) {
            $p = Program::whereKey($p->id)->lockForUpdate()->firstOrFail();
            $before = ProgramService::settings($p);
            $p->update(['is_open' => $data['is_open'], 'starts_at' => $data['starts_at'] ?? null, 'application_deadline' => $data['application_deadline'] ?? null,
                'settings' => array_replace($p->settings ?? [], ['eoa' => array_replace($p->settings['eoa'] ?? [], array_diff_key($data, array_flip(['is_open', 'starts_at', 'application_deadline'])))])]);
            AdminAction::log($request->user()->id, 'eoa.settings', 'program', $p->id, null, $before, ProgramService::settings($p));
        });

        return response()->json(['message' => 'Program settings saved.']);
    }

    public function editorial(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);
        $settings = ProgramService::settings(ProgramService::program());

        return response()->json([
            'data' => $settings['editorial'] ?? ['version' => 0, 'status' => 'draft', 'source_reference' => '', 'operator' => ['name_en' => 'LAMARKA', 'name_ar' => 'لاماركا', 'description_en' => '', 'description_ar' => '', 'website' => null, 'visible' => false], 'faqs' => []],
            'published_at' => $settings['editorial_published']['updated_at'] ?? null,
            'partner_roles' => (object) ($settings['partner_roles'] ?? []),
        ]);
    }

    public function saveEditorial(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);
        $rules = [
            'version' => 'required|integer|min:0',
            'action' => 'required|in:draft,publish,unpublish',
            'source_reference' => 'required_if:action,publish|nullable|string|max:2000',
            'operator' => 'required|array:name_en,name_ar,description_en,description_ar,website,visible',
            'operator.name_en' => 'nullable|string|max:255', 'operator.name_ar' => 'nullable|string|max:255',
            'operator.description_en' => 'nullable|string|max:3000', 'operator.description_ar' => 'nullable|string|max:3000',
            'operator.website' => 'nullable|url:https|max:255', 'operator.visible' => 'required|boolean',
            'faqs' => 'present|array|max:30',
            'faqs.*' => 'required|array:question_en,question_ar,answer_en,answer_ar,visible',
            'faqs.*.question_en' => 'required|string|max:300', 'faqs.*.question_ar' => 'required|string|max:300',
            'faqs.*.answer_en' => 'required|string|max:3000', 'faqs.*.answer_ar' => 'required|string|max:3000',
            'faqs.*.visible' => 'required|boolean',
        ];
        if ($request->input('action') === 'unpublish') {
            $rules = array_intersect_key($rules, array_flip(['version', 'action']));
        }
        $data = $request->validate($rules);
        if ($data['action'] === 'publish' && $data['operator']['visible']) {
            $request->validate([
                'operator.name_en' => 'required|string', 'operator.name_ar' => 'required|string',
                'operator.description_en' => 'required|string', 'operator.description_ar' => 'required|string',
                'operator.website' => 'required|url:https',
            ]);
        }

        return DB::transaction(function () use ($request, $data) {
            $program = Program::where('slug', ProgramService::SLUG)->lockForUpdate()->firstOrFail();
            $settings = $program->settings ?? [];
            $before = $settings['eoa']['editorial'] ?? null;
            abort_unless((int) ($before['version'] ?? 0) === $data['version'], 409, 'Content changed since you opened it. Reload before saving.');
            $editorial = $data['action'] === 'unpublish' ? ($before ?? ['operator' => null, 'faqs' => []]) : array_diff_key($data, ['action' => true]);
            $editorial['version'] = $data['version'] + 1;
            $editorial['status'] = $data['action'] === 'publish' ? 'published' : 'draft';
            $editorial['updated_at'] = now()->toIso8601String();
            $settings['eoa']['editorial'] = $editorial;
            if ($data['action'] === 'publish') {
                $settings['eoa']['editorial_published'] = $editorial;
            } elseif ($data['action'] === 'unpublish') {
                unset($settings['eoa']['editorial_published']);
            }
            $program->update(['settings' => $settings]);
            AdminAction::log($request->user()->id, 'eoa.editorial.'.$data['action'], 'program', $program->id, null, $before, $editorial);

            return response()->json(['data' => $editorial, 'published_at' => $settings['eoa']['editorial_published']['updated_at'] ?? null, 'message' => 'Content saved.']);
        });
    }

    public function create(Request $request, string $type, ?int $record = null)
    {
        abort_unless(Access::staff($request->user()), 403);
        $p = ProgramService::program();
        $cohort = ['nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $p->id)];
        if ($type === 'tracks') abort_unless(Access::lead($request->user()), 403);
        $rules = match ($type) {
            'tracks' => ['name_ar' => 'required|string|max:255', 'name_en' => ['required', 'string', 'max:255', Rule::unique('eoa_tracks')->where('program_id', $p->id)->ignore($record)], 'description_ar' => 'nullable|string|max:2000', 'description_en' => 'nullable|string|max:2000', 'is_active' => 'required|boolean'],
            'cohorts' => ['name' => 'required|string|max:255', 'starts_at' => 'nullable|date', 'ends_at' => 'nullable|date|after_or_equal:starts_at', 'capacity' => 'required|integer|min:1|max:200', 'status' => 'nullable|in:forming,active,completed,cancelled'],
            'sessions' => ['title' => 'required|string|max:255', 'description' => 'nullable|string|max:2000', 'cohort_id' => $cohort, 'starts_at' => 'required|date', 'duration_minutes' => 'required|integer|min:15|max:600', 'location' => 'nullable|string|max:255', 'online_link' => 'nullable|url:https|max:255', 'session_type' => 'required|in:learning_day,accountability,mentoring,prestigious_activity,alumni_follow_up', 'status' => 'nullable|in:scheduled,completed,cancelled'],
            'groups' => ['name' => 'required|string|max:255', 'cohort_id' => $cohort, 'coach_id' => 'nullable|integer|exists:users,id', 'meeting_link' => 'nullable|url:https|max:255'],
            'resources' => ['title' => 'required|string|max:255', 'description' => 'nullable|string|max:2000', 'cohort_id' => $cohort, 'url' => 'required|url:https|max:255', 'category' => 'nullable|string|max:80', 'is_archived' => 'nullable|boolean'],
            'announcements' => ['subject' => 'required|string|max:255', 'body' => 'required|string|max:8000', 'cohort_id' => $cohort],
            default => abort(404),
        };
        $data = $request->validate($rules);
        if ($type === 'cohorts' && ! $record && ! empty($data['starts_at']) && empty($data['ends_at'])) {
            $data['ends_at'] = Carbon::parse($data['starts_at'])->addMonthsNoOverflow(6)->toDateTimeString();
        }
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
                $table = ['tracks' => 'eoa_tracks', 'cohorts' => 'cohorts', 'sessions' => 'program_sessions', 'groups' => 'eoa_groups', 'resources' => 'program_resources', 'announcements' => 'program_messages'][$type];
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
            if ($type === 'tracks') {
                $id = DB::table('eoa_tracks')->insertGetId($data + ['program_id' => $p->id, 'created_at' => now(), 'updated_at' => now()]);
            }
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

    public function alumni(Request $request, int $participant)
    {
        abort_unless(Access::lead($request->user()), 403);
        $data = $request->validate(['graduation_reference' => 'required|string|max:500',
            'follow_up_on' => 'required|date_format:Y-m-d|after_or_equal:today', 'support_plan' => 'required|string|max:2000']);
        return DB::transaction(function () use ($request, $participant, $data) {
            $row = ProgramService::program()->participants()->lockForUpdate()->findOrFail($participant);
            abort_unless(in_array($row->status, ['enrolled', 'alumni']) && ($row->eoa_finance['global_confirmed'] ?? false), 409, 'Only enrolled participants can graduate.');
            if ($row->status !== 'alumni') {
                $cohort = $row->cohort()->first();
                abort_unless($cohort?->starts_at && $cohort->starts_at->copy()->addMonthsNoOverflow(6)->lte(now()), 422, 'The six-month cohort must finish before graduation.');
                abort_if($cohort->ends_at?->isFuture(), 422, 'The cohort has not ended.');
            }
            $before = $row->status;
            $onboarding = $row->eoa_onboarding ?? [];
            $onboarding['alumni'] = $data + ['recorded_by' => $request->user()->id, 'updated_at' => now()->toIso8601String()];
            $row->update(['status' => 'alumni', 'completed_at' => $row->completed_at ?? now(), 'eoa_onboarding' => $onboarding]);
            AdminAction::log($request->user()->id, 'eoa.alumni_updated', 'program_participant', $row->id, null, ['status' => $before], ['status' => 'alumni', 'follow_up_on' => $data['follow_up_on']]);
            return response()->json(['message' => 'Graduation and alumni follow-up recorded. EO membership is separate.']);
        });
    }

    public function assignment(Request $request, int $participant)
    {
        abort_unless(Access::staff($request->user()), 403);
        $p = ProgramService::program();
        $data = $request->validate([
            'cohort_id' => ['present', 'nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $p->id)],
            'group_id' => ['present', 'nullable', 'integer', Rule::exists('eoa_groups', 'id')->where('program_id', $p->id)],
            'fee_status' => 'prohibited', 'global_confirmed' => 'prohibited', 'status' => 'prohibited',
        ]);
        return DB::transaction(function () use ($request, $p, $participant, $data) {
            $row = $p->participants()->lockForUpdate()->findOrFail($participant);
            abort_unless(in_array($row->status, ['onboarding', 'enrolled']), 409);
            if ($data['cohort_id']) {
                $cohort = $p->cohorts()->lockForUpdate()->findOrFail($data['cohort_id']);
                abort_unless(in_array($cohort->status, ['forming', 'active']), 422, 'Choose an active or forming cohort.');
                abort_if($cohort->capacity && $p->participants()->where('cohort_id', $cohort->id)->where('id', '!=', $row->id)->count() >= $cohort->capacity, 422, 'Cohort is full.');
            }
            if ($data['group_id']) {
                $group = DB::table('eoa_groups')->where('id', $data['group_id'])->lockForUpdate()->first();
                abort_if($group->cohort_id && (int) $group->cohort_id !== $data['cohort_id'], 422, 'Group must belong to the selected cohort.');
            }
            $before = ['cohort_id' => $row->cohort_id, 'group_id' => $row->eoa_group_id];
            $row->update(['cohort_id' => $data['cohort_id'], 'eoa_group_id' => $data['group_id']]);
            AdminAction::log($request->user()->id, 'eoa.assignment', 'program_participant', $row->id, null, $before, $data);
            return response()->json(['message' => 'Participant assignment saved.']);
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
            abort_if($row->status === 'alumni', 409, 'Use the alumni follow-up workflow for graduates.');
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
        $data = $request->validate([
            'relationship_status' => 'required|in:ecosystem,prospective,confirmed', 'relationship_evidence' => 'required_if:relationship_status,confirmed|nullable|string|max:2000',
            'name_en' => 'sometimes|required|string|max:255', 'name_ar' => 'sometimes|required|string|max:255',
            'support_en' => 'sometimes|required|string|max:3000', 'support_ar' => 'sometimes|required|string|max:3000',
            'website' => 'sometimes|required|url:https|max:255', 'source_url' => 'sometimes|required|url:https|max:255',
            'logo_source_url' => 'sometimes|nullable|url:https|max:2048',
            'logo_path' => ['sometimes', 'nullable', 'string', 'max:255', function ($attribute, $value, $fail) {
                if (! preg_match('~^/(?:partners|eoa)/[A-Za-z0-9][A-Za-z0-9/_-]*\.(?:png|jpg|jpeg|webp|svg)$~i', $value)) {
                    $fail('Choose an existing image under /partners/ or /eoa/.');
                }
            }],
            'partner_role' => 'sometimes|nullable|in:operator,enabler,supporter',
            'sort_order' => 'sometimes|integer|min:0|max:10000',
        ]);
        abort_unless(DB::table('ecosystem_organizations')->where('id', $organization)->exists(), 404);
        DB::transaction(function () use ($request, $organization, $data) {
            $program = Program::where('slug', ProgramService::SLUG)->lockForUpdate()->firstOrFail();
            $before = DB::table('ecosystem_organizations')->where('id', $organization)->lockForUpdate()->first();
            $settings = $program->settings ?? [];
            if (array_key_exists('partner_role', $data)) {
                if ($data['partner_role']) $settings['eoa']['partner_roles'][(string) $organization] = $data['partner_role'];
                else unset($settings['eoa']['partner_roles'][(string) $organization]);
                $program->update(['settings' => $settings]);
            }
            $updates = array_diff_key($data, ['partner_role' => true]);
            DB::table('ecosystem_organizations')->where('id', $organization)->update($updates + ['updated_at' => now()]);
            AdminAction::log($request->user()->id, 'eoa.partner_status', 'ecosystem_organization', $organization, null, (array) $before, $data);
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
        $rows = $p->participants()->whereIn('eoa_group_id', $groups->select('id'))->whereIn('status', ['enrolled', 'alumni'])->with('user:id,name')->get();

        return response()->json(['data' => $rows->map(fn ($r) => ['participant_id' => $r->id, 'user_id' => $r->user_id, 'name' => $r->user->name,
            'cohort_id' => $r->cohort_id, 'progress' => ProgramProgress::where('program_id', $p->id)->where('user_id', $r->user_id)->first(['milestones', 'self_assessment', 'mentor_feedback']),
        ]), 'sessions' => $p->sessions()->where(fn ($q) => $q->whereNull('cohort_id')->orWhereIn('cohort_id', $rows->pluck('cohort_id')->filter()))->whereIn('status', ['scheduled', 'completed'])->where('starts_at', '<=', now())->orderByDesc('starts_at')->get(['id', 'title', 'cohort_id', 'starts_at'])]);
    }

    public function coachUpdate(Request $request, int $participant)
    {
        $p = ProgramService::program();
        $row = $p->participants()->findOrFail($participant);
        abort_unless(Access::staff($request->user()) || ($request->user()->hasRole('eoa_coach') && DB::table('eoa_groups')->where('id', $row->eoa_group_id)->where('coach_id', $request->user()->id)->exists()), 403);
        abort_unless(in_array($row->status, ['enrolled', 'alumni']) && ($row->eoa_finance['global_confirmed'] ?? false), 409, 'This participant is not actively enrolled.');
        $data = $request->validate(['mentor_feedback' => 'nullable|string|max:4000', 'session_id' => ['nullable', 'integer', Rule::exists('program_sessions', 'id')->where('program_id', $p->id)], 'attendance' => 'required_with:session_id|in:attended,absent,excused']);
        if (! empty($data['session_id'])) {
            $s = $p->sessions()->findOrFail($data['session_id']);
            abort_unless($s->cohort_id === null || $s->cohort_id === $row->cohort_id, 422);
            abort_unless(in_array($s->status, ['scheduled', 'completed']), 422, 'Attendance cannot be recorded for a cancelled session.');
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
