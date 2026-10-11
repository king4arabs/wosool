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
        $records = json_decode(file_get_contents(resource_path('data/founder-directory.json')), true, 512, JSON_THROW_ON_ERROR);
        $counts = ['founders_created' => 0, 'companies_created' => 0, 'preserved' => 0];
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
                        'translations' => ['ar' => ['name' => $row['company_name_ar'], 'description' => $row['company_brief_ar'], 'sector' => $row['sector_ar'], 'location' => $row['country_ar']]],
                    ]);
                    $counts['companies_created']++;
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

    private function slug(string $model, string $base): string
    {
        $slug = Str::slug($base);
        $candidate = $slug;
        $i = 2;
        while (DB::table((new $model)->getTable())->where('slug', $candidate)->exists()) { $candidate = $slug.'-'.$i++; }
        return $candidate;
    }
}
