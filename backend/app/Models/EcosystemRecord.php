<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EcosystemRecord extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['details' => 'array', 'source_urls' => 'array', 'editorial_lock' => 'boolean', 'deadline' => 'datetime', 'verified_at' => 'date'];

    protected $hidden = ['import_hash'];

    public function scopePublished($query)
    {
        return $query->whereIn('verification_status', ['verified', 'expired']);
    }
}
