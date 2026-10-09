<?php

namespace App\Console\Commands;

use App\Models\StartupDirectoryEntry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ImportStartupDirectory extends Command
{
    protected $signature = 'directory:import {--dry-run : Validate without changing records}';
    protected $description = 'Import reviewed businesses, preserving moderation and requiring website/revenue evidence';

    public function handle(): int
    {
        $rows = json_decode(file_get_contents(database_path('data/startup-directory.json')), true, 512, JSON_THROW_ON_ERROR);
        $rules = [
            'slug' => 'required|alpha_dash',
            'country_code' => 'required|size:2',
            'region' => ['required', Rule::in(['Saudi Arabia', 'GCC', 'MENA', 'Global'])],
            'business_type' => ['required', Rule::in(['technology', 'traditional'])],
            'website' => 'required|url:https',
            'website_status' => ['required', Rule::in(['active', 'pending', 'unavailable'])],
            'website_verified_at' => 'required_if:website_status,active|nullable|date|before_or_equal:today',
            'source_url' => 'required|url:https',
            'reviewed_at' => 'required|date|before_or_equal:today',
            'review_due_at' => 'required|date|after:reviewed_at',
            'revenue_status' => ['required', Rule::in(['pending', 'reported', 'financial_statement'])],
            'revenue_evidence' => 'required_unless:revenue_status,pending|nullable|array',
            'revenue_evidence.source_url' => 'required_with:revenue_evidence|url:https',
            'revenue_evidence.period' => 'required_with:revenue_evidence|string|max:200',
            'revenue_evidence.summary_en' => 'required_with:revenue_evidence|string|max:1000',
            'revenue_evidence.summary_ar' => 'required_with:revenue_evidence|string|max:1000',
            'revenue_evidence.reviewed_at' => 'required_with:revenue_evidence|date|before_or_equal:today',
            'ecosystem_sources' => 'present|array',
            'ecosystem_sources.*.key' => ['required', Rule::in(['misk', 'code', 'monshaat', 'multiverse', 'impact46', 'falak', 'lamarka', 'the-garage', 'leap', 'gitex'])],
            'ecosystem_sources.*.label' => 'required|string|max:100',
            'ecosystem_sources.*.relationship_en' => 'required|string|max:200',
            'ecosystem_sources.*.relationship_ar' => 'required|string|max:200',
            'ecosystem_sources.*.url' => 'required|url:https',
            'sources' => 'required|array|min:1',
            'sources.*' => 'url:https',
            'company_socials' => 'present|array',
            'company_socials.*.url' => 'required|url:https',
            'company_socials.*.label' => 'required|string|max:60',
            'founder_socials' => 'present|array',
            'founder_socials.*.url' => 'required|url:https',
            'founder_socials.*.label' => 'required|string|max:60',
        ];
        foreach (['logo_url', 'portrait_url'] as $field) {
            $rules[$field] = ['nullable', 'string', 'regex:~^(https://[^\s]+|/startup-directory/[a-z0-9-]+\.(png|jpg|svg|webp))$~'];
        }
        foreach (['company_name', 'country', 'sector', 'focus_area', 'founder_name', 'role', 'company_brief', 'founder_brief'] as $field) {
            foreach (['ar', 'en'] as $lang) $rules[$field.'_'.$lang] = 'required|string|max:1000';
        }
        foreach ($rows as $row) Validator::make($row, $rules)->validate();
        if (count(array_unique(array_column($rows, 'slug'))) !== count($rows)) {
            $this->error('Duplicate slugs.');
            return self::FAILURE;
        }
        if (!$this->option('dry-run')) {
            DB::transaction(function () use ($rows) {
                foreach ($rows as $row) {
                    $entry = StartupDirectoryEntry::firstOrNew(['slug' => $row['slug']]);
                    if ($entry->exists && $entry->reviewed_at > $row['reviewed_at']) continue;
                    $searchFields = ['company_name_en','company_name_ar','founder_name_en','founder_name_ar','country_en','country_ar','sector_en','sector_ar','focus_area_en','focus_area_ar'];
                    $entry->fill([
                        'source_keys' => array_column($row['ecosystem_sources'], 'key'),
                        'search_text' => mb_strtolower(implode(' ', array_intersect_key($row, array_flip($searchFields)))),
                        'country_code' => $row['country_code'], 'region' => $row['region'],
                        'business_type' => $row['business_type'], 'revenue_status' => $row['revenue_status'],
                        'website_status' => $row['website_status'], 'profile' => $row,
                        'reviewed_at' => $row['reviewed_at'], 'review_due_at' => $row['review_due_at'],
                    ])->save();
                }
            });
        }
        $this->info(count($rows).' profiles '.($this->option('dry-run') ? 'validated.' : 'imported.').' Pending evidence is excluded from the public API.');
        return self::SUCCESS;
    }
}
