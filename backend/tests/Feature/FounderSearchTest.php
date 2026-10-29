<?php

namespace Tests\Feature;

use App\Models\{CompanyProfile, FounderProfile};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FounderSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_names_match_in_both_languages_with_arabic_variants_and_mixed_terms(): void
    {
        $founder = FounderProfile::create(['slug' => 'ahmad-ali', 'display_name' => 'Ahmad Ali', 'country_code' => 'SA', 'is_public' => true, 'status' => 'active', 'translations' => ['ar' => ['name' => 'أَحْمَد العَلِيّ']]]);
        $company = CompanyProfile::create(['slug' => 'growth', 'name' => 'Growth Labs', 'country_code' => 'SA', 'is_public' => true, 'status' => 'active', 'translations' => ['ar' => ['name' => 'شَرِكَة النَّماء']]]);
        $founder->companies()->attach($company, ['is_primary' => true]);
        foreach (['ar', 'en'] as $locale) {
            foreach (['AHMAD', 'ahmad  ali', 'ali ahmad', 'أحمد', 'احـمد', 'العلي', 'GROWTH labs', 'شركه النماء', 'أحمد Growth', 'Ali النماء'] as $search) {
                $this->withHeader('X-Locale', $locale)->getJson('/api/v1/founders?'.http_build_query(['search' => $search]))
                    ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'ahmad-ali');
            }
        }
    }

    public function test_secondary_public_companies_match_but_private_draft_and_deleted_companies_do_not(): void
    {
        $founder = FounderProfile::create(['slug' => 'sara', 'display_name' => 'Sara', 'country_code' => 'SA', 'is_public' => true, 'status' => 'active']);
        foreach ([['primary', true, 'active'], ['secondary', true, 'active'], ['private', false, 'active'], ['draft', true, 'draft'], ['deleted', true, 'active']] as [$name, $public, $status]) {
            $company = CompanyProfile::create(['slug' => $name, 'name' => $name, 'country_code' => 'SA', 'is_public' => $public, 'status' => $status]);
            $founder->companies()->attach($company, ['is_primary' => $name === 'primary']);
            if ($name === 'deleted') $company->delete();
        }
        $this->getJson('/api/v1/founders?search=secondary')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'sara');
        foreach (['private', 'draft', 'deleted', '%', '_', "' OR 1=1 --"] as $search) {
            $this->getJson('/api/v1/founders?'.http_build_query(['search' => $search]))->assertOk()->assertJsonPath('meta.total', 0);
        }
    }

    public function test_search_remains_paginated_and_respects_filters_and_publication(): void
    {
        for ($i = 0; $i < 26; $i++) FounderProfile::create(['slug' => 'builder-'.$i, 'display_name' => 'Builder '.$i, 'country_code' => 'SA', 'is_public' => true, 'status' => 'active']);
        FounderProfile::create(['slug' => 'hidden-builder', 'display_name' => 'Builder hidden', 'country_code' => 'SA', 'is_public' => false, 'status' => 'active']);
        FounderProfile::create(['slug' => 'suspended-builder', 'display_name' => 'Builder suspended', 'country_code' => 'SA', 'is_public' => true, 'status' => 'suspended']);
        $this->getJson('/api/v1/founders?search=builder&per_page=100')->assertOk()->assertJsonCount(24, 'data')->assertJsonPath('meta.total', 26);
        $this->getJson('/api/v1/founders?search=builder&per_page=24&page=2')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/founders?search=builder&country=AE')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/founders?search=builder&region=gcc')->assertOk()->assertJsonPath('meta.total', 0);
    }
}
