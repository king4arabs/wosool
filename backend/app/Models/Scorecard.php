<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scorecard extends Model
{
    protected $fillable = [
        'founder_profile_id', 'overall_score', 'profile_completeness',
        'community_engagement', 'execution_track_record', 'network_strength',
        'knowledge_contribution', 'ai_summary', 'improvement_suggestions', 'calculated_at',
    ];

    protected $casts = [
        'improvement_suggestions' => 'array',
        'calculated_at' => 'datetime',
    ];

    public function founderProfile(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(ScorecardMetric::class);
    }
}
