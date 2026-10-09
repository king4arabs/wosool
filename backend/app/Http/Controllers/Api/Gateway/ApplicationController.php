<?php

namespace App\Http\Controllers\Api\Gateway;

use App\Http\Controllers\Controller;
use App\Http\Requests\GatewayApplicationRequest;
use App\Models\ApplicationEvent;
use App\Models\Program;
use App\Models\ProgramApplication;
use App\Models\ProgramProgress;
use App\Models\ProgramResource;
use App\Models\ProgramSession;
use App\Models\User;
use App\Services\AcceleratorGateway as Gateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    public function config()
    {
        $program = Program::where('slug', Gateway::SLUG)->first();

        return response()->json(['data' => Gateway::settings($program) + ['configured' => (bool) $program, 'consent_version' => Gateway::CONSENT]]);
    }

    public function eligibility(Request $request)
    {
        $data = $request->validate(['annual_revenue_usd' => 'required|numeric|min:0|max:999999999999', 'private_funding_usd' => 'nullable|numeric|min:0|max:999999999999',
            'venture_backed' => 'required|boolean', 'is_owner' => 'required|boolean', 'is_operating' => 'required|boolean']);

        return response()->json(['data' => Gateway::eligibility($data)]);
    }

    public function show(Request $request)
    {
        $program = Gateway::program();
        $application = ProgramApplication::where('program_id', $program->id)->where('user_id', $request->user()->id)
            ->whereNotNull('gateway_payload')->whereNull('eoa_data')->first();

        return response()->json(['data' => $application ? $this->present($application) : null, 'read_only' => true, 'canonical_url' => '/EOA/account']);
    }

    public function save(GatewayApplicationRequest $request)
    {
        abort_if(app()->isProduction() && ! config('gateway.privacy_ready'), 503, 'Applicant intake is not yet available.');
        $data = $request->validated();
        $program = Gateway::program();
        $application = DB::transaction(function () use ($request, $data, $program) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $application = ProgramApplication::where('program_id', $program->id)->where('user_id', $request->user()->id)->lockForUpdate()->first();
            abort_if($application && ! in_array($application->status, ['draft', 'information_requested']), 409, 'This application is locked for review.');
            abort_unless(($application?->revision ?? 0) === $data['revision'], 409, 'A newer draft exists. Reload before saving.');
            $application ??= new ProgramApplication(['program_id' => $program->id, 'user_id' => $request->user()->id, 'status' => 'draft']);
            $application->gateway_payload = $data['payload'];
            $application->motivation = $data['payload']['motivation'] ?? '';
            $application->revision = $data['revision'] + 1;
            $application->save();

            return $application;
        });

        return response()->json(['data' => $this->present($application)]);
    }

    public function submit(Request $request, Gateway $gateway)
    {
        $data = $request->validate(['revision' => 'required|integer|min:1']);
        $program = Gateway::program();
        abort_unless(Gateway::settings($program)['intake_enabled'], 409, 'Local intake is currently paused.');
        abort_if($program->application_deadline?->isPast(), 409, 'The application deadline has passed.');
        $application = ProgramApplication::where('program_id', $program->id)->where('user_id', $request->user()->id)->firstOrFail();
        Validator::make($application->gateway_payload ?? [], GatewayApplicationRequest::payloadRules(true))->validate();
        $application = $gateway->transition($application, $request->user(), 'submitted', null, $data['revision']);

        return response()->json(['data' => $this->present($application), 'message' => 'Application received for local review. تم استلام طلبك للمراجعة المحلية.']);
    }

    public function onboard(Request $request, Gateway $gateway)
    {
        $data = $request->validate(['revision' => 'required|integer|min:1', 'acknowledged' => 'accepted']);
        $application = ProgramApplication::where('program_id', Gateway::program()->id)->where('user_id', $request->user()->id)->firstOrFail();
        $application = $gateway->transition($application, $request->user(), 'onboarded', null, $data['revision']);

        return response()->json(['data' => $this->present($application)]);
    }

    public function present(ProgramApplication $application, bool $review = false): array
    {
        $data = $application->only(['id', 'status', 'revision', 'gateway_payload', 'submitted_at', 'consented_at', 'consent_version', 'created_at', 'updated_at', 'cohort_id']);
        $data['events'] = ApplicationEvent::where('application_id', $application->id)
            ->when(! $review, fn ($q) => $q->where('is_internal', false))->orderBy('id')->get(['id', 'from_status', 'to_status', 'message', 'is_internal', 'created_at']);
        $data['sessions'] = [];
        $data['resources'] = [];
        $data['milestones'] = [];
        $data['mentors'] = [];
        if (in_array($application->status, ['accepted', 'onboarded'])) {
            $scope = fn ($q) => $q->whereNull('cohort_id')->when($application->cohort_id, fn ($q) => $q->orWhere('cohort_id', $application->cohort_id));
            $data['sessions'] = ProgramSession::where('program_id', $application->program_id)->where($scope)
                ->whereIn('status', ['scheduled', 'completed'])->orderBy('starts_at')->get(['id', 'title', 'starts_at', 'duration_minutes', 'location', 'online_link']);
            $data['resources'] = ProgramResource::where('program_id', $application->program_id)->where($scope)->where('is_archived', false)
                ->whereIn('visibility', ['public', 'enrolled_only'])->get(['id', 'title', 'url', 'description']);
            $data['milestones'] = ProgramProgress::where('program_id', $application->program_id)->where('user_id', $application->user_id)->value('milestones') ?? [];
            $data['mentors'] = DB::table('program_mentors')->join('users', 'users.id', '=', 'program_mentors.user_id')
                ->where('program_id', $application->program_id)->where('participant_user_id', $application->user_id)->get(['users.name']);
        }
        if ($review) {
            $data['assigned_reviewer_id'] = $application->assigned_reviewer_id;
            $data['user'] = User::findOrFail($application->user_id)->only('id', 'name', 'email');
            $data['eligibility'] = Gateway::eligibility($application->gateway_payload ?? []);
        }

        return $data;
    }
}
