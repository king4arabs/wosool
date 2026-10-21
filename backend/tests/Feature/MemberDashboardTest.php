<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\FounderProfile;
use App\Models\Program;
use App\Models\ProgramApplication;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MemberDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_handles_missing_introductions_ledger_table(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        if (Schema::hasTable('introductions_ledger')) {
            Schema::drop('introductions_ledger');
        }

        $user = User::factory()->create();
        $user->assignRole('member');

        FounderProfile::query()->create([
            'user_id' => $user->id,
            'slug' => 'test-founder',
            'tagline' => 'Testing dashboard',
            'bio' => 'Bio',
            'location' => 'Riyadh',
            'sector' => 'FinTech',
            'stage' => 'seed',
            'needs' => ['advisors'],
            'offers' => ['product'],
            'status' => 'active',
            'is_public' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/member/dashboard');

        $response->assertOk();
        $response->assertJsonPath('data.intro_requests.pending_count', 0);
        $response->assertJsonPath('data.intro_requests.inbound_count', 0);
        $response->assertJsonPath('data.intro_requests.outbound_count', 0);
    }
    private function event(string $slug, array $attrs = []): Event
    {
        return Event::create(array_merge([
            'title' => ucfirst(str_replace('-', ' ', $slug)),
            'slug' => $slug,
            'starts_at' => now()->addWeek(),
            'type' => 'wosool',
            'format' => 'in-person',
            'is_public' => true,
            'requires_rsvp' => true,
            'status' => 'upcoming',
        ], $attrs));
    }

    public function test_upcoming_rsvps_only_list_places_the_member_still_holds_with_their_status(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->member()->create();
        $other = User::factory()->member()->create();

        $held = [
            'waitlisted-dinner' => ['waitlisted', now()->addDays(2)],
            'approved-workshop' => ['approved', now()->addDays(3)],
            'pending-roundtable' => ['pending_approval', now()->addDays(4)],
        ];
        foreach ($held as $slug => [$status, $startsAt]) {
            $this->event($slug, ['starts_at' => $startsAt])->attendees()->attach($user->id, ['status' => $status]);
        }
        $this->event('cancelled-session')->attendees()->attach($user->id, ['status' => 'cancelled_by_user']);
        $this->event('rejected-session')->attendees()->attach($user->id, ['status' => 'rejected']);
        $this->event('finished-session', ['starts_at' => now()->subDays(2), 'ends_at' => now()->subDay()])
            ->attendees()->attach($user->id, ['status' => 'approved']);
        $this->event('someone-elses-session', ['starts_at' => now()->addDay()])->attendees()->attach($other->id, ['status' => 'approved']);

        $response = $this->actingAs($user)->getJson('/api/v1/member/dashboard')->assertOk();

        $this->assertSame(
            ['waitlisted-dinner', 'approved-workshop', 'pending-roundtable'],
            collect($response->json('data.upcoming_rsvps'))->pluck('slug')->all(),
        );
        $this->assertSame(
            ['waitlisted', 'approved', 'pending_approval'],
            collect($response->json('data.upcoming_rsvps'))->pluck('rsvp_status')->all(),
        );
    }

    public function test_an_event_in_progress_stays_on_the_schedule_until_it_ends(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->member()->create();
        $this->event('live-session', ['starts_at' => now()->subHour(), 'ends_at' => now()->addHour(), 'status' => 'live'])
            ->attendees()->attach($user->id, ['status' => 'approved']);

        $this->actingAs($user)->getJson('/api/v1/member/dashboard')
            ->assertOk()
            ->assertJsonPath('data.upcoming_rsvps.0.slug', 'live-session')
            ->assertJsonPath('data.upcoming_rsvps.0.rsvp_status', 'approved');
    }

    public function test_program_applications_show_the_members_own_status(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->member()->create();
        $program = Program::create(['name' => 'Growth Sprint', 'slug' => 'growth-sprint', 'category' => 'growth', 'is_open' => true]);
        ProgramApplication::create(['program_id' => $program->id, 'user_id' => $user->id, 'status' => 'waitlisted', 'motivation' => 'Learning']);
        ProgramApplication::create(['program_id' => $program->id, 'user_id' => User::factory()->create()->id, 'status' => 'accepted', 'motivation' => 'Other']);

        $this->actingAs($user)->getJson('/api/v1/member/dashboard')
            ->assertOk()
            ->assertJsonCount(1, 'data.program_applications')
            ->assertJsonPath('data.program_applications.0.status', 'waitlisted')
            ->assertJsonPath('data.program_applications.0.program.slug', 'growth-sprint');
    }
}
