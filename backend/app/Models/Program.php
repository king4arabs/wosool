<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Program extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'title', 'slug', 'description', 'short_description', 'full_description',
        'program_type', 'category', 'duration', 'format', 'language', 'city_region',
        'target_stages', 'cohort_size', 'capacity', 'benefits', 'tags',
        'is_open', 'visibility', 'status_flow', 'application_deadline', 'starts_at', 'ends_at',
        'cover_image_url', 'objective', 'who_it_is_for', 'expected_outcomes',
        'program_manager_user_id', 'organizer_type', 'organizer_id',
        'eligibility_criteria', 'application_process', 'faqs',
        'targeting_rules', 'ai_settings', 'settings',
    ];

    protected $casts = [
        'target_stages' => 'array',
        'benefits' => 'array',
        'tags' => 'array',
        'is_open' => 'boolean',
        'application_deadline' => 'datetime',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'eligibility_criteria' => 'array',
        'application_process' => 'array',
        'faqs' => 'array',
        'targeting_rules' => 'array',
        'ai_settings' => 'array',
        'settings' => 'array',
    ];

    public function cohorts(): HasMany
    {
        return $this->hasMany(Cohort::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ProgramApplication::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ProgramSession::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ProgramParticipant::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(ProgramResource::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(ProgramProgress::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'program_manager_user_id');
    }
}
