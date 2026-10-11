<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HelpRequestSuggestedHelper extends Model
{
    protected $fillable = ['help_request_id', 'helper_user_id', 'reason', 'score', 'status'];

    public function helpRequest(): BelongsTo
    {
        return $this->belongsTo(HelpRequest::class);
    }

    public function helper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'helper_user_id');
    }
}
