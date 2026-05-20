<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScorecardResource;
use App\Models\AnalyticsEvent;
use App\Models\FounderProfile;
use App\Models\Scorecard;
use App\Services\ScorecardComputationEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScorecardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = FounderProfile::with('scorecard')
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $profile?->scorecard) {
            return response()->json(['message' => __('messages.scorecard.not_found')], 404);
        }

        return response()->json([
            'data' => new ScorecardResource($profile->scorecard),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $profile = FounderProfile::with('scorecard')
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $profile?->scorecard) {
            return response()->json(['data' => []]);
        }

        $logs = is_array($profile->scorecard->historical_logs) ? $profile->scorecard->historical_logs : [];

        $history = collect($logs)
            ->filter(fn ($entry): bool => is_array($entry))
            ->map(function (array $entry): array {
                return [
                    'label' => (string) ($entry['label'] ?? now()->format('M Y')),
                    'aggregate_score' => (int) ($entry['aggregate_score'] ?? 0),
                    'calculated_at' => $entry['calculated_at'] ?? null,
                ];
            })
            ->values()
            ->all();

        if ($history === []) {
            $history[] = [
                'label' => now()->format('M Y'),
                'aggregate_score' => (int) $profile->scorecard->aggregate_score,
                'calculated_at' => $profile->scorecard->updated_at?->toIso8601String(),
            ];
        }

        return response()->json([
            'data' => $history,
        ]);
    }

    public function recalculate(Request $request, ScorecardComputationEngine $engine): JsonResponse
    {
        $profile = FounderProfile::with('scorecard')
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $profile) {
            return response()->json(['message' => __('messages.scorecard.founder_not_found')], 404);
        }

        $computed = $engine->computeForFounderProfile($profile);

        $scorecard = DB::transaction(function () use ($profile, $computed): Scorecard {
            $scorecard = $profile->scorecard ?? new Scorecard(['founder_profile_id' => $profile->id]);

            $currentLogs = is_array($scorecard->historical_logs) ? $scorecard->historical_logs : [];
            $currentLogs[] = [
                'label' => now()->format('M Y'),
                'aggregate_score' => $computed['aggregate_score'],
                'momentum' => $computed['momentum'],
                'growth' => $computed['growth'],
                'readiness' => $computed['readiness'],
                'support_delta' => $computed['support_delta'],
                'calculated_at' => now()->toIso8601String(),
            ];

            $scorecard->fill([
                'aggregate_score' => $computed['aggregate_score'],
                'momentum' => $computed['momentum'],
                'growth' => $computed['growth'],
                'readiness' => $computed['readiness'],
                'support_delta' => $computed['support_delta'],
                'historical_logs' => $currentLogs,
            ]);

            $scorecard->save();

            return $scorecard->fresh();
        });

        AnalyticsEvent::track(
            eventName: 'scorecard.recalculated',
            userId: $request->user()->id,
            entityType: 'scorecard',
            entityId: $scorecard->id,
            properties: [
                'founder_profile_id' => $profile->id,
                'aggregate_score' => $scorecard->aggregate_score,
            ],
        );

        return response()->json([
            'message' => __('messages.scorecard.recalculated'),
            'data' => new ScorecardResource($scorecard),
        ]);
    }
}
