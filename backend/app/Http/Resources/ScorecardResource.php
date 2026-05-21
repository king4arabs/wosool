<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScorecardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $logs = is_array($this->historical_logs) ? $this->historical_logs : [];
        $latestLog = $this->latestLog($logs);
        $alerts = $this->dynamicAlerts();

        return [
            'id' => $this->id,
            'founder_profile_id' => $this->founder_profile_id,
            'aggregate_score' => (int) ($this->aggregate_score ?? 0),
            // Flat aliases used by dashboard clients that bind metrics directly.
            'momentum_score' => (int) ($this->momentum ?? 0),
            'fundraising_score' => (int) ($this->readiness ?? 0),
            'growth_score' => (int) ($this->growth ?? 0),
            'support_need_score' => (int) ($this->support_delta ?? 0),
            // Latest free-text operational update derived from historical logs when present.
            'latest_update_text' => $this->latestUpdateText($latestLog),
            'tracking' => [
                'momentum' => (int) ($this->momentum ?? 0),
                'growth' => (int) ($this->growth ?? 0),
                'readiness' => (int) ($this->readiness ?? 0),
                'support_delta' => (int) ($this->support_delta ?? 0),
            ],
            'trends' => [
                'score_direction' => $this->trendDirection((int) ($this->aggregate_score ?? 0), (int) data_get($latestLog, 'aggregate_score', 0)),
                'momentum_direction' => $this->trendDirection((int) ($this->momentum ?? 0), (int) data_get($latestLog, 'momentum', 0)),
                'growth_direction' => $this->trendDirection((int) ($this->growth ?? 0), (int) data_get($latestLog, 'growth', 0)),
                'readiness_direction' => $this->trendDirection((int) ($this->readiness ?? 0), (int) data_get($latestLog, 'readiness', 0)),
                'support_delta_direction' => $this->inverseTrendDirection((int) ($this->support_delta ?? 0), (int) data_get($latestLog, 'support_delta', 0)),
            ],
            'insights' => [
                'dynamic_alerts' => $alerts,
                'automated_action_suggestions' => $this->actionSuggestions($alerts),
            ],
            'historical_logs' => $logs,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    private function latestLog(array $logs): array
    {
        if ($logs === []) {
            return [];
        }

        $last = end($logs);

        return is_array($last) ? $last : [];
    }

    private function latestUpdateText(array $latestLog): ?string
    {
        $candidate = data_get($latestLog, 'update_text')
            ?? data_get($latestLog, 'latest_update_text')
            ?? data_get($latestLog, 'notes')
            ?? data_get($latestLog, 'summary');

        return is_string($candidate) && trim($candidate) !== '' ? trim($candidate) : null;
    }

    private function trendDirection(int $current, int $previous): string
    {
        if ($current > $previous) {
            return 'up';
        }

        if ($current < $previous) {
            return 'down';
        }

        return 'flat';
    }

    private function inverseTrendDirection(int $current, int $previous): string
    {
        if ($current < $previous) {
            return 'up';
        }

        if ($current > $previous) {
            return 'down';
        }

        return 'flat';
    }

    private function dynamicAlerts(): array
    {
        $alerts = [];

        if ((int) $this->aggregate_score < 45) {
            $alerts[] = [
                'level' => 'critical',
                'code' => 'LOW_AGGREGATE_SCORE',
                'message' => 'Aggregate score is below stable operating threshold.',
            ];
        }

        if ((int) $this->momentum < 50) {
            $alerts[] = [
                'level' => 'warning',
                'code' => 'MOMENTUM_DRIFT',
                'message' => 'Milestone execution momentum is lagging.',
            ];
        }

        if ((int) $this->readiness < 60) {
            $alerts[] = [
                'level' => 'warning',
                'code' => 'READINESS_GAP',
                'message' => 'Readiness score indicates missing operational elements.',
            ];
        }

        if ((int) $this->support_delta > 55) {
            $alerts[] = [
                'level' => 'info',
                'code' => 'SUPPORT_ALLOCATION_RECOMMENDED',
                'message' => 'Founder likely needs structured ecosystem support allocation.',
            ];
        }

        return $alerts;
    }

    private function actionSuggestions(array $alerts): array
    {
        if ($alerts === []) {
            return [[
                'key' => 'maintain_consistency',
                'label' => 'Maintain current execution cadence',
                'priority' => 'normal',
            ]];
        }

        $map = [
            'LOW_AGGREGATE_SCORE' => [
                'key' => 'scorecard_rebuild_sprint',
                'label' => 'Run a 14-day score recovery sprint with milestone checkpoints',
                'priority' => 'high',
            ],
            'MOMENTUM_DRIFT' => [
                'key' => 'milestone_velocity_push',
                'label' => 'Log at least 2 measurable milestones this week',
                'priority' => 'high',
            ],
            'READINESS_GAP' => [
                'key' => 'profile_and_ops_hardening',
                'label' => 'Complete profile and operational readiness fields',
                'priority' => 'medium',
            ],
            'SUPPORT_ALLOCATION_RECOMMENDED' => [
                'key' => 'request_support_channel',
                'label' => 'Trigger mentor/partner support routing for targeted unblock',
                'priority' => 'medium',
            ],
        ];

        $suggestions = [];

        foreach ($alerts as $alert) {
            $code = (string) ($alert['code'] ?? '');
            if ($code !== '' && isset($map[$code])) {
                $suggestions[] = $map[$code];
            }
        }

        return array_values(array_unique($suggestions, SORT_REGULAR));
    }
}
