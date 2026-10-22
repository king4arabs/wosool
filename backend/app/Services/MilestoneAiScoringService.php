<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class MilestoneAiScoringService
{
    public function score(string $text): ?array
    {
        $apiKey = (string) config('services.openai.api_key');
        $baseUrl = (string) config('services.openai.base_url', 'https://api.openai.com/v1');
        $model = (string) config('services.openai.model', 'gpt-5.4-mini');
        $timeout = (int) config('services.openai.request_timeout', 30);

        if ($apiKey === '') {
            return null;
        }

        $prompt = <<<PROMPT
You are scoring a startup milestone update.
Return ONLY valid JSON with this exact shape:
{
  "impact": integer from -25 to 25,
  "direction": "positive" | "negative" | "neutral",
  "confidence": number from 0 to 1,
  "reason": short string
}

Scoring guidance:
- Strong negative business update (lost customers, MRR decline, delays, runway pressure) => negative impact.
- Strong positive business update (revenue growth, signed customers, hiring key talent, funding progress) => positive impact.
- Neutral updates => near 0.
PROMPT;

        try {
            $response = Http::baseUrl($baseUrl)
                ->withToken($apiKey)
                ->timeout($timeout)
                ->post('/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $prompt],
                        ['role' => 'user', 'content' => $text],
                    ],
                    'temperature' => 0.1,
                    'response_format' => ['type' => 'json_object'],
                ]);

            if (! $response->ok()) {
                Log::warning('Milestone AI scoring failed at provider level.', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return null;
            }

            $rawContent = (string) data_get($response->json(), 'choices.0.message.content', '');
            $parsed = json_decode($rawContent, true);
            if (! is_array($parsed)) {
                return null;
            }

            $impact = (int) ($parsed['impact'] ?? 0);
            $impact = max(-25, min(25, $impact));

            $direction = (string) ($parsed['direction'] ?? ($impact > 0 ? 'positive' : ($impact < 0 ? 'negative' : 'neutral')));
            if (! in_array($direction, ['positive', 'negative', 'neutral'], true)) {
                $direction = $impact > 0 ? 'positive' : ($impact < 0 ? 'negative' : 'neutral');
            }

            return [
                'impact' => $impact,
                'direction' => $direction,
                'confidence' => max(0.0, min(1.0, (float) ($parsed['confidence'] ?? 0.6))),
                'reason' => (string) ($parsed['reason'] ?? ''),
                'source' => 'openai',
            ];
        } catch (Throwable $exception) {
            Log::warning('Milestone AI scoring request failed.', [
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    public function scoreMetrics(string $text, array $context = []): ?array
    {
        $apiKey = (string) config('services.openai.api_key');
        $baseUrl = (string) config('services.openai.base_url', 'https://api.openai.com/v1');
        $model = (string) config('services.openai.model', 'gpt-5.4-mini');
        $timeout = (int) config('services.openai.request_timeout', 30);

        if ($apiKey === '') {
            return null;
        }

        $contextJson = json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $prompt = <<<PROMPT
You are an AI scoring engine for startup performance scorecards.
Given milestone update text and current score context, return ONLY valid JSON with exact shape:
{
  "aggregate_score": 0-100 integer,
  "momentum": 0-100 integer,
  "growth": 0-100 integer,
  "readiness": 0-100 integer,
  "support_delta": 0-100 integer,
  "impact": -25 to 25 integer,
  "direction": "positive" | "negative" | "neutral",
  "confidence": 0 to 1 number,
  "reason": "short explanation"
}

Rules:
- If update describes losses, delays, churn, declining MRR, postponed fundraising => reduce momentum/growth/readiness and raise support_delta.
- If update describes strong revenue growth, customer wins, partnerships, key hiring, fundraising progress => increase momentum/growth/readiness and lower support_delta.
- Keep changes realistic but noticeable.
- aggregate_score should reflect the four component metrics.
PROMPT;

        try {
            $response = Http::baseUrl($baseUrl)
                ->withToken($apiKey)
                ->timeout($timeout)
                ->post('/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $prompt],
                        ['role' => 'user', 'content' => "Current context: {$contextJson}\n\nMilestone update: {$text}"],
                    ],
                    'temperature' => 0.1,
                    'response_format' => ['type' => 'json_object'],
                ]);

            if (! $response->ok()) {
                Log::warning('Milestone AI metric scoring failed at provider level.', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return null;
            }

            $rawContent = (string) data_get($response->json(), 'choices.0.message.content', '');
            $parsed = json_decode($rawContent, true);
            if (! is_array($parsed)) {
                return null;
            }

            $momentum = $this->clamp((int) ($parsed['momentum'] ?? 0), 0, 100);
            $growth = $this->clamp((int) ($parsed['growth'] ?? 0), 0, 100);
            $readiness = $this->clamp((int) ($parsed['readiness'] ?? 0), 0, 100);
            $supportDelta = $this->clamp((int) ($parsed['support_delta'] ?? 0), 0, 100);
            $aggregate = $this->clamp((int) ($parsed['aggregate_score'] ?? (int) round(($momentum + $growth + $readiness + (100 - $supportDelta)) / 4)), 0, 100);
            $impact = $this->clamp((int) ($parsed['impact'] ?? 0), -25, 25);

            $direction = (string) ($parsed['direction'] ?? ($impact > 0 ? 'positive' : ($impact < 0 ? 'negative' : 'neutral')));
            if (! in_array($direction, ['positive', 'negative', 'neutral'], true)) {
                $direction = $impact > 0 ? 'positive' : ($impact < 0 ? 'negative' : 'neutral');
            }

            return [
                'aggregate_score' => $aggregate,
                'momentum' => $momentum,
                'growth' => $growth,
                'readiness' => $readiness,
                'support_delta' => $supportDelta,
                'impact' => $impact,
                'direction' => $direction,
                'confidence' => max(0.0, min(1.0, (float) ($parsed['confidence'] ?? 0.6))),
                'reason' => (string) ($parsed['reason'] ?? ''),
                'source' => 'openai',
            ];
        } catch (Throwable $exception) {
            Log::warning('Milestone AI metric scoring request failed.', [
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function clamp(int $value, int $min, int $max): int
    {
        return max($min, min($value, $max));
    }
}
