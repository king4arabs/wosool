<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_id' => $this->room_id,
            'sender_user_id' => $this->sender_user_id,
            'message_type' => $this->message_type,
            'body' => $this->body,
            'metadata' => $this->metadata ?? [],
            'parent_message_id' => $this->parent_message_id,
            'edited_at' => $this->edited_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'sender' => $this->whenLoaded('sender', fn () => [
                'id' => $this->sender?->id,
                'name' => $this->sender?->name,
                'email' => $this->sender?->email,
            ]),
            'reactions' => $this->whenLoaded('reactions', fn () => $this->reactions->map(fn ($reaction) => [
                'id' => $reaction->id,
                'user_id' => $reaction->user_id,
                'reaction' => $reaction->reaction,
            ])),
        ];
    }
}
