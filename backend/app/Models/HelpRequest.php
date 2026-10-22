<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HelpRequest extends Model
{
    protected $fillable = [
        'requester_user_id', 'title', 'category', 'urgency', 'description', 'related_type', 'related_id',
        'visibility', 'status', 'allow_ai_matching', 'chat_room_id',
    ];

    protected $casts = [
        'allow_ai_matching' => 'boolean',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class, 'chat_room_id');
    }

    public function suggestedHelpers(): HasMany
    {
        return $this->hasMany(HelpRequestSuggestedHelper::class);
    }
}
