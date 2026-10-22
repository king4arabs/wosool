<?php

namespace Tests\Feature;

use App\Models\{CompanyProfile, FounderProfile, Scorecard, User};
use App\Services\FounderDirectoryImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class PublicFounderContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_minimal_unclaimed_profile_has_nullable_relationships_and_no_contact_details(): void
    {
        $founder = $this->founder('minimal');
        $response = $this->getJson('/api/v1/founders/'.$founder->slug)->assertOk()
            ->assertJsonPath('data.user', null)->assertJsonPath('data.scorecard', null)
            ->assertJsonPath('data.activation_status', 'unclaimed')->assertJsonPath('data.can_communicate', false)
            ->assertJsonPath('data.legal_name', 'minimal')->assertJsonMissingPath('data.invitation');
        $this->assertContracts([$this->sample($response, '/api/v1/founders/{slug}')]);
    }

    public function test_both_imported_catalogs_match_the_contract_in_both_locales(): void
    {
        $result = app(FounderDirectoryImporter::class)->run();
        $this->assertSame(150, $result['founders_created']);
        $this->assertSame(0, User::count());
        $samples = [];
        foreach (['en', 'ar'] as $locale) {
            foreach ([1, 2] as $page) {
                $response = $this->getJson('/api/v1/founders?per_page=100&page='.$page, ['X-Locale' => $locale])
                    ->assertOk()->assertJsonPath('meta.total', 150)->assertJsonCount($page === 1 ? 100 : 50, 'data');
                $samples[] = $this->sample($response, '/api/v1/founders');
            }
            $detail = $this->getJson('/api/v1/founders/salman-butt', ['X-Locale' => $locale])->assertOk()
                ->assertJsonPath('data.activation_status', 'unclaimed')->assertJsonPath('data.can_communicate', false);
            $samples[] = $this->sample($detail, '/api/v1/founders/{slug}');
        }
        $this->assertContracts($samples);
    }

    public function test_claimed_and_legacy_accounts_remain_distinct_from_unclaimed_editorial_profiles(): void
    {
        $samples = [];
        foreach (['unclaimed', 'claimed', 'legacy'] as $kind) {
            $user = User::factory()->create();
            $founder = $this->founder($kind, [
                'user_id' => $user->id, 'directory_key' => $kind === 'legacy' ? null : $kind,
                'claimed_at' => $kind === 'claimed' ? now() : null,
                'skills' => ['primary' => 'Engineering'], 'needs' => ['first' => 'Mentoring'],
            ]);
            $response = $this->getJson('/api/v1/founders/'.$founder->slug)->assertOk()
                ->assertJsonPath('data.activation_status', $kind === 'unclaimed' ? 'unclaimed' : 'active')
                ->assertJsonPath('data.can_communicate', $kind !== 'unclaimed')
                ->assertJsonPath('data.user.email', null)->assertJsonMissingPath('data.user.password')
                ->assertJsonMissingPath('data.user_id')->assertJsonMissingPath('data.invitation');
            $samples[] = $this->sample($response, '/api/v1/founders/{slug}');
        }
        $community = $this->getJson('/api/v1/founders?community=1')->assertOk()->assertJsonPath('meta.total', 2);
        $this->assertNotContains('unclaimed', array_column($community->json('data'), 'slug'));
        $samples[] = $this->sample($community, '/api/v1/founders');
        $this->assertContracts($samples);
    }

    public function test_private_inactive_and_deleted_profiles_and_company_relationships_are_excluded(): void
    {
        $visible = $this->founder('visible');
        $samples = [];
        foreach (['private', 'inactive', 'deleted'] as $kind) {
            $changes = $kind === 'private' ? ['is_public' => false] : ($kind === 'inactive' ? ['status' => 'inactive'] : []);
            $founder = $this->founder($kind, $changes);
            if ($kind === 'deleted') $founder->delete();
            $samples[] = $this->sample($this->getJson('/api/v1/founders/'.$kind)->assertNotFound(), '/api/v1/founders/{slug}');
            $company = CompanyProfile::create(array_merge(['name' => 'Fixture '.$kind, 'slug' => $kind, 'is_public' => true, 'status' => 'active'], $changes));
            $visible->companies()->attach($company->id, ['role' => 'Founder', 'is_primary' => false]);
            if ($kind === 'deleted') $company->delete();
        }
        $company = CompanyProfile::create(['name' => 'Public fixture', 'slug' => 'public-fixture', 'is_public' => true, 'status' => 'active', 'team_size' => 5, 'founded_year' => 2020,
            'metrics_summary' => ['en' => 'Company-reported fixture', 'ar' => 'بيان تجريبي', 'source_url' => 'https://example.com/evidence', 'reviewed_at' => '2026-10-19']]);
        $visible->companies()->attach($company->id, ['role' => 'Co-founder', 'is_primary' => true]);
        $detail = $this->getJson('/api/v1/founders/visible')->assertOk()->assertJsonCount(1, 'data.companies')
            ->assertJsonPath('data.companies.0.slug', 'public-fixture')->assertJsonPath('data.primary_company_name', 'Public fixture');
        $samples[] = $this->sample($detail, '/api/v1/founders/{slug}');
        $samples[] = $this->sample($this->getJson('/api/v1/founders/missing')->assertNotFound(), '/api/v1/founders/{slug}');
        $samples[] = $this->sample($this->getJson('/api/v1/founders')->assertOk()->assertJsonPath('meta.total', 1), '/api/v1/founders');
        $this->assertContracts($samples);
    }

    public function test_pagination_clamps_page_sizes_and_accepts_empty_and_out_of_range_pages(): void
    {
        foreach (['one', 'two', 'three'] as $slug) $this->founder($slug);
        $samples = [];
        foreach (['per_page=2&page=2', 'per_page=2&page=9', 'per_page=0', 'per_page=101', 'search=no-match'] as $query) {
            $samples[] = $this->sample($this->getJson('/api/v1/founders?'.$query)->assertOk(), '/api/v1/founders');
        }
        $this->assertSame(1, $samples[2]['body']->meta->per_page);
        $this->assertSame(100, $samples[3]['body']->meta->per_page);
        $this->assertSame([], $samples[4]['body']->data);
        $this->assertContracts($samples);
    }

    public function test_scorecard_computed_fields_and_legacy_log_shapes_match_the_contract(): void
    {
        $founder = $this->founder('scorecard');
        $scorecard = Scorecard::create(['founder_profile_id' => $founder->id, 'aggregate_score' => 30, 'momentum' => 35, 'growth' => 20, 'readiness' => 40, 'support_delta' => 70]);
        $samples = [];
        foreach ([[], [['aggregate_score' => 20, 'notes' => 'Fixture update']], ['previous' => ['aggregate_score' => 20]]] as $logs) {
            $scorecard->update(['historical_logs' => $logs]);
            $samples[] = $this->sample($this->getJson('/api/v1/founders/scorecard')->assertOk(), '/api/v1/founders/{slug}');
        }
        $scorecard->update(['aggregate_score' => 80, 'momentum' => 80, 'readiness' => 80, 'support_delta' => 10]);
        $response = $this->getJson('/api/v1/founders/scorecard')->assertOk()->assertJsonCount(0, 'data.scorecard.insights.dynamic_alerts')
            ->assertJsonPath('data.scorecard.insights.automated_action_suggestions.0.priority', 'normal');
        $samples[] = $this->sample($response, '/api/v1/founders/{slug}');
        $this->assertContracts($samples);
    }

    public function test_contract_rejects_drift_missing_fields_and_nested_account_or_company_leaks(): void
    {
        $user = User::factory()->create();
        $founder = $this->founder('drift', ['user_id' => $user->id]);
        $company = CompanyProfile::create(['name' => 'Fixture', 'slug' => 'fixture', 'is_public' => true, 'status' => 'active']);
        $founder->companies()->attach($company->id, ['is_primary' => true]);
        $original = $this->sample($this->getJson('/api/v1/founders/drift')->assertOk(), '/api/v1/founders/{slug}');
        foreach (['id', 'companies', 'invitation', 'email', 'company_private'] as $case) {
            $sample = unserialize(serialize($original));
            match ($case) {
                'id' => $sample['body']->data->id = 'invalid',
                'email' => $sample['body']->data->user->email = 'private@example.test',
                'invitation' => $sample['body']->data->invitation = ['token' => 'fixture'],
                'company_private' => $sample['body']->data->companies[0]->metrics_summary = ['private' => true],
                default => null,
            };
            if ($case === 'companies') unset($sample['body']->data->companies);
            $this->assertSame(1, $this->validator([$sample])->getExitCode(), 'Must reject '.$case);
        }
    }

    private function founder(string $slug, array $changes = []): FounderProfile
    {
        return FounderProfile::create(array_merge(['slug' => $slug, 'status' => 'active', 'is_public' => true], $changes));
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
