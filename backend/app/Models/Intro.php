<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Intro extends Model
{
    protected $fillable = [
        'match_id',
        'requester_id',
        'target_id',
        'facilitator_id',
        'message',
        'status',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(FounderMatch::class, 'match_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'requester_id');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'target_id');
    }

    public function facilitator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'facilitator_id');
    }

    public function scopeRequested($query)
    {
        return $query->where('status', 'requested');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
