<?php

namespace App\Http\Controllers\Api\Gateway;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\ApplicationEvent;
use App\Models\ProgramApplication;
use App\Models\ProgramParticipant;
use App\Models\User;
use App\Services\AcceleratorGateway as Gateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function index(Request $request, ApplicationController $presenter)
    {
        $admin = Gateway::isAdmin($request->user());
        abort_unless($admin || $request->user()->hasRole('accelerator-reviewer'), 403);
        $program = Gateway::program();
        $query = ProgramApplication::where('program_id', $program->id)->whereNot('status', 'draft')
            ->whereNotNull('gateway_payload')->whereNull('eoa_data')
            ->when(! $admin, fn ($q) => $q->where('assigned_reviewer_id', $request->user()->id));
        $request->validate(['status' => ['nullable', Rule::in(array_keys(Gateway::TRANSITIONS))]]);
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        $rows = $query->orderByDesc('updated_at')->paginate(30);

        return response()->json(['data' => $rows->getCollection()->map(fn ($row) => $presenter->present($row, true)),
            'meta' => ['current_page' => $rows->currentPage(), 'last_page' => $rows->lastPage(), 'total' => $rows->total(), 'program_id' => $program->id],
            'cohorts' => $program->cohorts()->get(['id', 'name']),
            'reviewers' => $admin ? User::role(['admin', 'accelerator-reviewer'])->get(['id', 'name']) : [],
            'settings' => $admin ? Gateway::settings($program) : null]);
    }

    public function update(Request $request, ProgramApplication $application, Gateway $gateway, ApplicationController $presenter)
    {
        abort_unless($application->program_id === Gateway::program()->id, 404);
        abort_unless(Gateway::canReview($request->user(), $application), 403);
        $data = $request->validate(['revision' => 'required|integer|min:1', 'status' => ['nullable', Rule::in(array_keys(Gateway::TRANSITIONS))],
            'message' => 'nullable|string|max:3000', 'assigned_reviewer_id' => 'sometimes|nullable|integer|exists:users,id',
            'cohort_id' => ['sometimes', 'nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $application->program_id)]]);
        if (! empty($data['status'])) {
            $application = $gateway->transition($application, $request->user(), $data['status'], $data['message'] ?? null, $data['revision']);
        } else {
            $application = DB::transaction(function () use ($request, $application, $data) {
                $row = ProgramApplication::whereKey($application->id)->lockForUpdate()->firstOrFail();
                abort_unless($row->revision === $data['revision'], 409, 'The application changed. Reload first.');
                abort_unless(Gateway::canReview($request->user(), $row), 403);
                if (array_key_exists('assigned_reviewer_id', $data) || array_key_exists('cohort_id', $data)) {
                    abort_unless(Gateway::isAdmin($request->user()), 403);
                    if (! empty($data['assigned_reviewer_id'])) {
                        $reviewer = User::findOrFail($data['assigned_reviewer_id']);
                        abort_unless(Gateway::isAdmin($reviewer) || $reviewer->hasRole('accelerator-reviewer'), 422, 'Select an authorized reviewer.');
                    }
                    $row->fill(array_intersect_key($data, array_flip(['assigned_reviewer_id', 'cohort_id'])));
                }
                $row->revision++;
                $row->save();
                if (array_key_exists('cohort_id', $data)) {
                    ProgramParticipant::where('application_id', $row->id)->update(['cohort_id' => $data['cohort_id']]);
                    DB::table('program_mentors')->where('program_id', $row->program_id)->where('participant_user_id', $row->user_id)->update(['cohort_id' => $data['cohort_id']]);
                    DB::table('program_progress')->where('program_id', $row->program_id)->where('user_id', $row->user_id)->update(['cohort_id' => $data['cohort_id']]);
                }
                ApplicationEvent::create(['application_id' => $row->id, 'actor_id' => $request->user()->id, 'from_status' => $row->status,
                    'to_status' => $row->status, 'message' => $data['message'] ?? 'Review assignment updated.', 'is_internal' => true]);

                return $row;
            });
        }

        return response()->json(['data' => $presenter->present($application, true)]);
    }

    public function settings(Request $request)
    {
        $data = $request->validate(['min_revenue_usd' => 'required|integer|min:0', 'max_revenue_usd' => 'required|integer|gte:min_revenue_usd',
            'allow_venture_backed' => 'required|boolean', 'intake_enabled' => 'required|boolean', 'global_fee_usd' => 'nullable|numeric|min:0',
            'local_fee' => 'nullable|string|max:500', 'local_dates' => 'nullable|string|max:500', 'source_url' => 'required|url:https|max:2048', 'verified_at' => 'required|date|before_or_equal:today']);
        $program = Gateway::program();
        $settings = $program->settings ?? [];
        $settings['gateway'] = $data;
        $program->update(['settings' => $settings]);
        AdminAction::log($request->user()->id, 'accelerator.settings.updated', 'program', $program->id, null, null, $data);

        return response()->json(['data' => $data]);
    }

    public function privacy(Request $request)
    {
        return response()->json(['data' => DB::table('privacy_requests')->join('users', 'users.id', '=', 'privacy_requests.user_id')
            ->select('privacy_requests.*', 'users.name', 'users.email')->orderByDesc('privacy_requests.id')->paginate(30)]);
    }

    public function resolvePrivacy(Request $request, int $id)
    {
        $data = $request->validate(['status' => 'required|in:in_review,completed,declined', 'resolution' => 'required|string|max:2000']);
        abort_unless(DB::table('privacy_requests')->where('id', $id)->exists(), 404);
        DB::table('privacy_requests')->where('id', $id)->update($data + ['resolved_by' => $request->user()->id, 'resolved_at' => now(), 'updated_at' => now()]);
        AdminAction::log($request->user()->id, 'eoa.privacy_request', 'privacy_request', $id, null, null, ['status' => $data['status']]);

        return response()->json(['message' => 'Request updated.']);
    }
}
