<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Preserve unrelated admin edits and avoid an end before a customized start.
        DB::table('events')
            ->where('slug', 'eo-riyadh-wow-2026')
            ->whereNull('deleted_at')
            ->where('ends_at', '2026-12-11 21:00:00')
            ->where('starts_at', '<=', '2026-12-11 20:00:00')
            ->update(['ends_at' => '2026-12-11 20:00:00', 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Retain the organizer's corrected event schedule.
    }
};
