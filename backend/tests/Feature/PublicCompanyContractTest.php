<?php

namespace Tests\Feature;

use App\Models\{CompanyProfile, FounderProfile, User};
use App\Services\FounderDirectoryImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class PublicCompanyContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_minimal_company_has_nullable_fields_and_distinct_list_and_detail_shapes(): void
    {
        $company = $this->company('minimal');
        $detail = $this->getJson('/api/v1/companies/minimal')->assertOk()
            ->assertJsonPath('data.traction', null)->assertJsonCount(0, 'data.founders')
            ->assertJsonMissingPath('data.founders_count')->assertJsonMissingPath('data.pivot');
        $list = $this->getJson('/api/v1/companies')->assertOk()
            ->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.founders_count', 0);
        $this->assertContracts([
            $this->sample($detail, '/api/v1/companies/{slug}'),
            $this->sample($list, '/api/v1/companies'),
        ]);
    }

    public function test_all_imported_companies_match_the_contract_in_both_locales(): void
    {
        $result = app(FounderDirectoryImporter::class)->run();
        $this->assertSame(173, $result['companies_created']);
        $this->assertSame(316, $result['founders_created']);
        $this->assertSame(0, User::count());
        $samples = [];
        foreach (['en', 'ar'] as $locale) {
            foreach (range(1, 8) as $page) {
                $list = $this->getJson('/api/v1/companies?per_page=24&page='.$page, ['X-Locale' => $locale])->assertOk()
                    ->assertJsonPath('meta.total', 173)->assertJsonCount($page === 8 ? 5 : 24, 'data');
                $samples[] = $this->sample($list, '/api/v1/companies');
            }
            $detail = $this->getJson('/api/v1/companies/unifonic', ['X-Locale' => $locale])->assertOk()
                ->assertJsonPath('data.is_public', true)->assertJsonPath('data.status', 'active');
            $samples[] = $this->sample($detail, '/api/v1/companies/{slug}');
        }
        $this->assertContracts($samples);
    }

    public function test_relationships_expose_only_public_active_founders_and_no_account_contact_fields(): void
    {
        $company = $this->company('visible');
        $user = User::factory()->create();
        $visible = $this->founder('visible-founder', ['user_id' => $user->id, 'claimed_at' => now()]);
        $private = $this->founder('private-founder', ['is_public' => false]);
        $inactive = $this->founder('inactive-founder', ['status' => 'inactive']);
        $deleted = $this->founder('deleted-founder');
        foreach ([$visible, $private, $inactive, $deleted] as $founder) {
            $company->founders()->attach($founder->id, ['role' => 'Founder', 'is_primary' => true]);
        }
        $deleted->delete();

        $list = $this->getJson('/api/v1/companies')->assertOk()
            ->assertJsonPath('data.0.founders_count', 1)->assertJsonCount(1, 'data.0.founders')
            ->assertJsonPath('data.0.founders.0.slug', 'visible-founder')
            ->assertJsonPath('data.0.founders.0.user', null)
            ->assertJsonMissingPath('data.0.founders.0.companies')
            ->assertJsonMissingPath('data.0.founders.0.scorecard')
            ->assertJsonMissingPath('data.0.founders.0.invitation');
        $detail = $this->getJson('/api/v1/companies/visible')->assertOk()->assertJsonCount(1, 'data.founders');
        $this->assertContracts([
            $this->sample($list, '/api/v1/companies'),
            $this->sample($detail, '/api/v1/companies/{slug}'),
        ]);
    }

    public function test_private_inactive_and_deleted_companies_are_excluded(): void
    {
        $this->company('visible');
        $private = $this->company('private', ['is_public' => false]);
        $inactive = $this->company('inactive', ['status' => 'inactive']);
        $deleted = $this->company('deleted');
        $deleted->delete();
        $samples = [];
        foreach ([$private, $inactive, $deleted] as $company) {
            $samples[] = $this->sample($this->getJson('/api/v1/companies/'.$company->slug)->assertNotFound(), '/api/v1/companies/{slug}');
        }
        $samples[] = $this->sample($this->getJson('/api/v1/companies')->assertOk()->assertJsonPath('meta.total', 1), '/api/v1/companies');
        $this->assertContracts($samples);
    }

    public function test_pagination_clamps_sizes_and_filters_without_a_422_contract(): void
    {
        $this->company('first', ['sector' => 'Fintech', 'is_hiring' => true]);
        $this->company('second', ['sector' => 'Robotics', 'is_collaborating' => true]);
        $this->company('third', ['sector' => 'Fintech', 'is_fundraising' => true]);
        $samples = [];
        foreach (['per_page=2&page=2', 'per_page=2&page=9', 'per_page=0', 'per_page=101', 'search=no-match', 'sector=Fintech', 'hiring=1', 'fundraising=1', 'collaborating=1'] as $query) {
            $samples[] = $this->sample($this->getJson('/api/v1/companies?'.$query)->assertOk(), '/api/v1/companies');
        }
        $this->assertSame(1, $samples[2]['body']->meta->per_page);
        $this->assertSame(24, $samples[3]['body']->meta->per_page);
        $this->assertSame([], $samples[4]['body']->data);
        $this->assertSame(2, $samples[5]['body']->meta->total);
        foreach ([6, 7, 8] as $index) $this->assertSame(1, $samples[$index]['body']->meta->total);
        $this->assertContracts($samples);
    }

    public function test_contract_rejects_missing_fields_and_nested_private_data(): void
    {
        $company = $this->company('drift');
        $user = User::factory()->create();
        $founder = $this->founder('drift-founder', ['user_id' => $user->id]);
        $company->founders()->attach($founder->id, ['role' => 'Founder', 'is_primary' => true]);
        $original = $this->sample($this->getJson('/api/v1/companies/drift')->assertOk(), '/api/v1/companies/{slug}');
        foreach (['id', 'founders', 'private_field', 'email', 'nested_company'] as $case) {
            $sample = unserialize(serialize($original));
            match ($case) {
                'id' => $sample['body']->data->id = 'invalid',
                'private_field' => $sample['body']->data->owner_email = 'private@example.test',
                'email' => $sample['body']->data->founders[0]->user = (object) ['id' => 5, 'name' => 'Member', 'email' => 'private@example.test'],
                'nested_company' => $sample['body']->data->founders[0]->companies = [],
                default => null,
            };
            if ($case === 'founders') unset($sample['body']->data->founders);
            $this->assertSame(1, $this->validator([$sample])->getExitCode(), 'Must reject '.$case);
        }
    }

    private function company(string $slug, array $changes = []): CompanyProfile
    {
        return CompanyProfile::create(array_merge(['name' => ucfirst($slug), 'slug' => $slug, 'status' => 'active', 'is_public' => true], $changes));
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
