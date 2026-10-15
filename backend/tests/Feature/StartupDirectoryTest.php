<?php
namespace Tests\Feature;

use App\Models\StartupDirectoryEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StartupDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_is_idempotent_preserves_moderation_and_creates_no_member_accounts(): void
    {
        $this->artisan('directory:import', ['--dry-run' => true])->assertSuccessful();
        $this->assertDatabaseCount('startup_directory_entries', 0);
        $users = User::count();
        $this->artisan('directory:import')->assertSuccessful();
        $this->assertDatabaseCount('startup_directory_entries', 14);
        StartupDirectoryEntry::where('slug', 'foodics')->update(['is_published' => false]);
        $this->artisan('directory:import')->assertSuccessful();
        $this->assertDatabaseCount('startup_directory_entries', 14);
        $this->assertFalse(StartupDirectoryEntry::where('slug', 'foodics')->first()->is_published);
        $this->assertEquals($users, User::count());
    }

    public function test_directory_prioritizes_regions_and_excludes_unpublished_profiles(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $response = $this->getJson('/api/v1/startup-directory?per_page=6')->assertOk()->assertJsonPath('meta.last_page', 2);
        $this->assertSame(['Saudi Arabia','Saudi Arabia','Saudi Arabia','Saudi Arabia','Saudi Arabia','GCC'], array_column($response->json('data'), 'region'));
        $this->getJson('/api/v1/startup-directory?page=2&per_page=6')->assertOk()->assertJsonPath('data.2.region', 'MENA')->assertJsonPath('data.3.region', 'Global');
        StartupDirectoryEntry::where('slug', 'foodics')->update(['is_published' => false]);
        $this->getJson('/api/v1/startup-directory?region=Saudi%20Arabia')->assertOk()->assertJsonPath('meta.total', 4);
        $this->getJson('/api/v1/startup-directory?per_page=101')->assertUnprocessable();
    }

    public function test_revenue_and_website_gates_exclude_unqualified_businesses(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $response = $this->getJson('/api/v1/startup-directory')->assertOk()->assertJsonPath('meta.total', 10);
        $this->assertNotContains('salla', array_column($response->json('data'), 'slug'));
        StartupDirectoryEntry::where('slug', 'foodics')->update(['website_status' => 'unavailable']);
        $entry = StartupDirectoryEntry::where('slug', 'tamara')->first();
        $profile = $entry->profile;
        unset($profile['revenue_evidence']);
        $entry->update(['profile' => $profile]);
        $this->getJson('/api/v1/startup-directory')->assertOk()->assertJsonPath('meta.total', 8);
    }

    public function test_business_focus_and_program_filters_apply_before_pagination(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $this->getJson('/api/v1/startup-directory?business_type=traditional')
            ->assertOk()->assertJsonPath('meta.total', 0);
        // A pending research record cannot leak through the business-type filter.
        $this->getJson('/api/v1/startup-directory?source=gitex')
            ->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/startup-directory?source=leap&per_page=1&page=2')
            ->assertOk()->assertJsonPath('meta.total', 2)->assertJsonPath('data.0.slug', 'verofax');
        $this->getJson('/api/v1/startup-directory?search=robotics')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'swarm-robotics');
        $this->getJson('/api/v1/startup-directory?search=%25')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/startup-directory?source=misk&business_type=traditional')
            ->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/startup-directory?business_type=invalid')->assertUnprocessable();
    }

    public function test_import_preserves_newer_editorial_profiles_and_unrelated_records(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $entry = StartupDirectoryEntry::where('slug', 'rasan')->firstOrFail();
        $profile = $entry->profile;
        $profile['company_brief_en'] = 'Owner-reviewed description';
        $entry->update(['profile' => $profile, 'reviewed_at' => '2026-10-12', 'is_published' => false]);
        $unrelated = $entry->replicate();
        $unrelated->slug = 'owner-created-business';
        $unrelated->save();

        $this->artisan('directory:import')->assertSuccessful();

        $entry->refresh();
        $this->assertSame($profile, $entry->profile);
        $this->assertFalse($entry->is_published);
        $this->assertDatabaseHas('startup_directory_entries', ['slug' => 'owner-created-business']);
    }

    public function test_financial_periods_and_pending_evidence_survive_import(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $jahez = StartupDirectoryEntry::where('slug', 'jahez')->firstOrFail();
        $this->assertSame('financial_statement', $jahez->revenue_status);
        $this->assertSame('Year ended 31 December 2024', $jahez->profile['revenue_evidence']['period']);
        $rasan = StartupDirectoryEntry::where('slug', 'rasan')->firstOrFail();
        $this->assertSame('reported', $rasan->revenue_status);
        $this->assertSame('Six months ended 30 June 2026', $rasan->profile['revenue_evidence']['period']);
        $thiqa = StartupDirectoryEntry::where('slug', 'thiqa-education')->firstOrFail();
        $this->assertSame('pending', $thiqa->website_status);
        $this->assertSame('2026-10-09', $thiqa->profile['website_verified_at']);
        $this->assertNotEmpty($thiqa->profile['revenue_evidence']['source_url']);
    }

    public function test_revenue_periods_and_program_labels_are_bilingual(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $jahez = StartupDirectoryEntry::where('slug', 'jahez')->firstOrFail();
        $this->assertSame('السنة المنتهية في 31 ديسمبر 2024', $jahez->profile['revenue_evidence']['period_ar']);
        $this->assertSame('إمباكت 46', $jahez->profile['ecosystem_sources'][0]['label_ar']);

        $rows = $this->getJson('/api/v1/startup-directory?per_page=100')->assertOk()->json('data');
        $this->assertNotEmpty($rows);
        foreach ($rows as $row) {
            $this->assertMatchesRegularExpression('/\p{Arabic}/u', $row['revenue_evidence']['period_ar'], $row['slug']);
            foreach ($row['ecosystem_sources'] as $source) {
                $this->assertMatchesRegularExpression('/\p{Arabic}/u', $source['label_ar'], $row['slug']);
            }
        }
    }

    public function test_overdue_reviews_are_exposed_without_falsely_refreshing_the_source_date(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $this->travelTo(now()->addMonths(6));
        $this->getJson('/api/v1/startup-directory')->assertOk()->assertJsonPath('data.0.review_due', true)->assertJsonPath('data.0.reviewed_at', '2026-10-09');
    }
}
