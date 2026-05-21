<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberFounderProfileShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_does_not_require_legacy_legal_name_field(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('member');

        FounderProfile::query()->create([
            'user_id' => $user->id,
            'slug' => 'founder-profile-test',
            'tagline' => 'Founder tagline',
            'bio' => 'Founder bio',
            'location' => 'Riyadh',
            'sector' => 'FinTech',
            'stage' => 'seed',
            'status' => 'active',
            'is_public' => true,
            'needs' => ['advisors'],
            'offers' => ['product'],
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/member/founder-profile');

        $response->assertOk();
        $response->assertJsonPath('data.legal_name', 'Founder tagline');
        $response->assertJsonPath('data.tagline', 'Founder tagline');
    }
}

