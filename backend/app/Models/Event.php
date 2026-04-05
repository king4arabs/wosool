<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'starts_at', 'ends_at', 'location',
        'type', 'format', 'virtual_link', 'image_url', 'max_attendees',
        'is_public', 'requires_rsvp', 'status', 'tags', 'created_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'tags' => 'array',
        'is_public' => 'boolean',
        'requires_rsvp' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_rsvps')
            ->withPivot('status')
            ->withTimestamps();
    }
}
