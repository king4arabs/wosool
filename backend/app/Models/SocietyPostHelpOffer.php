<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocietyPostHelpOffer extends Model
{
    protected $fillable = ['society_post_id', 'helper_user_id', 'message', 'status'];

    public function post(): BelongsTo
    {
        return $this->belongsTo(SocietyPost::class, 'society_post_id');
    }

    public function helper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'helper_user_id');
    }
}
