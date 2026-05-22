<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $roomId, public int $userId, public ?int $lastReadMessageId)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("chat.room.{$this->roomId}")];
    }

    public function broadcastAs(): string
    {
        return 'chat.message.read';
    }

    public function broadcastWith(): array
    {
        return ['room_id' => $this->roomId, 'user_id' => $this->userId, 'last_read_message_id' => $this->lastReadMessageId, 'read_at' => now()->toIso8601String()];
    }
}
