<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramSessionAttendance extends Model
{
    protected $table = 'program_session_attendance';

    protected $fillable = [
        'program_session_id',
        'user_id',
        'status',
        'attended_at',
        'note',
    ];

    protected $casts = [
        'attended_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(ProgramSession::class, 'program_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
