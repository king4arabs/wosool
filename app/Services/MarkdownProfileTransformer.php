<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Throwable;

class MarkdownProfileTransformer
{
    public function transform(array $input): string
    {
        try {
            $ventureMetadata = [
                '- Legal Name: '.$this->safeText(Arr::get($input, 'legal_name', 'N/A')),
                '- Domain URL: '.$this->safeText(Arr::get($input, 'domain_url', 'N/A')),
                '- Operational Stage: '.$this->safeText(Arr::get($input, 'operational_stage', 'N/A')),
                '- Sector: '.$this->safeText(Arr::get($input, 'sector', 'N/A')),
                '- HQ Location: '.$this->safeText(Arr::get($input, 'hq_location', 'N/A')),
            ];

            $architecture = [
                '- Founder Title: '.$this->safeText(Arr::get($input, 'title', 'N/A')),
                '- Biography Summary: '.$this->safeText(Arr::get($input, 'biography_summary', 'N/A')),
                '- Core Value Statement: '.$this->safeText(Arr::get($input, 'value_statement', 'N/A')),
                '- Problem Statement: '.$this->safeText(Arr::get($input, 'problem_statement', 'N/A')),
            ];

            $techTokens = $this->toBulletList(Arr::get($input, 'tech_stack_tokens', []), 'No technical dependencies logged yet.');
            $milestones = $this->toMilestoneList(Arr::get($input, 'milestone_logs', []));
            $pipelineIntegrations = $this->toBulletList(Arr::get($input, 'open_pipeline_integrations', []), 'No open integrations recorded.');

            $sections = [
                '### 1. VENTURE METADATA LAYER',
                implode("\n", $ventureMetadata),
                '',
                '### 2. CORE ARCHITECTURAL & VALUE STATEMENT',
                implode("\n", $architecture),
                '',
                '### 3. TECHNICAL STACK & DEPENDENCY TOKENS',
                $techTokens,
                '',
                '### 4. COMPLETED MILESTONES & PERFORMANCE LOGS',
                $milestones,
                '',
                '### 5. OPEN PIPELINE INTEGRATIONS',
                $pipelineIntegrations,
            ];

            return trim(implode("\n", $sections))."\n";
        } catch (Throwable) {
            return "### 1. VENTURE METADATA LAYER\n- N/A\n\n### 2. CORE ARCHITECTURAL & VALUE STATEMENT\n- N/A\n\n### 3. TECHNICAL STACK & DEPENDENCY TOKENS\n- N/A\n\n### 4. COMPLETED MILESTONES & PERFORMANCE LOGS\n- N/A\n\n### 5. OPEN PIPELINE INTEGRATIONS\n- N/A\n";
        }
    }

    private function toBulletList(mixed $items, string $fallback): string
    {
        $values = Arr::wrap($items);
        $lines = [];

        foreach ($values as $item) {
            if (is_array($item)) {
                $item = implode(' | ', array_map(fn ($v): string => $this->safeText($v), $item));
            }

            $normalized = $this->safeText($item);
            if ($normalized !== '') {
                $lines[] = '- '.$normalized;
            }
        }

        if ($lines === []) {
            return '- '.$fallback;
        }

        return implode("\n", $lines);
    }

    private function toMilestoneList(mixed $logs): string
    {
        $entries = Arr::wrap($logs);
        $lines = [];

        foreach ($entries as $entry) {
            if (is_array($entry)) {
                $name = $this->safeText(Arr::get($entry, 'name', Arr::get($entry, 'title', 'Milestone')));
                $status = Str::upper($this->safeText(Arr::get($entry, 'status', 'COMPLETED')));
                $metric = $this->safeText(Arr::get($entry, 'metric', Arr::get($entry, 'impact', 'N/A')));
                $completedAt = $this->safeText(Arr::get($entry, 'completed_at', Arr::get($entry, 'date', 'N/A')));

                $lines[] = sprintf('- %s | Status: %s | Metric: %s | Date: %s', $name, $status, $metric, $completedAt);

                continue;
            }

            $text = $this->safeText($entry);
            if ($text !== '') {
                $lines[] = '- '.$text;
            }
        }

        if ($lines === []) {
            return '- No milestone logs recorded yet.';
        }

        return implode("\n", $lines);
    }

    private function safeText(mixed $value): string
    {
        $text = trim((string) $value);
        if ($text === '') {
            return '';
        }

        $text = strip_tags($text);
        $text = preg_replace('/\s+/u', ' ', $text) ?? '';

        return str_replace(["\r", "\n"], ' ', $text);
    }
}
