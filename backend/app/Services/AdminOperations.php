<?php

namespace App\Services;

use App\Models\{ContactMessage, Event, FounderProfile, RelationshipRecord};
use App\Support\DirectoryGeography;

final class AdminOperations
{
    public static function summary(): array
    {
        return [
            'newsletter' => app(Newsletter::class)->status(),
            'open_messages' => ContactMessage::whereNull('responded_at')->count(),
            'crm_due' => RelationshipRecord::where('kind', 'crm')->due()->count(),
            'pr_due' => RelationshipRecord::where('kind', 'pr')->due()->count(),
            'crm_open' => RelationshipRecord::where('kind', 'crm')->open()->count(),
            'pr_open' => RelationshipRecord::where('kind', 'pr')->open()->count(),
            'public_members' => DirectoryGeography::founders(FounderProfile::query())->where('status', 'active')->where('is_public', true)->whereNotNull('user_id')->count(),
            'upcoming_events' => Event::whereIn('status', ['upcoming', 'live'])->whereBetween('starts_at', [now(), now()->addDays(7)])->count(),
            'follow_ups' => RelationshipRecord::with('owner:id,name')->due()->orderBy('follow_up_on')->orderBy('id')->limit(6)->get(['id', 'kind', 'name', 'organization', 'stage', 'priority', 'owner_id', 'follow_up_on']),
        ];
    }
}
