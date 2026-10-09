<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\ProgramParticipant;
use App\Models\User;
use App\Services\Eoa\Access;
use App\Services\Eoa\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(Access::reviewer($request->user()), 403);
        $program = ProgramService::program();
        $query = $program->applications()->whereNotNull('eoa_submitted_at')->with('user:id,name,email');
        if (! Access::staff($request->user())) {
            $query->whereIn('id', DB::table('eoa_reviewers')->where('user_id', $request->user()->id)->select('application_id'));
        }
        $status = $request->validate(['status' => 'nullable|in:submitted,under_review,information_requested,interview,accepted,waitlisted,rejected,enrolled']);
        if (! empty($status['status'])) {
            $query->where('status', $status['status']);
        }

        return response()->json(['data' => $query->latest()->paginate(30)->through(fn ($a) => [
            'id' => $a->id, 'status' => $a->status, 'version' => $a->eoa_version, 'name' => $a->user->name, 'email' => $a->user->email,
            'company_name' => $a->eoa_data['company_name'] ?? '', 'submitted_at' => $a->eoa_submitted_at,
        ]), 'capabilities' => ['lead' => Access::lead($request->user()), 'staff' => Access::staff($request->user())]]);
    }

    public function show(Request $request, int $application)
    {
        $item = ProgramService::program()->applications()->findOrFail($application);
        abort_unless(Access::application($request->user(), $item), 403);

        return response()->json(['data' => ApplicationController::present($item) + ['internal_note' => $item->internal_note]]);
    }

    public function update(Request $request, int $application)
    {
        $data = $request->validate([
            'status' => 'required|in:under_review,information_requested,interview,accepted,waitlisted,rejected',
            'version' => 'required|integer|min:1', 'message' => 'required|string|max:2000',
            'internal_note' => 'nullable|string|max:4000', 'interview_at' => 'required_if:status,interview|nullable|date|after:now',
            'interview_location' => 'required_if:status,interview|nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($request, $application, $data) {
            $item = ProgramService::program()->applications()->lockForUpdate()->findOrFail($application);
            ApplicationController::assertCanonical($item);
            abort_unless(Access::application($request->user(), $item), 403);
            if (in_array($data['status'], ['accepted', 'waitlisted', 'rejected'])) {
                abort_unless(Access::lead($request->user()), 403);
            }
            abort_unless($item->eoa_version === $data['version'], 409, 'This application changed. Reload before reviewing.');
            $transitions = [
                'submitted' => ['under_review', 'information_requested', 'interview', 'waitlisted', 'rejected', 'accepted'],
                'under_review' => ['information_requested', 'interview', 'accepted', 'waitlisted', 'rejected'],
                'information_requested' => ['under_review', 'interview', 'rejected'],
                'interview' => ['under_review', 'information_requested', 'accepted', 'waitlisted', 'rejected'],
                'waitlisted' => ['under_review', 'interview', 'accepted', 'rejected'],
            ];
            abort_unless(in_array($data['status'], $transitions[$item->status] ?? []), 409, 'Invalid review transition.');
            $before = $item->status;
            $message = $data['message'];
            if ($data['status'] === 'interview') {
                $message .= ' | '.$data['interview_at'].' | '.$data['interview_location'];
            }
            $item->update(['status' => $data['status'], 'decision_reason' => $message, 'internal_note' => $data['internal_note'] ?? $item->internal_note,
                'reviewed_by' => $request->user()->id, 'reviewed_at' => now(), 'eoa_version' => $item->eoa_version + 1]);
            if ($data['status'] === 'accepted') {
                ProgramParticipant::firstOrCreate(['program_id' => $item->program_id, 'user_id' => $item->user_id], ['application_id' => $item->id, 'status' => 'onboarding']);
            }
            AdminAction::log($request->user()->id, 'eoa.review', 'program_application', $item->id, null, ['status' => $before], ['status' => $item->status]);
            ProgramService::notify($item->user()->firstOrFail(), 'review_updated', 'Your application has an update / يوجد تحديث على طلبك. Open your account for details.');

            return response()->json(['data' => ApplicationController::present($item)]);
        });
    }

    public function assign(Request $request, int $application)
    {
        abort_unless(Access::staff($request->user()), 403);
        $request->validate(['reviewer_id' => 'required|integer|exists:users,id', 'remove' => 'nullable|boolean']);
        $item = ProgramService::program()->applications()->findOrFail($application);
        $reviewer = User::findOrFail($request->integer('reviewer_id'));
        abort_unless($reviewer->hasRole('eoa_reviewer'), 422, 'Select an assigned EOA reviewer.');
        DB::transaction(function () use ($request, $item, $reviewer) {
            if ($request->boolean('remove')) {
                DB::table('eoa_reviewers')->where('application_id', $item->id)->where('user_id', $reviewer->id)->delete();
            } else {
                DB::table('eoa_reviewers')->updateOrInsert(['application_id' => $item->id, 'user_id' => $reviewer->id]);
            }
            AdminAction::log($request->user()->id, $request->boolean('remove') ? 'eoa.unassign_reviewer' : 'eoa.assign_reviewer', 'program_application', $item->id, null, null, ['reviewer_id' => $reviewer->id]);
        });

        return response()->json(['message' => 'Reviewer assignment updated.']);
    }
}
