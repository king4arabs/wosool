<?php

namespace Tests\Feature;

use App\Models\CompanyProfile;
use App\Models\FounderProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProfileSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_columns_exist_after_fresh_migration_and_accept_model_attributes(): void
    {
        foreach (['legal_name', 'title', 'biography_summary', 'skills_tags', 'vetted_status', 'momentum_score', 'profile_markdown'] as $column) {
            $this->assertTrue(Schema::hasColumn('founder_profiles', $column), $column);
        }

        foreach (['legal_name', 'domain_url', 'operational_stage', 'hq_location', 'tech_stack_tokens', 'metrics_summary', 'vector_embedding_payload'] as $column) {
            $this->assertTrue(Schema::hasColumn('company_profiles', $column), $column);
        }

        $founder = FounderProfile::create([
            'user_id' => User::factory()->create()->id,
            'slug' => 'profile-schema-founder',
            'legal_name' => 'Example Founder',
            'skills_tags' => ['engineering'],
            'vetted_status' => true,
            'momentum_score' => 75,
        ]);
        $company = CompanyProfile::create([
            'name' => 'Example Company',
            'slug' => 'profile-schema-company',
            'legal_name' => 'Example Company Ltd',
            'tech_stack_tokens' => ['php'],
            'metrics_summary' => ['revenue' => 100],
        ]);

        $this->assertSame('Example Founder', $founder->fresh()->legal_name);
        $this->assertSame(['engineering'], $founder->fresh()->skills_tags);
        $this->assertTrue($founder->fresh()->vetted_status);
        $this->assertSame(75, $founder->fresh()->momentum_score);
        $this->assertSame('Example Company Ltd', $company->fresh()->legal_name);
        $this->assertSame(['php'], $company->fresh()->tech_stack_tokens);
        $this->assertSame(['revenue' => 100], $company->fresh()->metrics_summary);
    }
}
