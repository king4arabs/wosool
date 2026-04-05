<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'category', 'duration', 'target_stages',
        'cohort_size', 'benefits', 'is_open', 'application_deadline',
    ];

    protected $casts = [
        'target_stages' => 'array',
        'benefits' => 'array',
        'is_open' => 'boolean',
        'application_deadline' => 'datetime',
    ];

    public function cohorts(): HasMany
    {
        return $this->hasMany(Cohort::class);
    }
}
