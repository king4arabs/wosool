<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerProfile extends Model
{
    use SoftDeletes;

    protected $attributes = ['name_ar' => null, 'name_en' => null, 'logo_source_url' => null, 'approval_note' => null, 'approved_at' => null, 'identity_status' => 'needs_review', 'asset_status' => 'needs_review', 'designation_status' => 'needs_review'];

    protected $fillable = [
        'name_ar', 'name_en', 'identity_status', 'asset_status', 'designation_status', 'logo_source_url', 'approval_note', 'approved_at',
        'name', 'slug', 'description', 'logo_url', 'website', 'type', 'status',
        'sector', 'contact_name', 'contact_email', 'is_public', 'display_order',
    ];

    protected $casts = ['is_public' => 'boolean', 'approved_at' => 'datetime'];
}
