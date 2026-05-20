<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\FounderMatch;
use App\Models\FounderProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = FounderProfile::where('user_id', $request->user()->id)->firstOrFail();

        $matches = FounderMatch::query()
            ->with(['founderA.user', 'founderA.companies', 'founderB.user', 'founderB.companies'])
            ->where(function ($builder) use ($profile) {
                $builder
                    ->where('founder_a_id', $profile->id)
                    ->orWhere('founder_b_id', $profile->id);
            })
            ->latest()
            ->get();

        return response()->json([
            'data' => MatchResource::collection($matches),
        ]);
    }

    public function accept(Request $request, FounderMatch $match): JsonResponse
    {
        $this->authorizeMatch($request, $match);
        $match->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Match accepted.',
            'data' => new MatchResource($match->fresh(['founderA.user', 'founderB.user'])),
        ]);
    }

    public function decline(Request $request, FounderMatch $match): JsonResponse
    {
        $this->authorizeMatch($request, $match);
        $match->update(['status' => 'declined']);

        return response()->json([
            'message' => 'Match declined.',
            'data' => new MatchResource($match->fresh(['founderA.user', 'founderB.user'])),
        ]);
    }

    private function authorizeMatch(Request $request, FounderMatch $match): void
    {
        $profile = FounderProfile::where('user_id', $request->user()->id)->firstOrFail();

        abort_unless(
            in_array($profile->id, [$match->founder_a_id, $match->founder_b_id], true),
            403,
            'You do not have access to this match.'
        );
    }
}
