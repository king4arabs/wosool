<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cohort extends Model
{
    protected $fillable = ['program_id', 'name', 'status', 'starts_at', 'ends_at'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
