<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

/** Search public names without adding private fields or bypassing pagination. */
final class FounderSearch
{
    private static function folds(): array
    {
        static $folds;
        if ($folds !== null) return $folds;
        $folds = ['أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ٱ' => 'ا', 'ى' => 'ي', 'ة' => 'ه', 'ؤ' => 'و', 'ئ' => 'ي', 'ـ' => '', 'ٰ' => ''];
        for ($code = 0x064B; $code <= 0x065F; $code++) $folds[mb_chr($code)] = '';
        return $folds;
    }

    public static function normalize(string $text): string
    {
        return trim(preg_replace('/\s+/u', ' ', strtr(mb_strtolower($text), self::folds())));
    }

    private static function whereText(Builder $query, array $fields, string $pattern): void
    {
        $grammar = $query->getQuery()->getGrammar();
        foreach ($fields as $field) {
            // Grammar wrapping handles JSON names for both SQLite and MySQL.
            $expression = 'LOWER(COALESCE('.$grammar->wrap($query->getModel()->qualifyColumn($field)).", ''))";
            foreach (self::folds() as $from => $to) $expression = "REPLACE($expression, '$from', '$to')";
            $query->orWhereRaw("$expression LIKE ? ESCAPE '!'", [$pattern]);
        }
    }

    public static function apply(Builder $query, string $search): void
    {
        $terms = array_unique(array_filter(explode(' ', self::normalize($search)), fn ($term) => $term !== ''));
        foreach ($terms as $term) {
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
            $query->where(function (Builder $matches) use ($pattern) {
                self::whereText($matches, ['display_name', 'translations->ar->name', 'translations->en->name', 'tagline', 'translations->ar->tagline', 'bio', 'translations->ar->bio'], $pattern);
                $matches->orWhereHas('user', fn (Builder $user) => $user->where(fn (Builder $names) => self::whereText($names, ['name'], $pattern)));
                $matches->orWhereHas('companies', fn (Builder $company) => DirectoryGeography::visible($company)
                    ->where('is_public', true)->where('status', 'active')
                    ->where(fn (Builder $names) => self::whereText($names, ['name', 'translations->ar->name', 'translations->en->name'], $pattern)));
            });
        }
    }
}
