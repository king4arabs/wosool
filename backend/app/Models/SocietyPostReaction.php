<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocietyPostReaction extends Model
{
    protected $fillable = ['society_post_id', 'user_id', 'reaction_type'];

    public function post(): BelongsTo
    {
        return $this->belongsTo(SocietyPost::class, 'society_post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
