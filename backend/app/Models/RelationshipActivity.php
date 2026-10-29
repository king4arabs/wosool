<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RelationshipActivity extends Model
{
    protected $fillable = ['body', 'author_id'];
    public function author(): BelongsTo { return $this->belongsTo(User::class, 'author_id'); }
}
