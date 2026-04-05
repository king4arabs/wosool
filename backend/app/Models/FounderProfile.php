<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FounderProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'slug', 'tagline', 'bio', 'location', 'country_code',
        'sector', 'stage', 'linkedin_url', 'twitter_url', 'website_url',
        'needs', 'offers', 'skills', 'is_verified', 'is_featured',
        'is_public', 'status', 'avatar_url',
    ];

    protected $casts = [
        'needs' => 'array',
        'offers' => 'array',
        'skills' => 'array',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scorecard(): HasOne
    {
        return $this->hasOne(Scorecard::class);
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(CompanyProfile::class, 'founder_company_links')
            ->withPivot('role', 'is_primary')
            ->withTimestamps();
    }
}
