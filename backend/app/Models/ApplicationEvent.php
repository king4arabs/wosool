<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationEvent extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    protected $casts = ['is_internal' => 'boolean', 'created_at' => 'datetime', 'notification_sent_at' => 'datetime'];
}
