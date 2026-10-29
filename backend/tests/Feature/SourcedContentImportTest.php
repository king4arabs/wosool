<?php

namespace Tests\Feature;

use App\Models\CompanyProfile;
use App\Models\NewsItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SourcedContentImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_sourced_news_import_is_idempotent_and_respects_editors(): void
    {
        $rows = json_decode(file_get_contents(resource_path('data/sourced-news.json')), true);
        $this->artisan('wosool:import-news')->assertSuccessful();
        $this->assertSame(count($rows), NewsItem::count());
        $this->assertSame(0, NewsItem::whereNull('source_url')->count());

        $story = NewsItem::where('slug', 'barq-329-million-series-a-unicorn')->firstOrFail();
        $story->update(['title' => 'Edited by an editor']);
        $deleted = NewsItem::where('slug', 'tabby-233-million-series-f-6-5-billion')->firstOrFail();
        $deleted->delete();

        $this->artisan('wosool:import-news')->assertSuccessful();
        $this->assertSame(count($rows) - 1, NewsItem::count());
        $this->assertSame('Edited by an editor', $story->fresh()->title);
        $this->assertSoftDeleted($deleted);
    }

    public function test_news_import_fills_missing_images_and_preserves_editor_artwork(): void
    {
        $rows = collect(json_decode(file_get_contents(resource_path('data/sourced-news.json')), true));
        $source = $rows->firstWhere('slug', 'barq-329-million-series-a-unicorn');
        $this->artisan('wosool:import-news')->assertSuccessful();
        $story = NewsItem::where('slug', $source['slug'])->firstOrFail();
        $story->update(['image_url' => null, 'image_credit' => null]);

        $this->artisan('wosool:import-news', ['--dry-run' => true])->assertSuccessful();
        $this->assertNull($story->fresh()->image_url);
        $this->artisan('wosool:import-news')->assertSuccessful();
        $this->assertSame($source['imageUrl'], $story->fresh()->image_url);
        $this->assertSame($source['imageCredit'], $story->fresh()->image_credit);

        $story->update(['image_url' => 'https://example.com/editor-image.jpg', 'image_credit' => null]);
        $this->artisan('wosool:import-news')->assertSuccessful();
        $this->assertSame('https://example.com/editor-image.jpg', $story->fresh()->image_url);
        $this->assertNull($story->fresh()->image_credit);

        $story->update(['image_credit' => 'Editor photograph']);
        $this->artisan('wosool:import-news')->assertSuccessful();
        $this->assertSame('Editor photograph', $story->fresh()->image_credit);

        $story->update(['image_url' => $source['imageUrl'], 'image_credit' => null]);
        $this->artisan('wosool:import-news')->assertSuccessful();
        $this->assertSame($source['imageCredit'], $story->fresh()->image_credit);
    }

    public function test_public_news_filters_by_region_and_exposes_key_facts_and_translation(): void
    {
        $this->artisan('wosool:import-news')->assertSuccessful();

        $saudi = $this->getJson('/api/v1/news?region=saudi&per_page=50')->assertOk()->json('data');
        $this->assertNotEmpty($saudi);
        $this->assertTrue(collect($saudi)->every(fn ($item) => $item['region'] === 'saudi'));

        $this->getJson('/api/v1/news/barq-329-million-series-a-unicorn')->assertOk()
            ->assertJsonPath('data.source_name', 'Fintech Futures')
            ->assertJsonPath('data.companies', ['Barq'])
            ->assertJsonCount(4, 'data.key_facts')
            ->assertJsonStructure(['data' => ['translations' => ['ar' => ['title', 'excerpt', 'body', 'keyFacts']]]]);

        $this->getJson('/api/v1/news?region=mars')->assertUnprocessable();
    }

    public function test_founder_import_stores_sourced_traction_and_backfills_existing_companies(): void
    {
        CompanyProfile::create([
            'name' => 'Tabby', 'slug' => 'tabby-existing', 'website' => 'https://tabby.ai/', 'status' => 'active', 'is_public' => true,
            'description' => 'Editor written description',
        ]);

        $this->artisan('wosool:import-founders')->assertSuccessful();

        $tabby = CompanyProfile::where('slug', 'tabby-existing')->firstOrFail();
        $this->assertSame('Editor written description', $tabby->description);
        $this->assertSame(2019, $tabby->founded_year);
        $this->assertStringContainsString('fintechfutures.com', $tabby->metrics_summary['source_url']);

        $this->getJson('/api/v1/founders/hosam-arab', ['X-Locale' => 'en'])->assertOk()
            ->assertJsonPath('data.companies.0.traction.source_url', $tabby->metrics_summary['source_url']);
    }
}
