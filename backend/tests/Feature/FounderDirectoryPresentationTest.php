<?php

namespace Tests\Feature;

use App\Models\{CompanyProfile, FounderProfile, IntroductionLedger, SocietyPost, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FounderDirectoryPresentationTest extends TestCase
{
    use RefreshDatabase;

    private function founder(string $slug, array $attributes = []): FounderProfile
    {
        return FounderProfile::create(array_merge(['slug' => $slug, 'display_name' => $slug, 'status' => 'active', 'is_public' => true], $attributes));
    }

    public function test_coverage_is_applied_before_pagination_search_details_and_relationships(): void
    {
        $visible = $this->founder('visible', ['country_code' => 'SA']);
        foreach ([['country_code' => ' ir '], ['country_code' => 'IL'], ['location' => 'Tel Aviv, Israel'], ['translations' => ['ar' => ['location' => 'طهران، إيران']]]] as $i => $attributes) {
            $this->founder('outside-'.$i, $attributes);
            $this->getJson('/api/v1/founders/outside-'.$i)->assertNotFound();
        }
        $outsideCompany = CompanyProfile::create(['slug' => 'outside-company', 'name' => 'Outside company', 'country_code' => 'IR', 'status' => 'active', 'is_public' => true]);
        $linked = $this->founder('linked', ['country_code' => 'SA']);
        $linked->companies()->attach($outsideCompany, ['is_primary' => true]);
        $publicCompany = CompanyProfile::create(['slug' => 'public-company', 'name' => 'Public company', 'country_code' => 'SA', 'status' => 'active', 'is_public' => true]);
        $publicCompany->founders()->attach([$visible->id, $linked->id]);

        $this->getJson('/api/v1/founders?per_page=1&facets=1')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'visible');
        $this->getJson('/api/v1/founders?search=outside')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/founders?country=IR')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/founders/linked')->assertNotFound();
        $this->getJson('/api/v1/companies/outside-company')->assertNotFound();
        $this->getJson('/api/v1/companies')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.founders_count', 1);
        $this->getJson('/api/v1/companies/public-company')->assertOk()->assertJsonCount(1, 'data.founders')->assertJsonPath('data.founders.0.slug', 'visible');
        $this->assertDatabaseHas('founder_profiles', ['slug' => 'outside-0']);
    }

    public function test_country_and_region_filters_cover_all_pages_with_company_fallback_and_order(): void
    {
        for ($i = 0; $i < 26; $i++) $this->founder('saudi-'.$i, ['country_code' => 'SA']);
        $this->founder('world', ['country_code' => 'JP']);
        $this->founder('mena', ['country_code' => 'EG']);
        $gcc = $this->founder('gcc');
        $company = CompanyProfile::create(['slug' => 'uae-company', 'name' => 'UAE company', 'country_code' => 'AE', 'status' => 'active', 'is_public' => true]);
        $gcc->companies()->attach($company, ['is_primary' => true]);
        $this->getJson('/api/v1/founders?country=ae')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'gcc');
        $this->getJson('/api/v1/founders?region=gcc')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'gcc');
        $this->getJson('/api/v1/founders?region=mena')->assertOk()->assertJsonPath('data.0.slug', 'mena');
        $this->getJson('/api/v1/founders?country=BR')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/founders?search=UAE%20company')->assertOk()->assertJsonPath('data.0.slug', 'gcc');
        $last = $this->getJson('/api/v1/founders?per_page=24&page=2')->assertOk()->json('data');
        $this->assertSame(['gcc', 'mena', 'world'], array_slice(array_column($last, 'slug'), -3));
    }

    public function test_engagement_uses_activation_and_recent_approved_activity_without_private_details(): void
    {
        $this->travelTo(now()->startOfDay());
        $unclaimed = $this->founder('unclaimed');
        $owner = User::factory()->create();
        $active = $this->founder('active', ['user_id' => $owner->id, 'country_code' => 'NL', 'avatar_url' => 'https://example.com/portrait.jpg']);
        $this->getJson('/api/v1/founders/unclaimed')->assertOk()->assertJsonPath('data.community_engagement_score', null);
        $this->getJson('/api/v1/founders/active')->assertOk()->assertJsonPath('data.community_engagement_score', 50)->assertJsonPath('data.avatar_url', 'https://example.com/portrait.jpg');
        foreach (['INTRO_APPROVED', 'INTRO_PENDING', 'DECLINED'] as $status) {
            IntroductionLedger::create(['source_founder_id' => $active->id, 'target_founder_id' => $unclaimed->id, 'routing_status' => $status, 'payload_context_brief' => 'Private introduction context']);
        }
        foreach (['published', 'hidden', 'archived'] as $status) {
            SocietyPost::create(['author_user_id' => $owner->id, 'author_founder_profile_id' => $active->id, 'post_type' => 'ask', 'title' => 'Private community title', 'content' => 'Private community content', 'moderation_status' => $status, 'published_at' => now()]);
        }
        SocietyPost::create(['author_user_id' => $owner->id, 'author_founder_profile_id' => $active->id, 'post_type' => 'ask', 'title' => 'Old post', 'content' => 'Old post', 'moderation_status' => 'published', 'published_at' => now()->subDays(91)]);
        $this->getJson('/api/v1/founders/active')->assertOk()->assertJsonPath('data.community_engagement_score', 60)->assertJsonPath('data.scorecard', null)->assertDontSee('Private introduction context')->assertDontSee('Private community content')->assertJsonMissingPath('data.engagement_posts_count');
        for ($i = 0; $i < 8; $i++) {
            IntroductionLedger::create(['source_founder_id' => $active->id, 'target_founder_id' => $unclaimed->id, 'routing_status' => 'INTRO_APPROVED', 'payload_context_brief' => 'Private']);
            SocietyPost::create(['author_user_id' => $owner->id, 'author_founder_profile_id' => $active->id, 'post_type' => 'ask', 'title' => 'Contribution', 'content' => 'Contribution', 'moderation_status' => 'published', 'published_at' => now()]);
        }
        $this->getJson('/api/v1/founders/active')->assertOk()->assertJsonPath('data.community_engagement_score', 100);
        $this->travelBack();
    }
}
