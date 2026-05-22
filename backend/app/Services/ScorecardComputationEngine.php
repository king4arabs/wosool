<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FounderProfile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ScorecardComputationEngine
{
    private const PROFILE_WEIGHT = 0.20;
    private const MILESTONE_WEIGHT = 0.40;
    private const EVENT_WEIGHT = 0.40;

    public function compute(array $payload): array
    {
        try {
            $profileCompleteness = $this->normalizePercent((float) Arr::get($payload, 'profile_completeness', 0));

            $milestoneLogs = Arr::wrap(Arr::get($payload, 'milestone_velocity_logs', []));
            $milestoneVelocity = $this->computeMilestoneVelocity($milestoneLogs);

            $eventCheckIns = Arr::wrap(Arr::get($payload, 'event_check_ins', []));
            $ecosystemCheckIns = $this->computeEventCheckInsScore($eventCheckIns);

            $weighted = (
                ($profileCompleteness * self::PROFILE_WEIGHT)
                + ($milestoneVelocity * self::MILESTONE_WEIGHT)
                + ($ecosystemCheckIns * self::EVENT_WEIGHT)
            );

            $aggregateScore = $this->clampInt((int) round($weighted), 1, 100);

            $momentum = $this->clampInt((int) round(($milestoneVelocity * 0.70) + ($ecosystemCheckIns * 0.30)), 1, 100);
            $growth = $this->clampInt((int) round(($milestoneVelocity * 0.60) + ($profileCompleteness * 0.40)), 1, 100);
            $readiness = $this->clampInt((int) round(($profileCompleteness * 0.50) + ($ecosystemCheckIns * 0.50)), 1, 100);

            $supportDelta = $this->clampInt((int) round(
                max(0, 100 - $readiness) + max(0, 70 - $momentum) * 0.30
            ), 0, 100);

            return [
                'aggregate_score' => $aggregateScore,
                'momentum' => $momentum,
                'growth' => $growth,
                'readiness' => $readiness,
                'support_delta' => $supportDelta,
                'components' => [
                    'profile_completeness' => $profileCompleteness,
                    'milestone_velocity' => $milestoneVelocity,
                    'ecosystem_event_checkins' => $ecosystemCheckIns,
                ],
                'weights' => [
                    'profile_completeness' => self::PROFILE_WEIGHT,
                    'milestone_velocity_logs' => self::MILESTONE_WEIGHT,
                    'ecosystem_event_checkins' => self::EVENT_WEIGHT,
                ],
            ];
        } catch (Throwable $exception) {
            Log::error('Scorecard computation failed.', [
                'error' => $exception->getMessage(),
            ]);

            return [
                'aggregate_score' => 1,
                'momentum' => 1,
                'growth' => 1,
                'readiness' => 1,
                'support_delta' => 100,
                'components' => [
                    'profile_completeness' => 0,
                    'milestone_velocity' => 0,
                    'ecosystem_event_checkins' => 0,
                ],
                'weights' => [
                    'profile_completeness' => self::PROFILE_WEIGHT,
                    'milestone_velocity_logs' => self::MILESTONE_WEIGHT,
                    'ecosystem_event_checkins' => self::EVENT_WEIGHT,
                ],
            ];
        }
    }

    public function computeForFounderProfile(FounderProfile $profile): array
    {
        try {
            $profile->loadMissing(['companies', 'user', 'scorecard']);

            $profileCompleteness = $this->computeProfileCompletenessScore($profile);

            $milestoneLogs = DB::table('analytics_events')
                ->where('user_id', $profile->user_id)
                ->whereIn('event_name', [
                    'milestone.logged',
                    'milestone.completed',
                    'company.milestone.logged',
                    'company.milestone.completed',
                ])
                ->where('created_at', '>=', now()->subDays(90))
                ->select(['created_at', 'properties'])
                ->get()
                ->map(fn (object $event): array => [
                    'created_at' => (string) $event->created_at,
                    'impact' => (int) Arr::get((array) json_decode((string) $event->properties, true), 'impact', 1),
                ])
                ->all();

            // Backfill signal from stored scorecard logs so older updates still
            // influence recomputation even if no explicit analytics event exists.
            $historicalLogs = is_array($profile->scorecard?->historical_logs) ? $profile->scorecard->historical_logs : [];
            $backfilledMilestones = collect($historicalLogs)
                ->filter(fn ($entry): bool => is_array($entry))
                ->map(function (array $entry): array {
                    $updateText = strtolower((string) Arr::get($entry, 'update_text', ''));
                    $impact = (int) Arr::get($entry, 'impact', 0);

                    if ($impact === 0 && $updateText !== '') {
                        $impact = 3;
                        if (
                            str_contains($updateText, 'million') ||
                            str_contains($updateText, 'مليون') ||
                            str_contains($updateText, 'revenue') ||
                            str_contains($updateText, 'إيراد') ||
                            str_contains($updateText, 'ايراد')
                        ) {
                            $impact += 8;
                        }
                    }

                    return [
                        'created_at' => (string) Arr::get($entry, 'calculated_at', now()->toIso8601String()),
                        'impact' => max(-25, min($impact, 25)),
                    ];
                })
                ->all();

            $milestoneLogs = [...$milestoneLogs, ...$backfilledMilestones];

            $eventCheckIns = DB::table('event_rsvps')
                ->where('user_id', $profile->user_id)
                ->whereIn('status', ['confirmed', 'attended'])
                ->where('created_at', '>=', now()->subDays(180))
                ->select(['created_at', 'status'])
                ->get()
                ->map(fn (object $rsvp): array => [
                    'created_at' => (string) $rsvp->created_at,
                    'status' => (string) $rsvp->status,
                ])
                ->all();

            return $this->compute([
                'profile_completeness' => $profileCompleteness,
                'milestone_velocity_logs' => $milestoneLogs,
                'event_check_ins' => $eventCheckIns,
            ]);
        } catch (Throwable $exception) {
            Log::warning('Founder scorecard input generation failed, falling back to safe minimum.', [
                'founder_profile_id' => $profile->id,
                'error' => $exception->getMessage(),
            ]);

            return $this->compute([
                'profile_completeness' => 0,
                'milestone_velocity_logs' => [],
                'event_check_ins' => [],
            ]);
        }
    }

    private function computeProfileCompletenessScore(FounderProfile $profile): int
    {
        $attrs = $profile->getAttributes();
        $legacyOrNewName = (string) (
            $attrs['legal_name']
            ?? $attrs['name']
            ?? $attrs['tagline']
            ?? ''
        );
        $legacyOrNewTitle = (string) (
            $attrs['title']
            ?? ''
        );
        $legacyOrNewBioSummary = (string) (
            $attrs['biography_summary']
            ?? $attrs['bio']
            ?? ''
        );
        $legacyOrNewProfileMarkdown = (string) (
            $attrs['profile_markdown']
            ?? $attrs['bio']
            ?? ''
        );

        $skillsTags = $attrs['skills_tags'] ?? $attrs['skills'] ?? [];
        if (is_string($skillsTags)) {
            $decoded = json_decode($skillsTags, true);
            $skillsTags = is_array($decoded) ? $decoded : [];
        }

        $fields = [
            $legacyOrNewName,
            $legacyOrNewTitle,
            $legacyOrNewBioSummary,
            $legacyOrNewProfileMarkdown,
        ];

        $completed = collect($fields)->filter(fn ($value): bool => filled($value))->count();
        $skillsScore = is_array($skillsTags) && count($skillsTags) > 0 ? 1 : 0;
        $vettedRaw = $attrs['vetted_status'] ?? $attrs['is_verified'] ?? false;
        $vettedScore = (bool) $vettedRaw ? 1 : 0;
        $companyScore = $profile->companies->isNotEmpty() ? 1 : 0;

        $totalAvailable = count($fields) + 3;
        $raw = (($completed + $skillsScore + $vettedScore + $companyScore) / $totalAvailable) * 100;

        return $this->normalizePercent($raw);
    }

    private function computeMilestoneVelocity(array $milestoneLogs): int
    {
        if ($milestoneLogs === []) {
            return 0;
        }

        $points = 0;

        foreach ($milestoneLogs as $log) {
            $impact = (int) Arr::get((array) $log, 'impact', 1);
            $points += $this->clampInt($impact, -25, 25);
        }

        // Signed mapping: negative milestone flow drags score below 50,
        // positive flow pushes it above 50, capped safely between 0..100.
        $velocity = 50 + (($points / 120) * 50);

        return $this->normalizePercent($velocity);
    }

    private function computeEventCheckInsScore(array $eventCheckIns): int
    {
        if ($eventCheckIns === []) {
            return 0;
        }

        $validStatuses = ['confirmed', 'attended'];
        $count = 0;

        foreach ($eventCheckIns as $checkIn) {
            $status = strtolower((string) Arr::get((array) $checkIn, 'status', 'confirmed'));
            if (in_array($status, $validStatuses, true)) {
                $count++;
            }
        }

        // 10 relevant check-ins over the period maps to 100.
        return $this->normalizePercent(($count / 10) * 100);
    }

    private function normalizePercent(float $value): int
    {
        return $this->clampInt((int) round($value), 0, 100);
    }

    private function clampInt(int $value, int $min, int $max): int
    {
        return max($min, min($value, $max));
    }
}
