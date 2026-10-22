<?php

namespace App\Console\Commands;

use App\Models\AnalyticsEvent;
use App\Models\IntroductionLedger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireStalledIntroductions extends Command
{
    protected $signature = 'wosool:introductions:expire-stalled';

    protected $description = 'Expire INTRO_PENDING introductions that have passed their expires_at threshold.';

    public function handle(): int
    {
        $now = now();

        $expiredCount = 0;

        DB::transaction(function () use (&$expiredCount, $now): void {
            $stalledQuery = IntroductionLedger::query()
                ->where('routing_status', 'INTRO_PENDING')
                ->whereNotNull('expires_at')
                ->where('expires_at', '<=', $now);

            $stalledIds = $stalledQuery->pluck('id')->all();

            if ($stalledIds === []) {
                return;
            }

            $expiredCount = IntroductionLedger::query()
                ->whereIn('id', $stalledIds)
                ->update([
                    'routing_status' => 'ROUTE_EXPIRED',
                    'updated_at' => $now,
                ]);

            foreach ($stalledIds as $introId) {
                AnalyticsEvent::track(
                    eventName: 'introduction.expired',
                    userId: null,
                    entityType: 'introduction_ledger',
                    entityId: $introId,
                    properties: [
                        'reason' => 'stalled_timeout',
                        'released_allocation_slot' => true,
                        'expired_at' => $now->toIso8601String(),
                    ],
                );
            }
        });

        if ($expiredCount === 0) {
            $this->info('No stalled introduction routes to expire.');

            return self::SUCCESS;
        }

        $this->info("Expired {$expiredCount} stalled introduction route(s) and released allocation slots.");

        return self::SUCCESS;
    }
}
