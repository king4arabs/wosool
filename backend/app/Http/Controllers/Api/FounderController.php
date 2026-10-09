<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FounderResource;
use App\Models\FounderProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FounderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FounderProfile::with(['user', 'companies' => fn ($q) => $q->where('is_public', true), 'scorecard'])
            ->where('status', 'active')
            ->where('is_public', true);

        if ($request->has('sector')) {
            $query->where('sector', $request->sector);
        }
        if ($request->has('stage')) {
            $query->where('stage', $request->stage);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhere('tagline', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%");
            });
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $founders = $query
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(max(1, min(100, $request->integer('per_page', 12))))
            ->withQueryString();

        return FounderResource::collection($founders)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $founder = FounderProfile::with(['user', 'companies' => fn ($q) => $q->where('is_public', true), 'scorecard'])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json([
            'data' => new FounderResource($founder),
        ]);
    }

    /**
     * Return the authenticated user's founder profile.
     */
    public function myProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->founderProfile()
            ?->with(['companies', 'scorecard'])
            ->first();

        if (! $profile) {
            return response()->json(['message' => 'No founder profile found.'], 404);
        }

        return response()->json(['data' => new FounderResource($profile)]);
    }
}
