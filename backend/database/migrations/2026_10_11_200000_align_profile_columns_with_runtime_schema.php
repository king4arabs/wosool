<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('founder_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('founder_profiles', 'legal_name')) {
                $table->string('legal_name')->nullable();
            }
            if (! Schema::hasColumn('founder_profiles', 'title')) {
                $table->string('title')->nullable();
            }
            if (! Schema::hasColumn('founder_profiles', 'biography_summary')) {
                $table->text('biography_summary')->nullable();
            }
            if (! Schema::hasColumn('founder_profiles', 'skills_tags')) {
                $table->json('skills_tags')->nullable();
            }
            if (! Schema::hasColumn('founder_profiles', 'vetted_status')) {
                $table->boolean('vetted_status')->default(false);
            }
            if (! Schema::hasColumn('founder_profiles', 'momentum_score')) {
                $table->integer('momentum_score')->default(0);
            }
            if (! Schema::hasColumn('founder_profiles', 'profile_markdown')) {
                $table->text('profile_markdown')->nullable();
            }
        });

        Schema::table('company_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('company_profiles', 'legal_name')) {
                $table->string('legal_name')->nullable();
            }
            if (! Schema::hasColumn('company_profiles', 'domain_url')) {
                $table->string('domain_url')->nullable();
            }
            if (! Schema::hasColumn('company_profiles', 'operational_stage')) {
                $table->string('operational_stage')->nullable();
            }
            if (! Schema::hasColumn('company_profiles', 'hq_location')) {
                $table->string('hq_location')->nullable();
            }
            if (! Schema::hasColumn('company_profiles', 'tech_stack_tokens')) {
                $table->json('tech_stack_tokens')->nullable();
            }
            if (! Schema::hasColumn('company_profiles', 'metrics_summary')) {
                $table->json('metrics_summary')->nullable();
            }
            if (! Schema::hasColumn('company_profiles', 'vector_embedding_payload')) {
                $table->longText('vector_embedding_payload')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Preserve profile data across application rollbacks.
    }
};
