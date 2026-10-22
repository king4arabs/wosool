<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Eoa\ProgramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EoaAlumniTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('eoa:install');
    }

    private function account(string $role): User
    {
        $u = User::factory()->create();
        $u->assignRole($role);

        return $u;
    }

    public function test_install_uses_six_month_duration_and_preserves_local_program_edits(): void
    {
        $this->assertSame('6 months', ProgramService::program()->duration);
        ProgramService::program()->update(['duration' => '6 months plus alumni support']);
        $this->artisan('eoa:install')->assertSuccessful();
        $this->assertSame('6 months plus alumni support', ProgramService::program()->duration);
    }

    public function test_local_model_and_new_cohort_default_are_six_months(): void
    {
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.delivery_model.duration_months', 6)->assertJsonPath('data.delivery_model.cohort_interval_months', 6)->assertJsonPath('data.delivery_model.eo_membership_automatic', false)->assertJsonMissingPath('data.facts.duration_years');
        $r = $this->actingAs($this->account('eoa_staff'))->postJson('/api/v1/eoa/operations/create/cohorts', ['name' => 'Six month cohort', 'starts_at' => '2026-08-31', 'capacity' => 15, 'status' => 'forming'])->assertCreated();
        $cohort = ProgramService::program()->cohorts()->findOrFail($r->json('id'));
        $this->assertSame('2027-02-28', $cohort->ends_at->toDateString());
    }

    public function test_graduation_is_lead_only_requires_six_months_and_preserves_membership(): void
    {
        $p = ProgramService::program();
        $u = $this->account('eoa_applicant');
        $c = $p->cohorts()->create(['name' => 'Cohort', 'starts_at' => now()->subMonth(), 'capacity' => 15, 'status' => 'active']);
        $row = $p->participants()->create(['user_id' => $u->id, 'cohort_id' => $c->id, 'status' => 'enrolled', 'eoa_finance' => ['global_confirmed' => true, 'fee_status' => 'paid'], 'eoa_onboarding' => ['completed_at' => now()->toIso8601String()]]);
        $url = '/api/v1/eoa/operations/participants/'.$row->id.'/alumni';
        $data = ['graduation_reference' => 'Leadership review', 'follow_up_on' => now()->addMonth()->toDateString(), 'support_plan' => 'Review progress toward the revenue target.'];
        $this->actingAs($this->account('eoa_staff'))->patchJson($url, $data)->assertForbidden();
        $this->actingAs($this->account('eoa_lead'))->patchJson($url, $data)->assertUnprocessable();
        $c->update(['starts_at' => now()->subMonths(7), 'ends_at' => now()->subMonth()]);
        $this->patchJson($url, $data)->assertOk();
        $this->assertSame('alumni', $row->fresh()->status);
        $this->assertNotNull($row->fresh()->completed_at);
        $this->assertEquals(['eoa_applicant'], $u->fresh()->getRoleNames()->all());
        $this->patchJson('/api/v1/eoa/operations/participants/'.$row->id, ['fee_status' => 'paid', 'global_confirmed' => true, 'official_reference' => 'EOA registration', 'fee_reference' => 'receipt'])->assertConflict();
        $this->actingAs($u)->getJson('/api/v1/eoa/participant')->assertOk()->assertJsonPath('data.alumni.support_plan', $data['support_plan'])->assertJsonMissing(['graduation_reference' => 'Leadership review'])->assertJsonPath('data.status', 'alumni');
        $this->putJson('/api/v1/eoa/progress', ['milestones' => [['title' => 'Grow revenue', 'completed' => false, 'pillar' => 'strategy']]])->assertOk();
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.alumni_updated']);
    }

    public function test_alumni_follow_ups_keep_cohort_and_coach_boundaries(): void
    {
        $p = ProgramService::program();
        $u = $this->account('eoa_applicant');
        $coach = $this->account('eoa_coach');
        $other = $this->account('eoa_coach');
        $c = $p->cohorts()->create(['name' => 'Graduated cohort', 'capacity' => 15]);
        $foreign = $p->cohorts()->create(['name' => 'New cohort', 'capacity' => 15]);
        $g = DB::table('eoa_groups')->insertGetId(['name' => 'Alumni group', 'program_id' => $p->id, 'cohort_id' => $c->id, 'coach_id' => $coach->id]);
        $row = $p->participants()->create(['user_id' => $u->id, 'cohort_id' => $c->id, 'eoa_group_id' => $g, 'status' => 'alumni', 'eoa_finance' => ['global_confirmed' => true]]);
        $s = $p->sessions()->create(['title' => 'Alumni follow-up', 'cohort_id' => $c->id, 'starts_at' => now()->addWeek(), 'status' => 'scheduled', 'session_type' => 'alumni_follow_up']);
        $x = $p->sessions()->create(['title' => 'Other cohort', 'cohort_id' => $foreign->id, 'starts_at' => now()->addWeek(), 'status' => 'scheduled']);
        $this->actingAs($u)->postJson('/api/v1/eoa/sessions/'.$s->id.'/register')->assertOk();
        $this->postJson('/api/v1/eoa/sessions/'.$x->id.'/register')->assertForbidden();
        $this->actingAs($coach)->patchJson('/api/v1/eoa/coach/'.$row->id, ['mentor_feedback' => 'Follow up on growth goals'])->assertOk();
        $this->actingAs($other)->patchJson('/api/v1/eoa/coach/'.$row->id, ['mentor_feedback' => 'Unauthorized'])->assertForbidden();
    }
}
