<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpportunityAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_resolve_application_destination(): void
    {
        $this->getJson('/api/v1/ecosystem/aws-activate/connect')->assertUnauthorized();
    }

    public function test_verified_account_without_membership_cannot_connect(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $this->actingAs(User::factory()->create())->getJson('/api/v1/ecosystem/aws-activate/connect')->assertForbidden();
    }

    public function test_activation_and_complete_profile_are_required(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('member');
        $profile = FounderProfile::create(['user_id' => $user->id, 'slug' => 'opportunity-member', 'status' => 'active']);
        $this->actingAs($user)->getJson('/api/v1/ecosystem/aws-activate/connect')->assertStatus(422)->assertJson(['reason' => 'profile_incomplete']);
        $profile->update(['bio' => 'Building useful technology', 'sector' => 'Technology', 'location' => 'Riyadh']);
        $this->getJson('/api/v1/ecosystem/aws-activate/connect')->assertOk()->assertJson(['url' => 'https://aws.amazon.com/startups/credits'])->assertHeader('Cache-Control', 'max-age=0, no-store, private');
        $profile->update(['status' => 'suspended']);
        $this->getJson('/api/v1/ecosystem/aws-activate/connect')->assertForbidden();
    }

    public function test_unverified_member_cannot_connect(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->unverified()->create();
        $user->assignRole('member');
        $this->actingAs($user)->getJson('/api/v1/ecosystem/aws-activate/connect')->assertForbidden();
    }

    public function test_inactive_profile_is_reported_before_missing_details(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('member');
        $profile = FounderProfile::create(['user_id' => $user->id, 'slug' => 'opportunity-pending', 'status' => 'pending',
            'bio' => 'Building useful technology', 'sector' => 'Technology', 'location' => 'Riyadh']);
        $this->actingAs($user)->getJson('/api/v1/ecosystem/aws-activate/connect')
            ->assertForbidden()->assertJson(['reason' => 'profile_pending'])->assertJsonMissingPath('url');

        \App\Models\Application::create(['full_name' => 'Pending Founder', 'user_id' => $user->id, 'email' => $user->email, 'status' => 'approved']);
        $this->getJson('/api/v1/ecosystem/aws-activate/connect')->assertForbidden()->assertJson(['reason' => 'profile_pending']);

        $profile->update(['status' => 'active']);
        $this->getJson('/api/v1/ecosystem/aws-activate/connect')->assertOk()->assertJson(['url' => 'https://aws.amazon.com/startups/credits']);
    }
}
