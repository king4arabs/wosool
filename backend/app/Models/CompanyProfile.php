<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'website',
        'stage',
        'location',
        'country_code',
        'is_featured',
        'founded_year',
        'team_size',
        'is_hiring',
        'is_fundraising',
        'is_collaborating',
        'is_public',
        'slug',
        'status',
        'legal_name',
        'domain_url',
        'operational_stage',
        'sector',
        'hq_location',
        'tech_stack_tokens',
        'metrics_summary',
        'vector_embedding_payload',
    ];

    protected function casts(): array
    {
        return [
            'tech_stack_tokens' => 'array',
            'metrics_summary' => 'array',
            'is_hiring' => 'boolean',
            'is_fundraising' => 'boolean',
            'is_collaborating' => 'boolean',
            'is_public' => 'boolean',
            'is_featured' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function founders(): BelongsToMany
    {
        return $this->belongsToMany(FounderProfile::class, 'founder_company_links', 'company_profile_id', 'founder_profile_id');
    }
}
