<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramApplication extends Model
{
    protected $fillable = [
        'program_id', 'user_id', 'cohort_id', 'motivation', 'relevant_experience',
        'why_join', 'current_challenge', 'expected_outcome',
        'company_stage', 'sector', 'team_size', 'current_traction', 'fundraising_status',
        'availability_confirmed', 'consent_share_profile', 'attachment_path',
        'status', 'admin_notes', 'internal_note', 'decision_reason', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'availability_confirmed' => 'boolean',
        'consent_share_profile' => 'boolean',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(Cohort::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
