<?php
namespace Tests\Feature;

use App\Models\{FounderOutreach, FounderProfile, User};
use App\Notifications\FounderActivationInvitation;
use App\Services\FounderEmailResearch;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Http, Notification};
use Tests\TestCase;

class FounderOutreachTest extends TestCase
{
    use RefreshDatabase;
    private User $admin;
    protected function setUp(): void {
        parent::setUp(); $this->seed(RoleAndPermissionSeeder::class);
        $this->admin = User::factory()->create(); $this->admin->assignRole('admin');
        config(['mail.default' => 'smtp', 'services.openai.api_key' => 'test-key']);
        Notification::fake(); Http::preventStrayRequests();
    }
    private function profile(string $slug = 'test-founder'): FounderProfile {
        return FounderProfile::create(['slug' => $slug, 'display_name' => 'Test Founder', 'status' => 'active', 'is_public' => true]);
    }
    private function bulk(string $action, array $data = []) {
        return $this->actingAs($this->admin)->postJson('/api/v1/admin/founders/outreach', ['action' => $action] + $data);
    }
    private function verify(FounderProfile $profile): void {
        $this->actingAs($this->admin)->putJson('/api/v1/admin/founders/'.$profile->id.'/recipient', [
            'email' => 'founder@example.com', 'recipient_evidence' => 'Confirmed directly by the founder.', 'recipient_verified' => true,
        ])->assertOk();
    }
    public function test_bulk_sends_only_verified_unclaimed_profiles_and_is_idempotent(): void {
        $profile = $this->profile(); $this->profile('missing-email');
        $owned = $this->profile('owned'); $owned->update(['user_id' => User::factory()->create()->id]);
        $this->verify($profile);
        $this->bulk('invite', ['all_inactive' => true])->assertOk()->assertJsonPath('data.queued', 1)->assertJsonPath('data.skipped', 1);
        $this->bulk('invite', ['all_inactive' => true])->assertOk()->assertJsonPath('data.queued', 0);
        Notification::assertNothingSent();
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        Notification::assertSentOnDemand(FounderActivationInvitation::class, fn ($mail) => str_contains($mail->activationUrl, '/activate-founder#token='));
        $this->assertSame('sent', FounderOutreach::first()->status);
        $this->bulk('invite', ['all_inactive' => true])->assertOk()->assertJsonPath('data.queued', 0);
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        Notification::assertCount(1);
    }
    public function test_research_retries_then_requires_review_and_never_exposes_email_publicly(): void {
        $profile = $this->profile();
        $this->mock(FounderEmailResearch::class, function ($mock) {
            $mock->shouldReceive('configured')->andReturn(true);
            $mock->shouldReceive('find')->once()->andReturn(null);
            $mock->shouldReceive('find')->once()->andReturn(['email' => 'founder@example.com', 'source_url' => 'https://example.com/team', 'evidence' => 'Founder: founder@example.com']);
        });
        $this->bulk('research', ['ids' => [$profile->id]])->assertOk()->assertJsonPath('data.queued', 1);
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        $row = FounderOutreach::first(); $this->assertSame('retry', $row->status); $this->assertTrue($row->next_attempt_at->isFuture());
        $this->travel(2)->days(); $this->artisan('wosool:founder-outreach')->assertSuccessful();
        $row->refresh(); $this->assertSame('review', $row->status); $this->assertNull($row->verified_at);
        $this->assertNotSame('founder@example.com', $row->getRawOriginal('email'));
        $this->bulk('invite', ['all_inactive' => true])->assertOk()->assertJsonPath('data.queued', 0);
        $this->getJson('/api/v1/admin/founders')->assertOk()->assertJsonPath('data.0.outreach.email', 'founder@example.com');
        $this->getJson('/api/v1/founders/'.$profile->slug)->assertOk()->assertJsonMissingPath('data.outreach')->assertJsonMissing(['email' => 'founder@example.com']);
        Notification::assertNothingSent();
    }
    public function test_cancel_and_claimed_profiles_stop_research(): void {
        $profile = $this->profile();
        $this->bulk('research', ['all_inactive' => true])->assertOk();
        $this->bulk('cancel', ['ids' => [$profile->id]])->assertOk()->assertJsonPath('data.queued', 1);
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        $this->assertSame('cancelled', FounderOutreach::first()->status);
        $this->bulk('research', ['all_inactive' => true])->assertOk();
        $profile->update(['user_id' => User::factory()->create()->id]);
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        $this->assertSame('cancelled', FounderOutreach::first()->status); Http::assertNothingSent();
    }
    public function test_permissions_validation_and_missing_configuration(): void {
        $profile = $this->profile(); $member = User::factory()->create(); $member->assignRole('member');
        $this->actingAs($member)->postJson('/api/v1/admin/founders/outreach', ['action' => 'research', 'all_inactive' => true])->assertForbidden();
        $this->putJson('/api/v1/admin/founders/'.$profile->id.'/recipient', [])->assertForbidden();
        $this->bulk('invite')->assertUnprocessable();
        $this->actingAs($this->admin)->putJson('/api/v1/admin/founders/'.$profile->id.'/recipient', ['email' => 'founder@example.com'])->assertUnprocessable();
        config(['services.openai.api_key' => '']); $this->bulk('research', ['all_inactive' => true])->assertStatus(503);
        config(['mail.default' => 'log']); $this->bulk('invite', ['all_inactive' => true])->assertStatus(503);
        $this->assertSame(0, FounderOutreach::count());
    }
    public function test_web_research_requires_actual_source_and_explicit_email_evidence(): void {
        $profile = $this->profile(); $url = 'https://example.com/team';
        $reply = fn ($source) => ['status' => 'completed', 'output' => [
            ['type' => 'web_search_call', 'action' => ['sources' => [['url' => $source]]]],
            ['type' => 'message', 'content' => [['type' => 'output_text', 'text' => json_encode(['email' => 'founder@example.com', 'source_url' => $url, 'evidence' => 'Founder: founder@example.com'])]]],
        ]];
        Http::fakeSequence()->push($reply('https://example.com/other'))->push($reply($url));
        $service = app(FounderEmailResearch::class);
        $this->assertNull($service->find($profile));
        $this->assertSame('founder@example.com', $service->find($profile)['email']);
        Http::assertSent(fn ($request) => $request['store'] === false && $request['tools'][0]['type'] === 'web_search');
    }
    public function test_cancellation_during_research_cannot_be_overwritten(): void {
        $profile = $this->profile();
        $this->mock(FounderEmailResearch::class, function ($mock) {
            $mock->shouldReceive('configured')->andReturn(true);
            $mock->shouldReceive('find')->once()->andReturnUsing(function () {
                FounderOutreach::query()->update(['status' => 'cancelled']);
                return ['email' => 'founder@example.com', 'source_url' => 'https://example.com/team', 'evidence' => 'Founder: founder@example.com'];
            });
        });
        $this->bulk('research', ['ids' => [$profile->id]])->assertOk();
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        $this->assertSame('cancelled', FounderOutreach::first()->status); $this->assertNull(FounderOutreach::first()->email);
    }
    public function test_failed_mail_is_not_retried_without_admin_and_revoked_invites_stay_revoked(): void {
        $profile = $this->profile(); $this->verify($profile); $this->bulk('invite', ['all_inactive' => true])->assertOk();
        Notification::shouldReceive('send')->once()->andThrow(new \RuntimeException('SMTP failure'));
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        $this->assertSame('failed', FounderOutreach::first()->status);
        $this->artisan('wosool:founder-outreach')->assertSuccessful();
        $profile->invitations()->update(['status' => 'revoked']);
        $this->bulk('invite', ['all_inactive' => true])->assertOk()->assertJsonPath('data.queued', 0);
    }
}
