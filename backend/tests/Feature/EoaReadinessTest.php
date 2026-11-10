<?php
namespace Tests\Feature;

use App\Models\User;
use App\Services\Eoa\ProgramService;
use App\Services\Eoa\Readiness;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EoaReadinessTest extends TestCase
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
        $u->assignRole($role);
        return $u;
    }

    public function test_internal_finances_are_lead_only_and_not_public_or_in_staff_payloads(): void
    {
        $p = ProgramService::program();
        $p->update(['settings' => ['eoa_private_finance' => ['version' => 1, 'grant_received' => 15000, 'reference' => 'PRIVATE-RECONCILIATION'], 'eoa' => ['public_message_en' => 'Our launch grant is internal', 'editorial_published' => ['version' => 1, 'operator' => null, 'faqs' => [['visible' => true, 'question_en' => 'Funding', 'question_ar' => 'تمويل', 'answer_en' => 'Our launch grant', 'answer_ar' => 'منحة الإطلاق']]]]]]);
        $public = $this->getJson('/api/v1/eoa/program')->assertOk();
        $this->assertStringNotContainsString('PRIVATE-RECONCILIATION', $public->getContent());
        $this->assertStringNotContainsString('15000', $public->getContent());
        $public->assertJsonPath('data.public_message_en', null)->assertJsonCount(0, 'data.editorial.faqs');
        $this->assertArrayNotHasKey('settings', $p->toArray());
        foreach (['eoa_applicant', 'eoa_reviewer', 'eoa_coach', 'eoa_staff'] as $role) {
            $this->actingAs($this->user($role))->getJson('/api/v1/eoa/operations/finance')->assertForbidden();
        }
        $staff = $this->getJson('/api/v1/eoa/operations')->assertOk();
        $this->assertStringNotContainsString('PRIVATE-RECONCILIATION', $staff->getContent());
        $this->actingAs($this->user('eoa_lead'))->getJson('/api/v1/eoa/operations/finance')->assertOk()->assertJsonPath('data.grant_received', 15000);
    }

    public function test_readiness_is_versioned_and_does_not_create_appointments_or_open_intake(): void
    {
        $lead = $this->user('eoa_lead');
        $data = ['version' => 0, 'board' => [], 'coaches' => [], 'delivery_ready' => false, 'manager' => 'Confirmed manager'];
        $this->actingAs($lead)->putJson('/api/v1/eoa/operations/readiness', $data)->assertOk()->assertJsonPath('version', 1);
        $this->putJson('/api/v1/eoa/operations/readiness', $data)->assertConflict();
        $this->getJson('/api/v1/eoa/program')->assertJsonCount(0, 'data.governance')->assertJsonPath('data.applications_open', false);
        $this->assertFalse(Readiness::summary(ProgramService::program())['ready_for_official_launch']);
    }

    public function test_paid_counts_exclude_screened_pending_and_unconfirmed_sponsorship(): void
    {
        $p = ProgramService::program();
        foreach ([['onboarding', false, 'sponsored'], ['enrolled', true, 'pending'], ['enrolled', true, 'paid'], ['enrolled', true, 'sponsored']] as [$status, $global, $fee]) {
            $p->participants()->create(['user_id' => $this->user('eoa_applicant')->id, 'status' => $status, 'eoa_finance' => ['global_confirmed' => $global, 'fee_status' => $fee]]);
        }
        $this->assertSame(2, Readiness::paidParticipants($p));
        $this->assertSame(0, Readiness::finance($p)['potential_grant']);
    }

    public function test_untrained_coach_cannot_be_assigned_to_a_new_group(): void
    {
        $coach = $this->user('eoa_coach');
        $this->actingAs($this->user('eoa_staff'))->postJson('/api/v1/eoa/operations/create/groups', ['name' => 'Group', 'coach_id' => $coach->id])->assertUnprocessable();
    }
    public function test_approved_privacy_without_verified_email_delivery_does_not_open_registration(): void
    {
        $p = ProgramService::program();
        $p->update(['settings' => ['eoa' => ['privacy_status' => 'approved', 'privacy_approval_reference' => 'approval', 'privacy_notice_ar' => 'إشعار', 'privacy_notice_en' => 'Notice', 'privacy_notice_version' => 'v1']]]);
        config(['mail.default' => 'smtp']);
        $this->getJson('/api/v1/eoa/program')->assertJsonPath('data.data_collection_open', true)->assertJsonPath('data.registration_open', false);
        $this->postJson('/api/v1/eoa/auth/register', ['name' => 'Blocked', 'email' => 'not-created@example.test', 'password' => 'StrongPassword2026', 'password_confirmation' => 'StrongPassword2026', 'privacy_consent' => true])->assertStatus(503);
        $this->assertDatabaseMissing('users', ['email' => 'not-created@example.test']);
    }

    public function test_six_person_group_limit_and_unready_activation_are_enforced(): void
    {
        $p = ProgramService::program();
        $c = $p->cohorts()->create(['name' => 'Test', 'capacity' => 20, 'status' => 'active']);
        $g = \Illuminate\Support\Facades\DB::table('eoa_groups')->insertGetId(['program_id' => $p->id, 'cohort_id' => $c->id, 'name' => 'Full group']);
        for ($i=0; $i<6; $i++) $p->participants()->create(['user_id' => $this->user('eoa_applicant')->id, 'cohort_id' => $c->id, 'eoa_group_id' => $g, 'status' => 'enrolled']);
        $row = $p->participants()->create(['user_id' => $this->user('eoa_applicant')->id, 'status' => 'onboarding', 'eoa_onboarding' => ['completed_at' => now()->toIso8601String()]]);
        $this->actingAs($this->user('eoa_staff'))->patchJson('/api/v1/eoa/operations/participants/'.$row->id.'/assignment', ['cohort_id' => $c->id, 'group_id' => $g])->assertUnprocessable();
        $this->actingAs($this->user('eoa_lead'))->patchJson('/api/v1/eoa/operations/participants/'.$row->id, ['fee_status' => 'paid', 'global_confirmed' => true, 'fee_reference' => 'receipt', 'official_reference' => 'official'])->assertUnprocessable();
        $this->assertSame('onboarding', $row->fresh()->status);
    }

}
