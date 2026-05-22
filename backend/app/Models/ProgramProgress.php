<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramProgress extends Model
{
    protected $table = 'program_progress';

    protected $fillable = [
        'program_id',
        'user_id',
        'cohort_id',
        'completion_percentage',
        'tasks_completed',
        'materials_completed',
        'sessions_attended',
        'status',
        'at_risk',
        'mentor_feedback',
        'self_assessment',
        'milestones',
    ];

    protected $casts = [
        'completion_percentage' => 'integer',
        'tasks_completed' => 'integer',
        'materials_completed' => 'integer',
        'sessions_attended' => 'integer',
        'at_risk' => 'boolean',
        'milestones' => 'array',
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
}
