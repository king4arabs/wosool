<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'type',
        'category',
        'file_url',
        'external_url',
        'is_members_only',
        'is_featured',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_members_only' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_members_only', false);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
