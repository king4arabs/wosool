<?php

namespace Tests\Feature;

use App\Models\ProgramParticipant;
use App\Models\ProgramProgress;
use App\Models\User;
use App\Services\Eoa\ProgramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EoaManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('eoa:install');
    }

    private function user(string $role): User
    {
        $u = User::factory()->create();
        Role::findOrCreate($role, 'web');
        $u->assignRole($role);

        return $u;
    }

    private function participant(): ProgramParticipant
    {
        return ProgramService::program()->participants()->create(['user_id' => $this->user('eoa_applicant')->id, 'status' => 'enrolled', 'eoa_finance' => ['global_confirmed' => true, 'fee_status' => 'paid', 'fee_reference' => 'PRIVATE-RECEIPT']]);
    }

    public function test_staff_assignment_preserves_finance_and_rejects_cross_cohort_and_capacity(): void
    {
        $p = ProgramService::program();
        $a = $p->cohorts()->create(['name' => 'A', 'capacity' => 1, 'status' => 'active']);
        $b = $p->cohorts()->create(['name' => 'B', 'capacity' => 1, 'status' => 'active']);
        $g = DB::table('eoa_groups')->insertGetId(['program_id' => $p->id, 'cohort_id' => $a->id, 'name' => 'A group']);
        $row = $this->participant();
        $url = '/api/v1/eoa/operations/participants/'.$row->id.'/assignment';
        $this->actingAs($this->user('eoa_reviewer'))->patchJson($url, ['cohort_id' => $a->id, 'group_id' => $g])->assertForbidden();
        $this->actingAs($this->user('eoa_staff'))->patchJson($url, ['cohort_id' => $b->id, 'group_id' => $g])->assertUnprocessable();
        $this->patchJson($url, ['cohort_id' => $a->id, 'group_id' => $g, 'global_confirmed' => true])->assertUnprocessable();
        $this->patchJson($url, ['cohort_id' => $a->id, 'group_id' => $g])->assertOk();
        $this->assertSame('PRIVATE-RECEIPT', $row->fresh()->eoa_finance['fee_reference']);
        $this->assertSame('enrolled', $row->fresh()->status);
        $other = $this->participant();
        $this->patchJson('/api/v1/eoa/operations/participants/'.$other->id.'/assignment', ['cohort_id' => $a->id, 'group_id' => null])->assertUnprocessable();
        $this->getJson('/api/v1/eoa/operations')->assertOk()->assertJsonPath('data.participants.0.finance', null)->assertJsonMissing(['fee_reference' => 'PRIVATE-RECEIPT']);
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.assignment']);
    }

    public function test_summary_uses_actual_goals_and_restricts_access(): void
    {
        $row = $this->participant();
        ProgramProgress::create(['program_id' => $row->program_id, 'user_id' => $row->user_id, 'milestones' => [['title' => 'Late', 'due_date' => now()->subDay()->toDateString(), 'completed' => false], ['title' => 'Done', 'due_date' => now()->subDay()->toDateString(), 'completed' => true]]]);
        $this->actingAs($this->user('eoa_staff'))->getJson('/api/v1/eoa/operations')->assertOk()->assertJsonPath('data.management.learning.goals', 2)->assertJsonPath('data.management.learning.completed_goals', 1)->assertJsonPath('data.management.attention.overdue_goals', 1)->assertJsonPath('data.management.attention.unassigned_participants', 1);
        $this->actingAs($this->user('eoa_coach'))->getJson('/api/v1/eoa/operations')->assertForbidden();
    }

    public function test_roles_detect_stale_edits_and_allow_unverified_revocation(): void
    {
        $target = $this->user('eoa_coach');
        $url = '/api/v1/eoa/operations/accounts/'.$target->id;
        $this->actingAs($this->user('admin'))->patchJson($url, ['roles' => ['eoa_lead'], 'expected_roles' => []])->assertConflict();
        $this->assertTrue($target->fresh()->hasRole('eoa_coach'));
        $target->assignRole('eoa_reviewer');
        $target->update(['email_verified_at' => null]);
        $this->patchJson($url, ['roles' => ['eoa_coach'], 'expected_roles' => ['eoa_reviewer', 'eoa_coach'], 'reason' => 'Reduce scope'])->assertOk();
        $this->patchJson($url, ['roles' => ['eoa_lead'], 'expected_roles' => ['eoa_coach']])->assertUnprocessable();
    }

    public function test_coach_rejects_cancelled_sessions_and_inactive_participants(): void
    {
        $coach = $this->user('eoa_coach');
        $row = $this->participant();
        $g = DB::table('eoa_groups')->insertGetId(['program_id' => $row->program_id, 'coach_id' => $coach->id, 'name' => 'Assigned']);
        $row->update(['eoa_group_id' => $g]);
        $session = ProgramService::program()->sessions()->create(['title' => 'Cancelled', 'starts_at' => now()->subDay(), 'status' => 'cancelled']);
        $url = '/api/v1/eoa/coach/'.$row->id;
        $this->actingAs($coach)->patchJson($url, ['session_id' => $session->id, 'attendance' => 'attended'])->assertUnprocessable();
        $session->update(['status' => 'completed']);
        $this->patchJson($url, ['session_id' => $session->id, 'attendance' => 'attended'])->assertOk();
        $program = ProgramService::program();
        $cohort = $program->cohorts()->create(['name' => 'Unassigned cohort', 'capacity' => 10]);
        $program->sessions()->create(['title' => 'Private other cohort', 'cohort_id' => $cohort->id, 'starts_at' => now()->subDay(), 'status' => 'completed']);
        $program->sessions()->create(['title' => 'Future session', 'starts_at' => now()->addDay(), 'status' => 'scheduled']);
        $this->getJson('/api/v1/eoa/coach')->assertOk()->assertJsonCount(1, 'sessions')->assertJsonPath('sessions.0.id', $session->id);
        $row->update(['status' => 'onboarding']);
        $this->patchJson($url, ['mentor_feedback' => 'Hidden participant'])->assertConflict();
    }

    public function test_search_remains_assignment_scoped_and_goal_pillars_are_validated(): void
    {
        $reviewer = $this->user('eoa_reviewer');
        $applicant = $this->user('eoa_applicant');
        $a = ProgramService::program()->applications()->create(['user_id' => $applicant->id, 'motivation' => '', 'status' => 'submitted', 'eoa_submitted_at' => now()]);
        $url = '/api/v1/eoa/review?search='.urlencode($applicant->email);
        $this->actingAs($reviewer)->getJson($url)->assertJsonCount(0, 'data.data');
        DB::table('eoa_reviewers')->insert(['application_id' => $a->id, 'user_id' => $reviewer->id]);
        $this->getJson($url)->assertJsonCount(1, 'data.data');
        $row = $this->participant();
        $this->actingAs($row->user)->putJson('/api/v1/eoa/progress', ['milestones' => [['title' => 'Cash runway', 'completed' => false, 'pillar' => 'cash']]])->assertOk();
        $this->getJson('/api/v1/eoa/participant')->assertJsonPath('data.progress.milestones.0.pillar', 'cash');
        $this->putJson('/api/v1/eoa/progress', ['milestones' => [['title' => 'Invalid', 'completed' => false, 'pillar' => 'invented']]])->assertUnprocessable();
    }
}
