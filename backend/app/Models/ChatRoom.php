<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatRoom extends Model
{
    protected $fillable = [
        'uuid', 'type', 'title', 'description', 'status', 'created_by_user_id', 'owner_user_id',
        'related_type', 'related_id', 'visibility', 'is_ai_assisted', 'last_message_at', 'archived_at',
    ];

    protected $casts = [
        'is_ai_assisted' => 'boolean',
        'last_message_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ChatRoomParticipant::class, 'room_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'room_id');
    }
}
