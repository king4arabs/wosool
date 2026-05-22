<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ChatMessage $message)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("chat.room.{$this->message->room_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'room_id' => $this->message->room_id,
            'sender_user_id' => $this->message->sender_user_id,
            'message_type' => $this->message->message_type,
            'body' => $this->message->body,
            'metadata' => $this->message->metadata,
            'created_at' => $this->message->created_at?->toIso8601String(),
        ];
    }
}
