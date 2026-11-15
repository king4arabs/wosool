<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FounderIdentityReview extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['candidates' => 'array', 'reviewed_at' => 'datetime'];
    }
}
