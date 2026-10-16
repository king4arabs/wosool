<?php

namespace App\Services;

use App\Models\CompanyProfile;
use App\Models\FounderProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FounderDirectoryImporter
{
    public function run(): array
    {
        $base = json_decode(file_get_contents(resource_path('data/founder-directory.json')), true, 512, JSON_THROW_ON_ERROR);
        $expansion = json_decode(file_get_contents(resource_path('data/founder-directory-expansion-2026-10-16.json')), true, 512, JSON_THROW_ON_ERROR);
        $records = [...$base, ...$expansion];
        $this->validateRecords($records);
        $counts = ['founders_created' => 0, 'companies_created' => 0, 'preserved' => 0, 'companies_enriched' => 0];
        DB::transaction(function () use ($records, &$counts) {
            foreach ($records as $row) {
                $company = CompanyProfile::where('directory_key', $row['company_key'])->first();
                if (! $company) {
                    // Preserve an existing company with the same canonical site rather than creating duplicates.
                    $host = strtolower(preg_replace('/^www\./', '', parse_url($row['website'], PHP_URL_HOST)));
                    $company = CompanyProfile::all()->first(fn ($item) => $item->website && strtolower(preg_replace('/^www\./', '', (string) parse_url($item->website, PHP_URL_HOST))) === $host);
                }
                if (! $company) {
                    $company = CompanyProfile::create([
                        'directory_key' => $row['company_key'], 'slug' => $this->slug(CompanyProfile::class, $row['company_key']),
                        'name' => $row['company_name_en'], 'description' => $row['company_brief_en'],
                        'logo_url' => $row['logo_url'], 'website' => $row['website'], 'sector' => $row['sector_en'],
                        'location' => $row['country_en'], 'country_code' => $row['country_code'],
                        'status' => 'active', 'is_public' => true, 'source_urls' => $row['source_urls'],
                        'source_reviewed_at' => $row['reviewed_at'],
                        'founded_year' => $row['founded_year'] ?? null,
                        'metrics_summary' => $this->traction($row),
                        'translations' => ['ar' => ['name' => $row['company_name_ar'], 'description' => $row['company_brief_ar'], 'sector' => $row['sector_ar'], 'location' => $row['country_ar']]],
                    ]);
                    $counts['companies_created']++;
                } elseif ($this->enrich($company, $row)) {
                    $counts['companies_enriched']++;
                }
                $founder = FounderProfile::where('directory_key', $row['slug'])->first();
                if (! $founder) {
                    $founder = FounderProfile::where(function ($q) use ($row) {
                        $q->where('display_name', $row['founder_name_en'])->orWhereHas('user', fn ($u) => $u->where('name', $row['founder_name_en']));
                    })->whereHas('companies', fn ($q) => $q->where('company_profiles.id', $company->id))->first();
                }
                if ($founder) { $counts['preserved']++; continue; }
                $founder = FounderProfile::create([
                    'directory_key' => $row['slug'], 'slug' => $this->slug(FounderProfile::class, $row['slug']),
                    'display_name' => $row['founder_name_en'], 'position' => $row['role_en'],
                    'tagline' => $row['role_en'].' · '.$row['company_name_en'], 'bio' => $row['founder_brief_en'],
                    'location' => $row['country_en'], 'country_code' => $row['country_code'], 'sector' => $row['sector_en'],
                    'avatar_url' => $row['portrait_url'], 'website_url' => $row['website'],
                    'linkedin_url' => collect($row['founder_socials'])->firstWhere('label', 'LinkedIn')['url'] ?? null,
                    'twitter_url' => collect($row['founder_socials'])->firstWhere('label', 'X')['url'] ?? null,
                    'is_public' => true, 'status' => 'active', 'is_verified' => false,
                    'source_urls' => $row['source_urls'], 'source_reviewed_at' => $row['reviewed_at'],
                    'translations' => ['ar' => ['name' => $row['founder_name_ar'], 'position' => $row['role_ar'], 'tagline' => $row['role_ar'].' · '.$row['company_name_ar'], 'bio' => $row['founder_brief_ar'], 'location' => $row['country_ar'], 'sector' => $row['sector_ar']]],
                ]);
                $founder->companies()->attach($company, ['role' => $row['role_en'], 'is_primary' => true]);
                $counts['founders_created']++;
            }
        });
        return $counts;
    }

    /** Fail closed on ambiguous or unsourced directory data before touching production records. */
    private function validateRecords(array $records): void
    {
        $seen = [];
        foreach ($records as $index => $row) {
            foreach (['slug', 'company_key', 'founder_name_en', 'founder_name_ar', 'company_name_en',
                'company_name_ar', 'role_en', 'role_ar', 'founder_brief_en', 'founder_brief_ar',
                'company_brief_en', 'company_brief_ar', 'country_en', 'country_ar',
                'country_code', 'sector_en', 'sector_ar', 'website', 'source_url', 'reviewed_at'] as $field) {
                if (! is_string($row[$field] ?? null) || trim($row[$field]) === '') {
                    throw new \UnexpectedValueException("Founder directory row {$index} has invalid {$field}");
                }
            }
            $slug = $row['slug'];
            if (isset($seen[$slug])) {
                throw new \UnexpectedValueException("Duplicate founder directory key: {$slug}");
            }
            $seen[$slug] = true;
            if (! in_array($row['region'] ?? null, ['saudi', 'gcc', 'mena', 'global'], true)) {
                throw new \UnexpectedValueException("Invalid region for {$slug}");
            }
            if (! is_array($row['source_urls'] ?? null) || ! in_array($row['source_url'], $row['source_urls'], true)) {
                throw new \UnexpectedValueException("Missing primary evidence link for {$slug}");
            }
            foreach ([$row['website'], ...$row['source_urls']] as $url) {
                if (! is_string($url) || parse_url($url, PHP_URL_SCHEME) !== 'https'
                    || ! parse_url($url, PHP_URL_HOST)) {
                    throw new \UnexpectedValueException("Invalid HTTPS evidence URL for {$slug}");
                }
            }
        }
    }

    /** Sourced traction signal stored on the company; null when the record carries none. */
    private function traction(array $row): ?array
    {
        if (empty($row['traction_en']) || empty($row['traction_source_url'])) {
            return null;
        }

        return [
            'en' => $row['traction_en'],
            'ar' => $row['traction_ar'] ?? null,
            'source_url' => $row['traction_source_url'],
            'reviewed_at' => $row['reviewed_at'],
        ];
    }

    /** Fill sourced facts that are still empty without overwriting editorial changes. */
    private function enrich(CompanyProfile $company, array $row): bool
    {
        $changes = [];
        if (! $company->founded_year && ! empty($row['founded_year'])) {
            $changes['founded_year'] = $row['founded_year'];
        }
        if (empty($company->metrics_summary) && ($traction = $this->traction($row))) {
            $changes['metrics_summary'] = $traction;
            $changes['source_urls'] = array_values(array_unique([...($company->source_urls ?? []), $traction['source_url']]));
        }
        if (! $changes) {
            return false;
        }
        $company->update($changes);

        return true;
    }

    private function slug(string $model, string $base): string
    {
        $slug = Str::slug($base);
        $candidate = $slug;
        $i = 2;
        while (DB::table((new $model)->getTable())->where('slug', $candidate)->exists()) { $candidate = $slug.'-'.$i++; }
        return $candidate;
    }
}
