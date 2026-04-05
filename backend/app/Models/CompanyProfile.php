<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CompanyProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'logo_url', 'website', 'sector',
        'stage', 'location', 'country_code', 'founded_year', 'team_size',
        'is_hiring', 'is_fundraising', 'is_collaborating', 'is_featured',
        'is_public', 'status',
    ];

    protected $casts = [
        'is_hiring' => 'boolean',
        'is_fundraising' => 'boolean',
        'is_collaborating' => 'boolean',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
    ];

    public function founders(): BelongsToMany
    {
        return $this->belongsToMany(FounderProfile::class, 'founder_company_links')
            ->withPivot('role', 'is_primary')
            ->withTimestamps();
    }
}
