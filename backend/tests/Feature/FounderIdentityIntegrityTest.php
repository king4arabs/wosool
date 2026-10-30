<?php

namespace Tests\Feature;

use App\Models\{Application, FounderProfile, Scorecard, User};
use App\Services\{FounderDirectoryImporter, MembershipRegistration};
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class FounderIdentityIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_opaque_founder_id_is_shared_by_public_directory_member_profile_and_scorecard(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->create(['email' => 'private-founder@example.test']);
        $user->assignRole('member');
        $founder = FounderProfile::create([
            'user_id' => $user->id, 'slug' => 'identity-founder', 'display_name' => 'Identity Founder',
            'status' => 'active', 'is_public' => true, 'country_code' => 'SA',
        ]);
        $uid = $founder->founder_uid;
        $this->assertTrue(Str::isUuid($uid));
        $this->assertNotSame((string) $user->id, $uid);
        Scorecard::create(['founder_profile_id' => $founder->id]);

        $this->getJson('/api/v1/founders?slug=identity-founder')->assertOk()
            ->assertJsonPath('data.0.founder_uid', $uid)->assertJsonPath('data.0.id', $founder->id)
            ->assertJsonPath('data.0.scorecard', null)->assertDontSee($user->email);
        $this->getJson('/api/v1/founders/identity-founder')->assertOk()
            ->assertJsonPath('data.founder_uid', $uid)->assertJsonPath('data.scorecard', null);
        $this->actingAs($user)->getJson('/api/v1/member/founder-profile')->assertOk()
            ->assertJsonPath('data.founder_uid', $uid);
        $this->getJson('/api/v1/member/dashboard')->assertOk()
            ->assertJsonPath('data.profile.founder_uid', $uid);
        $this->getJson('/api/v1/member/scorecard')->assertOk()
            ->assertJsonPath('data.founder_uid', $uid)->assertJsonPath('data.founder_profile_id', $founder->id);

        // Client-provided identifiers cannot take ownership of a different card.
        $this->putJson('/api/v1/member/founder-profile', [
            'display_name' => 'Updated Founder', 'founder_uid' => (string) Str::uuid(),
            'user_id' => $user->id + 500,
        ])->assertOk()->assertJsonPath('data.founder_uid', $uid);
        $this->assertSame($uid, $founder->fresh()->founder_uid);
        $this->assertSame($user->id, $founder->fresh()->user_id);
        $this->assertDatabaseCount('founder_profiles', 1);
        $this->assertDatabaseCount('scorecards', 1);

        $admin = User::factory()->create(); $admin->assignRole('admin');
        $this->actingAs($admin)->getJson('/api/v1/admin/scorecards')->assertOk()
            ->assertJsonPath('data.0.founder_uid', $uid);
        $this->getJson('/api/v1/admin/founders?search='.$uid)->assertOk()
            ->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.founder_uid', $uid);
    }

    public function test_new_member_profile_receives_private_scorecard_and_different_immutable_uid(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $first = User::factory()->create(); $first->assignRole('member');
        $second = User::factory()->create(); $second->assignRole('member');
        $response = $this->actingAs($first)->putJson('/api/v1/member/founder-profile', [
            'display_name' => 'New Member', 'bio' => 'My own editable profile',
        ])->assertCreated();
        $uid = $response->json('data.founder_uid');
        $this->assertTrue(Str::isUuid($uid));
        $profileId = $response->json('data.id');

        $this->getJson('/api/v1/member/scorecard')->assertOk()
            ->assertJsonPath('data.founder_uid', $uid)->assertJsonPath('data.founder_profile_id', $profileId);
        $this->putJson('/api/v1/member/founder-profile', ['bio' => 'New information'])
            ->assertOk()->assertJsonPath('data.founder_uid', $uid)->assertJsonPath('data.id', $profileId);
        $this->actingAs($second)->putJson('/api/v1/member/founder-profile', ['bio' => 'Other member'])
            ->assertCreated();
        $this->assertNotSame($profileId, $second->founderProfile()->firstOrFail()->id);
        $this->assertNotSame($uid, $second->founderProfile()->firstOrFail()->founder_uid);
        $this->assertDatabaseCount('scorecards', 2);
    }

    public function test_reapproving_an_application_does_not_override_suspended_founder_identity(): void
    {
        $user = User::factory()->create();
        $founder = FounderProfile::create([
            'user_id' => $user->id, 'slug' => 'suspended-owner',
            'status' => 'suspended', 'is_public' => false,
        ]);
        $original = $founder->founder_uid;
        $application = Application::create([
            'user_id' => $user->id, 'email' => $user->email,
            'full_name' => 'Suspended Owner', 'company_name' => 'Company',
            'company_website' => 'https://example.org', 'sector' => 'Software',
            'stage' => 'Seed', 'location' => 'Riyadh', 'status' => 'approved',
            'onboarding_data' => ['position' => 'Founder', 'bio' => 'Experience',
                'country_code' => 'SA', 'company_description' => 'Software business',
                'founded_year' => 2024, 'team_size' => 2],
        ]);

        app(MembershipRegistration::class)->publish($application);
        $this->assertSame('suspended', $founder->fresh()->status);
        $this->assertFalse($founder->fresh()->is_public);
        $this->assertSame($original, $founder->fresh()->founder_uid);
        $this->assertDatabaseCount('company_profiles', 0);
        $this->assertDatabaseCount('scorecards', 0);
    }

    public function test_admin_cannot_approve_a_suspended_founder_without_resolving_moderation(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $owner = User::factory()->create();
        $owner->assignRole('member');
        $profile = FounderProfile::create([
            'user_id' => $owner->id, 'slug' => 'review-blocked', 'status' => 'suspended',
            'is_public' => false,
        ]);
        $application = Application::create([
            'user_id' => $owner->id, 'email' => $owner->email, 'full_name' => 'Review Blocked',
            'company_name' => 'Example Co', 'company_website' => 'https://example.org',
            'sector' => 'Software', 'stage' => 'Seed', 'location' => 'Riyadh',
            'onboarding_data' => ['position' => 'Founder', 'country_code' => 'SA'],
            'status' => 'submitted',
        ]);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin)->patchJson('/api/v1/admin/applications/'.$application->id, [
            'status' => 'approved',
        ])->assertStatus(409);
        $this->assertSame('submitted', $application->fresh()->status);
        $this->assertSame('suspended', $profile->fresh()->status);
        $this->assertFalse($profile->fresh()->is_public);
    }

    public function test_founder_uid_cannot_be_reassigned_even_by_model_force_fill(): void
    {
        $profile = FounderProfile::create(['slug' => 'immutable', 'display_name' => 'Founder']);
        $this->expectException(\LogicException::class);
        $profile->forceFill(['founder_uid' => (string) Str::uuid()])->save();
    }

    public function test_id_backfill_is_safe_to_rerun_and_includes_soft_deleted_profiles(): void
    {
        $profile = FounderProfile::create(['slug' => 'legacy-founder', 'display_name' => 'Legacy']);
        $other = FounderProfile::create(['slug' => 'retired-founder', 'display_name' => 'Retired']);
        $other->delete();
        $existing = $other->founder_uid;
        $time = $profile->updated_at?->toIso8601String();

        DB::table('founder_profiles')->where('id', $profile->id)->update(['founder_uid' => null]);
        $migration = require database_path('migrations/2026_10_30_120000_add_founder_uids.php');
        $migration->up();
        $backfilled = FounderProfile::findOrFail($profile->id);
        $this->assertTrue(Str::isUuid($backfilled->founder_uid));
        $this->assertNotSame($backfilled->founder_uid, $existing);
        $this->assertSame($time, $backfilled->updated_at?->toIso8601String());
        $this->assertSame($existing, FounderProfile::withTrashed()->findOrFail($other->id)->founder_uid);
        $migration->up();
        $this->assertSame($backfilled->founder_uid, $profile->fresh()->founder_uid);
    }

    public function test_scorecards_are_one_to_one_at_database_level(): void
    {
        $profile = FounderProfile::create(['slug' => 'unique-scorecard']);
        Scorecard::create(['founder_profile_id' => $profile->id]);
        $this->expectException(QueryException::class);
        Scorecard::create(['founder_profile_id' => $profile->id]);
    }

    public function test_identity_audit_reports_integrity_without_private_records(): void
    {
        $user = User::factory()->create(['email' => 'audit-secret@example.test']);
        FounderProfile::create(['user_id' => $user->id, 'slug' => 'audit-founder', 'status' => 'active']);
        $this->artisan('wosool:check-founder-identity', ['--json' => true])->assertExitCode(0);
        $this->assertDatabaseCount('founder_profiles', 1);
        // A corrupt legacy row must fail the audit rather than silently get a new ID.
        DB::table('founder_profiles')->where('user_id', $user->id)->update(['founder_uid' => null]);
        $this->artisan('wosool:check-founder-identity', ['--json' => true])->assertExitCode(1);
    }

    public function test_reimport_never_restores_deleted_founder_ids_or_company_records(): void
    {
        app(FounderDirectoryImporter::class)->run();
        $founder = FounderProfile::where('directory_key', 'salla')->firstOrFail();
        $company = $founder->companies()->firstOrFail();
        $uid = $founder->founder_uid;
        $founder->delete();
        $company->delete();

        $counts = app(FounderDirectoryImporter::class)->run();
        $this->assertSame(0, $counts['founders_created']);
        $this->assertSame(0, $counts['companies_created']);
        $this->assertGreaterThan(0, $counts['deleted_skipped']);
        $this->assertSame($uid, FounderProfile::withTrashed()->findOrFail($founder->id)->founder_uid);
        $this->assertSoftDeleted('founder_profiles', ['id' => $founder->id]);
        $this->assertSoftDeleted('company_profiles', ['id' => $company->id]);
    }
}
