<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eoa_board_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->string('slug', 160);
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('position_en');
            $table->string('position_ar')->nullable();
            foreach (['company_name_en', 'company_name_ar', 'company_role_en', 'company_role_ar'] as $field) {
                $table->string($field)->nullable();
            }
            foreach (['company_url', 'linkedin_url', 'twitter_url', 'facebook_url', 'instagram_url'] as $field) {
                $table->string($field, 2048)->nullable();
            }
            $table->string('portrait_path', 500)->nullable();
            $table->string('portrait_alt_en')->nullable();
            $table->string('portrait_alt_ar')->nullable();
            $table->string('portrait_position', 32)->default('50% 35%');
            $table->unsignedInteger('display_order')->default(100);
            $table->string('board_term', 40);
            $table->boolean('is_active')->default(true);
            $table->string('publication_status', 20)->default('draft');
            $table->json('source_references')->nullable();
            $table->date('verified_at')->nullable();
            $table->timestamps();
            $table->unique(['program_id', 'slug']);
            $table->index(['program_id', 'publication_status', 'is_active', 'display_order'], 'eoa_board_public_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eoa_board_members');
    }
};
