<?php

namespace App\Console\Commands;

use App\Services\ScopedAgentDataCorrection;
use Illuminate\Console\Command;
use Illuminate\Validation\ValidationException;

class ApplyScopedAgentDataCorrection extends Command
{
    protected $signature = 'wosool:agent-correct-founder
        {--actor= : Exact configured project-scoped Agent identity}
        {--project= : Must be wosool}
        {--slug= : Exact unclaimed founder slug}
        {--field= : Allowlisted URL field}
        {--value= : Replacement HTTPS URL}
        {--expected-updated-at= : Optimistic-lock timestamp from the inspected fixture}
        {--source-url= : HTTPS verification source}
        {--reason= : Audit reason, 20-500 characters}
        {--apply : Commit the one-row correction; otherwise preview only}';

    protected $description = 'Preview or apply one audited, non-production URL correction to an unclaimed founder fixture';

    public function handle(ScopedAgentDataCorrection $correction): int
    {
        try {
            $result = $correction->execute([
                'actor' => (string) $this->option('actor'),
                'project' => (string) $this->option('project'),
                'slug' => (string) $this->option('slug'),
                'field' => (string) $this->option('field'),
                'value' => (string) $this->option('value'),
                'expected_updated_at' => (string) $this->option('expected-updated-at'),
                'source_url' => (string) $this->option('source-url'),
                'reason' => (string) $this->option('reason'),
            ], (bool) $this->option('apply'));
        } catch (ValidationException $exception) {
            $this->error((string) collect($exception->errors())->flatten()->first());

            return self::FAILURE;
        } catch (\Throwable) {
            $this->error('The correction failed and was rolled back.');

            return self::FAILURE;
        }

        $this->line((string) json_encode($result, JSON_UNESCAPED_SLASHES));

        return self::SUCCESS;
    }
}
