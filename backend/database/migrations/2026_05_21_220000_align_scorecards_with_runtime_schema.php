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
            return;
        }

        if (! Schema::hasColumn('scorecards', 'aggregate_score')) {
            Schema::table('scorecards', function (Blueprint $table): void {
                $table->integer('aggregate_score')->default(0);
            });
        }

        if (! Schema::hasColumn('scorecards', 'momentum')) {
            Schema::table('scorecards', function (Blueprint $table): void {
                $table->integer('momentum')->default(0);
            });
        }

        if (! Schema::hasColumn('scorecards', 'growth')) {
            Schema::table('scorecards', function (Blueprint $table): void {
                $table->integer('growth')->default(0);
            });
        }

        if (! Schema::hasColumn('scorecards', 'readiness')) {
            Schema::table('scorecards', function (Blueprint $table): void {
                $table->integer('readiness')->default(0);
            });
        }

        if (! Schema::hasColumn('scorecards', 'support_delta')) {
            Schema::table('scorecards', function (Blueprint $table): void {
                $table->integer('support_delta')->default(0);
            });
        }

        if (! Schema::hasColumn('scorecards', 'historical_logs')) {
            Schema::table('scorecards', function (Blueprint $table): void {
                $table->json('historical_logs')->nullable();
            });
        }

        $hasOverall = Schema::hasColumn('scorecards', 'overall_score');
        $hasProfileCompleteness = Schema::hasColumn('scorecards', 'profile_completeness');
        $hasCommunityEngagement = Schema::hasColumn('scorecards', 'community_engagement');
        $hasExecutionTrackRecord = Schema::hasColumn('scorecards', 'execution_track_record');

        if ($hasOverall) {
            DB::table('scorecards')
                ->where('aggregate_score', 0)
                ->update(['aggregate_score' => DB::raw('overall_score')]);
        }

        if ($hasExecutionTrackRecord) {
            DB::table('scorecards')
                ->where('momentum', 0)
                ->update(['momentum' => DB::raw('execution_track_record')]);
        }

        if ($hasCommunityEngagement) {
            DB::table('scorecards')
                ->where('growth', 0)
                ->update(['growth' => DB::raw('community_engagement')]);
        }

        if ($hasProfileCompleteness) {
            DB::table('scorecards')
                ->where('readiness', 0)
                ->update(['readiness' => DB::raw('profile_completeness')]);
        }

        if ($hasProfileCompleteness) {
            DB::table('scorecards')
                ->where('support_delta', 0)
                ->update(['support_delta' => DB::raw('CASE WHEN profile_completeness < 100 THEN 100 - profile_completeness ELSE 0 END')]);
        }
    }

    public function down(): void
    {
        // Intentionally no-op to avoid destructive rollback on production data.
    }
};
