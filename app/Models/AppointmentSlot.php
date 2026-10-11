<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppointmentSlot extends Model
{
    protected $fillable = [
        'host_id',
        'title',
        'duration_minutes',
        'available_days',
        'available_from',
        'available_to',
        'is_active',
    ];

    protected $casts = [
        'available_days' => 'array',
        'is_active' => 'boolean',
    ];

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'slot_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
