<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventRsvpTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function makeEvent(array $attrs = []): Event
    {
        return Event::create(array_merge([
            'title' => 'Founders Meetup',
            'slug' => 'founders-meetup-' . uniqid(),
            'starts_at' => now()->addWeek(),
            'type' => 'wosool',
            'format' => 'in-person',
            'is_public' => true,
            'requires_rsvp' => true,
            'waitlist_enabled' => true,
            'status' => 'upcoming',
            'status_flow' => 'published',
        ], $attrs));
    }

    public function test_unauthenticated_user_cannot_rsvp(): void
    {
        $event = $this->makeEvent();
        $this->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])->assertUnauthorized();
    }

    public function test_member_can_rsvp_to_event(): void
    {
        $user = User::factory()->member()->create();
        $event = $this->makeEvent();

        $response = $this->actingAs($user)->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person']);

        $response->assertCreated()->assertJsonPath('status', 'approved');
        $this->assertDatabaseHas('event_rsvps', [
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => 'approved',
        ]);
    }

    public function test_past_event_rejects_registration_even_if_status_is_upcoming(): void
    {
        $user = User::factory()->member()->create();
        $event = $this->makeEvent(['starts_at' => now()->subDay()]);
        $this->actingAs($user)->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertUnprocessable()->assertJsonValidationErrors('event');
        $this->assertDatabaseMissing('event_rsvps', ['event_id' => $event->id, 'user_id' => $user->id]);
    }

    public function test_rsvp_returns_idempotent_when_already_registered(): void
    {
        $user = User::factory()->member()->create();
        $event = $this->makeEvent();

        $this->actingAs($user)->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])->assertCreated();
        $this->actingAs($user)
            ->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertOk()
            ->assertJsonPath('status', 'approved');
    }

    public function test_member_is_waitlisted_when_event_full(): void
    {
        $event = $this->makeEvent(['max_attendees' => 1]);
        $first = User::factory()->member()->create();
        $second = User::factory()->member()->create();

        $this->actingAs($first)->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])->assertCreated();
        $this->actingAs($second)
            ->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertCreated()
            ->assertJsonPath('status', 'waitlisted');
    }

    public function test_cancelling_waitlisted_rsvp_does_not_promote_when_confirmed_attendee_fills_capacity(): void
    {
        $event = $this->makeEvent(['max_attendees' => 1]);
        $confirmed = User::factory()->member()->create();
        $cancelled = User::factory()->member()->create();
        $waiting = User::factory()->member()->create();
        $event->attendees()->attach($confirmed->id, ['status' => 'confirmed']);

        $this->actingAs($cancelled)
            ->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertCreated()->assertJsonPath('status', 'waitlisted');
        $this->actingAs($waiting)
            ->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertCreated()->assertJsonPath('status', 'waitlisted');

        $this->actingAs($cancelled)->deleteJson("/api/v1/member/events/{$event->slug}/rsvp")->assertOk();

        $this->assertDatabaseHas('event_rsvps', [
            'event_id' => $event->id,
            'user_id' => $waiting->id,
            'status' => 'waitlisted',
        ]);
    }

    public function test_cannot_rsvp_to_cancelled_event(): void
    {
        $event = $this->makeEvent(['status' => 'cancelled', 'status_flow' => 'cancelled']);
        $user = User::factory()->member()->create();

        $this->actingAs($user)
            ->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertUnprocessable();
    }

    public function test_member_can_cancel_rsvp(): void
    {
        $user = User::factory()->member()->create();
        $event = $this->makeEvent();

        $this->actingAs($user)->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])->assertCreated();

        $this->actingAs($user)
            ->deleteJson("/api/v1/member/events/{$event->slug}/rsvp")
            ->assertOk();

        $this->assertDatabaseHas('event_rsvps', [
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => 'cancelled_by_user',
        ]);
    }

    public function test_member_can_list_their_rsvps(): void
    {
        $user = User::factory()->member()->create();
        $event = $this->makeEvent();
        $this->actingAs($user)->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])->assertCreated();

        $response = $this->actingAs($user)->getJson('/api/v1/member/events/rsvps');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_rsvp_messages_follow_the_request_language(): void
    {
        $user = User::factory()->member()->create();
        $event = $this->makeEvent(['max_attendees' => 1]);
        $other = User::factory()->member()->create();
        $event->attendees()->attach($other->id, ['status' => 'approved']);

        $this->actingAs($user)
            ->withHeader('X-Locale', 'ar')
            ->postJson("/api/v1/member/events/{$event->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertCreated()
            ->assertJsonPath('status', 'waitlisted')
            ->assertJsonPath('message', 'اكتمل العدد، وأُضفت إلى قائمة الانتظار.');

        $this->actingAs($user)
            ->withHeader('X-Locale', 'en')
            ->deleteJson("/api/v1/member/events/{$event->slug}/rsvp")
            ->assertOk()
            ->assertJsonPath('message', 'Your registration is cancelled.');

        $closed = $this->makeEvent(['status_flow' => 'registration_closed']);
        $this->actingAs($user)
            ->withHeader('X-Locale', 'ar')
            ->postJson("/api/v1/member/events/{$closed->slug}/rsvp", ['attendance_type' => 'in_person'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.event.0', 'أُغلق التسجيل في هذه الفعالية.');
    }

    public function test_member_catalog_does_not_invent_a_relevance_score_or_reason(): void
    {
        $user = User::factory()->member()->create();
        $this->makeEvent(['slug' => 'catalog-event']);

        $this->actingAs($user)->getJson('/api/v1/member/events/catalog')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'catalog-event')
            ->assertJsonPath('data.0.relevance_score', 0)
            ->assertJsonPath('data.0.why_recommended', null);
    }
}
