<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use App\Models\{FounderIdentityReview, FounderProfile, UserSetting};
use App\Mail\RegistrationOtpMail;
use App\Services\RegistrationOtp;
use Illuminate\Support\Facades\{DB, Mail};
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_view_settings(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('member');

        $this->actingAs($user)
            ->getJson('/api/v1/member/settings')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'account' => ['name', 'email'],
                    'privacy',
                    'notifications',
                    'visibility',
                ],
            ]);
    }

    public function test_member_can_update_settings_and_password(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create([
            'password' => bcrypt('Password1'),
        ]);
        $user->assignRole('member');

        $this->actingAs($user)
            ->putJson('/api/v1/member/settings', [
                'account' => [
                    'name' => 'Updated Name',
                    'email' => 'updated@example.com',
                    'current_password' => 'Password1',
                    'new_password' => 'NewPassword1',
                    'new_password_confirmation' => 'NewPassword1',
                ],
                'privacy' => [
                    'profile_visibility' => true,
                    'show_founder_score' => false,
                    'activity_visibility' => true,
                    'appear_in_directory' => false,
                ],
                'notifications' => [
                    'new_match_suggestions' => true,
                    'direct_messages' => true,
                    'event_reminders' => false,
                    'program_updates' => true,
                    'community_activity' => false,
                    'weekly_digest' => true,
                ],
                'visibility' => [
                    'allow_intro_requests' => true,
                    'show_email_to_matches' => true,
                    'discoverable_for_matching' => true,
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.account.email', 'updated@example.com')
            ->assertJsonPath('data.privacy.show_founder_score', false);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_changed_email_invalidates_old_codes_identity_evidence_and_admin_verification_until_reverified(): void
    {
        $this->seed(RoleAndPermissionSeeder::class); Mail::fake(); config(['mail.default' => 'smtp']);
        $user = User::factory()->unverified()->create(['password' => 'Password1']); $user->assignRole('member');
        app(RegistrationOtp::class)->send($user);
        $oldCode = Mail::sent(RegistrationOtpMail::class)->last()->code;
        $user->forceFill(['email_verified_at' => now()])->save();
        $profile = FounderProfile::create(['user_id' => $user->id, 'slug' => 'changed-address', 'display_name' => $user->name, 'status' => 'active', 'is_verified' => true]);
        $profile->forceFill(['admin_verified_at' => now()])->save();
        $review = FounderIdentityReview::create(['user_id' => $user->id, 'candidates' => [['id' => 100, 'signals' => ['verified_contact_email']]]]);
        $payload = ['account' => ['name' => $user->name, 'email' => 'new-address@example.com', 'current_password' => 'Password1'], ...UserSetting::defaults()];
        $this->actingAs($user)->putJson('/api/v1/member/settings', $payload)->assertOk()->assertJsonPath('verification_required', true);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
        $this->assertSame([], $review->fresh()->candidates);
        $this->assertFalse($profile->fresh()->is_verified); $this->assertNull($profile->fresh()->admin_verified_at);
        $this->assertSame(0, DB::table('registration_email_otps')->where('user_id', $user->id)->count());
        $this->actingAs($user->fresh())->getJson('/api/v1/member/dashboard')->assertForbidden();
        $this->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('user.registration_step', 'verify');
        $this->postJson('/api/v1/auth/registration/verify', ['code' => $oldCode])->assertUnprocessable();
        $this->postJson('/api/v1/auth/registration/resend')->assertOk();
        $newCode = Mail::sent(RegistrationOtpMail::class)->last()->code;
        $this->postJson('/api/v1/auth/registration/verify', ['code' => $newCode])->assertOk();
        $this->actingAs($user->fresh())->getJson('/api/v1/registration/application')->assertOk()->assertJsonPath('step', 'active');
        $this->assertFalse($profile->fresh()->is_verified);
    }

    public function test_non_member_cannot_access_member_settings(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        Application::create([
            'full_name' => 'Pending User',
            'email' => 'pending@wosool.test',
            'phone' => '+966500000099',
            'company_name' => 'Pending Co',
            'sector' => 'SaaS',
            'stage' => 'Seed',
            'location' => 'Riyadh',
            'motivation' => 'Join network',
            'status' => 'submitted',
        ]);

        $user = User::factory()->create(['email' => 'pending@wosool.test']);

        $this->actingAs($user)
            ->getJson('/api/v1/member/settings')
            ->assertForbidden();
    }
}

