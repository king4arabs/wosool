<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StartupDirectoryEntry;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StartupDirectoryController extends Controller
{
    public function index(Request $request)
    {
        $input = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'region' => ['sometimes', Rule::in(['Saudi Arabia', 'GCC', 'MENA', 'Global'])],
            'business_type' => 'sometimes|in:technology,traditional',
            'search' => 'sometimes|string|max:120',
            'sector' => 'sometimes|string|max:100',
            'source' => 'sometimes|string|max:40',
        ]);
        $query = StartupDirectoryEntry::where('is_published', true)
            ->where('website_status', 'active')
            ->whereIn('revenue_status', ['reported', 'financial_statement'])
            ->whereNotNull('profile->revenue_evidence->source_url');
        $sectors = (clone $query)->select('profile->sector_en as en', 'profile->sector_ar as ar')->distinct()->get()->map(fn ($row) => ['en' => $row->en, 'ar' => $row->ar]);
        if (isset($input['region'])) $query->where('region', $input['region']);
        if (isset($input['business_type'])) $query->where('business_type', $input['business_type']);
        if (isset($input['sector'])) $query->where('profile->sector_en', $input['sector']);
        if (isset($input['source'])) $query->whereJsonContains('source_keys', $input['source']);
        if (isset($input['search']) && trim($input['search']) !== '') {
            // Escape SQL wildcards so user input is matched as literal text.
            $needle = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower(trim($input['search'])));
            $query->whereRaw("search_text LIKE ? ESCAPE '!'", ['%'.$needle.'%']);
        }
        $entries = $query->orderByRaw("CASE region WHEN 'Saudi Arabia' THEN 0 WHEN 'GCC' THEN 1 WHEN 'MENA' THEN 2 ELSE 3 END")
            ->orderBy('slug')->paginate($input['per_page'] ?? 24);
        $entries->through(fn ($entry) => [...$entry->profile, 'id' => $entry->slug, 'reviewed_at' => $entry->reviewed_at, 'review_due_at' => $entry->review_due_at, 'review_due' => $entry->review_due_at < now()->toDateString()]);
        return response()->json([
            'data' => $entries->items(),
            'meta' => [
                'current_page' => $entries->currentPage(), 'last_page' => $entries->lastPage(), 'total' => $entries->total(),
                'sectors' => $sectors,
            ],
        ]);
    }
}
