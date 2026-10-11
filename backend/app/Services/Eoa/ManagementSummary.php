<?php

namespace App\Services\Eoa;

use App\Models\Program;
use App\Models\ProgramProgress;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ManagementSummary
{
    public static function forProgram(Program $program): array
    {
        $participants = $program->participants()->get();
        $enrolled = $participants->where('status', 'enrolled');
        $progress = ProgramProgress::where('program_id', $program->id)->whereIn('user_id', $enrolled->pluck('user_id'))->get();
        $goals = $progress->flatMap(fn ($p) => $p->milestones ?? []);
        $today = now('Asia/Riyadh')->toDateString();
        $applications = $program->applications()->whereNotNull('eoa_submitted_at');
        $groups = DB::table('eoa_groups')->where('program_id', $program->id)->get();
        $validCoaches = User::role('eoa_coach')->whereNotNull('email_verified_at')->pluck('id');

        return [
            'generated_at' => now()->toIso8601String(),
            'pipeline' => (clone $applications)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'attention' => [
                'unassigned_reviews' => (clone $applications)->whereIn('status', ['submitted', 'under_review', 'interview'])->whereNotIn('id', DB::table('eoa_reviewers')->whereIn('user_id', User::role('eoa_reviewer')->whereNotNull('email_verified_at')->select('id'))->select('application_id'))->count(),
                'overdue_reviews' => (clone $applications)->whereIn('status', ['submitted', 'under_review'])->where('updated_at', '<', now()->subDays(14))->count(),
                'onboarding' => $participants->where('status', 'onboarding')->count(),
                'unassigned_participants' => $enrolled->filter(fn ($p) => ! $p->cohort_id || ! $p->eoa_group_id)->count(),
                'groups_without_coach' => $groups->filter(fn ($g) => ! $validCoaches->contains($g->coach_id))->count(),
                'overdue_goals' => $goals->filter(fn ($g) => empty($g['completed']) && ! empty($g['due_date']) && $g['due_date'] < $today)->count(),
            ],
            'learning' => [
                'goals' => $goals->count(), 'completed_goals' => $goals->where('completed', true)->count(),
                'participants_with_goals' => $progress->filter(fn ($p) => count($p->milestones ?? []) > 0)->count(),
                'enrolled' => $enrolled->count(),
            ],
            'upcoming_sessions' => $program->sessions()->where('status', 'scheduled')->where('starts_at', '>', now())->orderBy('starts_at')->limit(5)->get(['id', 'title', 'starts_at', 'session_type', 'cohort_id']),
            'cohorts' => $program->cohorts()->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'status' => $c->status, 'capacity' => $c->capacity, 'assigned' => $participants->where('cohort_id', $c->id)->count()]),
        ];
    }
}
