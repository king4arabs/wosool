<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SponsorProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'logo_url', 'website', 'tier',
        'is_active', 'contact_name', 'contact_email', 'contract_start',
        'contract_end', 'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'contract_start' => 'date',
        'contract_end' => 'date',
    ];
}
