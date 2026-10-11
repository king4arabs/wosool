<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatRoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'related_type' => $this->related_type,
            'related_id' => $this->related_id,
            'is_ai_assisted' => (bool) $this->is_ai_assisted,
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'participants' => $this->whenLoaded('participants', fn () => $this->participants->map(fn ($p) => [
                'user_id' => $p->user_id,
                'role' => $p->role,
                'status' => $p->status,
                'joined_at' => $p->joined_at?->toIso8601String(),
                'user' => $p->relationLoaded('user') ? [
                    'id' => $p->user?->id,
                    'name' => $p->user?->name,
                    'email' => $p->user?->email,
                ] : null,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
