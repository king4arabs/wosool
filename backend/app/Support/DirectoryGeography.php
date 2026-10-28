<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

final class DirectoryGeography
{
    public static function policy(): array
    {
        static $policy;
        return $policy ??= json_decode(file_get_contents(resource_path('data/directory-geography.json')), true, flags: JSON_THROW_ON_ERROR);
    }

    /** Apply coverage before pagination, counts and relationship serialization. */
    public static function visible(Builder $query, string $countryField = 'country_code', array $locationFields = ['location', 'translations->ar->location']): Builder
    {
        $column = $query->getModel()->qualifyColumn($countryField);
        $query->where(fn ($q) => $q->whereNull($column)->orWhereRaw('UPPER(TRIM('.$query->getQuery()->getGrammar()->wrap($column).')) NOT IN (?, ?)', self::policy()['excluded_codes']));
        foreach (self::policy()['excluded_location_terms'] as $term) {
            foreach ($locationFields as $field) {
                $field = $query->getModel()->qualifyColumn($field);
                $query->where(fn ($q) => $q->whereNull($field)->orWhereRaw('LOWER('.$query->getQuery()->getGrammar()->wrap($field).') NOT LIKE ?', ['%'.$term.'%']));
            }
        }
        return $query;
    }

    public static function founders(Builder $query): Builder
    {
        self::visible($query);
        // A linked company outside coverage must not reappear in a founder card.
        return $query->whereDoesntHave('companies', function ($companies) {
            $companies->where('is_public', true)->where('status', 'active')
                ->whereNotIn('company_profiles.id', self::visible(\App\Models\CompanyProfile::query())->select('company_profiles.id'));
        });
    }

    public static function filterCountry(Builder $query, string $country): Builder
    {
        return $query->whereRaw(self::countryExpression().' = ?', [$country]);
    }

    public static function filterRegion(Builder $query, string $region): Builder
    {
        $codes = match ($region) {
            'saudi' => ['SA'], 'gcc' => self::policy()['gcc'], 'mena' => self::policy()['mena'],
            default => array_merge(['SA'], self::policy()['gcc'], self::policy()['mena']),
        };
        $placeholders = implode(',', array_fill(0, count($codes), '?'));
        return $query->whereRaw('COALESCE('.self::countryExpression().", '') ".($region === 'other' ? 'NOT IN' : 'IN')." ($placeholders)", $codes);
    }

    private static function countryExpression(): string
    {
        return "UPPER(TRIM(COALESCE(NULLIF(TRIM(founder_profiles.country_code), ''), (SELECT cp.country_code FROM company_profiles cp JOIN founder_company_links fcl ON cp.id = fcl.company_profile_id WHERE fcl.founder_profile_id = founder_profiles.id AND cp.is_public = 1 AND cp.status = 'active' AND cp.deleted_at IS NULL ORDER BY fcl.is_primary DESC, cp.id LIMIT 1))))";
    }

    public static function orderFounders(Builder $query): Builder
    {
        // Company geography fills legacy records whose founder country is empty.
        $country = self::countryExpression();
        $gcc = implode("','", self::policy()['gcc']);
        $mena = implode("','", self::policy()['mena']);
        return $query->orderByRaw("CASE WHEN $country = 'SA' THEN 0 WHEN $country IN ('$gcc') THEN 1 WHEN $country IN ('$mena') THEN 2 ELSE 3 END");
    }
}
