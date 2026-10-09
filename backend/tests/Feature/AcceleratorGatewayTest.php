<?php

namespace Tests\Feature;

use App\Jobs\SendApplicationUpdate;
use App\Models\ApplicationEvent;
use App\Models\Cohort;
use App\Models\EcosystemRecord;
use App\Models\Program;
use App\Models\ProgramApplication;
use App\Models\ProgramParticipant;
use App\Models\ProgramResource;
use App\Models\User;
use App\Notifications\VerifyApplicantEmail;
use App\Services\AcceleratorGateway as Gateway;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AcceleratorGatewayTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
        $this->artisan('wosool:prepare-gateway --apply')->assertSuccessful();
    }

    private function applicant(): User
    {
        return User::factory()->create(['is_accelerator_applicant' => true]);
    }

    private function admin(): User
    {
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    private function payload(): array
    {
        return ['founder_role' => 'Founder', 'founder_bio' => 'Building a Saudi business.', 'city' => 'Riyadh', 'company_name' => 'Gateway Test Company',
            'company_description' => 'Operating test company.', 'company_stage' => 'growth', 'sector' => 'Software', 'team_size' => 5,
            'annual_revenue_usd' => 350000, 'is_owner' => true, 'is_operating' => true, 'venture_backed' => false, 'motivation' => 'Structured growth learning.',
            'current_challenge' => 'Execution focus.', 'expected_outcome' => 'Build a stronger operating system.', 'availability_confirmed' => true, 'consent' => true];
    }



    public function test_verification_requires_valid_signature_matching_account_and_expiry(): void
    {
        $u = User::factory()->unverified()->create(['is_accelerator_applicant' => true]);
        $path = URL::temporarySignedRoute('gateway.verification', now()->addMinutes(10), ['id' => $u->id, 'hash' => sha1($u->email)], absolute: false);
        $this->actingAs(User::factory()->create())->getJson($path)->assertForbidden();
        $this->actingAs($u)->getJson($path.'&tampered=1')->assertForbidden();
        $expired = URL::temporarySignedRoute('gateway.verification', now()->subMinute(), ['id' => $u->id, 'hash' => sha1($u->email)], absolute: false);
        $this->getJson($expired)->assertForbidden();
        $this->getJson($path)->assertOk();
        $this->assertTrue($u->fresh()->hasVerifiedEmail());
        $this->getJson($path)->assertOk();
    }




    public function test_eligibility_bounds_and_venture_path_are_server_configured(): void
    {
        foreach ([[249999, 'needs_discussion'], [250000, 'potentially_eligible'], [999999, 'potentially_eligible'], [1000000, 'needs_discussion']] as [$revenue,$result]) {
            $this->postJson('/api/v1/accelerator/eligibility', ['annual_revenue_usd' => $revenue, 'is_owner' => true, 'is_operating' => true, 'venture_backed' => false])->assertOk()->assertJsonPath('data.result', $result);
        }
        $this->postJson('/api/v1/accelerator/eligibility', ['annual_revenue_usd' => 1000, 'private_funding_usd' => 300000, 'is_owner' => true, 'is_operating' => true, 'venture_backed' => true])->assertJsonPath('data.route', 'venture_backed');
    }

    public function test_source_import_is_preview_first_idempotent_and_preserves_editorial_reviews(): void
    {
        $this->artisan('wosool:import-ecosystem')->assertSuccessful();
        $this->assertDatabaseCount('ecosystem_records', 0);
        $this->artisan('wosool:import-ecosystem --apply')->assertSuccessful();
        $this->assertDatabaseCount('ecosystem_records', 18);
        $count = DB::table('ecosystem_revisions')->count();
        $this->artisan('wosool:import-ecosystem --apply')->assertSuccessful();
        $this->assertDatabaseCount('ecosystem_revisions', $count);
        $row = EcosystemRecord::first();
        $row->update(['editorial_lock' => true, 'name_en' => 'Reviewed name']);
        $this->artisan('wosool:import-ecosystem --apply')->assertSuccessful();
        $this->assertSame('Reviewed name', $row->fresh()->name_en);
        $this->getJson('/api/v1/ecosystem?application_status=open')->assertOk();
        $this->getJson('/api/v1/ecosystem/the-garage-challenge-2-2026')->assertOk()->assertJsonPath('data.application_status', 'closed');
        $this->getJson('/api/v1/ecosystem/misk-launchpad-10')->assertOk()->assertJsonPath('data.application_status', 'closed')->assertJsonPath('data.verification_status', 'verified');
    }

    public function test_pending_partners_are_hidden_and_unapproved_publication_is_rejected(): void
    {
        $this->getJson('/api/v1/partners')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($this->admin())->postJson('/api/v1/admin/partners', ['name' => 'Unsafe', 'type' => 'ecosystem', 'status' => 'confirmed', 'is_public' => true,
            'identity_status' => 'needs_review', 'asset_status' => 'needs_review', 'designation_status' => 'needs_review'])->assertUnprocessable();
    }

    public function test_private_program_resources_never_leak_through_public_details(): void
    {
        $program = Gateway::program();
        ProgramResource::create(['program_id' => $program->id, 'title' => 'Private handbook', 'visibility' => 'enrolled_only', 'url' => 'https://example.test/private']);
        $this->getJson('/api/v1/programs/'.Gateway::SLUG)->assertOk()->assertJsonMissing(['url' => 'https://example.test/private'])->assertJsonMissingPath('data.settings');
    }

    public function test_privacy_requests_are_deduplicated_and_require_admin_to_resolve(): void
    {
        $u = $this->applicant();
        $this->actingAs($u)->postJson('/api/v1/applicant/privacy-requests', ['type' => 'deletion'])->assertCreated();
        $this->postJson('/api/v1/applicant/privacy-requests', ['type' => 'deletion'])->assertCreated();
        $this->assertDatabaseCount('privacy_requests', 1);
        $this->getJson('/api/v1/admin/privacy-requests')->assertForbidden();
        $this->actingAs($this->admin())->patchJson('/api/v1/admin/privacy-requests/1', ['status' => 'in_review', 'resolution' => 'Assess retention obligations.'])->assertOk();
        $this->assertDatabaseHas('users', ['id' => $u->id]);
        $this->actingAs($u)->getJson('/api/v1/eoa/privacy-requests')->assertOk()->assertJsonPath('data.0.status', 'in_review');
        $this->postJson('/api/v1/eoa/privacy-requests', ['type' => 'deletion'])->assertCreated();
        $this->assertDatabaseCount('privacy_requests', 1);
        $this->actingAs($this->applicant())->getJson('/api/v1/eoa/privacy-requests')->assertJsonCount(0, 'data');
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.privacy_request']);
    }

    public function test_private_responses_disable_caching_and_readiness_is_real(): void
    {
        $this->actingAs($this->applicant())->getJson('/api/v1/applicant/application')
            ->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private');
        $this->getJson('/api/ready')->assertOk()->assertJsonPath('status', 'ready');
        Gateway::program()->delete();
        $this->getJson('/api/ready')->assertStatus(503);
    }


    public function test_notifications_retry_without_repeating_completed_delivery_or_internal_notes(): void
    {
        config(['gateway.email_updates' => true]);
        $u = $this->applicant();
        $a = ProgramApplication::create(['program_id' => Gateway::program()->id, 'user_id' => $u->id, 'status' => 'submitted', 'motivation' => 'Test learning']);
        $e = ApplicationEvent::create(['application_id' => $a->id, 'to_status' => 'submitted', 'is_internal' => false]);
        Mail::shouldReceive('raw')->once()->andReturnNull();
        (new SendApplicationUpdate($e->id))->handle();
        (new SendApplicationUpdate($e->id))->handle();
        $this->assertNotNull($e->fresh()->notification_sent_at);
        $internal = ApplicationEvent::create(['application_id' => $a->id, 'to_status' => 'submitted', 'is_internal' => true]);
        (new SendApplicationUpdate($internal->id))->handle();
        $this->assertNull($internal->fresh()->notification_sent_at);
    }



    public function test_retired_writes_cannot_bypass_canonical_approvals_or_create_enrollment(): void
    {
        $this->postJson('/api/v1/auth/applicant-register', [])->assertStatus(410)->assertJsonPath('url', '/EOA/account');
        $user = $this->applicant();
        $application = ProgramApplication::create(['program_id' => Gateway::program()->id, 'user_id' => $user->id,
            'status' => 'accepted', 'motivation' => '', 'eoa_data' => ['company_name' => 'Protected'], 'eoa_version' => 3]);
        $this->actingAs($user);
        foreach ([['PUT', '/api/v1/applicant/application'], ['POST', '/api/v1/applicant/application/submit'], ['POST', '/api/v1/applicant/application/onboard']] as [$method, $url]) {
            $this->json($method, $url, ['revision' => 0, 'acknowledged' => true, 'payload' => $this->payload()])->assertStatus(410);
        }
        $this->actingAs($this->admin());
        foreach ([['PATCH', '/api/v1/review/accelerator/'.$application->id], ['PUT', '/api/v1/admin/accelerator/settings'],
            ['PUT', '/api/v1/admin/accelerator/participant'], ['POST', '/api/v1/admin/accelerator/resources']] as [$method, $url]) {
            $this->json($method, $url, ['status' => 'accepted', 'intake_enabled' => true])->assertStatus(410);
        }
        $this->assertSame('accepted', $application->fresh()->status);
        $this->assertSame(3, $application->fresh()->eoa_version);
        $this->assertDatabaseCount('program_participants', 0);
        $this->getJson('/api/v1/accelerator')->assertJsonPath('data.intake_enabled', false);
    }

    public function test_legacy_data_stays_private_read_only_and_cannot_be_silently_overwritten(): void
    {
        $owner = $this->applicant();
        $row = ProgramApplication::create(['program_id' => Gateway::program()->id, 'user_id' => $owner->id,
            'status' => 'draft', 'motivation' => '', 'gateway_payload' => $this->payload(), 'revision' => 4]);
        $this->actingAs($owner)->getJson('/api/v1/applicant/application')
            ->assertOk()->assertJsonPath('read_only', true)->assertJsonPath('data.gateway_payload.company_name', 'Gateway Test Company');
        $this->actingAs($this->applicant())->getJson('/api/v1/applicant/application')->assertJsonPath('data', null);
        $this->actingAs($owner)->getJson('/api/v1/eoa/application')->assertConflict();
        Gateway::program()->update(['settings' => ['eoa' => [
            'privacy_status' => 'approved', 'privacy_approval_reference' => 'test', 'privacy_notice_version' => 'v1',
            'privacy_notice_ar' => 'إشعار تجريبي', 'privacy_notice_en' => 'Test notice',
        ]]]);
        $this->putJson('/api/v1/eoa/application', ['version' => 0, 'company_name' => 'Overwrite'])->assertConflict();
        $this->assertSame('Gateway Test Company', $row->fresh()->gateway_payload['company_name']);
        $this->assertNull($row->fresh()->eoa_data);
        $this->assertArrayNotHasKey('gateway_payload', $row->toArray());
    }

    public function test_legacy_review_assignment_never_grants_access_to_canonical_application(): void
    {
        $reviewer = User::factory()->create();
        $reviewer->assignRole('accelerator-reviewer');
        $row = ProgramApplication::create(['program_id' => Gateway::program()->id, 'user_id' => $this->applicant()->id,
            'status' => 'submitted', 'motivation' => '', 'eoa_data' => ['company_name' => 'Private'], 'eoa_version' => 1,
            'eoa_submitted_at' => now(), 'assigned_reviewer_id' => $reviewer->id]);
        $this->actingAs($reviewer)->getJson('/api/v1/review/accelerator')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/eoa/review/'.$row->id)->assertForbidden();
    }

    public function test_preparation_is_closed_and_preserves_existing_approved_settings(): void
    {
        $program = Gateway::program();
        $this->assertFalse($program->is_open);
        $this->assertSame('draft', $program->status_flow);
        $program->update(['settings' => ['eoa' => ['approval_reference' => 'preserve-me']]]);
        $this->artisan('wosool:prepare-gateway --apply')->assertSuccessful();
        $this->assertSame('preserve-me', $program->fresh()->settings['eoa']['approval_reference']);
        $this->assertDatabaseCount('programs', 1);
    }

    public function test_generic_program_admin_cannot_bypass_eoa_controls(): void
    {
        $program = Gateway::program();
        $this->actingAs($this->admin());
        $this->putJson('/api/v1/admin/programs/'.$program->id, ['name' => 'Changed', 'category' => 'growth', 'is_open' => true])->assertConflict();
        $this->postJson('/api/v1/admin/programs/'.$program->id.'/cohorts', ['name' => 'Unapproved'])->assertConflict();
        $this->deleteJson('/api/v1/admin/programs/'.$program->id)->assertConflict();
        $this->assertFalse($program->fresh()->is_open);
        $this->assertDatabaseCount('cohorts', 0);
    }
}
