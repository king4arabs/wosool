<?php

namespace App\Console\Commands;

use App\Models\NewsItem;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Imports the reviewed, sourced news briefs shipped in resources/data/sourced-news.json.
 * Production-safe: creates missing stories, fills empty editorial fields on existing ones,
 * and never overwrites text an editor has changed in the admin.
 */
class ImportSourcedNews extends Command
{
    protected $signature = 'wosool:import-news {--dry-run : Report what would change without writing}';

    protected $description = 'Import reviewed, sourced startup news briefs without overwriting editorial changes';

    public function handle(): int
    {
        $rows = json_decode(file_get_contents(resource_path('data/sourced-news.json')), true, 512, JSON_THROW_ON_ERROR);
        $counts = ['created' => 0, 'enriched' => 0, 'unchanged' => 0, 'skipped' => 0];

        DB::transaction(function () use ($rows, &$counts) {
            foreach ($rows as $row) {
                if (! $this->valid($row)) {
                    $counts['skipped']++;
                    continue;
                }

                $item = NewsItem::withTrashed()->where('slug', $row['slug'])->first();
                if ($item?->trashed()) {
                    // An editor deleted this story; respect that decision.
                    $counts['unchanged']++;
                    continue;
                }

                if (! $item) {
                    if (! $this->option('dry-run')) {
                        NewsItem::create($this->attributes($row));
                    }
                    $counts['created']++;
                    continue;
                }

                $fill = array_filter([
                    'region' => $item->region ? null : ($row['region'] ?? null),
                    'key_facts' => $item->key_facts ? null : ($row['keyFacts'] ?? null),
                    'translations' => $item->translations ? null : ($row['translations'] ?? null),
                    'source_url' => $item->source_url ? null : $row['sourceUrl'],
                    'source_name' => $item->source_name ? null : $row['sourceName'],
                    'companies' => $item->companies ? null : ($row['companies'] ?? null),
                ], fn ($value) => $value !== null && $value !== []);

                if ($fill === []) {
                    $counts['unchanged']++;
                    continue;
                }
                if (! $this->option('dry-run')) {
                    $item->update($fill);
                }
                $counts['enriched']++;
            }
        });

        $this->info(json_encode($counts));

        return self::SUCCESS;
    }

    private function valid(array $row): bool
    {
        return filled($row['slug'] ?? null) && filled($row['title'] ?? null)
            && str_starts_with((string) ($row['sourceUrl'] ?? ''), 'https://')
            && filled($row['sourceName'] ?? null) && filled($row['publishedAt'] ?? null);
    }

    private function attributes(array $row): array
    {
        return [
            'title' => $row['title'],
            'slug' => $row['slug'],
            'excerpt' => $row['excerpt'] ?? null,
            'content' => $row['content'] ?? null,
            'category' => $row['category'] ?? 'Ecosystem',
            'region' => $row['region'] ?? null,
            'image_url' => ($row['imageUrl'] ?? '') ?: null,
            'image_credit' => ($row['imageCredit'] ?? '') ?: null,
            'source_url' => $row['sourceUrl'],
            'source_name' => $row['sourceName'],
            'companies' => $row['companies'] ?? [],
            'tags' => $row['tags'] ?? [],
            'key_facts' => $row['keyFacts'] ?? [],
            'translations' => $row['translations'] ?? null,
            'author_name' => $row['author'] ?? 'Wosool news desk',
            'status' => 'published',
            'is_public' => true,
            'is_featured' => false,
            'published_at' => CarbonImmutable::parse($row['publishedAt']),
        ];
    }
}
