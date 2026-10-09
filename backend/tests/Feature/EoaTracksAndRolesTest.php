<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\ProgramApplication;
use App\Models\User;
use App\Services\Eoa\ProgramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EoaTracksAndRolesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('eoa:install')->assertSuccessful();
        Role::findOrCreate('admin', 'web');
        Notification::fake();
    }

    private function account(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        return $user;
    }

    public function test_only_platform_admin_can_assign_verified_accounts_scoped_eoa_roles(): void
    {
        $target = $this->account('eoa_applicant');
        $lead = $this->account('eoa_lead');
        $this->actingAs($lead)->getJson('/api/v1/eoa/operations/accounts')->assertForbidden();
        $this->patchJson('/api/v1/eoa/operations/accounts/'.$target->id, ['roles' => ['eoa_lead']])->assertForbidden();
        $admin = $this->account('admin');
        $this->actingAs($admin)->getJson('/api/v1/eoa/operations/accounts?search='.urlencode($target->email))->assertOk()->assertJsonPath('data.data.0.id', $target->id);
        $this->patchJson('/api/v1/eoa/operations/accounts/'.$target->id, ['roles' => ['admin']])->assertUnprocessable();
        $this->patchJson('/api/v1/eoa/operations/accounts/'.$target->id, ['roles' => ['eoa_reviewer', 'eoa_coach']])->assertOk();
        $this->assertTrue($target->fresh()->hasAllRoles(['eoa_applicant', 'eoa_reviewer', 'eoa_coach']));
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.roles_updated', 'admin_id' => $admin->id, 'entity_id' => $target->id]);
        $unverified = User::factory()->unverified()->create();
        $this->patchJson('/api/v1/eoa/operations/accounts/'.$unverified->id, ['roles' => ['eoa_lead']])->assertUnprocessable();
        $this->patchJson('/api/v1/eoa/operations/accounts/'.$target->id, ['roles' => []])->assertOk();
        $this->assertTrue($target->fresh()->hasRole('eoa_applicant'));
        $this->assertFalse($target->fresh()->hasAnyRole(['eoa_reviewer', 'eoa_coach']));
    }

    public function test_acceptance_requires_an_active_program_track_and_exposes_it_to_the_applicant(): void
    {
        $founder = $this->account('eoa_applicant');
        $program = ProgramService::program();
        $application = $program->applications()->create(['user_id' => $founder->id, 'motivation' => '', 'status' => 'submitted', 'eoa_version' => 1, 'eoa_submitted_at' => now()]);
        $track = DB::table('eoa_tracks')->where('program_id', $program->id)->value('id');
        $lead = $this->account('eoa_lead');
        $payload = ['status' => 'accepted', 'version' => 1, 'message' => 'Your application has been accepted.'];
        $this->actingAs($lead)->patchJson('/api/v1/eoa/review/'.$application->id, $payload)->assertUnprocessable();
        $other = Program::create(['name' => 'Other program', 'slug' => 'other-track-program', 'category' => 'growth']);
        $foreignTrack = DB::table('eoa_tracks')->insertGetId(['program_id' => $other->id, 'name_en' => 'Other track', 'name_ar' => 'مسار آخر', 'is_active' => true]);
        $this->patchJson('/api/v1/eoa/review/'.$application->id, $payload + ['track_id' => $foreignTrack])->assertUnprocessable();
        DB::table('eoa_tracks')->where('id', $track)->update(['is_active' => false]);
        $this->patchJson('/api/v1/eoa/review/'.$application->id, $payload + ['track_id' => $track])->assertUnprocessable();
        DB::table('eoa_tracks')->where('id', $track)->update(['is_active' => true]);
        $this->patchJson('/api/v1/eoa/review/'.$application->id, $payload + ['track_id' => $track])->assertOk()->assertJsonPath('data.track.id', $track);
        $this->assertDatabaseHas('program_participants', ['user_id' => $founder->id, 'eoa_track_id' => $track, 'status' => 'onboarding']);
        $this->actingAs($founder)->getJson('/api/v1/eoa/participant')->assertOk()->assertJsonPath('data.track.id', $track);
    }

    public function test_track_publication_and_role_revocation_respect_access_boundaries(): void
    {
        $staff = $this->account('eoa_staff');
        $payload = ['name_en' => 'Growth focus', 'name_ar' => 'مسار النمو', 'is_active' => true];
        $this->actingAs($staff)->postJson('/api/v1/eoa/operations/create/tracks', $payload)->assertForbidden();
        $lead = $this->account('eoa_lead');
        $track = $this->actingAs($lead)->postJson('/api/v1/eoa/operations/create/tracks', $payload)->assertCreated()->json('id');
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonCount(2, 'data.tracks');
        $this->patchJson('/api/v1/eoa/operations/update/tracks/'.$track, array_merge($payload, ['is_active' => false]))->assertOk();
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonCount(1, 'data.tracks');
        $reviewer = $this->account('eoa_reviewer');
        $application = ProgramApplication::create(['program_id' => ProgramService::program()->id, 'user_id' => $this->account('eoa_applicant')->id, 'motivation' => '', 'status' => 'submitted']);
        DB::table('eoa_reviewers')->insert(['application_id' => $application->id, 'user_id' => $reviewer->id]);
        $this->actingAs($reviewer)->getJson('/api/v1/eoa/review/'.$application->id)->assertOk();
        $this->actingAs($this->account('admin'))->patchJson('/api/v1/eoa/operations/accounts/'.$reviewer->id, ['roles' => []])->assertOk();
        $this->actingAs($reviewer->fresh())->getJson('/api/v1/eoa/review/'.$application->id)->assertForbidden();
    }
}
