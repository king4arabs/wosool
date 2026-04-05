<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    protected $fillable = [
        'user_id', 'full_name', 'email', 'phone', 'company_name', 'company_website',
        'sector', 'stage', 'location', 'motivation', 'what_you_offer', 'what_you_need',
        'linkedin_url', 'referral_source', 'referrer_name', 'status', 'admin_notes',
        'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
