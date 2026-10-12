<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Editorial fields for sourced briefs: market region for filtering, key facts
 * shown as a scannable summary, and an Arabic translation of the brief.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news_items', function (Blueprint $table): void {
            if (! Schema::hasColumn('news_items', 'region')) {
                $table->string('region', 20)->nullable()->index();
            }
            if (! Schema::hasColumn('news_items', 'key_facts')) {
                $table->json('key_facts')->nullable();
            }
            if (! Schema::hasColumn('news_items', 'translations')) {
                $table->json('translations')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('news_items', function (Blueprint $table): void {
            foreach (['region', 'key_facts', 'translations'] as $column) {
                if (Schema::hasColumn('news_items', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
