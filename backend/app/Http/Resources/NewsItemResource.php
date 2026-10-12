<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'category' => $this->category,
            'image_url' => $this->image_url,
            'source_url' => $this->source_url,
            'source_name' => $this->source_name,
            'image_credit' => $this->image_credit,
            'companies' => $this->companies ?? [],
            'region' => $this->region,
            'key_facts' => $this->key_facts ?? [],
            'translations' => $this->translations ?? (object) [],
            'author_name' => $this->author_name,
            'is_featured' => (bool) $this->is_featured,
            'is_public' => (bool) $this->is_public,
            'status' => $this->status,
            'tags' => $this->tags ?? [],
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
