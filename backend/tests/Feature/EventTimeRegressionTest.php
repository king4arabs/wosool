<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventTimeRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(now()->setDate(2026, 10, 11)->setTime(12, 0));
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function event(string $slug, array $attributes = []): Event
    {
        return Event::create(array_merge([
            'title' => $slug, 'slug' => $slug, 'starts_at' => now()->addDay(),
            'type' => 'wosool', 'format' => 'in-person', 'is_public' => true,
            'visibility' => 'public', 'status' => 'upcoming', 'status_flow' => 'published',
            'requires_rsvp' => true, 'rsvp_required' => true,
        ], $attributes));
    }

    public function test_october_capture_dates_are_past_even_with_stale_upcoming_status(): void
    {
        foreach (['2026-04-22', '2026-05-06', '2026-05-15', '2026-05-28', '2026-06-10', '2026-06-25'] as $date) {
            $this->event($date, ['starts_at' => $date.' 15:00:00', 'ends_at' => $date.' 17:00:00']);
        }
        $this->event('future');
        foreach (['/api/v1/events', '/api/v1/events?period=upcoming'] as $url) {
            $response = $this->getJson($url)->assertOk();
            $this->assertSame(['future'], array_column($response->json('data'), 'slug'));
        }
        $response = $this->getJson('/api/v1/events?period=past')->assertOk();
        $this->assertSame(['2026-06-25', '2026-06-10', '2026-05-28', '2026-05-15', '2026-05-06', '2026-04-22'], array_column($response->json('data'), 'slug'));
    }

    public function test_member_catalog_and_public_api_share_end_boundary_and_valid_ranges(): void
    {
        $this->event('ended', ['starts_at' => now()->subHour(), 'ends_at' => now()]);
        $this->event('ongoing', ['starts_at' => now()->subHour(), 'ends_at' => now()->addHour()]);
        $this->event('invalid-range', ['ends_at' => now()->addHour()]);
        $this->event('draft', ['status_flow' => 'draft']);
        $this->event('completed', ['starts_at' => now()->subDay(), 'status_flow' => 'completed']);
        $this->actingAs(User::factory()->member()->create());
        foreach (['/api/v1/events', '/api/v1/member/events/catalog'] as $url) {
            $this->assertSame(['ongoing'], array_column($this->getJson($url.'?period=upcoming')->assertOk()->json('data'), 'slug'));
            $this->assertSame(['ended', 'completed'], array_column($this->getJson($url.'?period=past')->assertOk()->json('data'), 'slug'));
        }
    }

    public function test_registration_status_and_submission_close_at_the_same_boundary(): void
    {
        $user = User::factory()->member()->create();
        $this->actingAs($user);
        $cases = [
            'ended' => ['starts_at' => now()->subHour(), 'ends_at' => now()],
            'no-end' => ['starts_at' => now()],
            'deadline' => ['registration_deadline' => now()],
            'draft' => ['status_flow' => 'draft'],
            'completed' => ['status_flow' => 'completed'],
            'bad-range' => ['ends_at' => now()->addHour()],
            'no-rsvp' => ['requires_rsvp' => false, 'rsvp_required' => false],
        ];
        foreach ($cases as $slug => $attributes) {
            $event = $this->event($slug, $attributes);
            $this->getJson('/api/v1/member/events/'.$slug.'/registration-status')
                ->assertOk()->assertJsonPath('data.event_state', 'registration_closed');
            $this->postJson('/api/v1/member/events/'.$slug.'/rsvp', ['attendance_type' => 'in_person'])->assertUnprocessable();
            $this->assertDatabaseMissing('event_rsvps', ['event_id' => $event->id, 'user_id' => $user->id]);
        }
    }

    public function test_ended_event_cancellation_does_not_promote_waitlist(): void
    {
        $event = $this->event('ended', ['starts_at' => now()->subDay(), 'max_attendees' => 1]);
        $user = User::factory()->member()->create();
        $waiting = User::factory()->member()->create();
        $event->attendees()->attach($user->id, ['status' => 'approved']);
        $event->attendees()->attach($waiting->id, ['status' => 'waitlisted']);
        $this->actingAs($user)->deleteJson('/api/v1/member/events/ended/rsvp')->assertOk();
        $this->assertDatabaseHas('event_rsvps', ['event_id' => $event->id, 'user_id' => $waiting->id, 'status' => 'waitlisted']);
    }

    public function test_admin_saves_local_times_and_explicit_offsets_as_utc_without_changing_the_instant(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin);
        $payload = ['title' => 'Timezone test', 'location' => 'Riyadh', 'type' => 'Workshop', 'format' => 'in-person', 'status' => 'upcoming',
            'starts_at' => '2026-10-12T18:00', 'ends_at' => '2026-10-12T19:00',
            'registration_deadline' => '2026-10-12T17:00', 'timezone' => 'Asia/Riyadh'];
        $id = $this->postJson('/api/v1/admin/events', $payload)->assertCreated()->json('data.id');
        $this->assertDatabaseHas('events', ['id' => $id, 'starts_at' => '2026-10-12 15:00:00', 'ends_at' => '2026-10-12 16:00:00', 'registration_deadline' => '2026-10-12 14:00:00']);
        $payload['starts_at'] = '2026-10-12T18:00:00+03:00';
        $payload['ends_at'] = '2026-10-12T16:00:00Z';
        $this->putJson('/api/v1/admin/events/'.$id, $payload)->assertOk()->assertJsonPath('data.starts_at', '2026-10-12T15:00:00+00:00');
        $payload['ends_at'] = '2026-10-12T14:59:00Z';
        $this->putJson('/api/v1/admin/events/'.$id, $payload)->assertUnprocessable()->assertJsonValidationErrors('ends_at');
        $payload['timezone'] = 'Not/A-Timezone';
        $this->putJson('/api/v1/admin/events/'.$id, $payload)->assertUnprocessable()->assertJsonValidationErrors('timezone');
    }
}
