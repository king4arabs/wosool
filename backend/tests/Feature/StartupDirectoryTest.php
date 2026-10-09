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
        $this->assertDatabaseCount('startup_directory_entries', 13);
        StartupDirectoryEntry::where('slug', 'foodics')->update(['is_published' => false]);
        $this->artisan('directory:import')->assertSuccessful();
        $this->assertDatabaseCount('startup_directory_entries', 13);
        $this->assertFalse(StartupDirectoryEntry::where('slug', 'foodics')->first()->is_published);
        $this->assertEquals($users, User::count());
    }

    public function test_directory_prioritizes_regions_and_excludes_unpublished_profiles(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $response = $this->getJson('/api/v1/startup-directory?per_page=6')->assertOk()->assertJsonPath('meta.last_page', 2);
        $this->assertSame(['Saudi Arabia','Saudi Arabia','Saudi Arabia','Saudi Arabia','GCC','GCC'], array_column($response->json('data'), 'region'));
        $this->getJson('/api/v1/startup-directory?page=2&per_page=6')->assertOk()->assertJsonPath('data.2.region', 'MENA')->assertJsonPath('data.3.region', 'Global');
        StartupDirectoryEntry::where('slug', 'foodics')->update(['is_published' => false]);
        $this->getJson('/api/v1/startup-directory?region=Saudi%20Arabia')->assertOk()->assertJsonPath('meta.total', 3);
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
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'thiqa-education');
        $this->getJson('/api/v1/startup-directory?source=leap&per_page=1&page=2')
            ->assertOk()->assertJsonPath('meta.total', 2)->assertJsonPath('data.0.slug', 'verofax');
        $this->getJson('/api/v1/startup-directory?search=robotics')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'swarm-robotics');
        $this->getJson('/api/v1/startup-directory?search=%25')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/startup-directory?source=misk&business_type=traditional')
            ->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/startup-directory?business_type=invalid')->assertUnprocessable();
    }

    public function test_overdue_reviews_are_exposed_without_falsely_refreshing_the_source_date(): void
    {
        $this->artisan('directory:import')->assertSuccessful();
        $this->travelTo(now()->addMonths(6));
        $this->getJson('/api/v1/startup-directory')->assertOk()->assertJsonPath('data.0.review_due', true)->assertJsonPath('data.0.reviewed_at', '2026-10-09');
    }
}
