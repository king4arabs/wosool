<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFounderProfileRequest;
use App\Http\Resources\FounderResource;
use App\Models\FounderProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FounderProfileController extends Controller
{
    /**
     * Return the authenticated user's founder profile, or 404 if none exists.
     */
    public function show(Request $request): JsonResponse
    {
        $profile = FounderProfile::with(['companies', 'scorecard'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $profile) {
            return response()->json(['message' => __('messages.founder.profile_not_found')], 404);
        }

        return response()->json([
            'data' => [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'legal_name' => $this->modelAttr($profile, ['legal_name', 'name', 'tagline', 'slug'], ''),
                'title' => $this->modelAttr($profile, ['title', 'tagline'], ''),
                'biography_summary' => $this->modelAttr($profile, ['biography_summary', 'bio']),
                'skills_tags' => $this->modelAttr($profile, ['skills_tags', 'skills'], []),
                'vetted_status' => (bool) $this->modelAttr($profile, ['vetted_status', 'is_verified'], false),
                'momentum_score' => (int) $this->modelAttr($profile, ['momentum_score'], 0),
                'profile_markdown' => $this->modelAttr($profile, ['profile_markdown', 'bio']),
                'tagline' => $this->modelAttr($profile, ['tagline']),
                'bio' => $this->modelAttr($profile, ['bio']),
                'location' => $this->modelAttr($profile, ['location']),
                'country_code' => $this->modelAttr($profile, ['country_code']),
                'sector' => $this->modelAttr($profile, ['sector']),
                'stage' => $this->modelAttr($profile, ['stage']),
                'linkedin_url' => $this->modelAttr($profile, ['linkedin_url']),
                'twitter_url' => $this->modelAttr($profile, ['twitter_url']),
                'website_url' => $this->modelAttr($profile, ['website_url']),
                'needs' => $this->modelAttr($profile, ['needs'], []),
                'offers' => $this->modelAttr($profile, ['offers'], []),
                'is_public' => (bool) $this->modelAttr($profile, ['is_public'], true),
                'created_at' => $profile->created_at?->toIso8601String(),
                'updated_at' => $profile->updated_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Create or update the authenticated user's founder profile (idempotent upsert).
     */
    public function update(UpdateFounderProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = FounderProfile::firstOrNew(['user_id' => $user->id]);

        $data = $request->validated();
        $created = ! $profile->exists;

        if ($created) {
            $profile->slug = $this->uniqueSlug($user->name);
            $profile->status = 'active';
            $profile->is_public = $data['is_public'] ?? true;
        }

        $profile->fill($data);
        $profile->save();
        $profile->load(['user', 'companies', 'scorecard']);

        return response()->json([
            'message' => $created ? __('messages.founder.profile_created') : __('messages.founder.profile_updated'),
            'data' => new FounderResource($profile),
        ], $created ? 201 : 200);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'founder';
        $slug = $base;
        $i = 2;
        while (FounderProfile::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    private function modelAttr(Model $model, array $keys, mixed $default = null): mixed
    {
        $attributes = $model->getAttributes();
        foreach ($keys as $key) {
            if (array_key_exists($key, $attributes)) {
                return $attributes[$key];
            }
        }

        return $default;
    }
}
