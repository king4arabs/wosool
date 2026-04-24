<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberFounderProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_unauthenticated_user_cannot_access_member_profile(): void
    {
        $this->getJson('/api/v1/member/founder-profile')->assertUnauthorized();
    }

    public function test_show_returns_404_when_no_profile_exists(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->getJson('/api/v1/member/founder-profile')
            ->assertNotFound();
    }

    public function test_update_creates_profile_when_missing(): void
    {
        $user = User::factory()->create(['name' => 'Layla Test']);

        $response = $this->actingAs($user)->putJson('/api/v1/member/founder-profile', [
            'tagline' => 'Building the future',
            'bio' => 'A founder bio',
            'sector' => 'FinTech',
            'stage' => 'seed',
            'needs' => ['Investors', 'Mentors'],
            'offers' => ['Strategy'],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.tagline', 'Building the future')
            ->assertJsonPath('data.user_id', $user->id);

        $this->assertDatabaseHas('founder_profiles', [
            'user_id' => $user->id,
            'sector' => 'FinTech',
        ]);
    }

    public function test_update_modifies_existing_profile(): void
    {
        $user = User::factory()->create();
        FounderProfile::create([
            'user_id' => $user->id,
            'slug' => 'existing-founder',
            'tagline' => 'Old',
            'status' => 'active',
            'is_public' => true,
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/member/founder-profile', [
            'tagline' => 'New tagline',
        ]);

        $response->assertOk()->assertJsonPath('data.tagline', 'New tagline');
        $this->assertDatabaseHas('founder_profiles', [
            'user_id' => $user->id,
            'tagline' => 'New tagline',
        ]);
    }

    public function test_update_validates_url_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/v1/member/founder-profile', ['linkedin_url' => 'not-a-url'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['linkedin_url']);
    }
}
