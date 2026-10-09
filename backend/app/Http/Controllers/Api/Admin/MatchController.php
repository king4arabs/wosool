<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\FounderMatch;
use App\Models\FounderProfile;
use App\Models\AdminAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MatchController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'founder_a_id' => ['required', 'integer', Rule::exists('founder_profiles', 'id')->where('status', 'active')],
            'founder_b_id' => ['required', 'integer', 'different:founder_a_id', Rule::exists('founder_profiles', 'id')->where('status', 'active')],
            'reason' => ['required', 'string', 'min:10', 'max:2000'],
        ]);
        $match = DB::transaction(function () use ($data, $request) {
            $ids = [(int) $data['founder_a_id'], (int) $data['founder_b_id']];
            sort($ids);
            FounderProfile::whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get();
            abort_if(FounderMatch::whereIn('founder_a_id', $ids)->whereIn('founder_b_id', $ids)
                ->whereIn('status', ['suggested', 'accepted', 'connected'])->exists(), 409, 'An active match already exists for these founders.');
            $match = FounderMatch::create([
                'founder_a_id' => $ids[0], 'founder_b_id' => $ids[1],
                'match_reasons' => [$data['reason']], 'status' => 'suggested',
                'is_ai_generated' => false, 'match_score' => 0,
            ]);
            AdminAction::log($request->user()->id, 'match.suggested', 'match', $match->id, $data['reason'], null, $match->toArray());
            return $match;
        });
        return response()->json(['data' => new MatchResource($match->load(['founderA.user', 'founderA.companies', 'founderB.user', 'founderB.companies']))], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $matches = FounderMatch::query()
            ->with(['founderA.user', 'founderA.companies', 'founderB.user', 'founderB.companies'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->latest()
            ->get();

        return response()->json([
            'data' => MatchResource::collection($matches),
            'meta' => [
                'total' => $matches->count(),
                'suggested' => $matches->where('status', 'suggested')->count(),
                'accepted' => $matches->where('status', 'accepted')->count(),
                'connected' => $matches->where('status', 'connected')->count(),
            ],
        ]);
    }
}
