<?php

namespace Tests\Feature;

use App\Console\Commands\SyncNews;
use App\Models\CompanyProfile;
use App\Models\NewsItem;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NewsSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(now()->setDate(2026, 10, 12)->startOfDay());
        Http::preventStrayRequests();
    }

    public function test_sync_imports_plain_briefs_and_is_repeatable_without_overwriting_editors(): void
    {
        CompanyProfile::create(['name' => 'Acme', 'slug' => 'acme', 'is_public' => true]);
        CompanyProfile::create(['name' => 'PrivateCo', 'slug' => 'privateco', 'is_public' => false]);
        $this->fakeFeed($this->rss($this->item(
            description: '<p>Acme and PrivateCo raised funding. '.str_repeat('Brief news. ', 100).'</p>',
        )));

        $this->artisan('news:sync')->assertSuccessful();
        $article = NewsItem::firstOrFail();
        $this->assertSame('https://www.wamda.com/2026/10/acme-funding', $article->source_url);
        $this->assertSame('Wamda', $article->source_name);
        $this->assertSame(['Acme'], $article->companies);
        $this->assertLessThanOrEqual(320, mb_strlen($article->excerpt));
        $this->assertStringNotContainsString('<', $article->excerpt);
        $this->assertNull($article->content);
        $this->assertNull($article->image_url);
        $this->assertNull($article->image_credit);
        $this->assertSame('rss-'.hash('sha256', $article->source_url), $article->slug);

        $article->update(['title' => 'Editorial title', 'companies' => ['EditorialCo'], 'status' => 'draft']);
        $slug = $article->slug;
        $this->artisan('news:sync')->assertSuccessful();
        $this->assertDatabaseCount('news_items', 1);
        $this->assertSame('Editorial title', $article->fresh()->title);
        $this->assertSame(['EditorialCo'], $article->fresh()->companies);
        $this->assertSame('draft', $article->fresh()->status);
        $this->assertSame($slug, $article->fresh()->slug);
    }

    public function test_deleted_imports_are_not_restored_and_manual_news_is_retained(): void
    {
        $manual = $this->manualNews();
        $this->fakeFeed($this->rss($this->item()));
        $this->artisan('news:sync')->assertSuccessful();
        NewsItem::whereNotNull('source_url')->firstOrFail()->delete();
        $this->artisan('news:sync')->assertSuccessful();

        $this->assertDatabaseCount('news_items', 2);
        $this->assertSame(1, NewsItem::count());
        $this->assertSame('Manual news', $manual->fresh()->title);
        $this->getJson('/api/v1/news/'.$manual->slug)
            ->assertOk()
            ->assertJsonPath('data.source_url', null)
            ->assertJsonPath('data.source_name', null)
            ->assertJsonPath('data.image_credit', null)
            ->assertJsonPath('data.companies', []);
    }

    public function test_feed_failures_retain_news_and_other_feeds_still_import(): void
    {
        $manual = $this->manualNews();
        Http::fake([
            'https://www.wamda.com/feed' => Http::response('Unavailable', 503),
            'https://techcrunch.com/category/startups/feed/' => Http::response($this->rss($this->item(
                url: 'https://techcrunch.com/2026/10/10/acme-funding/',
            ))),
            '*' => Http::response($this->rss('')),
        ]);
        $this->artisan('news:sync')->assertFailed();
        $this->assertDatabaseCount('news_items', 2);
        $this->assertSame('Manual news', $manual->fresh()->title);
        $this->assertDatabaseHas('news_items', ['source_name' => 'TechCrunch']);

        Http::fake(['*' => Http::failedConnection()]);
        $this->artisan('news:sync')->assertFailed();
        $this->assertDatabaseCount('news_items', 2);
    }

    public function test_unsafe_source_urls_and_future_or_invalid_dates_are_skipped(): void
    {
        $items = '';
        foreach ([
            'http://www.wamda.com/story',
            'https://127.0.0.1/story',
            'https://www.wamda.com.evil.example/story',
            'https://evil.example/story',
            '******www.wamda.com/story',
            'https://www.wamda.com:8443/story',
            'https://techcrunch.com/story',
            'https://www.wamda.com\\@evil.example/story',
        ] as $url) {
            $items .= $this->item(url: $url);
        }
        $items .= $this->item(url: 'https://www.wamda.com/future', date: 'Tue, 13 Oct 2026 12:00:00 +0000');
        $items .= $this->item(url: 'https://www.wamda.com/missing-date', date: '');
        $items .= $this->item(url: 'https://www.wamda.com/relative-date', date: 'yesterday');
        $items .= $this->item(url: 'https://www.wamda.com/invalid-date', date: 'Sat, 31 Feb 2026 12:00:00 +0000');
        $this->fakeFeed($this->rss($items));

        $this->artisan('news:sync')->assertSuccessful();
        $this->assertDatabaseCount('news_items', 0);
    }

    public function test_external_entities_doctype_malformed_and_oversized_xml_are_rejected(): void
    {
        $manual = $this->manualNews();
        foreach ([
            '<!DOCTYPE rss [<!ENTITY external SYSTEM "file:///etc/passwd">]><rss><channel><item><title>&external;</title></item></channel></rss>',
            '<!DOCTYPE rss SYSTEM "https://evil.example/feed.dtd"><rss><channel/></rss>',
            '<rss><channel><item>',
            '<html>Not RSS</html>',
            "\0".$this->rss($this->item()),
            str_repeat(' ', 1_048_577),
        ] as $body) {
            $this->fakeFeed($body);
            $this->artisan('news:sync')->assertFailed();
        }

        $this->assertDatabaseCount('news_items', 1);
        $this->assertSame('Manual news', $manual->fresh()->title);
    }

    public function test_item_count_is_bounded_and_fragments_deduplicate(): void
    {
        $items = $this->item(url: 'https://www.wamda.com/story#first')
            .$this->item(url: 'https://www.wamda.com/story#second');
        for ($i = 0; $i < 60; $i++) {
            $items .= $this->item(url: 'https://www.wamda.com/story-'.$i);
        }
        $this->fakeFeed($this->rss($items));
        $this->artisan('news:sync')->assertSuccessful();

        $this->assertDatabaseCount('news_items', 49);
        $this->assertDatabaseHas('news_items', ['source_url' => 'https://www.wamda.com/story']);
        $this->assertDatabaseMissing('news_items', ['source_url' => 'https://www.wamda.com/story-48']);
    }

    public function test_fetch_uses_only_fixed_https_feeds_and_never_follows_redirects(): void
    {
        Http::fake(function (Request $request, array $options) {
            $this->assertFalse($options['allow_redirects']);
            $this->assertTrue($options['stream']);
            $this->assertSame(10, $options['timeout']);
            $this->assertSame(3, $options['connect_timeout']);
            $this->assertSame(3, $options['read_timeout']);

            return Http::response('', 302, ['Location' => 'http://127.0.0.1/private']);
        });
        $this->artisan('news:sync')->assertFailed();
        Http::assertSentCount(3);
        Http::assertSent(fn (Request $request) => $request->url() === 'https://www.wamda.com/feed');
        $this->assertDatabaseCount('news_items', 0);
    }

    public function test_public_news_resource_exposes_source_and_company_names(): void
    {
        $this->fakeFeed($this->rss($this->item()));
        $this->artisan('news:sync')->assertSuccessful();
        $article = NewsItem::firstOrFail();
        $article->update(['companies' => ['Acme']]);

        $this->getJson('/api/v1/news/'.$article->slug)
            ->assertOk()
            ->assertJsonPath('data.source_url', $article->source_url)
            ->assertJsonPath('data.source_name', 'Wamda')
            ->assertJsonPath('data.image_credit', null)
            ->assertJsonPath('data.companies', ['Acme']);
    }

    public function test_admin_can_validate_and_edit_source_metadata(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $data = [
            'title' => 'Editorial news',
            'excerpt' => 'A brief.',
            'category' => 'ecosystem',
            'author_name' => 'Editor',
            'status' => 'published',
            'source_url' => 'https://www.wamda.com/editorial',
            'source_name' => 'Wamda',
            'image_credit' => 'Image owner',
            'companies' => ['Acme'],
        ];
        $this->actingAs($admin)->postJson('/api/v1/admin/news', $data)
            ->assertCreated()
            ->assertJsonPath('data.companies', ['Acme'])
            ->assertJsonPath('data.image_credit', 'Image owner');
        $this->postJson('/api/v1/admin/news', array_replace($data, ['source_url' => 'http://www.wamda.com/story', 'companies' => [123]]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['source_url', 'companies.0']);
        $this->postJson('/api/v1/admin/news', $data)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['source_url']);
    }

    public function test_sync_is_scheduled_daily_without_overlapping(): void
    {
        $event = collect(app(Schedule::class)->events())
            ->first(fn ($event) => str_contains($event->command ?? '', 'news:sync'));

        $this->assertNotNull($event);
        $this->assertSame('0 0 * * *', $event->expression);
        $this->assertTrue($event->withoutOverlapping);
        $this->assertSame('news:sync', app(SyncNews::class)->getName());
    }

    private function fakeFeed(string $body): void
    {
        Http::fake([
            'https://www.wamda.com/feed' => Http::response($body),
            '*' => Http::response($this->rss('')),
        ]);
    }

    private function rss(string $items): string
    {
        return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>'.$items.'</channel></rss>';
    }

    private function item(
        string $url = 'https://www.wamda.com/2026/10/acme-funding',
        string $date = 'Sat, 10 Oct 2026 12:00:00 +0000',
        string $description = '<p>Acme raised seed funding.</p>',
    ): string {
        return '<item><title><![CDATA[Acme <b>raises</b> funding]]></title><link>'
            .htmlspecialchars($url, ENT_XML1).'</link><pubDate>'.$date.'</pubDate><description><![CDATA['
            .$description.']]></description><content:encoded xmlns:content="http://purl.org/rss/1.0/modules/content/"><![CDATA[Full article must not be copied.]]></content:encoded>'
            .'<enclosure url="https://evil.example/image.jpg" type="image/jpeg"/></item>';
    }

    private function manualNews(): NewsItem
    {
        return NewsItem::create([
            'title' => 'Manual news',
            'slug' => 'manual-news',
            'excerpt' => 'An editorial brief.',
            'category' => 'ecosystem',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);
    }
}
