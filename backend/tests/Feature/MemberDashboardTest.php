<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MemberDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_handles_missing_introductions_ledger_table(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        if (Schema::hasTable('introductions_ledger')) {
            Schema::drop('introductions_ledger');
        }

        $user = User::factory()->create();
        $user->assignRole('member');

        FounderProfile::query()->create([
            'user_id' => $user->id,
            'slug' => 'test-founder',
            'tagline' => 'Testing dashboard',
            'bio' => 'Bio',
            'location' => 'Riyadh',
            'sector' => 'FinTech',
            'stage' => 'seed',
            'needs' => ['advisors'],
            'offers' => ['product'],
            'status' => 'active',
            'is_public' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/member/dashboard');

        $response->assertOk();
        $response->assertJsonPath('data.intro_requests.pending_count', 0);
        $response->assertJsonPath('data.intro_requests.inbound_count', 0);
        $response->assertJsonPath('data.intro_requests.outbound_count', 0);
    }
}
