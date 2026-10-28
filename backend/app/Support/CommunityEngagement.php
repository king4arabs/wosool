<?php

namespace App\Support;

use App\Models\FounderProfile;
use Illuminate\Database\Eloquent\Builder;

final class CommunityEngagement
{
    public static function withCounts(Builder $query): Builder
    {
        $since = now()->subDays(90);
        return $query->withCount([
            'outboundIntros as engagement_outbound_count' => fn ($q) => $q->where('routing_status', 'INTRO_APPROVED')->where('updated_at', '>=', $since),
            'inboundIntros as engagement_inbound_count' => fn ($q) => $q->where('routing_status', 'INTRO_APPROVED')->where('updated_at', '>=', $since),
            'societyPosts as engagement_posts_count' => fn ($q) => $q->where('moderation_status', 'published')->whereBetween('published_at', [$since, now()]),
        ]);
    }

    /** Activation: 50 points; up to five approved introductions and five posts: 5 each. */
    public static function score(FounderProfile $founder): ?int
    {
        if (! $founder->communityActive() || ! array_key_exists('engagement_posts_count', $founder->getAttributes())) return null;
        return 50 + 5 * min(5, $founder->engagement_outbound_count + $founder->engagement_inbound_count)
            + 5 * min(5, $founder->engagement_posts_count);
    }
}
