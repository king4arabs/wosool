<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramParticipant extends Model
{
    protected $fillable = [
        'eoa_track_id',
        'eoa_onboarding', 'eoa_finance', 'eoa_group_id', 'program_id',
        'user_id',
        'cohort_id',
        'application_id',
        'status',
        'completion_percentage',
        'at_risk',
        'manager_notes',
        'enrolled_at',
        'completed_at',
    ];

    protected $hidden = ['eoa_finance'];

    protected $casts = [
        'eoa_onboarding' => 'array',
        'eoa_finance' => 'encrypted:array',
        'completion_percentage' => 'integer',
        'at_risk' => 'boolean',
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(Cohort::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(ProgramApplication::class, 'application_id');
    }
}
