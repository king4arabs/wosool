<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * The administrator's view of a company: the stored (English) columns and the Arabic directory
 * text side by side, whatever the request locale.
 *
 * The public CompanyResource swaps in the Arabic translation when the request is in Arabic. The
 * admin editor saves what it loads back into the base columns, so it must never receive the
 * swapped values, or saving a company from the Arabic admin would overwrite its English name.
 */
class AdminCompanyResource extends CompanyResource
{
    public const ARABIC_FIELDS = ['name', 'description', 'sector', 'location'];

    public function toArray(Request $request): array
    {
        $arabic = ($this->translations ?? [])['ar'] ?? [];

        return array_merge(parent::toArray($request), [
            'name' => $this->name,
            'description' => $this->description,
            'sector' => $this->sector,
            'location' => $this->location,
            'ar' => collect(self::ARABIC_FIELDS)
                ->mapWithKeys(fn (string $field) => [$field => is_string($arabic[$field] ?? null) ? $arabic[$field] : null])
                ->all(),
        ]);
    }
}
