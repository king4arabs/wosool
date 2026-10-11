<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScorecardMetric extends Model
{
    protected $fillable = [
        'scorecard_id', 'metric_key', 'metric_label', 'value', 'max_value', 'explanation',
    ];

    public function scorecard(): BelongsTo
    {
        return $this->belongsTo(Scorecard::class);
    }
}
