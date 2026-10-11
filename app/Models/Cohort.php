<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cohort extends Model
{
    protected $fillable = [
        'program_id',
        'name',
        'code',
        'status',
        'starts_at',
        'ends_at',
        'capacity',
        'city_region',
        'format',
        'program_manager_user_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'program_manager_user_id');
    }

    public function programApplications(): HasMany
    {
        return $this->hasMany(ProgramApplication::class);
    }
}
