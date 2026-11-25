<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Change the former scheduled start only; preserve unrelated administrator edits.
        DB::table('events')
            ->where('slug', 'eo-riyadh-wow-2026')
            ->whereNull('deleted_at')
            ->where('starts_at', '2026-12-11 11:00:00')
            ->update(['starts_at' => '2026-12-11 12:00:00', 'updated_at' => now()]);
    }

    public function down(): void
    {
        // The organizer's schedule correction is intentionally retained on rollback.
    }
};
