<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntroductionLedger extends Model
{
    protected $table = 'introductions_ledger';

    protected $fillable = [
        'source_founder_id',
        'target_founder_id',
        'routing_status',
        'payload_context_brief',
        'tracking_notes',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function sourceFounder(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'source_founder_id');
    }

    public function targetFounder(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'target_founder_id');
    }
}
