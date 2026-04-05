<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    protected $fillable = [
        'user_id',
        'event_name',
        'entity_type',
        'entity_id',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByEvent($query, string $eventName)
    {
        return $query->where('event_name', $eventName);
    }

    public function scopeForEntity($query, string $type, int $id)
    {
        return $query->where('entity_type', $type)->where('entity_id', $id);
    }

    public static function track(
        string $eventName,
        ?int $userId = null,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $properties = null,
    ): self {
        return self::create([
            'user_id' => $userId,
            'event_name' => $eventName,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
