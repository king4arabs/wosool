<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatMessage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'room_id', 'sender_user_id', 'message_type', 'body', 'metadata', 'parent_message_id', 'edited_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'edited_at' => 'datetime',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class, 'room_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'parent_message_id');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(ChatMessageRead::class, 'message_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(ChatMessageReaction::class, 'message_id');
    }
}
