<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramSession extends Model
{
    protected $fillable = [
        'program_id',
        'cohort_id',
        'title',
        'description',
        'session_type',
        'starts_at',
        'duration_minutes',
        'location',
        'online_link',
        'mentor_user_id',
        'is_required',
        'materials',
        'recording_link',
        'attendance_required',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'materials' => 'array',
        'is_required' => 'boolean',
        'attendance_required' => 'boolean',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(Cohort::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_user_id');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(ProgramSessionAttendance::class, 'program_session_id');
    }
}
