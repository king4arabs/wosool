<?php

namespace App\Http\Resources;

use App\Models\SocietyPostReaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocietyPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewerId = $request->user()?->id;
        $reactions = $this->whenLoaded('reactions', fn () => $this->reactions, collect());

        return [
            'id' => $this->id,
            'post_type' => $this->post_type,
            'title' => $this->title,
            'content' => $this->content,
            'sector' => $this->sector,
            'priority' => $this->priority,
            'attachments' => $this->attachments ?? [],
            'moderation_status' => $this->moderation_status,
            'published_at' => $this->published_at?->toIso8601String(),
            'author' => [
                'user_id' => $this->author?->id,
                'name' => $this->author?->name,
                'founder_profile_id' => $this->founderProfile?->id,
                'company' => [
                    'id' => $this->companyProfile?->id,
                    'name' => $this->companyProfile?->legal_name ?? $this->companyProfile?->name,
                    'sector' => $this->companyProfile?->sector,
                ],
            ],
            'counts' => [
                'reactions' => $this->whenCounted('reactions', (int) $this->reactions_count, 0),
                'comments' => $this->whenCounted('comments', (int) $this->comments_count, 0),
                'help_offers' => $this->whenCounted('helpOffers', (int) $this->help_offers_count, 0),
                'reports' => $this->whenCounted('reports', (int) $this->reports_count, 0),
            ],
            'viewer_state' => [
                'saved' => $viewerId ? $this->saves()->where('user_id', $viewerId)->exists() : false,
                'reacted' => $viewerId
                    ? $reactions->contains(fn (SocietyPostReaction $reaction) => $reaction->user_id === $viewerId)
                    : false,
                'is_owner' => $viewerId ? (int) $this->author_user_id === (int) $viewerId : false,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
