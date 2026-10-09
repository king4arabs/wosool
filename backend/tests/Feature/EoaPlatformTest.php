<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\ProgramApplication;
use App\Models\ProgramParticipant;
use App\Models\User;
use App\Notifications\EoaVerifyEmail;
use App\Services\Eoa\ProgramService;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EoaPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('eoa:install')->assertSuccessful();
        ProgramService::program()->update(['settings' => ['eoa' => ['privacy_status' => 'approved', 'privacy_approval_reference' => 'fixture', 'privacy_notice_ar' => 'إشعار للاختبار', 'privacy_notice_en' => 'Test notice', 'privacy_notice_version' => 'test-v1']]]);
        Storage::fake('local');
        Notification::fake();
    }

    private function founder(): User
    {
        $u = User::factory()->create();
        $u->assignRole('eoa_applicant');

        return $u;
    }

    private function lead(): User
    {
        $u = User::factory()->create();
        $u->assignRole('eoa_lead');

        return $u;
    }

    private function fields(): array
    {
        return ['preferred_track_id' => DB::table('eoa_tracks')->value('id'), 'founder_name' => 'Test Founder', 'phone' => '+966500000001', 'founder_role' => 'founder', 'company_name' => 'Test Company', 'country' => 'Saudi Arabia', 'city' => 'Riyadh', 'sector' => 'Technology', 'stage' => 'operating', 'revenue_amount' => 300000, 'revenue_currency' => 'USD', 'revenue_year' => 2025, 'growth_objectives' => 'Build a sustainable company with predictable revenue and leadership.', 'support_needs' => 'Peer learning', 'privacy_consent' => true, 'accuracy_confirmed' => true, 'attendance_commitment' => true];
    }

    private function draft(User $u): array
    {
        return $this->actingAs($u)->putJson('/api/v1/eoa/application', $this->fields() + ['version' => 0])->assertOk()->json('data');
    }

    private function submit(User $u): array
    {
        $a = $this->draft($u);
        $this->postJson('/api/v1/eoa/documents', ['document' => UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf')])->assertCreated();
        ProgramService::program()->update(['is_open' => true, 'settings' => ['eoa' => array_merge(ProgramService::settings(ProgramService::program()), ['approval_status' => 'approved'])]]);

        return $this->postJson('/api/v1/eoa/application/submit', ['version' => $a['version']])->assertOk()->json('data');
    }

    public function test_registration_verification_and_network_access_boundaries(): void
    {
        $this->postJson('/api/v1/eoa/auth/register', ['name' => 'EOA Founder', 'email' => 'Founder@example.com', 'password' => 'StrongPassword2026', 'password_confirmation' => 'StrongPassword2026', 'privacy_consent' => true])->assertCreated()->assertJsonPath('email_queued', false);
        $u = User::where('email', 'founder@example.com')->firstOrFail();
        Notification::assertSentTo($u, EoaVerifyEmail::class);
        $this->actingAs($u)->putJson('/api/v1/eoa/application', ['version' => 0])->assertForbidden();
        $this->getJson('/api/v1/member/dashboard')->assertForbidden();
        $link = URL::temporarySignedRoute('eoa.verify', now()->addHour(), ['id' => $u->id, 'hash' => sha1($u->email)], false);
        $this->get($link)->assertRedirect();
        $this->assertNotNull($u->fresh()->email_verified_at);
        $this->get($link.'invalid')->assertForbidden();
        $this->getJson('/api/v1/eoa/review')->assertForbidden();
    }

    public function test_drafts_are_encrypted_versioned_and_private(): void
    {
        $u = $this->founder();
        $a = $this->draft($u);
        $raw = DB::table('program_applications')->where('id', $a['id'])->value('eoa_data');
        $this->assertStringNotContainsString('300000', $raw);
        $this->putJson('/api/v1/eoa/application', ['version' => 0])->assertConflict();
        $this->actingAs($this->founder())->getJson('/api/v1/eoa/application')->assertOk()->assertJsonPath('data', null);
        $this->getJson('/api/v1/eoa/review/'.$a['id'])->assertForbidden();
        $this->assertArrayNotHasKey('eoa_data', ProgramApplication::findOrFail($a['id'])->toArray());
    }

    public function test_submission_requires_open_intake_complete_fields_and_evidence(): void
    {
        $a = $this->draft($this->founder());
        $this->postJson('/api/v1/eoa/application/submit', ['version' => $a['version']])->assertConflict();
        ProgramService::program()->update(['is_open' => true, 'settings' => ['eoa' => array_merge(ProgramService::settings(ProgramService::program()), ['approval_status' => 'approved'])]]);
        $this->postJson('/api/v1/eoa/application/submit', ['version' => $a['version']])->assertUnprocessable();
        $this->postJson('/api/v1/eoa/documents', ['document' => UploadedFile::fake()->create('bad.html', 5, 'text/html')])->assertUnprocessable();
        $this->postJson('/api/v1/eoa/documents', ['document' => UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf')])->assertCreated();
        $this->postJson('/api/v1/eoa/application/submit', ['version' => $a['version']])->assertOk();
        $this->postJson('/api/v1/eoa/application/submit', ['version' => $a['version']])->assertConflict();
        $this->assertDatabaseCount('eoa_notifications', 1);
    }

    public function test_document_authorization_and_reviewer_assignment(): void
    {
        $u = $this->founder();
        $a = $this->submit($u);
        $doc = DB::table('eoa_documents')->first();
        $this->get('/api/v1/eoa/documents/'.$doc->id)->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $this->actingAs($this->founder())->getJson('/api/v1/eoa/documents/'.$doc->id)->assertForbidden();
        $reviewer = User::factory()->create();
        $reviewer->assignRole('eoa_reviewer');
        $this->actingAs($reviewer)->getJson('/api/v1/eoa/review/'.$a['id'])->assertForbidden();
        DB::table('eoa_reviewers')->insert(['application_id' => $a['id'], 'user_id' => $reviewer->id]);
        $this->getJson('/api/v1/eoa/review/'.$a['id'])->assertOk();
        $this->patchJson('/api/v1/eoa/review/'.$a['id'], ['status' => 'accepted', 'track_id' => DB::table('eoa_tracks')->value('id'), 'version' => $a['version'], 'message' => 'Approved'])->assertForbidden();
        $this->patchJson('/api/v1/eoa/review/'.$a['id'], ['status' => 'information_requested', 'version' => $a['version'], 'message' => 'Please clarify reporting year.'])->assertOk();
        $this->actingAs($u)->putJson('/api/v1/eoa/application', $this->fields() + ['version' => $a['version'] + 1])->assertOk();
        $this->actingAs($this->lead())->postJson('/api/v1/eoa/review/'.$a['id'].'/assign', ['reviewer_id' => $reviewer->id, 'remove' => true])->assertOk();
        $this->actingAs($reviewer)->getJson('/api/v1/eoa/review/'.$a['id'])->assertForbidden();
        $this->getJson('/api/v1/eoa/documents/'.$doc->id)->assertForbidden();
    }

    public function test_review_onboarding_and_official_enrollment_flow(): void
    {
        $u = $this->founder();
        $a = $this->submit($u);
        $lead = $this->lead();
        $this->actingAs($lead)->patchJson('/api/v1/eoa/review/'.$a['id'], ['status' => 'accepted', 'track_id' => DB::table('eoa_tracks')->value('id'), 'version' => $a['version'], 'message' => 'Local review complete.'])->assertOk();
        $p = ProgramParticipant::firstOrFail();
        $this->assertSame('onboarding', $p->status);
        $this->actingAs($u)->postJson('/api/v1/eoa/onboarding', ['participation_agreed' => true, 'profile_confirmed' => true])->assertOk();
        $this->actingAs($lead)->patchJson('/api/v1/eoa/operations/participants/'.$p->id, ['fee_status' => 'paid', 'global_confirmed' => true])->assertUnprocessable();
        $this->patchJson('/api/v1/eoa/operations/participants/'.$p->id, ['fee_status' => 'paid', 'global_confirmed' => true, 'fee_reference' => 'receipt-1', 'official_reference' => 'eo-record-1'])->assertOk();
        $this->assertSame('enrolled', $p->fresh()->status);
        $this->actingAs($u)->putJson('/api/v1/eoa/progress', ['milestones' => [['title' => 'Create a growth plan', 'completed' => false]]])->assertOk();
        $this->getJson('/api/v1/eoa/participant')->assertOk()->assertJsonPath('data.status', 'enrolled')->assertJsonMissing(['official_reference' => 'eo-record-1']);
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.review']);
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.enrollment']);
    }

    public function test_public_partner_and_program_privacy_and_repeatable_import(): void
    {
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonCount(0, 'data.partners')->assertJsonPath('data.facts.annual_global_fee_usd', 1750);
        $this->artisan('eoa:install')->assertSuccessful();
        $this->assertDatabaseCount('ecosystem_organizations', 7);
        $p = ProgramService::program();
        $p->update(['settings' => ['eoa' => ['approval_reference' => 'PRIVATE APPROVAL']]]);
        $p->resources()->create(['title' => 'Confidential', 'url' => 'https://example.com/private']);
        $this->getJson('/api/v1/programs/'.$p->slug)->assertOk()->assertJsonMissing(['approval_reference' => 'PRIVATE APPROVAL'])->assertJsonMissing(['url' => 'https://example.com/private']);
        $lead = $this->lead();
        $org = DB::table('ecosystem_organizations')->where('slug', 'eo-riyadh')->first();
        $this->actingAs($lead)->patchJson('/api/v1/eoa/operations/organizations/'.$org->id, ['relationship_status' => 'confirmed'])->assertUnprocessable();
        $this->patchJson('/api/v1/eoa/operations/organizations/'.$org->id, ['relationship_status' => 'confirmed', 'relationship_evidence' => 'Approved record: test reference'])->assertOk();
        $this->getJson('/api/v1/eoa/program')->assertJsonCount(1, 'data.partners');
        $this->artisan('eoa:install')->assertSuccessful();
        $this->assertDatabaseHas('ecosystem_organizations', ['id' => $org->id, 'relationship_status' => 'confirmed']);
    }

    public function test_coach_and_cross_cohort_boundaries(): void
    {
        $u = $this->founder();
        $a = $this->submit($u);
        $coach = User::factory()->create();
        $coach->assignRole('eoa_coach');
        $p = ProgramService::program();
        $c = $p->cohorts()->create(['name' => 'A']);
        $other = $p->cohorts()->create(['name' => 'B']);
        $group = DB::table('eoa_groups')->insertGetId(['program_id' => $p->id, 'cohort_id' => $c->id, 'name' => 'Group A', 'coach_id' => $coach->id]);
        $participant = $p->participants()->create(['user_id' => $u->id, 'application_id' => $a['id'], 'status' => 'enrolled', 'cohort_id' => $c->id, 'eoa_group_id' => $group, 'eoa_finance' => ['global_confirmed' => true]]);
        $session = $p->sessions()->create(['title' => 'Other cohort', 'cohort_id' => $other->id, 'starts_at' => now()->addDay()]);
        $this->actingAs($u)->postJson('/api/v1/eoa/sessions/'.$session->id.'/register')->assertForbidden();
        $this->getJson('/api/v1/eoa/participant')->assertJsonCount(0, 'data.sessions');
        $this->actingAs($coach)->getJson('/api/v1/eoa/review/'.$a['id'])->assertForbidden();
        $this->getJson('/api/v1/eoa/documents/'.DB::table('eoa_documents')->value('id'))->assertForbidden();
        $this->getJson('/api/v1/eoa/coach')->assertOk()->assertJsonCount(1, 'data')->assertJsonMissing(['revenue_amount' => 300000]);
        $this->patchJson('/api/v1/eoa/coach/'.$participant->id, ['mentor_feedback' => 'Agree on a measurable next step.'])->assertOk();
        $second = User::factory()->create();
        $second->assignRole('eoa_coach');
        $this->actingAs($second)->patchJson('/api/v1/eoa/coach/'.$participant->id, ['mentor_feedback' => 'Not assigned'])->assertForbidden();
    }

    public function test_privacy_approval_and_expired_verification_are_enforced(): void
    {
        ProgramService::program()->update(['settings' => []]);
        $this->postJson('/api/v1/eoa/auth/register', ['name' => 'Blocked Account', 'email' => 'blocked@example.com', 'password' => 'StrongPassword2026', 'password_confirmation' => 'StrongPassword2026', 'privacy_consent' => true])->assertStatus(503);
        $this->assertDatabaseMissing('users', ['email' => 'blocked@example.com']);
        $this->getJson('/api/v1/eoa/program')->assertJsonPath('data.data_collection_open', false);
        $u = $this->founder();
        $this->actingAs($u)->putJson('/api/v1/eoa/application', $this->fields() + ['version' => 0])->assertStatus(503);
        $u->update(['email_verified_at' => null]);
        $url = URL::temporarySignedRoute('eoa.verify', now()->subMinute(), ['id' => $u->id, 'hash' => sha1($u->email)], false);
        $this->get($url)->assertForbidden();
        $this->assertNull($u->fresh()->email_verified_at);
        $reset = (new ResetPassword('test-token'))->toMail($u);
        $this->assertStringContainsString('/EOA/reset-password?', $reset->actionUrl);
    }

    public function test_operations_edits_and_fee_approval_are_scoped_and_audited(): void
    {
        $u = $this->founder();
        $this->actingAs($u)->getJson('/api/v1/eoa/operations')->assertForbidden();
        $this->actingAs($this->lead());
        $base = ProgramService::settings(ProgramService::program()) + ['is_open' => false];
        $base['local_fee_status'] = 'approved';
        $base['local_fee_usd'] = 250;
        $base['sponsor_contribution_usd'] = 500;
        $base['participant_contribution_usd'] = 1400;
        $this->putJson('/api/v1/eoa/operations/settings', $base)->assertUnprocessable();
        $base['participant_contribution_usd'] = 1500;
        $this->putJson('/api/v1/eoa/operations/settings', $base)->assertOk();
        $base['is_open'] = true;
        $base['approval_status'] = 'approved';
        $base['approval_reference'] = 'approved-record';
        $this->putJson('/api/v1/eoa/operations/settings', $base)->assertUnprocessable(); // log transport
        $cohort = $this->postJson('/api/v1/eoa/operations/create/cohorts', ['name' => 'First intake', 'capacity' => 15])->assertCreated()->json('id');
        $session = ['title' => 'Learning day', 'cohort_id' => $cohort, 'starts_at' => '2026-12-01T09:00:00+03:00', 'duration_minutes' => 180, 'session_type' => 'learning_day'];
        $id = $this->postJson('/api/v1/eoa/operations/create/sessions', $session)->assertCreated()->json('id');
        $session['starts_at'] = '2026-12-02T09:00:00+03:00';
        $this->patchJson('/api/v1/eoa/operations/update/sessions/'.$id, $session)->assertOk();
        $this->assertDatabaseHas('program_sessions', ['id' => $id, 'starts_at' => '2026-12-02 06:00:00']);
        $other = ProgramService::program()->replicate();
        $other->slug = 'other';
        $other->save();
        $c = $other->cohorts()->create(['name' => 'Other intake']);
        $this->patchJson('/api/v1/eoa/operations/update/cohorts/'.$c->id, ['name' => 'Unauthorized edit', 'capacity' => 2])->assertNotFound();
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.update_sessions', 'entity_id' => $id]);
        $this->getJson('/api/v1/eoa/operations')->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_waitlist_interview_and_rejection_notify_without_enrolling(): void
    {
        $u = $this->founder();
        $a = $this->submit($u);
        $this->actingAs($this->lead());
        foreach (['waitlisted', 'interview', 'rejected'] as $status) {
            $data = ['status' => $status, 'version' => $a['version'], 'message' => 'Your review has progressed.'];
            if ($status === 'interview') {
                $data += ['interview_at' => now()->addWeek()->toIso8601String(), 'interview_location' => 'Private meeting details'];
            }
            $a = $this->patchJson('/api/v1/eoa/review/'.$a['id'], $data)->assertOk()->json('data');
        }
        $this->assertDatabaseCount('program_participants', 0);
        $this->assertDatabaseCount('eoa_notifications', 4);
        $this->actingAs($u)->getJson('/api/v1/eoa/application')->assertJsonPath('data.status', 'rejected');
        $this->assertSame('test-v1', ProgramApplication::findOrFail($a['id'])->eoa_data['privacy_notice_version']);
    }

    public function test_contact_inquiries_are_scoped_and_manual_handling_is_audited(): void
    {
        $this->postJson('/api/v1/contact', ['name' => 'Partner', 'email' => 'partner@example.com', 'category' => 'partnerships', 'subject' => 'EO Accelerator — Support', 'message' => 'We would like to discuss approved support.'])->assertCreated();
        $row = ContactMessage::firstOrFail();
        $this->actingAs($this->founder())->patchJson('/api/v1/eoa/operations/inquiries/'.$row->id, ['handled' => true])->assertForbidden();
        $this->actingAs($this->lead())->getJson('/api/v1/eoa/operations')->assertJsonCount(1, 'data.inquiries');
        $this->patchJson('/api/v1/eoa/operations/inquiries/'.$row->id, ['handled' => true])->assertOk();
        $this->assertNotNull($row->fresh()->responded_at);
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.inquiry_handled']);
    }
}
