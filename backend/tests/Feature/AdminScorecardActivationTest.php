<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\Scorecard;
use App\Models\User;
use App\Notifications\VerifyFounderEmail;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminScorecardActivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_profile_ownership_and_send_verification_to_unverified_owner(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        Notification::fake();
        config(['mail.default' => 'smtp', 'app.frontend_url' => 'https://wosool.org']);

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $owner = User::factory()->create(['email_verified_at' => null]);
        $owner->assignRole('member');
        $profile = FounderProfile::create(['slug' => 'score-founder', 'user_id' => $owner->id, 'display_name' => 'Score Founder', 'status' => 'active', 'is_public' => true]);
        $scorecard = Scorecard::create(['founder_profile_id' => $profile->id]);

        $this->actingAs($owner)->getJson('/api/v1/admin/scorecards')->assertForbidden();
        $this->postJson("/api/v1/admin/scorecards/{$scorecard->id}/verify-email")->assertForbidden();

        $this->actingAs($admin)->getJson('/api/v1/admin/scorecards')
            ->assertOk()
            ->assertJsonPath('data.0.founder_profile_id', $profile->id)
            ->assertJsonPath('data.0.founder_slug', 'score-founder')
            ->assertJsonPath('data.0.user_email', $owner->email)
            ->assertJsonPath('data.0.email_verified', false);

        $this->postJson("/api/v1/admin/scorecards/{$scorecard->id}/verify-email")->assertOk();
        Notification::assertSentTo($owner, VerifyFounderEmail::class, function ($notification) use ($owner) {
            $url = $notification->toMail($owner)->actionUrl;
            parse_str(parse_url($url, PHP_URL_QUERY), $query);
            $this->actingAs($owner)->getJson($query['path'])->assertOk();

            return true;
        });
        $this->assertNotNull($owner->fresh()->email_verified_at);
        $this->actingAs($admin)->postJson("/api/v1/admin/scorecards/{$scorecard->id}/verify-email")->assertConflict();
    }

    public function test_unclaimed_profiles_require_invitations_and_verification_requires_a_real_mailer(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        Notification::fake();
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $profile = FounderProfile::create(['slug' => 'unclaimed-score', 'display_name' => 'Unclaimed', 'status' => 'active']);
        $scorecard = Scorecard::create(['founder_profile_id' => $profile->id]);

        $this->actingAs($admin)->getJson('/api/v1/admin/scorecards')
            ->assertJsonPath('data.0.user_email', null)
            ->assertJsonPath('data.0.founder_slug', 'unclaimed-score');
        $this->postJson("/api/v1/admin/scorecards/{$scorecard->id}/verify-email")->assertConflict();
        Notification::assertNothingSent();

        $owner = User::factory()->create(['email_verified_at' => null]);
        $profile->update(['user_id' => $owner->id]);
        config(['mail.default' => 'log']);
        $this->postJson("/api/v1/admin/scorecards/{$scorecard->id}/verify-email")->assertStatus(503);
        Notification::assertNothingSent();
    }
}
