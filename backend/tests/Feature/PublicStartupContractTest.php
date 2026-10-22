<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class PublicStartupContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_revenue_qualified_imports_match_the_contract_in_both_locales(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $samples = [];
        foreach (['en', 'ar'] as $locale) {
            $response = $this->getJson('/api/v1/startup-directory?per_page=100', ['X-Locale' => $locale])
                ->assertOk()->assertJsonPath('meta.total', 8)->assertJsonCount(8, 'data');
            $this->assertSame(['reported', 'financial_statement'], array_values(array_unique(array_column($response->json('data'), 'revenue_status'))));
            $samples[] = $this->sample($response);
        }
        $this->assertContracts($samples);
    }

    public function test_filters_pagination_facets_and_empty_pages_match_the_contract(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $samples = [];
        foreach (['per_page=2&page=2', 'per_page=2&page=9', 'region=Saudi%20Arabia', 'source=leap', 'business_type=traditional', 'search=no-match'] as $query) {
            $samples[] = $this->sample($this->getJson('/api/v1/startup-directory?'.$query)->assertOk());
        }
        $this->assertSame([], $samples[4]['body']->data);
        $this->assertSame([], $samples[5]['body']->data);
        $this->assertContracts($samples);
    }

    public function test_validation_errors_match_the_contract(): void
    {
        $samples = [];
        foreach (['per_page=101', 'page=0', 'region=invalid', 'business_type=invalid'] as $query) {
            $samples[] = $this->sample($this->getJson('/api/v1/startup-directory?'.$query)->assertUnprocessable());
        }
        $this->assertContracts($samples);
    }

    public function test_contract_rejects_eligibility_drift_and_private_field_leaks(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $original = $this->sample($this->getJson('/api/v1/startup-directory?per_page=1')->assertOk());
        foreach (['pending_revenue', 'missing_period', 'private_field', 'bad_date'] as $case) {
            $sample = unserialize(serialize($original));
            if ($case === 'pending_revenue') {
                $sample['body']->data[0]->revenue_status = 'pending';
            } elseif ($case === 'missing_period') {
                unset($sample['body']->data[0]->revenue_evidence->period);
            } elseif ($case === 'private_field') {
                $sample['body']->data[0]->owner_email = 'private@example.test';
            } else {
                $sample['body']->data[0]->reviewed_at = '2026-02-30';
            }
            $this->assertSame(1, $this->validator([$sample])->getExitCode(), 'Must reject '.$case);
        }
    }

    private function sample(TestResponse $response): array
    {
        return ['path' => '/api/v1/startup-directory', 'status' => $response->status(), 'body' => json_decode($response->getContent(), false, 512, JSON_THROW_ON_ERROR)];
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
