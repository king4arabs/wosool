<?php

namespace Tests\Feature;

use App\Console\Commands\SyncNews;
use App\Models\CompanyProfile;
use App\Models\NewsItem;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
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

        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
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
        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
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
        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
        NewsItem::whereNotNull('source_url')->firstOrFail()->delete();
        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();

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
            '*' => fn () => Http::response($this->rss('')),
        ]);
        $this->artisan('news:sync', ['--include-unverified' => true])->assertFailed();
        $this->assertDatabaseCount('news_items', 2);
        $this->assertSame('Manual news', $manual->fresh()->title);
        $this->assertDatabaseHas('news_items', ['source_name' => 'TechCrunch']);

        Http::swap(new Factory);
        Http::preventStrayRequests();
        Http::fake(['*' => Http::failedConnection()]);
        $this->artisan('news:sync', ['--include-unverified' => true])->assertFailed();
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
            'https://reader@www.wamda.com/story',
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

        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
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
            '<?xml version="1.0" encoding="UTF-7"?><rss><channel/></rss>',
            "\0".$this->rss($this->item()),
            str_repeat(' ', 1_048_577),
        ] as $body) {
            $this->fakeFeed($body);
            $this->artisan('news:sync', ['--include-unverified' => true])->assertFailed();
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
        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();

        $this->assertDatabaseCount('news_items', 49);
        $this->assertDatabaseHas('news_items', ['source_url' => 'https://www.wamda.com/story']);
        $this->assertDatabaseMissing('news_items', ['source_url' => 'https://www.wamda.com/story-48']);
    }

    public function test_fetch_uses_only_fixed_https_feeds_and_never_follows_redirects(): void
    {
        $requestOptions = [];
        Http::fake(function (Request $request, array $options) use (&$requestOptions) {
            $requestOptions[] = $options;

            return Http::response('', 302, ['Location' => 'http://127.0.0.1/private']);
        });
        $this->artisan('news:sync', ['--include-unverified' => true])->assertFailed();
        foreach ($requestOptions as $options) {
            $this->assertFalse($options['allow_redirects']);
            $this->assertTrue($options['stream']);
            $this->assertSame(10, $options['timeout']);
            $this->assertSame(3, $options['connect_timeout']);
            $this->assertSame(3, $options['read_timeout']);
        }
        Http::assertSentCount(4);
        Http::assertSent(fn (Request $request) => $request->url() === 'https://www.wamda.com/feed');
        Http::assertSent(fn (Request $request) => $request->url() === 'https://www.microsoft.com/en-us/startups/blog/feed/');
        $this->assertDatabaseCount('news_items', 0);
    }

    public function test_public_news_resource_exposes_source_and_company_names(): void
    {
        $this->fakeFeed($this->rss($this->item()));
        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
        $article = NewsItem::firstOrFail();
        $article->update(['companies' => ['Acme']]);

        $this->getJson('/api/v1/news/'.$article->slug)
            ->assertOk()
            ->assertJsonPath('data.source_url', $article->source_url)
            ->assertJsonPath('data.source_name', 'Wamda')
            ->assertJsonPath('data.image_credit', null)
            ->assertJsonPath('data.companies', ['Acme']);
    }

    public function test_sync_accepts_allowlisted_media_thumbnail_enclosure_and_description_images_with_credit(): void
    {
        $image = 'https://wamda-prod.s3.amazonaws.com/photos/acme.jpg';
        foreach ([
            ['xml' => '<media:content xmlns:media="http://search.yahoo.com/mrss/" medium="image" type="image/jpeg" url="'.$image.'"/>'],
            ['xml' => '<media:thumbnail xmlns:media="http://search.yahoo.com/mrss/" url="'.$image.'"/>'],
            ['xml' => '<enclosure type="image/jpeg" url="'.$image.'"/>'],
            ['description' => '<p>Acme raised funding.</p><img src="'.$image.'" alt="Acme">'],
            [
                'xml' => '<media:content xmlns:media="http://search.yahoo.com/mrss/" url="https://evil.example/image.jpg"/>',
                'description' => '<p>Acme raised funding.</p><img src="'.$image.'">',
            ],
        ] as $i => $candidate) {
            $this->fakeFeed($this->rss($this->item(
                url: 'https://www.wamda.com/image-story-'.$i,
                description: $candidate['description'] ?? '<p>Acme raised funding.</p>',
                imageXml: $candidate['xml'] ?? '',
            )));
            $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
            $this->assertDatabaseHas('news_items', [
                'source_url' => 'https://www.wamda.com/image-story-'.$i,
                'image_url' => $image,
                'image_credit' => 'Wamda',
            ]);
            Http::assertSentCount(4);
        }

        $techCrunchImage = 'https://techcrunch.com/wp-content/uploads/2026/10/acme.jpg';
        Http::swap(new Factory);
        Http::preventStrayRequests();
        Http::fake([
            'https://techcrunch.com/category/startups/feed/' => fn () => Http::response($this->rss($this->item(
                url: 'https://techcrunch.com/2026/10/10/acme/',
                description: '<p>Acme raised funding.</p><img src="'.$techCrunchImage.'">',
            ))),
            '*' => fn () => Http::response($this->rss('')),
        ]);
        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
        $this->assertDatabaseHas('news_items', ['image_url' => $techCrunchImage, 'image_credit' => 'TechCrunch']);
    }

    public function test_sync_rejects_unsafe_or_cross_publisher_image_urls(): void
    {
        foreach ([
            'http://wamda-prod.s3.amazonaws.com/image.jpg',
            'https://wamda-prod.s3.amazonaws.com.evil.example/image.jpg',
            'https://other-bucket.s3.amazonaws.com/image.jpg',
            'https://techcrunch.com/wp-content/image.jpg',
            'https://127.0.0.1/image.jpg',
            'https://reader@www.wamda.com/image.jpg',
            'https://www.wamda.com:8443/image.jpg',
            'data:image/png;base64,abc',
            '/image.jpg',
        ] as $i => $image) {
            $this->fakeFeed($this->rss($this->item(
                url: 'https://www.wamda.com/unsafe-image-'.$i,
                description: '<p>Acme raised funding.</p><img src="'.htmlspecialchars($image, ENT_QUOTES).'">',
                imageXml: '<media:thumbnail xmlns:media="http://search.yahoo.com/mrss/" url="'.htmlspecialchars($image, ENT_XML1).'"/>',
            )));
            $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
            $this->assertDatabaseHas('news_items', [
                'source_url' => 'https://www.wamda.com/unsafe-image-'.$i,
                'image_url' => null,
                'image_credit' => null,
            ]);
        }
        $this->fakeFeed($this->rss($this->item(
            url: 'https://www.wamda.com/video-not-image',
            imageXml: '<media:content xmlns:media="http://search.yahoo.com/mrss/" medium="video" type="video/mp4" url="https://www.wamda.com/video.mp4"/>',
        )));
        $this->artisan('news:sync', ['--include-unverified' => true])->assertSuccessful();
        $this->assertDatabaseHas('news_items', ['source_url' => 'https://www.wamda.com/video-not-image', 'image_url' => null]);
    }

    public function test_sync_imports_verified_microsoft_startup_feed_with_publisher_image_credit(): void
    {
        $source = 'https://www.microsoft.com/en-us/startups/blog/2026/09/15/startup-story/';
        $image = 'https://www.microsoft.com/en-us/startups/blog/wp-content/uploads/2026/09/startup-story.jpg';
        Http::fake([
            'https://www.microsoft.com/en-us/startups/blog/feed/' => fn () => Http::response($this->rss($this->item(
                url: $source,
                date: 'Tue, 15 Sep 2026 12:00:00 +0000',
                description: '<p>Acme startup brief.</p><img src="'.$image.'">',
            ))),
            '*' => fn () => Http::response($this->rss('')),
        ]);

        $this->artisan('news:sync')->assertSuccessful();
        $this->artisan('news:sync')->assertSuccessful();
        Http::assertSentCount(2);
        Http::assertNotSent(fn (Request $request) => $request->url() !== 'https://www.microsoft.com/en-us/startups/blog/feed/');
        $this->assertDatabaseCount('news_items', 1);
        $this->assertDatabaseHas('news_items', [
            'source_url' => $source,
            'source_name' => 'Microsoft for Startups',
            'image_url' => $image,
            'image_credit' => 'Microsoft for Startups',
            'content' => null,
        ]);
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

    public function test_microsoft_content_encoded_image_is_used_only_when_description_has_no_image(): void
    {
        $image = 'https://www.microsoft.com/en-us/startups/blog/wp-content/uploads/2026/09/content-image.jpg';
        $descriptionImage = 'https://www.microsoft.com/en-us/startups/blog/wp-content/uploads/2026/09/description-image.jpg';
        $fullContent = '<h1>Full article text must not be stored.</h1><img src="'.$image.'">';
        $items = $this->item(
            url: 'https://www.microsoft.com/en-us/startups/blog/content-image/',
            description: '<p>Only this brief should be stored.</p>',
            content: $fullContent,
        ).$this->item(
            url: 'https://www.microsoft.com/en-us/startups/blog/description-image/',
            description: '<p>Another brief.</p><img src="'.$descriptionImage.'">',
            content: $fullContent,
        ).$this->item(
            url: 'https://www.microsoft.com/en-us/startups/blog/unsafe-content-image/',
            content: '<p>Full source article.</p><img src="https://evil.example/image.jpg">',
        );
        Http::fake([
            'https://www.microsoft.com/en-us/startups/blog/feed/' => fn () => Http::response($this->rss($items)),
        ]);

        $this->artisan('news:sync')->assertSuccessful();
        $this->assertDatabaseHas('news_items', [
            'source_url' => 'https://www.microsoft.com/en-us/startups/blog/content-image/',
            'image_url' => $image,
            'image_credit' => 'Microsoft for Startups',
            'excerpt' => 'Only this brief should be stored.',
            'content' => null,
        ]);
        $this->assertDatabaseHas('news_items', [
            'source_url' => 'https://www.microsoft.com/en-us/startups/blog/description-image/',
            'image_url' => $descriptionImage,
            'content' => null,
        ]);
        $this->assertDatabaseHas('news_items', [
            'source_url' => 'https://www.microsoft.com/en-us/startups/blog/unsafe-content-image/',
            'image_url' => null,
            'image_credit' => null,
            'content' => null,
        ]);
        Http::assertSentCount(1);
    }

    public function test_company_filter_matches_only_exact_company_names_or_tags(): void
    {
        $companyNews = $this->manualNews();
        $companyNews->update(['companies' => ['Acme']]);
        $tagNews = NewsItem::create([
            'title' => 'A funding update',
            'slug' => 'tag-news',
            'category' => 'ecosystem',
            'tags' => ['acme-slug'],
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);
        NewsItem::create([
            'title' => 'Acme mentioned without a verified association',
            'slug' => 'unassociated-news',
            'category' => 'ecosystem',
            'companies' => ['Acme Labs'],
            'tags' => ['acme-slug-extra'],
            'status' => 'published',
        ]);
        NewsItem::create([
            'title' => 'Private Acme news',
            'slug' => 'private-company-news',
            'category' => 'ecosystem',
            'companies' => ['Acme'],
            'status' => 'published',
            'is_public' => false,
        ]);

        $this->getJson('/api/v1/news?company=Acme')
            ->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $companyNews->id);
        $this->getJson('/api/v1/news?company=acme-slug')
            ->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $tagNews->id);
        $this->getJson('/api/v1/news?company=acm')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/news?company[]=Acme')->assertUnprocessable();
    }

    public function test_public_news_excludes_future_publications_drafts_and_private_items(): void
    {
        $visible = $this->manualNews();
        foreach ([
            ['slug' => 'future-news', 'published_at' => now()->addMinute(), 'status' => 'published'],
            ['slug' => 'draft-news', 'published_at' => now()->subDay(), 'status' => 'draft'],
            ['slug' => 'private-news', 'published_at' => now()->subDay(), 'status' => 'published', 'is_public' => false],
        ] as $data) {
            $hidden = NewsItem::create(array_merge([
                'title' => 'Hidden news',
                'category' => 'ecosystem',
                'companies' => ['Acme'],
                'tags' => ['acme-slug'],
            ], $data));
            $this->getJson('/api/v1/news/'.$hidden->slug)->assertNotFound();
        }
        $legacy = NewsItem::create([
            'title' => 'Legacy undated editorial',
            'slug' => 'undated-news',
            'category' => 'ecosystem',
            'status' => 'published',
        ]);
        $this->getJson('/api/v1/news')
            ->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/news?company=acme-slug')
            ->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/news/'.$visible->slug)->assertOk();
        $this->getJson('/api/v1/news/'.$legacy->slug)->assertOk();
    }

    public function test_company_alias_list_or_matches_exact_localized_names_english_names_and_tags(): void
    {
        $news = $this->manualNews();
        $news->update(['companies' => ['Foodics'], 'tags' => ['foodics-slug']]);
        NewsItem::create([
            'title' => 'Unrelated Foodics headline',
            'slug' => 'unrelated-foodics',
            'category' => 'ecosystem',
            'companies' => ['Foodics Labs'],
            'status' => 'published',
        ]);
        foreach ([
            'فودكس, Foodics ,foodics',
            'فودكس,foodics-slug',
        ] as $aliases) {
            $this->getJson('/api/v1/news?companies='.rawurlencode($aliases))
                ->assertOk()->assertJsonCount(1, 'data')
                ->assertJsonPath('data.0.id', $news->id);
        }
        $news->update(['companies' => ['فودكس']]);
        $this->getJson('/api/v1/news?companies='.rawurlencode('فودكس,Foodics'))
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/news?companies=Foodics-extra,foodics-slug-extra')
            ->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/news?companies=Other&company=foodics-slug')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/news?companies='.implode(',', range(1, 10)))
            ->assertOk();
        $this->getJson('/api/v1/news?companies='.implode(',', range(1, 11)))
            ->assertUnprocessable()->assertJsonValidationErrors(['companies']);
        $this->getJson('/api/v1/news?companies='.str_repeat('a', 256))
            ->assertUnprocessable()->assertJsonValidationErrors(['companies']);
        $this->getJson('/api/v1/news?companies[]=Foodics')
            ->assertUnprocessable()->assertJsonValidationErrors(['companies']);
    }

    public function test_public_news_page_size_is_clamped(): void
    {
        $this->manualNews();
        foreach ([0 => 1, -5 => 1, 1000 => 50, 7 => 7] as $requested => $expected) {
            $this->getJson('/api/v1/news?per_page='.$requested)
                ->assertOk()->assertJsonPath('meta.per_page', $expected);
        }
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
        Http::swap(new Factory);
        Http::preventStrayRequests();
        Http::fake([
            'https://www.wamda.com/feed' => fn () => Http::response($body),
            '*' => fn () => Http::response($this->rss('')),
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
        string $imageXml = '',
        string $content = 'Full article must not be copied.',
    ): string {
        return '<item><title><![CDATA[Acme <b>raises</b> funding]]></title><link>'
            .htmlspecialchars($url, ENT_XML1).'</link><pubDate>'.$date.'</pubDate><description><![CDATA['
            .$description.']]></description><content:encoded xmlns:content="http://purl.org/rss/1.0/modules/content/"><![CDATA['.$content.']]></content:encoded>'
            .$imageXml.'<enclosure url="https://evil.example/image.jpg" type="image/jpeg"/></item>';
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
