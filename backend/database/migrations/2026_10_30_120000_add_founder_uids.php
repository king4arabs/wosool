<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('founder_profiles')) {
            throw new LogicException('Founder profiles must exist before assigning founder IDs.');
        }

        if (! Schema::hasColumn('founder_profiles', 'founder_uid')) {
            // Nullable during additive rollout so older application processes can run
            // until migrated and replaced. The model assigns IDs for every new record.
            Schema::table('founder_profiles', function (Blueprint $table): void {
                $table->uuid('founder_uid')->nullable();
            });
        }

        // Include soft-deleted profiles: IDs must never be recycled or reassigned.
        // Only fill NULL gaps; comparing UUID columns to an empty string breaks PostgreSQL.
        // Never regenerate an ID or touch editorial/update timestamps.
        DB::table('founder_profiles')
            ->select(['id', 'founder_uid'])
            ->whereNull('founder_uid')
            ->orderBy('id')
            ->chunkById(100, function ($rows): void {
                foreach ($rows as $row) {
                    DB::table('founder_profiles')->where('id', $row->id)
                        ->whereNull('founder_uid')
                        ->update(['founder_uid' => (string) Str::uuid()]);
                }
            });

        $seen = [];
        DB::table('founder_profiles')->select(['id', 'founder_uid'])->orderBy('id')
            ->chunkById(100, function ($rows) use (&$seen): void {
                foreach ($rows as $row) {
                    $uid = (string) ($row->founder_uid ?? '');
                    if (! Str::isUuid($uid) || isset($seen[$uid])) {
                        throw new LogicException('Invalid or duplicate founder identifier. Resolve the data conflict before release.');
                    }
                    $seen[$uid] = true;
                }
            });

        $hasUnique = collect(Schema::getIndexes('founder_profiles'))->contains(
            fn (array $index): bool => ($index['unique'] ?? false) && ($index['columns'] ?? []) === ['founder_uid']
        );
        if (! $hasUnique) {
            Schema::table('founder_profiles', function (Blueprint $table): void {
                $table->unique('founder_uid', 'founder_profiles_founder_uid_unique');
            });
        }
    }

    public function down(): void
    {
        // An ID is permanent even after account activation, moderation or deletion.
        throw new LogicException('Founder identifiers are immutable; roll back application code, not this column.');
    }
};
