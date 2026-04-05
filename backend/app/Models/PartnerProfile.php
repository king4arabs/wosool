<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'logo_url', 'website', 'type', 'status',
        'sector', 'contact_name', 'contact_email', 'is_public', 'display_order',
    ];

    protected $casts = ['is_public' => 'boolean'];
}
