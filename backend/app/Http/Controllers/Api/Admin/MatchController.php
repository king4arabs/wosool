<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\FounderMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchController extends Controller
{
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
