<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('founder_profiles', fn (Blueprint $table) =>
            $table->index(['status', 'is_public', 'deleted_at', 'founder_uid'], 'founder_public_discovery_idx'));
    }

    public function down(): void
    {
        Schema::table('founder_profiles', fn (Blueprint $table) => $table->dropIndex('founder_public_discovery_idx'));
    }
};
