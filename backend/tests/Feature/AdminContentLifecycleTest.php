<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContentLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    public function test_admin_can_publish_edit_and_delete_news_and_public_sees_published_only(): void
    {
        $admin = $this->admin();
        $payload = ['title' => 'Founder circle opens', 'excerpt' => 'Applications are now open.', 'content' => 'Full story.', 'category' => 'announcement', 'author_name' => 'Wosool Team', 'status' => 'published', 'is_public' => true];

        $id = $this->actingAs($admin)->postJson('/api/v1/admin/news', $payload)->assertCreated()->json('data.id');
        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/news', ['title' => 'Unreleased', 'status' => 'draft'] + $payload)->assertCreated()->json('data.slug');

        $this->app['auth']->forgetGuards();
        $slugs = collect($this->getJson('/api/v1/news')->assertOk()->json('data'))->pluck('slug');
        $this->assertContains('founder-circle-opens', $slugs);
        $this->assertNotContains($draft, $slugs);

        $this->actingAs($admin)->putJson("/api/v1/admin/news/{$id}", ['title' => 'Founder circle is open'] + $payload)->assertOk()
            ->assertJsonPath('data.title', 'Founder circle is open');
        $this->actingAs($admin)->deleteJson("/api/v1/admin/news/{$id}")->assertOk();
    }

    public function test_admin_can_create_program_cohort_and_session_and_members_cannot_apply_when_closed(): void
    {
        $admin = $this->admin();
        $programId = $this->actingAs($admin)->postJson('/api/v1/admin/programs', [
            'name' => 'Pilot Program', 'description' => 'Short pilot.', 'category' => 'growth', 'duration' => '4 weeks',
            'is_open' => true, 'status_flow' => 'applications_open', 'visibility' => 'public',
        ])->assertCreated()->json('data.id');

        $cohortId = $this->actingAs($admin)->postJson("/api/v1/admin/programs/{$programId}/cohorts", ['name' => 'Cohort A', 'status' => 'open', 'capacity' => 10])
            ->assertCreated()->json('data.id');
        $this->actingAs($admin)->postJson("/api/v1/admin/programs/{$programId}/sessions", [
            'cohort_id' => $cohortId, 'title' => 'Kickoff', 'session_type' => 'workshop', 'starts_at' => now()->addWeek()->toIso8601String(), 'duration_minutes' => 60,
        ])->assertCreated();
        $this->actingAs($admin)->getJson("/api/v1/admin/programs/{$programId}/sessions")->assertOk()->assertJsonPath('data.0.title', 'Kickoff');

        $member = User::factory()->create();
        $member->assignRole('member');
        $slug = Program::findOrFail($programId)->slug;
        Program::whereKey($programId)->update(['status_flow' => 'applications_closed']);
        $this->actingAs($member)->postJson("/api/v1/member/programs/{$slug}/apply", ['motivation' => 'I want to learn practical growth playbooks.'])
            ->assertUnprocessable();
        Program::whereKey($programId)->update(['status_flow' => 'applications_open']);
        $this->actingAs($member)->postJson("/api/v1/member/programs/{$slug}/apply", ['motivation' => 'I want to learn practical growth playbooks.'])
            ->assertCreated();
    }

    public function test_session_start_sent_as_riyadh_time_is_stored_and_returned_as_the_same_instant(): void
    {
        // /admin/programs/[id] sends the typed time with Riyadh's +03:00 offset. A bare local
        // time would be read as UTC (the app time zone) and shown three hours later in Riyadh.
        $admin = $this->admin();
        $programId = $this->actingAs($admin)->postJson('/api/v1/admin/programs', [
            'name' => 'Timing Program', 'description' => 'Short pilot.', 'category' => 'growth', 'duration' => '4 weeks',
            'is_open' => true, 'status_flow' => 'applications_open', 'visibility' => 'public',
        ])->assertCreated()->json('data.id');

        $this->actingAs($admin)->postJson("/api/v1/admin/programs/{$programId}/sessions", [
            'title' => 'Riyadh kickoff', 'session_type' => 'workshop', 'starts_at' => '2027-01-10T10:00:00+03:00', 'duration_minutes' => 60,
        ])->assertCreated();
        $this->actingAs($admin)->getJson("/api/v1/admin/programs/{$programId}/sessions")->assertOk()
            ->assertJsonPath('data.0.starts_at', '2027-01-10T07:00:00+00:00');

        $this->actingAs($admin)->postJson("/api/v1/admin/programs/{$programId}/cohorts", ['name' => 'Cohort B', 'status' => 'draft', 'capacity' => 0])
            ->assertUnprocessable()->assertJsonValidationErrors('capacity');
        $this->actingAs($admin)->postJson("/api/v1/admin/programs/{$programId}/sessions", [
            'title' => 'Too short', 'session_type' => 'workshop', 'starts_at' => '2027-01-10T10:00:00+03:00', 'duration_minutes' => 10,
        ])->assertUnprocessable()->assertJsonValidationErrors('duration_minutes');
    }
}
