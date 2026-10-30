<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('scorecards')) {
            throw new LogicException('Scorecards table must exist before enforcing founder ownership.');
        }

        // The legacy baseline allowed multiple scorecards per founder, even though
        // the runtime models one-to-one ownership. Never delete or merge old rows.
        $duplicate = DB::table('scorecards')
            ->select('founder_profile_id')
            ->groupBy('founder_profile_id')
            ->havingRaw('COUNT(*) > 1')
            ->first();
        if ($duplicate) {
            throw new LogicException('Duplicate scorecards detected. Reconcile them manually after a backup; no rows were deleted.');
        }

        $hasUnique = collect(Schema::getIndexes('scorecards'))->contains(
            fn (array $index): bool => ($index['unique'] ?? false) && ($index['columns'] ?? []) === ['founder_profile_id']
        );
        if (! $hasUnique) {
            Schema::table('scorecards', function (Blueprint $table): void {
                $table->unique('founder_profile_id', 'scorecards_founder_profile_id_unique');
            });
        }
    }

    public function down(): void
    {
        // Prevent accidental weakening of the scorecard ownership contract.
        throw new LogicException('Scorecard owner uniqueness must not be dropped automatically.');
    }
};
