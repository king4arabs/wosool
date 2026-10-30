<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Read-only release audit: only aggregate counts, never names, emails or tokens.
 */
class CheckFounderIdentity extends Command
{
    protected $signature = 'wosool:check-founder-identity {--json : Emit machine-readable aggregate counts}';

    protected $description = 'Check permanent founder IDs and account/scorecard identity integrity without changing data.';

    public function handle(): int
    {
        if (! Schema::hasTable('founder_profiles') || ! Schema::hasTable('scorecards')
            || ! Schema::hasColumn('founder_profiles', 'founder_uid')) {
            $this->error('Founder identity schema is not installed. Run reviewed additive migrations first.');

            return self::FAILURE;
        }

        $invalid = 0;
        DB::table('founder_profiles')->select(['id', 'founder_uid'])->orderBy('id')
            ->chunkById(250, function ($rows) use (&$invalid): void {
                foreach ($rows as $row) {
                    if (! Str::isUuid((string) ($row->founder_uid ?? ''))) $invalid++;
                }
            });

        $duplicates = DB::table('founder_profiles')->whereNotNull('founder_uid')
            ->groupBy('founder_uid')->havingRaw('COUNT(*) > 1')->get(['founder_uid'])->count();

        // Soft-deleted profiles keep their IDs and do not block replacement with
        // a new profile after deliberate deletion. Live account collisions do.
        $multipleOwners = DB::table('founder_profiles')->whereNull('deleted_at')->whereNotNull('user_id')
            ->groupBy('user_id')->havingRaw('COUNT(*) > 1')->get(['user_id'])->count();

        $duplicateScorecards = DB::table('scorecards')->whereNotNull('founder_profile_id')
            ->groupBy('founder_profile_id')->havingRaw('COUNT(*) > 1')->get(['founder_profile_id'])->count();

        $orphanScorecards = DB::table('scorecards')
            ->leftJoin('founder_profiles', 'scorecards.founder_profile_id', '=', 'founder_profiles.id')
            ->whereNull('founder_profiles.id')->count();

        // Warning only: do not create artificial score or claim an unsourced founder
        // as a member just because a public profile exists.
        $unscoredMembers = DB::table('founder_profiles')
            ->leftJoin('scorecards', 'founder_profiles.id', '=', 'scorecards.founder_profile_id')
            ->whereNull('founder_profiles.deleted_at')->whereNotNull('founder_profiles.user_id')
            ->where('founder_profiles.status', 'active')->whereNull('scorecards.id')->count();

        $counts = [
            'founder_profiles_including_deleted' => DB::table('founder_profiles')->count(),
            'invalid_or_missing_founder_uids' => $invalid,
            'duplicate_founder_uids' => $duplicates,
            'multiple_live_profiles_per_account' => $multipleOwners,
            'duplicate_scorecards_per_founder' => $duplicateScorecards,
            'orphan_scorecards' => $orphanScorecards,
            'active_member_profiles_without_scorecards' => $unscoredMembers,
        ];

        $critical = $invalid + $duplicates + $multipleOwners + $duplicateScorecards + $orphanScorecards;
        if ($this->option('json')) {
            $this->line(json_encode(['ok' => $critical === 0, 'counts' => $counts], JSON_THROW_ON_ERROR));
        } else {
            foreach ($counts as $key => $count) {
                $this->line(str_replace('_', ' ', $key).': '.$count);
            }
            if ($unscoredMembers) $this->warn('Some existing member profiles have no private scorecard; review before creating one.');
            if ($critical) $this->error('Founder identity integrity check failed. Investigate without merging or deleting rows.');
            else $this->info('Founder identifier and scorecard link integrity verified.');
        }

        return $critical === 0 ? self::SUCCESS : self::FAILURE;
    }
}
