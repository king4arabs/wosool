<?php

namespace Tests\Feature;

use App\Models\{AdminAction, Application, ContactMessage, RelationshipRecord, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        Role::findOrCreate('member', 'web');
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('admin', 'web'));
        return $admin;
    }

    private function payload(array $overrides = []): array
    {
        return array_replace(['kind' => 'crm', 'name' => 'Partner Lead', 'organization' => 'Growth Company', 'email' => 'lead@example.com',
            'stage' => 'new', 'priority' => 'normal', 'follow_up_on' => now('Asia/Riyadh')->toDateString(), 'notes' => 'Private relationship brief'], $overrides);
    }

    public function test_relationships_are_only_available_to_administrators(): void
    {
        $record = RelationshipRecord::create($this->payload());
        $this->getJson('/api/v1/admin/relationships?kind=crm')->assertUnauthorized();
        $member = User::factory()->create();
        $this->actingAs($member);
        $this->getJson('/api/v1/admin/relationships?kind=crm')->assertForbidden();
        $this->getJson('/api/v1/admin/relationships/'.$record->id)->assertForbidden();
        $this->postJson('/api/v1/admin/relationships', $this->payload())->assertForbidden();
        $this->putJson('/api/v1/admin/relationships/'.$record->id, $this->payload())->assertForbidden();
        $this->postJson('/api/v1/admin/relationships/'.$record->id.'/activities', ['body' => 'Not allowed'])->assertForbidden();
        $this->assertDatabaseCount('relationship_activities', 0);
    }

    public function test_crm_records_persist_assignment_followups_and_notes_with_an_audit_trail(): void
    {
        $admin = $this->admin();
        $response = $this->actingAs($admin)->postJson('/api/v1/admin/relationships', $this->payload(['owner_id' => $admin->id]))
            ->assertCreated()->assertJsonPath('data.owner.name', $admin->name)->assertJsonPath('data.version', 1);
        $id = $response->json('data.id');
        $update = $this->payload(['stage' => 'in_progress', 'priority' => 'high', 'version' => 1, 'owner_id' => $admin->id]);
        unset($update['kind']);
        $this->putJson('/api/v1/admin/relationships/'.$id, $update)->assertOk()->assertJsonPath('data.version', 2);
        $this->postJson('/api/v1/admin/relationships/'.$id.'/activities', ['body' => 'Call completed. Prepare next meeting.'])
            ->assertCreated()->assertJsonPath('data.author.id', $admin->id);
        $this->getJson('/api/v1/admin/relationships/'.$id)->assertOk()->assertJsonPath('data.activities.0.body', 'Call completed. Prepare next meeting.');
        $this->getJson('/api/v1/admin/relationships?kind=crm&due=1')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('summary.due', 1);
        $this->assertDatabaseCount('admin_actions', 3);
        $this->assertStringNotContainsString('lead@example.com', AdminAction::all()->toJson());
        $this->assertStringNotContainsString('Private relationship brief', AdminAction::all()->toJson());
    }

    public function test_stale_edits_do_not_overwrite_another_admins_work(): void
    {
        $record = RelationshipRecord::create($this->payload());
        $data = $this->payload(['stage' => 'contacted', 'version' => 1]); unset($data['kind']);
        $this->actingAs($this->admin())->putJson('/api/v1/admin/relationships/'.$record->id, $data)->assertOk();
        $data['stage'] = 'closed';
        $this->putJson('/api/v1/admin/relationships/'.$record->id, $data)->assertStatus(409);
        $this->assertSame('contacted', $record->fresh()->stage);
    }

    public function test_pr_stages_coverage_links_and_admin_owners_are_validated(): void
    {
        $member = User::factory()->create();
        $this->actingAs($this->admin());
        $this->postJson('/api/v1/admin/relationships', $this->payload(['kind' => 'pr']))->assertUnprocessable();
        $this->postJson('/api/v1/admin/relationships', $this->payload(['owner_id' => $member->id]))->assertUnprocessable();
        $this->postJson('/api/v1/admin/relationships', $this->payload(['coverage_url' => 'javascript:alert(1)']))->assertUnprocessable();
        $this->postJson('/api/v1/admin/relationships', $this->payload(['follow_up_on' => 'not-a-date']))->assertUnprocessable();
        $this->postJson('/api/v1/admin/relationships', $this->payload(['kind' => 'pr', 'stage' => 'published', 'campaign' => 'Founder launch', 'coverage_url' => 'https://example.com/story']))->assertCreated();
        $this->getJson('/api/v1/admin/relationships?kind=pr')->assertOk()->assertJsonPath('summary.stages.published', 1)->assertJsonPath('summary.due', 0);
    }

    public function test_search_filters_pagination_and_due_counts_are_scoped(): void
    {
        RelationshipRecord::create($this->payload(['name' => 'شركة نمو', 'organization' => '100% Labs']));
        RelationshipRecord::create($this->payload(['kind' => 'pr', 'stage' => 'pitched']));
        RelationshipRecord::create($this->payload(['stage' => 'closed']));
        RelationshipRecord::create($this->payload(['follow_up_on' => now()->addDays(5)->toDateString()]));
        $this->actingAs($this->admin());
        $this->getJson('/api/v1/admin/relationships?kind=crm&search='.urlencode('نمو'))->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/relationships?kind=crm&search='.urlencode('%'))->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/relationships?kind=crm&due=1')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('summary.total', 3);
        $this->getJson('/api/v1/admin/relationships?kind=crm&per_page=1')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('meta.last_page', 3);
        $this->getJson('/api/v1/admin/relationships?kind=crm&per_page=1000')->assertUnprocessable();
        $this->getJson('/api/v1/admin/relationships?kind=wrong')->assertUnprocessable();
    }

    public function test_dashboard_prioritizes_messages_and_open_due_relationships(): void
    {
        RelationshipRecord::create($this->payload());
        RelationshipRecord::create($this->payload(['kind' => 'pr', 'stage' => 'pitched']));
        RelationshipRecord::create($this->payload(['stage' => 'won']));
        ContactMessage::create(['name' => 'Sender', 'email' => 'sender@example.com', 'category' => 'general', 'subject' => 'Inquiry', 'message' => 'Private message']);
        $this->actingAs($this->admin())->getJson('/api/v1/admin/dashboard')->assertOk()
            ->assertJsonPath('operations.crm_due', 1)->assertJsonPath('operations.pr_due', 1)
            ->assertJsonPath('operations.open_messages', 1)->assertJsonCount(2, 'operations.follow_ups')
            ->assertDontSee('lead@example.com')->assertDontSee('Private relationship brief');
    }

    public function test_analytics_uses_equal_date_windows_and_zero_fills_the_trend(): void
    {
        $this->travelTo(now()->setDate(2026, 10, 29)->setTime(12, 0));
        $admin = $this->admin();
        User::factory()->create(['created_at' => now()->subDays(8)]);
        Application::create(['full_name' => 'Founder', 'email' => 'founder@example.com', 'status' => 'approved']);
        Application::create(['full_name' => 'Pending', 'email' => 'pending@example.com', 'status' => 'submitted']);
        $response = $this->actingAs($admin)->getJson('/api/v1/admin/analytics?days=7')->assertOk()
            ->assertJsonPath('data.period.start', '2026-10-23')->assertJsonPath('data.period.end', '2026-10-29')
            ->assertJsonPath('data.comparison.current.signups', 1)->assertJsonPath('data.comparison.previous.signups', 1)
            ->assertJsonPath('data.comparison.current.applications', 2)->assertJsonPath('data.comparison.current.approval_rate', 50)
            ->assertJsonPath('data.comparison.previous.approval_rate', null)->assertJsonCount(7, 'data.trend');
        $this->assertSame(1, array_sum(array_column($response->json('data.trend'), 'signups')));
        $this->getJson('/api/v1/admin/analytics?days=365')->assertUnprocessable();
    }
}
