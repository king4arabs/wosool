<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'privacy',
        'notifications',
        'visibility',
    ];

    protected $casts = [
        'privacy' => 'array',
        'notifications' => 'array',
        'visibility' => 'array',
    ];

    public static function defaults(): array
    {
        return [
            'privacy' => [
                'profile_visibility' => true,
                'show_founder_score' => true,
                'activity_visibility' => true,
                'appear_in_directory' => true,
            ],
            'notifications' => [
                'new_match_suggestions' => true,
                'direct_messages' => true,
                'event_reminders' => true,
                'program_updates' => true,
                'community_activity' => false,
                'weekly_digest' => true,
            ],
            'visibility' => [
                'allow_intro_requests' => true,
                'show_email_to_matches' => false,
                'discoverable_for_matching' => true,
            ],
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

