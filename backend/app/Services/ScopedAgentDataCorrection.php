<?php

namespace App\Services;

use App\Models\FounderProfile;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ScopedAgentDataCorrection
{
    private const PROJECT = 'wosool';

    /** @var array<string, int> */
    private const URL_FIELDS = [
        'linkedin_url' => 255,
        'twitter_url' => 255,
        'website_url' => 255,
    ];

    /**
     * @param  array{actor:string,project:string,slug:string,field:string,value:string,expected_updated_at:string,source_url:string,reason:string}  $input
     * @return array{request_id:string,status:string,project:string,target:string,field:string,would_change:bool}
     */
    public function execute(array $input, bool $apply): array
    {
        $this->authorize($input);
        $field = $input['field'];
        $value = $this->validateHttpsUrl($input['value'], 'value', self::URL_FIELDS[$field] ?? 0);
        $sourceUrl = $this->validateHttpsUrl($input['source_url'], 'source_url', 2048);
        $reason = trim($input['reason']);

        if (mb_strlen($reason) < 20 || mb_strlen($reason) > 500) {
            throw ValidationException::withMessages(['reason' => 'Reason must contain 20 to 500 characters.']);
        }

        $expectedUpdatedAt = $this->parseDate($input['expected_updated_at'], 'expected_updated_at');
        $requestId = (string) Str::uuid();

        return DB::transaction(function () use ($input, $apply, $field, $value, $sourceUrl, $reason, $expectedUpdatedAt, $requestId): array {
            $founder = FounderProfile::query()->where('slug', $input['slug'])->lockForUpdate()->first();

            if (! $founder || $founder->user_id !== null || $founder->claimed_at !== null) {
                throw ValidationException::withMessages(['slug' => 'Only an existing unclaimed founder fixture can be corrected.']);
            }

            if (! $founder->updated_at || ! $founder->updated_at->equalTo($expectedUpdatedAt)) {
                throw ValidationException::withMessages(['expected_updated_at' => 'The fixture changed after preview; inspect it again.']);
            }

            $before = (string) ($founder->getAttribute($field) ?? '');
            $wouldChange = ! hash_equals($before, $value);

            if ($apply && $wouldChange) {
                $founder->forceFill([$field => $value])->save();
            }

            DB::table('data_operation_audits')->insert([
                'request_id' => $requestId,
                'project' => self::PROJECT,
                'actor_id' => $input['actor'],
                'operation' => 'correct_unclaimed_founder_url',
                'status' => $apply ? ($wouldChange ? 'applied' : 'no_change') : 'previewed',
                'target_type' => FounderProfile::class,
                'target_id' => $founder->getKey(),
                'target_key' => $founder->slug,
                'field' => $field,
                'source_url' => $sourceUrl,
                'reason' => $reason,
                'before_hash' => hash('sha256', $before),
                'after_hash' => hash('sha256', $value),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'request_id' => $requestId,
                'status' => $apply ? ($wouldChange ? 'applied' : 'no_change') : 'previewed',
                'project' => self::PROJECT,
                'target' => $founder->slug,
                'field' => $field,
                'would_change' => $wouldChange,
            ];
        });
    }

    /** @param array{actor:string,project:string,field:string} $input */
    private function authorize(array $input): void
    {
        if (! app()->environment(['local', 'testing']) || ! config('data_operations.agent.enabled')) {
            throw ValidationException::withMessages(['environment' => 'Scoped data corrections are disabled; explicit local or testing enablement is required.']);
        }

        $configuredIdentity = config('data_operations.agent.identity');
        if (! is_string($configuredIdentity) || $configuredIdentity === '' || ! hash_equals($configuredIdentity, $input['actor'])) {
            throw ValidationException::withMessages(['actor' => 'The scoped Agent identity is missing or does not match.']);
        }

        if ($input['project'] !== self::PROJECT) {
            throw ValidationException::withMessages(['project' => 'Cross-project data operations are denied.']);
        }

        $expiresAt = $this->parseDate((string) config('data_operations.agent.expires_at'), 'expires_at');
        if (! now()->lt($expiresAt)) {
            throw ValidationException::withMessages(['expires_at' => 'The scoped Agent authorization has expired.']);
        }

        if (! array_key_exists($input['field'], self::URL_FIELDS)) {
            throw ValidationException::withMessages(['field' => 'Only allowlisted public URL corrections are permitted.']);
        }
    }

    private function validateHttpsUrl(string $value, string $field, int $max): string
    {
        $value = trim($value);
        if ($max < 1 || mb_strlen($value) > $max || filter_var($value, FILTER_VALIDATE_URL) === false) {
            throw ValidationException::withMessages([$field => 'A valid bounded HTTPS URL is required.']);
        }

        $parts = parse_url($value);
        if (($parts['scheme'] ?? null) !== 'https' || isset($parts['user']) || isset($parts['pass']) || ! isset($parts['host'])) {
            throw ValidationException::withMessages([$field => 'A credential-free HTTPS URL is required.']);
        }

        return $value;
    }

    private function parseDate(string $value, string $field): CarbonImmutable
    {
        try {
            return CarbonImmutable::parse($value);
        } catch (\Throwable) {
            throw ValidationException::withMessages([$field => 'A valid timestamp is required.']);
        }
    }
}
