<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FounderMatch extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'founder_a_id',
        'founder_b_id',
        'match_score',
        'match_reasons',
        'status',
        'is_ai_generated',
    ];

    protected $casts = [
        'match_reasons' => 'array',
        'match_score' => 'decimal:2',
        'is_ai_generated' => 'boolean',
    ];

    public function founderA(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'founder_a_id');
    }

    public function founderB(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'founder_b_id');
    }

    public function intros(): HasMany
    {
        return $this->hasMany(Intro::class, 'match_id');
    }

    public function scopeSuggested($query)
    {
        return $query->where('status', 'suggested');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeConnected($query)
    {
        return $query->where('status', 'connected');
    }
}
