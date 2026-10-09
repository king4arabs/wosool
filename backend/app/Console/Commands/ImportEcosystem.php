<?php

namespace App\Console\Commands;

use App\Models\EcosystemRecord;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ImportEcosystem extends Command
{
    protected $signature = 'wosool:import-ecosystem {file?} {--apply} {--backup-verified} {--staging-verified}';

    protected $description = 'Preview, validate and idempotently import researched public records. Never edits applicant or member data.';

    public function handle(): int
    {
        if ($this->option('apply') && app()->isProduction() && (! $this->option('backup-verified') || ! $this->option('staging-verified'))) {
            $this->error('Production import requires verified recovery and staging checks.');

            return self::FAILURE;
        }
        $path = $this->argument('file') ?: base_path('../docs/research/saudi-ecosystem-2026-10-08.json');
        $input = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        $records = $input['records'];
        Validator::make(['records' => $records], ['records' => 'required|array', 'records.*.slug' => 'required|string|distinct',
            'records.*.entity_type' => 'required|in:organization,program,opportunity', 'records.*.name_ar' => 'required|string|max:255',
            'records.*.name_en' => 'required|string|max:255', 'records.*.website_url' => 'required|url:https',
            'records.*.source_urls' => 'required|array|min:1', 'records.*.source_urls.*' => 'url:https',
            'records.*.application_url' => 'nullable|url:https', 'records.*.verified_at' => 'required|date|before_or_equal:today',
            'records.*.verification_status' => 'required|in:verified,needs_review,expired,archived',
            'records.*.application_status' => 'required|in:open,closed,not_announced', 'records.*.deadline' => 'nullable|date'])->validate();
        usort($records, fn ($a, $b) => ($a['entity_type'] === 'organization' ? 0 : 1) <=> ($b['entity_type'] === 'organization' ? 0 : 1));
        $report = ['mode' => $this->option('apply') ? 'applied' : 'preview', 'added' => [], 'corrected' => [], 'unchanged' => [], 'archived' => [], 'merged' => [], 'unresolved' => $input['unresolved'] ?? []];
        DB::transaction(function () use ($records, &$report) {
            $incomingSlugs = array_column($records, 'slug');
            foreach ($records as $record) {
                $existing = EcosystemRecord::where('slug', $record['slug'])->lockForUpdate()->first();
                $parent = empty($record['organization_slug']) ? null : EcosystemRecord::where('slug', $record['organization_slug'])->value('id');
                if (! empty($record['organization_slug']) && ! $parent && ! in_array($record['organization_slug'], $incomingSlugs)) {
                    $report['unresolved'][] = $record['slug'].': missing organization';

                    continue;
                }
                $canonical = rtrim(strtolower($record['website_url']), '/');
                $duplicates = EcosystemRecord::where('entity_type', $record['entity_type'])->where('slug', '!=', $record['slug'])
                    ->whereIn('website_url', [$canonical, $canonical.'/'])->exists();
                if ($duplicates) {
                    $report['unresolved'][] = $record['slug'].': possible duplicate; manual merge review required';

                    continue;
                }
                $hash = hash('sha256', json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
                if ($existing?->import_hash === $hash) {
                    $report['unchanged'][] = $record['slug'];

                    continue;
                }
                if ($existing?->editorial_lock) {
                    $report['unresolved'][] = $record['slug'].': editorial lock; review import differences';

                    continue;
                }
                $fields = ['slug', 'entity_type', 'name_ar', 'name_en', 'category', 'description_ar', 'description_en', 'website_url', 'application_url', 'source_urls', 'verification_status', 'application_status', 'deadline', 'verified_at'];
                $values = array_intersect_key($record, array_flip($fields));
                $values['details'] = array_diff_key($record, array_flip($fields));
                $values['organization_id'] = $parent;
                $values['import_hash'] = $hash;
                $action = $existing ? 'corrected' : 'added';
                $report[$action][] = $record['slug'];
                if ($this->option('apply')) {
                    $before = $existing?->toArray();
                    $row = EcosystemRecord::updateOrCreate(['slug' => $record['slug']], $values);
                    DB::table('ecosystem_revisions')->insert(['ecosystem_record_id' => $row->id, 'action' => $action,
                        'before_state' => $before ? json_encode($before) : null, 'after_state' => json_encode($row->toArray()), 'created_at' => now()]);
                }
            }
        });
        $this->line(json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return self::SUCCESS;
    }
}
