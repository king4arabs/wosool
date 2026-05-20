<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CompanyProfile extends Model
{
    protected $fillable = [
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
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function founders(): BelongsToMany
    {
        return $this->belongsToMany(FounderProfile::class, 'founder_company_links', 'company_profile_id', 'founder_profile_id');
    }
}
