<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news_items', function (Blueprint $table) {
            $table->string('source_url')->nullable()->unique();
            $table->string('source_name')->nullable();
            $table->string('image_credit')->nullable();
            $table->json('companies')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('news_items', function (Blueprint $table) {
            $table->dropUnique(['source_url']);
            $table->dropColumn(['source_url', 'source_name', 'image_credit', 'companies']);
        });
    }
};
