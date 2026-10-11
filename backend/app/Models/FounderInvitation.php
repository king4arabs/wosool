<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FounderInvitation extends Model
{
    use HasUuids;

    protected $guarded = ['id'];
    protected $hidden = ['email', 'token_hash', 'recipient_evidence'];
    protected function casts(): array
    {
        return ['email' => 'encrypted', 'expires_at' => 'datetime', 'sent_at' => 'datetime', 'accepted_at' => 'datetime'];
    }
    public function founder(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'founder_profile_id');
    }
}
