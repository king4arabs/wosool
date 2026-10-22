<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SocietyPost extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'author_user_id',
        'author_founder_profile_id',
        'author_company_profile_id',
        'post_type',
        'title',
        'content',
        'sector',
        'priority',
        'attachments',
        'moderation_status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'published_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_user_id');
    }

    public function founderProfile(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'author_founder_profile_id');
    }

    public function companyProfile(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'author_company_profile_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(SocietyPostReaction::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(SocietyPostComment::class);
    }

    public function saves(): HasMany
    {
        return $this->hasMany(SocietyPostSave::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(SocietyPostReport::class);
    }

    public function helpOffers(): HasMany
    {
        return $this->hasMany(SocietyPostHelpOffer::class);
    }
}
