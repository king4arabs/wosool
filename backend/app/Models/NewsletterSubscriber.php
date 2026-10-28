<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class NewsletterSubscriber extends Model
{
    protected $guarded = ['id'];
    protected $hidden = ['confirmation_hash'];
    protected $attributes = ['status' => 'pending', 'explicit_opt_in' => false, 'user_id' => null, 'confirmation_hash' => null, 'confirmation_expires_at' => null, 'confirmation_sent_at' => null, 'confirmed_at' => null, 'unsubscribed_at' => null];
    protected function casts(): array { return ['explicit_opt_in' => 'boolean', 'confirmation_expires_at' => 'datetime', 'confirmation_sent_at' => 'datetime', 'confirmed_at' => 'datetime', 'unsubscribed_at' => 'datetime']; }
}
