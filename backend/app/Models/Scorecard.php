<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scorecard extends Model
{
    protected $fillable = [
        'founder_profile_id',
        'aggregate_score',
        'momentum',
        'growth',
        'readiness',
        'support_delta',
        'historical_logs',
    ];

    protected function casts(): array
    {
        return [
            'aggregate_score' => 'integer',
            'momentum' => 'integer',
            'growth' => 'integer',
            'readiness' => 'integer',
            'support_delta' => 'integer',
            'historical_logs' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function founderProfile(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class);
    }
}
