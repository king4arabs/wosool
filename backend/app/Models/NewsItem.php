<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'category', 'image_url',
        'author_name', 'author_id', 'is_featured', 'is_public', 'status',
        'tags', 'published_at', 'source_url', 'source_name', 'image_credit', 'companies',
        'region', 'key_facts', 'translations',
    ];

    protected $casts = [
        'tags' => 'array',
        'companies' => 'array',
        'key_facts' => 'array',
        'translations' => 'array',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
