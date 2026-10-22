<?php

namespace App\Services;

use App\Models\ChatRoom;
use App\Models\ChatRoomParticipant;
use Illuminate\Support\Str;

class ChatRoomService
{
    public function ensureRoom(array $attributes, array $participants = []): ChatRoom
    {
        $room = ChatRoom::query()
            ->where('type', $attributes['type'])
            ->where('related_type', $attributes['related_type'] ?? null)
            ->where('related_id', $attributes['related_id'] ?? null)
            ->first();

        if (! $room) {
            $room = ChatRoom::create(array_merge([
                'uuid' => (string) Str::uuid(),
                'status' => 'open',
                'visibility' => 'private',
                'is_ai_assisted' => false,
            ], $attributes));
        }

        foreach ($participants as $participant) {
            $this->addParticipant(
                roomId: $room->id,
                userId: (int) $participant['user_id'],
                role: (string) ($participant['role'] ?? 'participant')
            );
        }

        return $room;
    }

    public function addParticipant(int $roomId, int $userId, string $role = 'participant'): ChatRoomParticipant
    {
        return ChatRoomParticipant::updateOrCreate(
            ['room_id' => $roomId, 'user_id' => $userId],
            ['role' => $role, 'status' => 'active', 'joined_at' => now()]
        );
    }
}
