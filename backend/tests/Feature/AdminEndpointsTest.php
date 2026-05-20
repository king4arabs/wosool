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
                'application_pipeline',
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

    public function test_admin_can_load_analytics_and_settings(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@wosool.org')->firstOrFail();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/analytics')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['kpis', 'monthly_signups', 'sector_distribution', 'recent_activity'],
            ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/settings')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['general', 'email', 'security'],
            ]);
    }

    public function test_admin_can_manage_partners_and_sponsors(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@wosool.org')->firstOrFail();

        $this->actingAs($admin)->postJson('/api/v1/admin/partners', [
            'name' => 'New Partner',
            'description' => 'Strategic advisory support.',
            'website' => 'https://partner.example.com',
            'type' => 'strategic',
            'status' => 'confirmed',
            'sector' => 'Advisory',
            'contact_name' => 'Partner Lead',
            'contact_email' => 'lead@partner.example.com',
            'is_public' => true,
            'display_order' => 10,
        ])->assertCreated();

        $this->actingAs($admin)->postJson('/api/v1/admin/sponsors', [
            'name' => 'New Sponsor',
            'description' => 'Community sponsor.',
            'website' => 'https://sponsor.example.com',
            'tier' => 'gold',
            'is_active' => true,
            'contact_name' => 'Sponsor Lead',
            'contact_email' => 'lead@sponsor.example.com',
            'contract_start' => now()->toDateString(),
            'contract_end' => now()->addYear()->toDateString(),
            'display_order' => 5,
        ])->assertCreated();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/partners')
            ->assertOk()
            ->assertJsonFragment(['name' => 'New Partner']);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/sponsors')
            ->assertOk()
            ->assertJsonFragment(['name' => 'New Sponsor']);
    }
}
