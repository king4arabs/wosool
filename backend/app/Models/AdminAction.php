<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminAction extends Model
{
    protected $fillable = [
        'admin_id',
        'action',
        'entity_type',
        'entity_id',
        'notes',
        'before_state',
        'after_state',
    ];

    protected $casts = [
        'before_state' => 'array',
        'after_state' => 'array',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeForEntity($query, string $type, int $id)
    {
        return $query->where('entity_type', $type)->where('entity_id', $id);
    }

    public static function log(
        int $adminId,
        string $action,
        string $entityType,
        int $entityId,
        ?string $notes = null,
        ?array $beforeState = null,
        ?array $afterState = null,
    ): self {
        return self::create([
            'admin_id' => $adminId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'notes' => $notes,
            'before_state' => $beforeState,
            'after_state' => $afterState,
        ]);
    }
}
