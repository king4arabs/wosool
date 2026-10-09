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

    private function submit(User $user): array
    {
        $saved = $this->actingAs($user)->putJson('/api/v1/applicant/application', ['revision' => 0, 'payload' => $this->payload()])->assertOk()->json('data');

        return $this->postJson('/api/v1/applicant/application/submit', ['revision' => $saved['revision']])->assertOk()->json('data');
    }

    public function test_registration_queues_verification_without_granting_community_access(): void
    {
        Notification::fake();
        $r = $this->postJson('/api/v1/auth/applicant-register', ['name' => 'Founder', 'email' => 'new@example.test', 'password' => 'StrongPassword123', 'password_confirmation' => 'StrongPassword123', 'consent' => true])->assertCreated();
        $u = User::findOrFail($r->json('user.id'));
        Notification::assertSentTo($u, VerifyApplicantEmail::class);
        $this->assertTrue($u->is_accelerator_applicant);
        $this->assertFalse($u->hasVerifiedEmail());
        $this->actingAs($u)->getJson('/api/v1/member/dashboard')->assertForbidden();
        $this->getJson('/api/v1/applicant/application')->assertForbidden();
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

    public function test_drafts_are_private_and_stale_updates_do_not_overwrite(): void
    {
        $u = $this->applicant();
        $other = $this->applicant();
        $this->actingAs($u)->putJson('/api/v1/applicant/application', ['revision' => 0, 'payload' => ['company_name' => 'Private draft']])->assertOk()->assertJsonPath('data.revision', 1);
        $this->putJson('/api/v1/applicant/application', ['revision' => 0, 'payload' => ['company_name' => 'Stale']])->assertConflict();
        $this->postJson('/api/v1/applicant/application/submit', ['revision' => 1])->assertUnprocessable();
        $this->actingAs($other)->getJson('/api/v1/applicant/application')->assertOk()->assertJsonPath('data', null);
        $this->actingAs($u)->getJson('/api/v1/applicant/application')->assertJsonPath('data.gateway_payload.company_name', 'Private draft');
        $this->putJson('/api/v1/applicant/application', ['revision' => 1, 'payload' => ['user_id' => $other->id]])->assertUnprocessable();
    }

    public function test_full_review_information_request_and_onboarding_journey(): void
    {
        $u = $this->applicant();
        $admin = $this->admin();
        $a = $this->submit($u);
        $id = $a['id'];
        $this->assertDatabaseHas('founder_profiles', ['user_id' => $u->id, 'is_public' => false]);
        $this->getJson('/api/v1/member/dashboard')->assertForbidden();
        $this->getJson('/api/v1/founders')->assertJsonCount(0, 'data');
        $this->actingAs($admin)->patchJson("/api/v1/review/accelerator/$id", ['revision' => $a['revision'], 'status' => 'accepted'])->assertUnprocessable();
        $a = $this->patchJson("/api/v1/review/accelerator/$id", ['revision' => $a['revision'], 'status' => 'under_review'])->assertOk()->json('data');
        $this->patchJson("/api/v1/review/accelerator/$id", ['revision' => $a['revision'], 'status' => 'information_requested'])->assertUnprocessable();
        $a = $this->patchJson("/api/v1/review/accelerator/$id", ['revision' => $a['revision'], 'status' => 'information_requested', 'message' => 'Please clarify your goals.'])->assertOk()->json('data');
        $saved = $this->actingAs($u)->putJson('/api/v1/applicant/application', ['revision' => $a['revision'], 'payload' => $this->payload()])->assertOk()->json('data');
        $a = $this->postJson('/api/v1/applicant/application/submit', ['revision' => $saved['revision']])->assertOk()->json('data');
        foreach (['under_review', 'shortlisted', 'accepted'] as $status) {
            $a = $this->actingAs($admin)->patchJson("/api/v1/review/accelerator/$id", ['revision' => $a['revision'], 'status' => $status])->assertOk()->json('data');
        }
        $this->actingAs($u)->postJson('/api/v1/applicant/application/onboard', ['revision' => $a['revision'], 'acknowledged' => true])->assertOk()->assertJsonPath('data.status', 'onboarded');
        $this->travel(61)->seconds();
        $this->postJson('/api/v1/applicant/application/onboard', ['revision' => $a['revision'], 'acknowledged' => true])->assertConflict();
        $this->assertDatabaseCount('program_participants', 1);
        $this->assertDatabaseCount('company_profiles', 1);
        $this->assertDatabaseCount('application_events', 8);
    }

    public function test_reviewer_sees_only_assigned_applications_and_cannot_accept_or_assign_foreign_cohort(): void
    {
        $u = $this->applicant();
        $a = $this->submit($u);
        $reviewer = User::factory()->create();
        $reviewer->assignRole('accelerator-reviewer');
        $this->actingAs($reviewer)->getJson('/api/v1/review/accelerator')->assertOk()->assertJsonCount(0, 'data');
        $this->patchJson('/api/v1/review/accelerator/'.$a['id'], ['revision' => $a['revision'], 'status' => 'under_review'])->assertForbidden();
        $a = $this->actingAs($this->admin())->patchJson('/api/v1/review/accelerator/'.$a['id'], ['revision' => $a['revision'], 'assigned_reviewer_id' => $reviewer->id, 'message' => 'Internal context'])->assertOk()->json('data');
        $this->actingAs($u)->getJson('/api/v1/applicant/application')->assertJsonMissing(['message' => 'Internal context']);
        $this->actingAs($reviewer)->getJson('/api/v1/review/accelerator')->assertJsonCount(1, 'data');
        foreach (['under_review', 'shortlisted'] as $s) {
            $a = $this->patchJson('/api/v1/review/accelerator/'.$a['id'], ['revision' => $a['revision'], 'status' => $s])->assertOk()->json('data');
        }
        $this->patchJson('/api/v1/review/accelerator/'.$a['id'], ['revision' => $a['revision'], 'status' => 'accepted'])->assertForbidden();
        $p = Program::create(['slug' => 'other', 'name' => 'Other', 'category' => 'growth']);
        $c = Cohort::create(['program_id' => $p->id, 'name' => 'Foreign']);
        $this->actingAs($this->admin())->patchJson('/api/v1/review/accelerator/'.$a['id'], ['revision' => $a['revision'], 'cohort_id' => $c->id])->assertUnprocessable();
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

    public function test_program_operations_are_admin_only_and_cohort_scoped(): void
    {
        $p = Gateway::program();
        $u = $this->applicant();
        $admin = $this->admin();
        $this->actingAs($u)->getJson('/api/v1/admin/accelerator/operations')->assertForbidden();
        $this->actingAs($admin)->getJson('/api/v1/admin/accelerator/operations')->assertOk();
        $c = Cohort::create(['program_id' => $p->id, 'name' => 'Local cohort']);
        $other = Program::create(['slug' => 'foreign-program', 'name' => 'Other', 'category' => 'growth']);
        $foreign = Cohort::create(['program_id' => $other->id, 'name' => 'Other cohort']);
        $this->postJson('/api/v1/admin/accelerator/resources', ['title' => 'Wrong', 'url' => 'https://example.test/guide', 'cohort_id' => $foreign->id])->assertUnprocessable();
        $this->postJson('/api/v1/admin/accelerator/resources', ['title' => 'Safe guide', 'url' => 'https://example.test/guide', 'cohort_id' => $c->id])->assertOk();
        $a = ProgramApplication::create(['program_id' => $p->id, 'user_id' => $u->id, 'status' => 'onboarded', 'motivation' => 'Test learning', 'cohort_id' => $c->id]);
        ProgramParticipant::create(['program_id' => $p->id, 'user_id' => $u->id, 'application_id' => $a->id, 'cohort_id' => $c->id, 'status' => 'enrolled']);
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');
        $this->putJson('/api/v1/admin/accelerator/participant', ['user_id' => $u->id, 'mentor_user_id' => $mentor->id, 'milestones' => [['title' => 'Growth plan', 'completed' => false]]])->assertOk();
        $session = $this->postJson('/api/v1/admin/programs/'.$p->id.'/sessions', ['title' => 'Learning day', 'session_type' => 'workshop', 'starts_at' => '2027-01-01T13:00:00+03:00', 'cohort_id' => $c->id])->assertCreated()->json('data.id');
        $this->assertDatabaseHas('program_sessions', ['id' => $session, 'starts_at' => '2027-01-01 10:00:00']);
        $this->postJson('/api/v1/admin/programs/'.$p->id.'/sessions/'.$session.'/attendance', ['user_id' => $u->id, 'status' => 'attended'])->assertOk();
        $this->postJson('/api/v1/admin/programs/'.$p->id.'/sessions/'.$session.'/attendance', ['user_id' => $mentor->id, 'status' => 'attended'])->assertUnprocessable();
        $this->actingAs($u)->getJson('/api/v1/applicant/application')->assertOk()
            ->assertJsonPath('data.resources.0.title', 'Safe guide')->assertJsonPath('data.mentors.0.name', $mentor->name)
            ->assertJsonPath('data.milestones.0.title', 'Growth plan');
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

    public function test_paused_intake_rejects_new_accounts_and_submission(): void
    {
        $p = Gateway::program();
        $p->update(['settings' => ['gateway' => ['intake_enabled' => false]]]);
        $this->postJson('/api/v1/auth/applicant-register', ['name' => 'Founder', 'email' => 'paused@example.test', 'password' => 'StrongPassword123', 'password_confirmation' => 'StrongPassword123', 'consent' => true])->assertStatus(503);
        $u = $this->applicant();
        $this->actingAs($u)->putJson('/api/v1/applicant/application', ['revision' => 0, 'payload' => $this->payload()])->assertOk();
        $this->postJson('/api/v1/applicant/application/submit', ['revision' => 1])->assertConflict();
    }
}
