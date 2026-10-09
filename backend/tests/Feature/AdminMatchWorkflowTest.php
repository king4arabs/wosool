<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMatchWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admins_can_suggest_distinct_active_founders_without_duplicate_matches(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $founders = collect([1, 2])->map(fn ($i) => FounderProfile::create(['user_id' => User::factory()->create()->id, 'slug' => "founder-{$i}", 'status' => 'active']));
        $data = ['founder_a_id' => $founders[0]->id, 'founder_b_id' => $founders[1]->id, 'reason' => 'Complementary founder experience.'];
        $this->actingAs(User::factory()->create())->postJson('/api/v1/admin/matches', $data)->assertForbidden();
        $this->actingAs($admin)->postJson('/api/v1/admin/matches', array_merge($data, ['founder_b_id' => $founders[0]->id]))->assertUnprocessable();
        $this->postJson('/api/v1/admin/matches', $data)->assertCreated()->assertJsonPath('data.status', 'suggested')->assertJsonPath('data.is_ai_generated', false);
        $this->postJson('/api/v1/admin/matches', ['founder_a_id' => $founders[1]->id, 'founder_b_id' => $founders[0]->id, 'reason' => 'Reverse duplicate proposal.'])->assertStatus(409);
        $this->assertDatabaseCount('matches', 1);
        $this->assertDatabaseHas('admin_actions', ['action' => 'match.suggested', 'admin_id' => $admin->id]);
    }
}
