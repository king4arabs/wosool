<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScorecardResource;
use App\Models\AdminAction;
use App\Models\Scorecard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScorecardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $scorecards = Scorecard::query()
            ->with(['founderProfile.user'])
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return response()->json([
            'data' => collect($scorecards->items())->map(fn (Scorecard $scorecard) => [
                'id' => $scorecard->id,
                'founder_profile_id' => $scorecard->founder_profile_id,
                'founder_name' => $scorecard->founderProfile?->legal_name ?? $scorecard->founderProfile?->user?->name,
                'aggregate_score' => $scorecard->aggregate_score,
                'momentum' => $scorecard->momentum,
                'growth' => $scorecard->growth,
                'readiness' => $scorecard->readiness,
                'support_delta' => $scorecard->support_delta,
                'updated_at' => $scorecard->updated_at?->toIso8601String(),
            ]),
            'meta' => [
                'total' => $scorecards->total(),
                'current_page' => $scorecards->currentPage(),
                'per_page' => $scorecards->perPage(),
            ],
            'links' => [
                'next' => $scorecards->nextPageUrl(),
                'prev' => $scorecards->previousPageUrl(),
            ],
        ]);
    }

    public function show(Scorecard $scorecard): JsonResponse
    {
        return response()->json([
            'data' => new ScorecardResource($scorecard->load('founderProfile.user')),
        ]);
    }

    public function override(Request $request, Scorecard $scorecard): JsonResponse
    {
        $validated = $request->validate([
            'aggregate_score' => ['nullable', 'integer', 'between:1,100'],
            'momentum' => ['nullable', 'integer', 'between:1,100'],
            'growth' => ['nullable', 'integer', 'between:1,100'],
            'readiness' => ['nullable', 'integer', 'between:1,100'],
            'support_delta' => ['nullable', 'integer', 'between:0,100'],
            'override_note' => ['required', 'string', 'max:1200'],
        ]);

        $before = $scorecard->toArray();

        $scorecard->fill(array_filter([
            'aggregate_score' => $validated['aggregate_score'] ?? null,
            'momentum' => $validated['momentum'] ?? null,
            'growth' => $validated['growth'] ?? null,
            'readiness' => $validated['readiness'] ?? null,
            'support_delta' => $validated['support_delta'] ?? null,
        ], static fn ($v) => $v !== null));

        $logs = is_array($scorecard->historical_logs) ? $scorecard->historical_logs : [];
        $logs[] = [
            'type' => 'admin_override',
            'aggregate_score' => $scorecard->aggregate_score,
            'momentum' => $scorecard->momentum,
            'growth' => $scorecard->growth,
            'readiness' => $scorecard->readiness,
            'support_delta' => $scorecard->support_delta,
            'note' => $validated['override_note'],
            'timestamp' => now()->toIso8601String(),
            'admin_id' => $request->user()->id,
        ];
        $scorecard->historical_logs = $logs;
        $scorecard->save();

        AdminAction::log(
            adminId: $request->user()->id,
            action: 'scorecard.overridden',
            entityType: 'scorecard',
            entityId: $scorecard->id,
            notes: $validated['override_note'],
            beforeState: $before,
            afterState: $scorecard->fresh()->toArray(),
        );

        return response()->json([
            'message' => 'Scorecard override applied.',
            'data' => new ScorecardResource($scorecard->fresh('founderProfile.user')),
        ]);
    }
}
