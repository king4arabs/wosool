<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');

        Schema::dropIfExists('introductions_ledger');
        Schema::dropIfExists('scorecards');
        Schema::dropIfExists('founder_company_links');
        Schema::dropIfExists('company_profiles');
        Schema::dropIfExists('founder_profiles');
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->enum('role_token', ['admin', 'founder', 'mentor', 'partner', 'sponsor'])->index();
            $table->timestamps();
        });

        Schema::create('founder_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('legal_name');
            $table->string('title');
            $table->text('biography_summary');
            $table->jsonb('skills_tags');
            $table->boolean('vetted_status')->default(false)->index();
            $table->integer('momentum_score')->default(0)->index();
            $table->text('profile_markdown');
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table): void {
            $table->id();
            $table->string('legal_name');
            $table->string('domain_url')->nullable();
            $table->enum('operational_stage', ['pre-seed', 'seed', 'series-a', 'series-b'])->index();
            $table->string('sector')->index();
            $table->string('hq_location');
            $table->jsonb('tech_stack_tokens');
            $table->jsonb('metrics_summary');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE company_profiles ADD COLUMN vector_embedding_payload vector(1536)');

        Schema::create('founder_company_links', function (Blueprint $table): void {
            $table->foreignId('founder_profile_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->foreignId('company_profile_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->primary(['founder_profile_id', 'company_profile_id'], 'founder_company_links_pk');
        });

        Schema::create('scorecards', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('founder_profile_id')->unique()->constrained('founder_profiles')->cascadeOnDelete();
            $table->integer('aggregate_score')->default(0);
            $table->integer('momentum')->default(0);
            $table->integer('growth')->default(0);
            $table->integer('readiness')->default(0);
            $table->integer('support_delta')->default(0);
            $table->jsonb('historical_logs');
            $table->timestamps();
        });

        Schema::create('introductions_ledger', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('source_founder_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->foreignId('target_founder_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->enum('routing_status', ['INTRO_PENDING', 'INTRO_APPROVED', 'ROUTE_EXPIRED', 'DECLINED'])->index();
            $table->text('payload_context_brief');
            $table->text('tracking_notes')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();

            $table->index(['source_founder_id', 'target_founder_id'], 'introductions_ledger_route_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('introductions_ledger');
        Schema::dropIfExists('scorecards');
        Schema::dropIfExists('founder_company_links');
        Schema::dropIfExists('company_profiles');
        Schema::dropIfExists('founder_profiles');
        Schema::dropIfExists('users');
    }
};
