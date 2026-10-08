<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicEventListingTest extends TestCase
{
    use RefreshDatabase;

    private function event(string $slug, array $attributes = []): Event
    {
        return Event::create(array_merge([
            'title' => $slug, 'slug' => $slug, 'starts_at' => now()->addDay(),
            'type' => 'wosool', 'format' => 'in-person', 'is_public' => true,
            'visibility' => 'public', 'status' => 'upcoming', 'status_flow' => 'published',
        ], $attributes));
    }

    public function test_upcoming_excludes_ended_events_and_orders_the_next_event_first(): void
    {
        $this->event('ended', ['starts_at' => now()->subDay()]);
        $this->event('later', ['starts_at' => now()->addWeek()]);
        $this->event('next');
        $response = $this->getJson('/api/v1/events?period=upcoming')->assertOk();
        $this->assertSame(['next', 'later'], array_column($response->json('data'), 'slug'));
    }

    public function test_past_includes_completed_events_but_excludes_drafts_and_future_events(): void
    {
        $this->event('completed', ['starts_at' => now()->subDay(), 'status_flow' => 'completed']);
        $this->event('draft', ['starts_at' => now()->subDay(), 'status_flow' => 'draft']);
        $this->event('future');
        $response = $this->getJson('/api/v1/events?period=past')->assertOk();
        $this->assertSame(['completed'], array_column($response->json('data'), 'slug'));
    }

    public function test_conflicting_visibility_flags_do_not_expose_private_events(): void
    {
        $this->event('members-only', ['visibility' => 'members_only']);
        $this->event('private', ['is_public' => false]);
        $this->event('public');
        $response = $this->getJson('/api/v1/events?period=upcoming')->assertOk();
        $this->assertSame(['public'], array_column($response->json('data'), 'slug'));
    }

    public function test_private_and_draft_details_and_calendars_are_not_public(): void
    {
        $this->event('members-only', ['visibility' => 'members_only']);
        $this->event('private', ['is_public' => false]);
        $this->event('draft', ['status_flow' => 'draft']);
        foreach (['members-only', 'private', 'draft'] as $slug) {
            $this->getJson("/api/v1/events/{$slug}")->assertNotFound();
            $this->get("/api/v1/events/{$slug}/calendar.ics")->assertNotFound();
        }
    }

    public function test_public_details_omit_invites_internal_settings_and_join_links(): void
    {
        $this->event('public', [
            'invites' => ['private@example.test'], 'ai_settings' => ['internal' => true],
            'online_meeting_url' => 'https://example.test/private-meeting',
            'virtual_link' => 'https://example.test/private-meeting',
        ]);
        $this->getJson('/api/v1/events/public')->assertOk()
            ->assertJsonMissingPath('data.invites')
            ->assertJsonMissingPath('data.ai_settings')
            ->assertJsonMissingPath('data.online_meeting_url')
            ->assertJsonMissingPath('data.virtual_link');
        $this->get('/api/v1/events/public/calendar.ics')->assertOk()
            ->assertHeader('Content-Type', 'text/calendar; charset=utf-8');
    }
}
