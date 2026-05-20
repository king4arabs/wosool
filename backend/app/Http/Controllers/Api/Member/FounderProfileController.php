<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFounderProfileRequest;
use App\Http\Resources\FounderResource;
use App\Models\FounderProfile;
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
                'legal_name' => $profile->legal_name,
                'title' => $profile->title,
                'biography_summary' => $profile->biography_summary,
                'skills_tags' => $profile->skills_tags ?? [],
                'vetted_status' => (bool) $profile->vetted_status,
                'momentum_score' => (int) $profile->momentum_score,
                'profile_markdown' => $profile->profile_markdown,
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
        $profile->load(['companies', 'scorecard']);

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
}
