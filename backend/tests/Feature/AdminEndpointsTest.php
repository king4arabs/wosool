<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('member');

        $this->actingAs($user)
            ->getJson('/api/v1/admin/dashboard')
            ->assertForbidden();
    }

    public function test_admin_can_load_dashboard(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@wosool.org')->firstOrFail();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'stats' => ['total_members', 'active_founders', 'companies'],
                'recent_applications',
                'activity',
            ]);
    }

    public function test_admin_can_create_update_and_delete_company(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@wosool.org')->firstOrFail();

        $createResponse = $this->actingAs($admin)->postJson('/api/v1/admin/companies', [
            'name' => 'Atlas Commerce',
            'description' => 'A commerce operations platform.',
            'website' => 'https://atlas.example.com',
            'sector' => 'Commerce',
            'stage' => 'seed',
            'location' => 'Riyadh, Saudi Arabia',
            'country_code' => 'SA',
            'founded_year' => 2024,
            'team_size' => 14,
            'status' => 'active',
            'is_hiring' => true,
            'is_fundraising' => false,
            'is_collaborating' => true,
            'is_featured' => false,
            'is_public' => true,
        ]);

        $createResponse->assertCreated()->assertJsonPath('data.name', 'Atlas Commerce');
        $companyId = $createResponse->json('data.id');

        $this->actingAs($admin)->putJson("/api/v1/admin/companies/{$companyId}", [
            'name' => 'Atlas Commerce',
            'description' => 'Updated company description.',
            'website' => 'https://atlas.example.com',
            'sector' => 'Commerce',
            'stage' => 'series-a',
            'location' => 'Riyadh, Saudi Arabia',
            'country_code' => 'SA',
            'founded_year' => 2024,
            'team_size' => 20,
            'status' => 'active',
            'is_hiring' => true,
            'is_fundraising' => true,
            'is_collaborating' => true,
            'is_featured' => true,
            'is_public' => true,
        ])->assertOk()->assertJsonPath('data.stage', 'series-a');

        $this->actingAs($admin)
            ->deleteJson("/api/v1/admin/companies/{$companyId}")
            ->assertOk();

        $this->assertSoftDeleted('company_profiles', ['id' => $companyId]);
    }

    public function test_admin_can_review_application(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@wosool.org')->firstOrFail();
        $application = Application::firstOrFail();

        $this->actingAs($admin)
            ->patchJson("/api/v1/admin/applications/{$application->id}", [
                'status' => 'reviewing',
                'admin_notes' => 'Follow-up scheduled.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'reviewing');

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'reviewing',
            'reviewed_by' => $admin->id,
        ]);
    }
}
