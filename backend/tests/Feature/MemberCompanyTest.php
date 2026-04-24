<?php

namespace Tests\Feature;

use App\Models\CompanyProfile;
use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberCompanyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function userWithFounder(): User
    {
        $user = User::factory()->create();
        FounderProfile::create([
            'user_id' => $user->id,
            'slug' => 'founder-' . $user->id,
            'status' => 'active',
            'is_public' => true,
        ]);
        return $user;
    }

    public function test_member_can_create_company(): void
    {
        $user = $this->userWithFounder();

        $response = $this->actingAs($user)->postJson('/api/v1/member/companies', [
            'name' => 'Acme Inc',
            'sector' => 'SaaS',
            'stage' => 'seed',
            'role' => 'CEO',
            'is_primary' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Acme Inc')
            ->assertJsonPath('data.slug', 'acme-inc');

        $this->assertDatabaseHas('founder_company_links', [
            'founder_profile_id' => $user->founderProfile->id,
            'role' => 'CEO',
            'is_primary' => 1,
        ]);
    }

    public function test_create_requires_founder_profile(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->postJson('/api/v1/member/companies', ['name' => 'X'])
            ->assertStatus(422);
    }

    public function test_member_can_list_their_companies(): void
    {
        $user = $this->userWithFounder();
        $this->actingAs($user)->postJson('/api/v1/member/companies', ['name' => 'Co One']);
        $this->actingAs($user)->postJson('/api/v1/member/companies', ['name' => 'Co Two']);

        $response = $this->actingAs($user)->getJson('/api/v1/member/companies');
        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_member_can_update_own_company(): void
    {
        $user = $this->userWithFounder();
        $created = $this->actingAs($user)
            ->postJson('/api/v1/member/companies', ['name' => 'OldName'])
            ->json('data');

        $this->actingAs($user)
            ->putJson("/api/v1/member/companies/{$created['id']}", ['name' => 'NewName'])
            ->assertOk()
            ->assertJsonPath('data.name', 'NewName');
    }

    public function test_member_cannot_update_other_users_company(): void
    {
        $owner = $this->userWithFounder();
        $other = $this->userWithFounder();

        $created = $this->actingAs($owner)
            ->postJson('/api/v1/member/companies', ['name' => 'OwnerCo'])
            ->json('data');

        $this->actingAs($other)
            ->putJson("/api/v1/member/companies/{$created['id']}", ['name' => 'Hijacked'])
            ->assertForbidden();
    }

    public function test_member_can_delete_own_company(): void
    {
        $user = $this->userWithFounder();
        $created = $this->actingAs($user)
            ->postJson('/api/v1/member/companies', ['name' => 'DelCo'])
            ->json('data');

        $this->actingAs($user)
            ->deleteJson("/api/v1/member/companies/{$created['id']}")
            ->assertOk();

        $this->assertSoftDeleted('company_profiles', ['id' => $created['id']]);
    }
}
