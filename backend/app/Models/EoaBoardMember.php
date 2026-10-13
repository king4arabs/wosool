<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EoaBoardMember extends Model
{
    public const PUBLIC_FIELDS = [
        'id', 'slug', 'name_en', 'name_ar', 'position_en', 'position_ar',
        'company_name_en', 'company_name_ar', 'company_role_en', 'company_role_ar',
        'company_url', 'linkedin_url', 'twitter_url', 'facebook_url', 'instagram_url',
        'portrait_path', 'portrait_alt_en', 'portrait_alt_ar', 'portrait_position',
        'display_order', 'board_term', 'is_active', 'publication_status',
    ];

    protected $fillable = [
        'program_id', 'slug', 'name_en', 'name_ar', 'position_en', 'position_ar',
        'company_name_en', 'company_name_ar', 'company_role_en', 'company_role_ar',
        'company_url', 'linkedin_url', 'twitter_url', 'facebook_url', 'instagram_url',
        'portrait_path', 'portrait_alt_en', 'portrait_alt_ar', 'portrait_position',
        'display_order', 'board_term', 'is_active', 'publication_status', 'source_references', 'verified_at', 'version',
    ];

    protected $attributes = [
        'portrait_position' => '50% 35%',
        'display_order' => 100,
        'is_active' => true,
        'publication_status' => 'draft',
        'version' => 1,
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'version' => 'integer',
        'source_references' => 'array',
        'verified_at' => 'date:Y-m-d',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
