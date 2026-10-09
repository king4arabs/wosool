<?php
namespace Tests\Feature;

use App\Models\CompanyProfile;
use App\Models\FounderProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCardRelationshipTest extends TestCase
{
    use RefreshDatabase;
    public function test_public_cards_include_roles_but_hide_inactive_relationships(): void
    {
        $founder = FounderProfile::create(['user_id' => User::factory()->create()->id, 'slug' => 'public-founder', 'status' => 'active', 'is_public' => true]);
        $company = CompanyProfile::create(['name' => 'Public company', 'slug' => 'public-company', 'status' => 'active', 'is_public' => true, 'country_code' => 'SA']);
        $hidden = CompanyProfile::create(['name' => 'Hidden company', 'slug' => 'hidden-company', 'status' => 'pending', 'is_public' => true]);
        $founder->companies()->attach($company, ['role' => 'Co-founder', 'is_primary' => true]);
        $founder->companies()->attach($hidden, ['role' => 'Founder', 'is_primary' => false]);
        $this->getJson('/api/v1/founders/public-founder')->assertOk()->assertJsonCount(1, 'data.companies')->assertJsonPath('data.companies.0.pivot.role', 'Co-founder');
        $this->getJson('/api/v1/companies/public-company')->assertOk()->assertJsonPath('data.founders.0.position', 'Co-founder');
        $founder->update(['status' => 'suspended']);
        $this->getJson('/api/v1/companies/public-company')->assertOk()->assertJsonCount(0, 'data.founders');
    }
}
