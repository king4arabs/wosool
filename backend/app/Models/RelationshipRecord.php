<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Builder, Model};
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class RelationshipRecord extends Model
{
    public const STAGES = [
        'crm' => ['new', 'contacted', 'in_progress', 'won', 'closed'],
        'pr' => ['planned', 'pitched', 'confirmed', 'published', 'closed'],
    ];
    public const TERMINAL = ['won', 'published', 'closed'];
    protected $fillable = ['kind', 'name', 'organization', 'email', 'phone', 'stage', 'priority', 'owner_id', 'follow_up_on', 'campaign', 'coverage_url', 'notes'];
    protected $attributes = ['version' => 1];
    protected $casts = ['follow_up_on' => 'date:Y-m-d', 'version' => 'integer'];

    public function owner(): BelongsTo { return $this->belongsTo(User::class, 'owner_id'); }
    public function activities(): HasMany { return $this->hasMany(RelationshipActivity::class); }
    public function scopeOpen(Builder $query): Builder { return $query->whereNotIn('stage', self::TERMINAL); }
    public function scopeDue(Builder $query): Builder { return $query->open()->whereDate('follow_up_on', '<=', now('Asia/Riyadh')->toDateString()); }
}
