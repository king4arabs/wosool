<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('company_profiles') && ! Schema::hasColumn('company_profiles', 'deleted_at')) {
            Schema::table('company_profiles', fn (Blueprint $table) => $table->softDeletes());
        }
    }

    public function down(): void
    {
        // Preserve historical deletion records and existing installations' column.
    }
};
