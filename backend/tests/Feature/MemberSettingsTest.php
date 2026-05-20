<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
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

