<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FounderProfile extends Model
{
    protected $fillable = [
        'user_id',
        'legal_name',
        'title',
        'biography_summary',
        'skills_tags',
        'vetted_status',
        'momentum_score',
        'profile_markdown',
    ];

    protected function casts(): array
    {
        return [
            'skills_tags' => 'array',
            'vetted_status' => 'boolean',
            'momentum_score' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(CompanyProfile::class, 'founder_company_links', 'founder_profile_id', 'company_profile_id');
    }

    public function scorecard(): HasOne
    {
        return $this->hasOne(Scorecard::class);
    }

    public function outboundIntros(): HasMany
    {
        return $this->hasMany(IntroductionLedger::class, 'source_founder_id');
    }

    public function inboundIntros(): HasMany
    {
        return $this->hasMany(IntroductionLedger::class, 'target_founder_id');
    }
}
