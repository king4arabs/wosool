<?php

namespace Tests\Feature;

use App\Models\{CompanyProfile, FounderProfile};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PublicFounderDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    private function founder(string $slug, array $attributes = []): FounderProfile
    {
        return FounderProfile::create([...['slug' => $slug, 'display_name' => $slug, 'country_code' => 'SA',
            'status' => 'active', 'is_public' => true, 'legal_name' => 'Private legal name'], ...$attributes]);
    }

    public function test_rotation_wraps_without_duplicates_and_respects_moderation_and_locale(): void
    {
        $profiles = collect(range(1, 29))->map(fn ($n) => $this->founder('profile-'.$n))
            ->sortBy('founder_uid')->values();
        $this->founder('hidden', ['is_public' => false]);
        $this->founder('pending', ['status' => 'pending']);
        $this->founder('outside-coverage', ['country_code' => 'IR']);
        $this->founder('deleted')->delete();
        $url = '/api/v1/founders/discover/cards?start='.$profiles[27]->founder_uid;
        $expected = $profiles->slice(27)->concat($profiles->take(22))->pluck('slug')->all();
        foreach (['en', 'ar'] as $locale) {
            $response = $this->getJson($url, ['X-Locale' => $locale])->assertOk()->assertJsonCount(24, 'data')
                ->assertJsonPath('data.0.can_communicate', false)->assertJsonPath('data.0.scorecard', null)
                ->assertDontSee('Private legal name');
            $this->assertSame($expected, array_column($response->json('data'), 'slug'));
        }
        $profiles[27]->update(['is_public' => false]);
        $this->assertNotContains($profiles[27]->slug, array_column($this->getJson($url)->assertOk()->json('data'), 'slug'));
        $this->getJson('/api/v1/founders/'.$profiles[27]->slug)->assertNotFound();
    }

    public function test_empty_directory_and_invalid_cursor_are_distinct(): void
    {
        $this->getJson('/api/v1/founders/discover/cards?start=00000000-0000-4000-8000-000000000000')
            ->assertOk()->assertExactJson(['data' => []]);
        $this->getJson('/api/v1/founders/discover/cards?start=invalid')->assertUnprocessable();
        $this->assertTrue(Schema::hasIndex('founder_profiles', 'founder_public_discovery_idx'));
    }

    public function test_news_uses_only_exact_current_public_company_relationships(): void
    {
        $company = CompanyProfile::create(['slug' => 'atlas', 'name' => 'Atlas Labs', 'country_code' => 'SA',
            'translations' => ['ar' => ['name' => 'مختبرات أطلس']], 'status' => 'active', 'is_public' => true]);
        $public = $this->founder('atlas-founder');
        $private = $this->founder('private-founder', ['is_public' => false]);
        $public->companies()->attach($company, ['is_primary' => false]);
        $private->companies()->attach($company);
        foreach (['atlas', 'Atlas Labs', 'مختبرات أطلس'] as $alias) {
            $this->getJson('/api/v1/founders?'.http_build_query(['companies' => [$alias]]))->assertOk()
                ->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', $public->slug);
        }
        $this->getJson('/api/v1/founders?companies[]=Atl')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/founders?companies=invalid')->assertUnprocessable();
        $company->update(['is_public' => false]);
        $this->getJson('/api/v1/founders?companies[]=atlas')->assertOk()->assertJsonCount(0, 'data');
    }
}
