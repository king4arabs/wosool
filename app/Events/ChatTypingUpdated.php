<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatTypingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $roomId, public int $userId, public bool $isTyping)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("chat.room.{$this->roomId}")];
    }

    public function broadcastAs(): string
    {
        return 'chat.typing.updated';
    }

    public function broadcastWith(): array
    {
        return ['room_id' => $this->roomId, 'user_id' => $this->userId, 'is_typing' => $this->isTyping];
    }
}
