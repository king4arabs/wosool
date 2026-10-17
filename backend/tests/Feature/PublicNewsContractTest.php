<?php

namespace Tests\Feature;

use App\Models\NewsItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class PublicNewsContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_minimal_manual_story_preserves_nullable_fields_and_empty_translations(): void
    {
        $story = $this->story('minimal');
        $response = $this->getJson('/api/v1/news/'.$story->slug)->assertOk()
            ->assertJsonPath('data.source_url', null)->assertJsonPath('data.published_at', null);
        $this->assertContracts([$this->sample($response, '/api/v1/news/{slug}')]);

        $story->update(['translations' => []]);
        $response = $this->getJson('/api/v1/news/'.$story->slug)->assertOk()->assertJsonPath('data.translations', []);
        $this->assertContracts([$this->sample($response, '/api/v1/news/{slug}')]);
    }

    public function test_reviewed_news_catalog_matches_the_exported_contract_in_both_locales(): void
    {
        $this->artisan('wosool:import-news')->assertSuccessful();
        $samples = [];
        foreach (['en', 'ar'] as $locale) {
            $response = $this->getJson('/api/v1/news?per_page=50', ['Accept-Language' => $locale])->assertOk();
            $this->assertNotEmpty($response->json('data'));
            $samples[] = $this->sample($response, '/api/v1/news');
            $slug = $response->json('data.0.slug');
            $samples[] = $this->sample($this->getJson('/api/v1/news/'.$slug)->assertOk(), '/api/v1/news/{slug}');
        }
        $this->assertContracts($samples);
    }

    public function test_pagination_filters_and_empty_pages_match_the_contract(): void
    {
        foreach (['one', 'two', 'three'] as $slug) {
            $this->story($slug, ['companies' => ['Fixture Company'], 'region' => 'saudi', 'published_at' => now()->subDay()]);
        }
        $samples = [];
        foreach ([1, 2, 9] as $page) {
            $response = $this->getJson('/api/v1/news?company=Fixture%20Company&per_page=2&page='.$page)
                ->assertOk()->assertJsonPath('meta.total', 3)->assertJsonPath('meta.current_page', $page);
            $samples[] = $this->sample($response, '/api/v1/news');
        }
        $empty = $this->getJson('/api/v1/news?region=gcc')->assertOk()->assertJsonCount(0, 'data');
        $samples[] = $this->sample($empty, '/api/v1/news');
        $this->assertContracts($samples);
    }

    public function test_non_public_future_and_deleted_stories_remain_excluded(): void
    {
        $samples = [];
        foreach ([['status' => 'draft'], ['status' => 'archived'], ['is_public' => false], ['published_at' => now()->addDay()]] as $index => $changes) {
            $story = $this->story('hidden-'.$index, $changes);
            $samples[] = $this->sample($this->getJson('/api/v1/news/'.$story->slug)->assertNotFound(), '/api/v1/news/{slug}');
        }
        $deleted = $this->story('deleted');
        $deleted->delete();
        foreach (['deleted', 'missing'] as $slug) {
            $samples[] = $this->sample($this->getJson('/api/v1/news/'.$slug)->assertNotFound(), '/api/v1/news/{slug}');
        }
        $samples[] = $this->sample($this->getJson('/api/v1/news')->assertOk()->assertJsonCount(0, 'data'), '/api/v1/news');
        $this->assertContracts($samples);
    }

    public function test_validation_errors_match_the_contract(): void
    {
        $samples = [];
        foreach (['region=invalid', 'company[]=invalid', 'companies='.str_repeat('a', 256)] as $query) {
            $samples[] = $this->sample($this->getJson('/api/v1/news?'.$query)->assertUnprocessable(), '/api/v1/news');
        }
        $this->assertContracts($samples);
    }

    public function test_existing_associative_editorial_fields_remain_supported(): void
    {
        $story = $this->story('associative', ['tags' => ['topic' => 'funding'], 'key_facts' => ['first' => 'Editorial fact']]);
        $this->assertContracts([$this->sample($this->getJson('/api/v1/news/'.$story->slug)->assertOk(), '/api/v1/news/{slug}')]);
    }

    public function test_contract_gate_rejects_type_drift_missing_fields_and_private_field_leaks(): void
    {
        $story = $this->story('drift');
        $original = $this->sample($this->getJson('/api/v1/news/'.$story->slug)->assertOk(), '/api/v1/news/{slug}');
        foreach (['id', 'slug', 'author_id', 'published_at'] as $field) {
            $sample = unserialize(serialize($original));
            if ($field === 'slug') {
                unset($sample['body']->data->slug);
            } else {
                $sample['body']->data->{$field} = $field === 'author_id' ? 123 : 'invalid';
            }
            $process = $this->validator([$sample]);
            $this->assertSame(1, $process->getExitCode(), 'The contract must reject '.$field);
        }
    }

    private function story(string $slug, array $changes = []): NewsItem
    {
        return NewsItem::create(array_merge(['title' => 'Contract fixture', 'slug' => $slug, 'category' => 'ecosystem', 'status' => 'published', 'is_public' => true], $changes));
    }

    private function sample(TestResponse $response, string $path): array
    {
        return ['path' => $path, 'status' => $response->status(), 'body' => json_decode($response->getContent(), false, 512, JSON_THROW_ON_ERROR)];
    }

    private function validator(array $samples): Process
    {
        $process = new Process(['node', '--import', 'tsx', 'scripts/check-public-api-contract.ts'], base_path('../frontend'));
        $process->setInput(json_encode($samples, JSON_THROW_ON_ERROR));
        $process->setTimeout(30);
        $process->run();

        return $process;
    }

    private function assertContracts(array $samples): void
    {
        $process = $this->validator($samples);
        $this->assertSame(0, $process->getExitCode(), $process->getErrorOutput().$process->getOutput());
    }
}
