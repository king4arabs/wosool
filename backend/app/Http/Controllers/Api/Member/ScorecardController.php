<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScorecardResource;
use App\Models\AnalyticsEvent;
use App\Models\FounderProfile;
use App\Models\Scorecard;
use App\Services\MilestoneAiScoringService;
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

    public function submitUpdate(
        Request $request,
        ScorecardComputationEngine $engine,
        MilestoneAiScoringService $aiScoring
    ): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:220'],
            'update_text' => ['required', 'string', 'max:12000'],
            'sector' => ['nullable', 'string', 'max:80'],
            'priority' => ['nullable', 'in:normal,urgent'],
        ]);

        $profile = FounderProfile::with('scorecard')
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $profile) {
            return response()->json(['message' => __('messages.scorecard.founder_not_found')], 404);
        }

        $currentContext = [
            'aggregate_score' => (int) ($profile->scorecard?->aggregate_score ?? 0),
            'momentum' => (int) ($profile->scorecard?->momentum ?? 0),
            'growth' => (int) ($profile->scorecard?->growth ?? 0),
            'readiness' => (int) ($profile->scorecard?->readiness ?? 0),
            'support_delta' => (int) ($profile->scorecard?->support_delta ?? 0),
        ];

        $aiMetricResult = $aiScoring->scoreMetrics($validated['update_text'], $currentContext);
        $aiImpactResult = $aiMetricResult ? null : $aiScoring->score($validated['update_text']);

        $impact = $aiMetricResult['impact']
            ?? $aiImpactResult['impact']
            ?? $this->estimateMilestoneImpactFromText($validated['update_text']);
        $impactDirection = $aiMetricResult['direction']
            ?? $aiImpactResult['direction']
            ?? ($impact >= 0 ? 'positive' : 'negative');

        // Track a normalized milestone signal before recomputing so the new
        // update affects momentum/growth/readiness immediately.
        AnalyticsEvent::track(
            eventName: 'milestone.logged',
            userId: $request->user()->id,
            entityType: 'founder_profile',
            entityId: $profile->id,
            properties: [
                'impact' => $impact,
                'impact_direction' => $impactDirection,
                'impact_source' => $aiMetricResult['source'] ?? $aiImpactResult['source'] ?? 'heuristic',
                'impact_confidence' => $aiMetricResult['confidence'] ?? $aiImpactResult['confidence'] ?? null,
                'impact_reason' => $aiMetricResult['reason'] ?? $aiImpactResult['reason'] ?? null,
                'title' => $validated['title'] ?? null,
                'sector' => $validated['sector'] ?? null,
                'priority' => $validated['priority'] ?? 'normal',
            ],
        );

        $computed = $aiMetricResult
            ? [
                'aggregate_score' => (int) $aiMetricResult['aggregate_score'],
                'momentum' => (int) $aiMetricResult['momentum'],
                'growth' => (int) $aiMetricResult['growth'],
                'readiness' => (int) $aiMetricResult['readiness'],
                'support_delta' => (int) $aiMetricResult['support_delta'],
            ]
            : $engine->computeForFounderProfile($profile);

        $scorecard = DB::transaction(function () use ($profile, $computed, $validated, $aiMetricResult): Scorecard {
            $scorecard = $profile->scorecard ?? new Scorecard(['founder_profile_id' => $profile->id]);
            $currentLogs = is_array($scorecard->historical_logs) ? $scorecard->historical_logs : [];

            $currentLogs[] = [
                'label' => now()->format('M Y'),
                'title' => $validated['title'] ?? null,
                'update_text' => $validated['update_text'],
                'sector' => $validated['sector'] ?? null,
                'priority' => $validated['priority'] ?? 'normal',
                'aggregate_score' => $computed['aggregate_score'],
                'momentum' => $computed['momentum'],
                'growth' => $computed['growth'],
                'readiness' => $computed['readiness'],
                'support_delta' => $computed['support_delta'],
                'calculated_at' => now()->toIso8601String(),
                'scoring_source' => $aiMetricResult ? 'openai' : 'engine',
                'ai_reason' => $aiMetricResult['reason'] ?? null,
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
            eventName: 'scorecard_update_submitted',
            userId: $request->user()->id,
            entityType: 'scorecard',
            entityId: $scorecard->id,
            properties: [
                'founder_profile_id' => $profile->id,
                'sector' => $validated['sector'] ?? null,
                'priority' => $validated['priority'] ?? 'normal',
                'score_source' => $aiMetricResult ? 'openai' : 'engine',
            ],
        );

        return response()->json([
            'message' => 'Scorecard update submitted.',
            'data' => new ScorecardResource($scorecard),
        ], 201);
    }

    private function estimateMilestoneImpactFromText(string $text): int
    {
        $normalized = mb_strtolower(trim($text));
        if ($normalized === '') {
            return 0;
        }

        $impact = 3;

        // Revenue/funding/traction keywords increase milestone importance.
        $highSignalKeywords = [
            'إيراد', 'ايراد', 'revenue', 'mrr', 'arr',
            'استثمار', 'funding', 'seed', 'series',
            'عميل', 'customers', 'enterprise',
            'شراكة', 'partnership',
            'توظيف', 'hiring',
            'نمو', 'growth',
        ];

        foreach ($highSignalKeywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                $impact += 2;
            }
        }

        $negativeKeywords = [
            'تراجع', 'انخفاض', 'انخفض', 'خسرنا', 'فقدنا', 'تأخر', 'تأجيل',
            'خروج', 'انسحاب', 'تعثر', 'ضغط سيولة', 'سيولة', 'لا نزال',
            'decline', 'decrease', 'drop', 'lost', 'delay', 'postpone',
            'churn', 'runway', 'burn', 'blocked', 'missed',
        ];
        $negativeHits = 0;
        foreach ($negativeKeywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                $negativeHits++;
            }
        }

        // Numeric signals: deals/revenue/headcount usually include numbers.
        preg_match_all('/\d+([.,]\d+)?/u', $normalized, $matches);
        $numberCount = count($matches[0] ?? []);
        if ($numberCount >= 1) {
            $impact += min(8, $numberCount * 2);
        }

        // Extra boost for clearly large-value updates.
        if (
            str_contains($normalized, 'مليون') ||
            str_contains($normalized, 'million') ||
            str_contains($normalized, 'ريال') ||
            str_contains($normalized, 'sar') ||
            str_contains($normalized, '$')
        ) {
            $impact += 4;
        }

        if ($negativeHits >= 2) {
            // Strongly negative updates should materially lower score components.
            $impact = -max(8, min(25, $impact + ($negativeHits * 2)));
        }

        return max(-25, min(25, $impact));
    }

    public function shareInvestorProfile(Request $request): JsonResponse
    {
        $profile = FounderProfile::with('scorecard')
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $profile?->scorecard) {
            return response()->json(['message' => __('messages.scorecard.not_found')], 404);
        }

        AnalyticsEvent::track(
            eventName: 'scorecard_share_investor_profile',
            userId: $request->user()->id,
            entityType: 'scorecard',
            entityId: $profile->scorecard->id,
            properties: [
                'founder_profile_id' => $profile->id,
                'aggregate_score' => $profile->scorecard->aggregate_score,
            ],
        );

        return response()->json([
            'message' => 'Investor profile share action recorded.',
            'data' => [
                'status' => 'queued',
                'scorecard_id' => $profile->scorecard->id,
            ],
        ]);
    }
}
