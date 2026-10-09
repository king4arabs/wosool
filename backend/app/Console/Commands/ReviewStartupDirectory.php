<?php
namespace App\Console\Commands;

use App\Models\StartupDirectoryEntry;
use Illuminate\Console\Command;

class ReviewStartupDirectory extends Command
{
    protected $signature = 'directory:review-due {--all : Include every published record}';
    protected $description = 'List sourced startup records due for editorial review without claiming automatic verification';
    public function handle(): int
    {
        $query = StartupDirectoryEntry::where('is_published', true)->orderBy('review_due_at');
        if (!$this->option('all')) $query->where('review_due_at', '<=', now()->toDateString());
        $this->line($query->get()->map(fn ($entry) => ['slug' => $entry->slug, 'reviewed_at' => $entry->reviewed_at, 'review_due_at' => $entry->review_due_at, 'sources' => $entry->profile['sources'] ?? []])->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        return self::SUCCESS;
    }
}
