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
        return response()->json(['data' => new FounderResource($profile->load('user'))]);
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

        // Member edits supersede imported translations; stale editorial text must not hide owner changes.
        if ($profile->directory_key && $data) { $profile->translations = null; }
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

}
