<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSpeaker extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'role',
        'company',
        'bio',
        'avatar_url',
        'social_links',
        'is_featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}

