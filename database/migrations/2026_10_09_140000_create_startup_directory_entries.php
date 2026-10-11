<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('startup_directory_entries', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('country_code', 2)->index();
            $table->string('region')->index();
            $table->string('business_type')->index();
            $table->string('revenue_status')->default('pending')->index();
            $table->string('website_status')->default('pending')->index();
            $table->json('source_keys');
            $table->text('search_text');
            $table->json('profile');
            $table->date('reviewed_at');
            $table->date('review_due_at')->index();
            $table->boolean('is_published')->default(true)->index();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('startup_directory_entries'); }
};
