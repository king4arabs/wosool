<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFounderProfileRequest;
use App\Http\Resources\FounderResource;
use App\Models\FounderProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
        return DB::transaction(function () use ($request): JsonResponse {
            // Serialise profile creation with other writes for this account. The UUID
            // never comes from request fields and the owner relationship is preserved.
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $profile = FounderProfile::where('user_id', $user->id)->lockForUpdate()->first()
                ?? new FounderProfile(['user_id' => $user->id]);

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
        });
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'founder';
        $slug = $base;
        $i = 2;
        while (FounderProfile::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }


    /** Public-disk folder for member-uploaded founder portraits. */
    private const AVATAR_DIRECTORY = 'founders/avatars';

    /**
     * Upload a portrait for the authenticated member's founder profile.
     * Replaces (and deletes) any portrait previously uploaded through this endpoint.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|file|image|mimes:jpg,jpeg,png,webp|mimetypes:image/jpeg,image/png,image/webp|max:2048|dimensions:min_width=160,min_height=160,max_width=6000,max_height=6000',
        ]);

        $profile = FounderProfile::where('user_id', $request->user()->id)->first();
        abort_unless($profile, 404, __('messages.founder.profile_not_found'));

        $file = $request->file('avatar');
        $extension = match ($file->getMimeType()) {
            'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
            default => abort(422, 'Choose a JPEG, PNG or WebP image.'),
        };
        $stored = Storage::disk('public')->putFileAs(self::AVATAR_DIRECTORY, $file, Str::uuid().'.'.$extension);
        abort_unless($stored, 500, 'The photo could not be saved. Please try again.');

        $previous = $this->uploadedAvatarPath($profile->avatar_url);
        $profile->update(['avatar_url' => '/storage/'.$stored]);
        if ($previous && $previous !== $stored) {
            Storage::disk('public')->delete($previous);
        }

        return response()->json(['data' => new FounderResource($profile->load(['user', 'companies']))]);
    }

    /** Remove the member's uploaded portrait. */
    public function deleteAvatar(Request $request): JsonResponse
    {
        $profile = FounderProfile::where('user_id', $request->user()->id)->first();
        abort_unless($profile, 404, __('messages.founder.profile_not_found'));

        if ($path = $this->uploadedAvatarPath($profile->avatar_url)) {
            Storage::disk('public')->delete($path);
        }
        $profile->update(['avatar_url' => null]);

        return response()->json(['data' => new FounderResource($profile->load(['user', 'companies']))]);
    }

    /** Return the public-disk path when the avatar is one this endpoint stored. */
    private function uploadedAvatarPath(?string $url): ?string
    {
        if ($url && preg_match('~^/storage/('.preg_quote(self::AVATAR_DIRECTORY, '~').'/[a-f0-9-]+\.(?:jpg|png|webp))$~', $url, $m)) {
            return $m[1];
        }

        return null;
    }
}
