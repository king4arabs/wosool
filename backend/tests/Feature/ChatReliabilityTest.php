<?php

namespace Tests\Feature;

use App\Events\ChatMessageCreated;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Tests\TestCase;

class ChatReliabilityTest extends TestCase
{
    use RefreshDatabase;

    private function room(User $user): ChatRoom
    {
        $room = ChatRoom::create(['uuid' => (string) Str::uuid(), 'type' => 'direct', 'title' => 'Test conversation', 'status' => 'open', 'created_by_user_id' => $user->id, 'owner_user_id' => $user->id]);
        $room->participants()->create(['user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
        return $room;
    }

    public function test_room_opens_with_latest_messages_and_older_history_is_paginated(): void
    {
        $user = User::factory()->create();
        $room = $this->room($user);
        for ($i = 1; $i <= 55; $i++) {
            ChatMessage::create(['room_id' => $room->id, 'sender_user_id' => $user->id, 'message_type' => 'text', 'body' => "Message {$i}"]);
        }
        $this->actingAs($user)->getJson("/api/v1/chat/rooms/{$room->id}")
            ->assertOk()->assertJsonPath('data.messages.0.body', 'Message 55')->assertJsonCount(50, 'data.messages')->assertJsonPath('meta.last_page', 2);
        $this->getJson("/api/v1/chat/rooms/{$room->id}?page=2")
            ->assertOk()->assertJsonCount(5, 'data.messages')->assertJsonPath('data.messages.0.body', 'Message 5');
    }

    public function test_writes_require_active_membership_and_an_open_room(): void
    {
        Event::fake();
        $user = User::factory()->create();
        $room = $this->room($user);
        $this->actingAs($user)->postJson("/api/v1/chat/rooms/{$room->id}/messages", ['body' => 'Hello'])->assertCreated();
        $room->participants()->update(['status' => 'muted']);
        $this->postJson("/api/v1/chat/rooms/{$room->id}/messages", ['body' => 'Muted'])->assertForbidden();
        $room->participants()->update(['status' => 'active']);
        $room->update(['status' => 'closed']);
        $this->postJson("/api/v1/chat/rooms/{$room->id}/messages", ['body' => 'Closed'])->assertStatus(409);
        $this->actingAs(User::factory()->create())->getJson("/api/v1/chat/rooms/{$room->id}")->assertNotFound();
        $this->assertDatabaseCount('chat_messages', 1);
    }

    public function test_empty_or_system_messages_and_cross_room_references_are_rejected(): void
    {
        Event::fake();
        $user = User::factory()->create();
        $room = $this->room($user);
        $otherRoom = $this->room($user);
        $message = ChatMessage::create(['room_id' => $otherRoom->id, 'sender_user_id' => $user->id, 'message_type' => 'text', 'body' => 'Other room']);
        $this->actingAs($user)->postJson("/api/v1/chat/rooms/{$room->id}/messages", ['body' => ' '])->assertUnprocessable();
        $this->postJson("/api/v1/chat/rooms/{$room->id}/messages", ['body' => 'Impersonated system', 'message_type' => 'system'])->assertUnprocessable();
        $this->postJson("/api/v1/chat/rooms/{$room->id}/messages", ['body' => 'Reply', 'parent_message_id' => $message->id])->assertUnprocessable();
        $this->postJson("/api/v1/chat/rooms/{$room->id}/read", ['last_read_message_id' => $message->id])->assertUnprocessable();
    }

    public function test_a_broadcast_failure_does_not_turn_a_saved_message_into_a_failed_request(): void
    {
        $user = User::factory()->create();
        $room = $this->room($user);
        Event::listen(ChatMessageCreated::class, fn () => throw new \RuntimeException('Broker unavailable'));
        $this->actingAs($user)->postJson("/api/v1/chat/rooms/{$room->id}/messages", ['body' => 'Saved successfully'])->assertCreated();
        $this->assertDatabaseCount('chat_messages', 1);
    }
}
