<?php

namespace Tests\Feature;

use App\Models\{Application, CompanyProfile, FounderIdentityReview, FounderOutreach, FounderProfile, Scorecard, User};
use App\Services\FounderIdentityService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Mail, Notification};
use Tests\TestCase;

class FounderIdentityLinkingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
        Mail::fake(); Notification::fake();
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    private function member(string $name = 'Mohammed Ahmad'): User
    {
        return User::factory()->create(['name' => $name, 'community_registration_started_at' => now()]);
    }

    private function source(string $slug = 'canonical-founder', string $name = 'Mohammed Ahmad'): FounderProfile
    {
        $profile = FounderProfile::create(['slug' => $slug, 'directory_key' => $slug, 'display_name' => $name,
            'translations' => ['ar' => ['name' => 'محمد أحمد', 'bio' => 'نبذة منشورة سابقة']],
            'status' => 'active', 'is_public' => true, 'source_urls' => ['https://example.com/about'],
            'linkedin_url' => 'https://www.linkedin.com/in/canonical-founder/']);
        $company = CompanyProfile::create(['slug' => $slug.'-company', 'name' => 'Example Company',
            'website' => 'https://www.example.com/', 'description' => 'Original company description', 'status' => 'active', 'is_public' => true]);
        $profile->companies()->attach($company->id, ['role' => 'Founder', 'is_primary' => true]);
        return $profile;
    }

    private function details(array $overrides = []): array
    {
        return array_replace(['full_name' => 'Mohammed Ahmad', 'phone' => '+966500000000', 'company_name' => 'Example Company',
            'company_website' => 'https://example.com/', 'sector' => 'Software', 'stage' => 'Seed', 'location' => 'Riyadh',
            'motivation' => 'Build the founder community.', 'what_you_offer' => 'Software experience', 'what_you_need' => 'Mentorship',
            'linkedin_url' => 'https://linkedin.com/in/canonical-founder', 'country_code' => 'SA', 'position' => 'Co-founder',
            'bio' => 'Reviewed owner biography with current professional experience.', 'company_description' => 'A business providing software to local companies.',
            'founded_year' => 2024, 'team_size' => 5, 'public_profile_consent' => true], $overrides);
    }

    private function submit(User $user, array $overrides = []): Application
    {
        $this->actingAs($user)->postJson('/api/v1/registration/application', $this->details($overrides))->assertCreated();
        return Application::where('user_id', $user->id)->firstOrFail();
    }

    public function test_verified_registration_finds_matches_but_cannot_claim_or_publish_without_admin_review(): void
    {
        $source = $this->source(); $user = $this->member();
        $application = $this->submit($user);
        $review = FounderIdentityReview::where('user_id', $user->id)->firstOrFail();
        $this->assertSame($source->id, $review->candidates[0]['id']);
        $this->assertContains('company_website', $review->candidates[0]['signals']);
        $this->assertNull($source->fresh()->user_id);
        $this->assertFalse($user->fresh()->hasRole('member'));
        $this->getJson('/api/v1/member/founder-profile')->assertForbidden();
        $this->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['matched_founder_id' => $source->id, 'identity_verified' => true])->assertForbidden();
        $this->actingAs($this->admin)->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertStatus(409);
        $this->assertSame('submitted', $application->fresh()->status);
        $this->assertDatabaseCount('scorecards', 0);
    }

    public function test_unapproved_registration_cannot_use_community_aliases_or_broadcast_authorization(): void
    {
        $user = $this->member(); $user->assignRole('member');
        $this->submit($user);
        foreach (['/api/v1', '/v1'] as $prefix) {
            $this->actingAs($user)->getJson($prefix.'/chat/rooms')->assertForbidden();
            $this->getJson($prefix.'/help-requests')->assertForbidden();
            $this->postJson($prefix.'/chat/rooms', ['title' => 'Unapproved'])->assertForbidden();
        }
        $this->postJson('/broadcasting/auth', ['channel_name' => 'private-chat.room.1', 'socket_id' => '1.2'])->assertForbidden();
        $this->actingAs($this->admin)->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['identity_verified' => true, 'create_new_profile' => true])->assertOk();
        $this->actingAs($user->fresh())->getJson('/api/v1/chat/rooms')->assertOk();
        $this->getJson('/api/v1/help-requests')->assertOk();
    }

    public function test_public_company_name_and_website_do_not_grant_a_new_applicant_company_access(): void
    {
        $source = $this->source(); $company = $source->companies()->first();
        $user = $this->member('Separate Founder');
        $this->submit($user, ['full_name' => 'Separate Founder', 'linkedin_url' => null]);
        $this->actingAs($this->admin)->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['identity_verified' => true, 'create_new_profile' => true])->assertOk();
        $this->assertFalse($user->fresh()->founderProfile->companies()->whereKey($company->id)->exists());
        $this->actingAs($user->fresh())->putJson('/api/v1/member/companies/'.$company->id, ['name' => 'Unauthorized edit'])->assertForbidden();
        $this->assertSame('Example Company', $company->fresh()->name);
    }

    public function test_admin_verification_uses_resulting_status_and_inactive_profiles_lose_the_badge(): void
    {
        $user = $this->member();
        $profile = FounderProfile::create(['user_id' => $user->id, 'slug' => 'moderated-founder', 'display_name' => $user->name, 'status' => 'pending']);
        $url = '/api/v1/admin/founders/'.$profile->id;
        $this->actingAs($this->admin)->patchJson($url, ['status' => 'active', 'is_verified' => true])->assertOk();
        $this->assertTrue($profile->fresh()->is_verified);
        $this->patchJson($url, ['status' => 'suspended', 'is_verified' => true])->assertConflict();
        $this->assertSame('active', $profile->fresh()->status);
        $this->patchJson($url, ['status' => 'suspended'])->assertOk();
        $this->assertFalse($profile->fresh()->is_verified); $this->assertNull($profile->fresh()->admin_verified_at);
    }

    public function test_invited_email_search_uses_decrypted_display_precedence_before_pagination(): void
    {
        $source = $this->source();
        FounderOutreach::create(['founder_profile_id' => $source->id, 'requested_by' => $this->admin->id,
            'email' => 'reviewed@example.com', 'status' => 'ready', 'evidence' => 'Confirmed by the founder.', 'verified_at' => now()]);
        $source->invitations()->create(['invited_by' => $this->admin->id, 'email' => 'older@example.com', 'recipient_evidence' => 'Earlier reviewed address.',
            'token_hash' => hash('sha256', 'old-token'), 'otp_hash' => 'unused', 'status' => 'sent', 'expires_at' => now()->addDay()]);
        $this->actingAs($this->admin)->getJson('/api/v1/admin/users?origin=invited&search=REVIEWED%40EXAMPLE.COM&per_page=1')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.founder_profile_id', $source->id);
        $this->getJson('/api/v1/admin/users?origin=invited&search=older%40example.com')->assertOk()->assertJsonPath('meta.total', 0);
    }

    public function test_admin_link_preserves_uid_slug_sources_and_scorecard_and_unifies_owner_data(): void
    {
        $source = $this->source(); $uid = $source->founder_uid;
        $card = Scorecard::create(['founder_profile_id' => $source->id, 'aggregate_score' => 73, 'historical_logs' => []]);
        $user = $this->member(); $this->submit($user);
        $this->actingAs($this->admin)->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['matched_founder_id' => $source->id, 'identity_verified' => true])->assertOk();
        $source->refresh();
        $this->assertSame($user->id, $source->user_id); $this->assertSame($uid, $source->founder_uid);
        $this->assertSame('canonical-founder', $source->slug);
        $this->assertSame($this->details()['bio'], $source->bio);
        $this->assertNull($source->translations);
        $this->assertSame($source->display_name, $user->fresh()->name);
        $this->assertSame(['https://example.com/about'], $source->source_urls);
        $this->assertTrue($source->is_verified); $this->assertNotNull($source->admin_verified_at);
        $this->assertSame($this->admin->id, $source->admin_verified_by);
        $this->assertSame($card->id, $source->scorecard->id); $this->assertEquals(73, $source->scorecard->aggregate_score);
        $this->assertDatabaseCount('founder_profiles', 1); $this->assertDatabaseCount('company_profiles', 1);
        $this->assertSame($this->details()['company_description'], $source->companies()->first()->description);
        $this->actingAs($user->fresh())->getJson('/api/v1/member/founder-profile')->assertOk()->assertJsonPath('data.founder_uid', $uid)
            ->assertJsonPath('data.admin_verification.verified', true)->assertJsonMissingPath('data.record_origin');
        $this->getJson('/api/v1/founders/'.$source->slug)->assertOk()->assertJsonPath('data.is_verified', true)
            ->assertJsonMissingPath('data.record_origin')->assertJsonMissingPath('data.admin_verification')->assertDontSee($user->email);
        $this->actingAs($this->admin)->getJson('/api/v1/admin/users')->assertJsonPath('meta.invited', 0)->assertJsonPath('meta.registered', 2);
    }

    public function test_no_match_publishes_one_new_verified_profile_and_repeat_approval_preserves_owner_edits(): void
    {
        $user = $this->member('New Independent Founder');
        $application = $this->submit($user, ['full_name' => $user->name, 'linkedin_url' => null]);
        $this->assertSame([], FounderIdentityReview::where('user_id', $user->id)->firstOrFail()->candidates);
        $this->actingAs($this->admin)->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['identity_verified' => true, 'create_new_profile' => true])->assertOk();
        $profile = $user->founderProfile()->firstOrFail();
        $profile->update(['bio' => 'Owner edited biography']);
        $this->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertOk();
        $this->assertSame('Owner edited biography', $profile->fresh()->bio);
        $this->assertTrue($profile->fresh()->is_verified); $this->assertTrue($user->fresh()->hasRole('member'));
        $this->assertDatabaseCount('founder_profiles', 1); $this->assertDatabaseCount('scorecards', 1);
        $this->getJson('/api/v1/founders?community=1')->assertJsonPath('meta.total', 1);
    }

    public function test_ambiguous_name_requires_explicit_administrator_selection_or_reviewed_new_identity(): void
    {
        $a = $this->source(); $b = $this->source('other-same-name'); $user = $this->member(); $application = $this->submit($user);
        $this->actingAs($this->admin)->getJson('/api/v1/admin/users/'.$user->id.'/identity')->assertOk()->assertJsonCount(2, 'data.candidates');
        $this->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['identity_verified' => true])->assertStatus(409);
        $this->assertNull($a->fresh()->user_id); $this->assertNull($b->fresh()->user_id);
        $this->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved', 'create_new_profile' => true])->assertUnprocessable();
        $this->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['identity_verified' => true, 'create_new_profile' => true])->assertOk();
        $this->assertDatabaseCount('founder_profiles', 3);
        $this->assertNull($a->fresh()->user_id); $this->assertNull($b->fresh()->user_id);
    }

    public function test_changed_ownership_and_deleted_or_suspended_sources_cannot_be_claimed(): void
    {
        $source = $this->source(); $user = $this->member(); $this->submit($user);
        $owner = $this->member('Actual Owner'); $source->update(['user_id' => $owner->id, 'claimed_at' => now()]);
        $this->actingAs($this->admin)->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['identity_verified' => true, 'matched_founder_id' => $source->id])->assertStatus(409);
        $this->assertSame($owner->id, $source->fresh()->user_id);
        $deleted = $this->source('deleted-source'); $deleted->delete();
        $suspended = $this->source('suspended-source'); $suspended->update(['status' => 'suspended']);
        $this->assertSame([], app(FounderIdentityService::class)->candidates($user, Application::where('user_id', $user->id)->first()));
    }

    public function test_origin_labels_and_candidate_evidence_are_administrator_only_and_accounts_without_profiles_are_visible(): void
    {
        $source = $this->source(); $user = $this->member(); $this->submit($user);
        $this->getJson('/api/v1/admin/users')->assertForbidden();
        $this->getJson('/api/v1/admin/users/'.$user->id.'/identity')->assertForbidden();
        $this->actingAs($this->admin)->getJson('/api/v1/admin/users?origin=invited')->assertOk()->assertJsonPath('data.0.origin', 'invited')->assertJsonPath('data.0.founder_profile_id', $source->id);
        $this->getJson('/api/v1/admin/users?origin=registered&search='.urlencode($user->email))->assertOk()->assertJsonPath('data.0.origin', 'registered')->assertJsonPath('data.0.user_id', $user->id);
        $this->getJson('/api/v1/founders/'.$source->slug)->assertOk()->assertJsonMissingPath('data.record_origin')->assertJsonMissingPath('data.admin_verification')->assertJsonMissingPath('data.invitation');
    }

    public function test_unverified_email_and_company_only_evidence_cannot_link_an_identity(): void
    {
        $this->source(); $user = $this->member('Different Person');
        $application = $this->submit($user, ['full_name' => 'Different Person', 'linkedin_url' => null]);
        $this->assertSame([], app(FounderIdentityService::class)->candidates($user, $application));
        $user->forceFill(['email_verified_at' => null])->save();
        $this->assertNull(app(FounderIdentityService::class)->refresh($user->fresh()));
        $this->actingAs($this->admin)->postJson('/api/v1/admin/users/'.$user->id.'/verify', ['identity_verified' => true, 'create_new_profile' => true])->assertStatus(409);
        $this->assertDatabaseCount('founder_profiles', 1);
    }

    public function test_arabic_name_normalization_finds_alias_without_relying_on_company_only(): void
    {
        $source = $this->source(); $user = $this->member('مُحَمَّد أَحْمَد');
        $review = app(FounderIdentityService::class)->refresh($user);
        $this->assertSame($source->id, $review->candidates[0]['id']);
        $this->assertSame(['name'], $review->candidates[0]['signals']);
        $this->assertNull(FounderIdentityService::website('https://linkedin.com.evil.test/in/person', true));
    }

    public function test_legacy_preapproval_does_not_bypass_review_of_new_registration_data(): void
    {
        $source = $this->source(); $user = $this->member();
        Application::create(['user_id' => $user->id, 'email' => $user->email, 'full_name' => $user->name,
            'status' => 'approved', 'reviewed_by' => $this->admin->id, 'reviewed_at' => now()]);
        $application = $this->submit($user);
        $this->assertSame('submitted', $application->status);
        $this->assertNull($source->fresh()->user_id);
        $application->update(['status' => 'approved']);
        app(\App\Services\MembershipRegistration::class)->linkVerifiedApplications($user->fresh());
        $this->assertSame('reviewing', $application->fresh()->status);
        $this->assertNull($source->fresh()->user_id);
        $this->assertFalse($user->fresh()->hasRole('member'));
    }
}
