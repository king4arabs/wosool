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
        'source_credit_consumed_at',
        'intro_email_sent_at',
        'thread_id',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'source_credit_consumed_at' => 'datetime',
            'intro_email_sent_at' => 'datetime',
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
