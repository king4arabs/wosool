<?php

namespace App\Http\Controllers\Api\Gateway;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\ProgramParticipant;
use App\Models\ProgramProgress;
use App\Models\ProgramResource;
use App\Models\ProgramSessionAttendance;
use App\Models\User;
use App\Services\AcceleratorGateway as Gateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProgramOperationsController extends Controller
{
    public function index()
    {
        $p = Gateway::program();

        return response()->json(['data' => ['program_id' => $p->id, 'cohorts' => $p->cohorts()->get(), 'sessions' => $p->sessions()->orderBy('starts_at')->get(),
            'resources' => $p->resources()->orderBy('id')->get(), 'participants' => $p->participants()->with('user:id,name')->get()->map(fn ($r) => ['user_id' => $r->user_id, 'name' => $r->user->name, 'cohort_id' => $r->cohort_id]),
            'mentors' => User::role(['admin', 'accelerator-reviewer', 'mentor'])->get(['id', 'name']),
            'assignments' => DB::table('program_mentors')->where('program_id', $p->id)->get(['user_id', 'participant_user_id']),
            'progress' => ProgramProgress::where('program_id', $p->id)->get(['user_id', 'milestones']),
            'attendance' => ProgramSessionAttendance::whereIn('program_session_id', $p->sessions()->select('id'))->get(['program_session_id', 'user_id', 'status'])]]);
    }

    public function saveResource(Request $request)
    {
        $p = Gateway::program();
        $data = $request->validate(['id' => ['nullable', 'integer', Rule::exists('program_resources', 'id')->where('program_id', $p->id)],
            'title' => 'required|string|max:255', 'description' => 'nullable|string|max:3000', 'url' => 'required|url:https|max:255',
            'cohort_id' => ['nullable', 'integer', Rule::exists('cohorts', 'id')->where('program_id', $p->id)], 'is_archived' => 'sometimes|boolean']);
        $resource = isset($data['id']) ? $p->resources()->findOrFail($data['id']) : new ProgramResource(['program_id' => $p->id]);
        $resource->fill(collect($data)->except('id')->all() + ['visibility' => 'enrolled_only', 'resource_type' => 'link']);
        $resource->save();
        AdminAction::log($request->user()->id, 'accelerator.resource.saved', 'program_resource', $resource->id);

        return response()->json(['data' => $resource]);
    }

    public function participant(Request $request)
    {
        $p = Gateway::program();
        $data = $request->validate(['user_id' => ['required', 'integer', Rule::exists('program_participants', 'user_id')->where('program_id', $p->id)],
            'mentor_user_id' => 'sometimes|nullable|integer|exists:users,id', 'milestones' => 'sometimes|array|max:30',
            'milestones.*' => 'array:title,completed', 'milestones.*.title' => 'required|string|max:255', 'milestones.*.completed' => 'required|boolean']);
        DB::transaction(function () use ($p, $data, $request) {
            $participant = ProgramParticipant::where('program_id', $p->id)->where('user_id', $data['user_id'])->lockForUpdate()->firstOrFail();
            if (array_key_exists('mentor_user_id', $data)) {
                if ($data['mentor_user_id']) {
                    $mentor = User::findOrFail($data['mentor_user_id']);
                    abort_unless($mentor->hasAnyRole(['admin', 'accelerator-reviewer', 'mentor']), 422, 'Select a designated mentor or coach.');
                }
                DB::table('program_mentors')->where('program_id', $p->id)->where('participant_user_id', $participant->user_id)->delete();
                if ($data['mentor_user_id']) {
                    DB::table('program_mentors')->insert(['program_id' => $p->id, 'user_id' => $data['mentor_user_id'], 'participant_user_id' => $participant->user_id,
                        'cohort_id' => $participant->cohort_id, 'created_at' => now(), 'updated_at' => now()]);
                }
            }
            if (array_key_exists('milestones', $data)) {
                ProgramProgress::updateOrCreate(['program_id' => $p->id, 'user_id' => $participant->user_id], ['milestones' => $data['milestones'], 'cohort_id' => $participant->cohort_id]);
            }
            AdminAction::log($request->user()->id, 'accelerator.participant.updated', 'program_participant', $participant->id);
        });

        return response()->json(['message' => 'Participant updated.']);
    }
}
