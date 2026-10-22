<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait GeneratesUniqueSlug
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    protected function uniqueSlug(
        string $value,
        string $fallback,
        string $modelClass,
        ?int $ignoreId = null,
    ): string {
        $base = Str::slug($value) ?: $fallback;
        $slug = $base;
        $suffix = 2;

        while ($this->slugExists($modelClass, $slug, $ignoreId)) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    /**
     * @param  class-string<Model>  $modelClass
     */
    private function slugExists(string $modelClass, string $slug, ?int $ignoreId = null): bool
    {
        $query = $modelClass::query()->where('slug', $slug);

        if ($ignoreId) {
            $query->whereKeyNot($ignoreId);
        }

        return $query->exists();
    }
}
