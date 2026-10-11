<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // This codebase already has a richer baseline schema created by the
        // 2024 migrations (slug-based founder/company models, etc). If that
        // schema exists, skip this legacy replacement migration to avoid
        // destructive table shape drift that breaks seeders and models.
        if (
            Schema::hasTable('founder_profiles') &&
            Schema::hasTable('company_profiles') &&
            Schema::hasColumn('founder_profiles', 'slug') &&
            Schema::hasColumn('company_profiles', 'slug')
        ) {
            return;
        }

        $driver = DB::getDriverName();
        $isPgsql = $driver === 'pgsql';

        if ($isPgsql) {
            DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
        }

        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('scorecard_metrics');
        Schema::dropIfExists('introductions_ledger');
        Schema::dropIfExists('scorecards');
        Schema::dropIfExists('founder_company_links');
        Schema::dropIfExists('company_profiles');
        Schema::dropIfExists('founder_profiles');
        Schema::dropIfExists('users');

        Schema::enableForeignKeyConstraints();

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('password_hash')->nullable();
            $table->rememberToken();
            $table->enum('role_token', ['admin', 'founder', 'mentor', 'partner', 'sponsor'])->default('founder')->index();
            $table->timestamps();
        });

        Schema::create('founder_profiles', function (Blueprint $table) use ($isPgsql): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('legal_name');
            $table->string('title');
            $table->text('biography_summary');
            if ($isPgsql) {
                $table->jsonb('skills_tags');
            } else {
                $table->json('skills_tags');
            }
            $table->boolean('vetted_status')->default(false)->index();
            $table->integer('momentum_score')->default(0)->index();
            $table->text('profile_markdown');
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) use ($isPgsql): void {
            $table->id();
            $table->string('legal_name');
            $table->string('domain_url')->nullable();
            $table->enum('operational_stage', ['pre-seed', 'seed', 'series-a', 'series-b'])->index();
            $table->string('sector')->index();
            $table->string('hq_location');
            if ($isPgsql) {
                $table->jsonb('tech_stack_tokens');
                $table->jsonb('metrics_summary');
            } else {
                $table->json('tech_stack_tokens');
                $table->json('metrics_summary');
            }
            $table->timestamps();
        });

        if ($isPgsql) {
            DB::statement('ALTER TABLE company_profiles ADD COLUMN vector_embedding_payload vector(1536)');
        } else {
            // Fallback storage for non-PostgreSQL dev/test environments.
            Schema::table('company_profiles', function (Blueprint $table): void {
                $table->longText('vector_embedding_payload')->nullable();
            });
        }

        Schema::create('founder_company_links', function (Blueprint $table): void {
            $table->foreignId('founder_profile_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->foreignId('company_profile_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->primary(['founder_profile_id', 'company_profile_id'], 'founder_company_links_pk');
        });

        Schema::create('scorecards', function (Blueprint $table) use ($isPgsql): void {
            $table->id();
            $table->foreignId('founder_profile_id')->unique()->constrained('founder_profiles')->cascadeOnDelete();
            $table->integer('aggregate_score')->default(0);
            $table->integer('momentum')->default(0);
            $table->integer('growth')->default(0);
            $table->integer('readiness')->default(0);
            $table->integer('support_delta')->default(0);
            if ($isPgsql) {
                $table->jsonb('historical_logs');
            } else {
                $table->json('historical_logs');
            }
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
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('scorecard_metrics');
        Schema::dropIfExists('introductions_ledger');
        Schema::dropIfExists('scorecards');
        Schema::dropIfExists('founder_company_links');
        Schema::dropIfExists('company_profiles');
        Schema::dropIfExists('founder_profiles');
        Schema::dropIfExists('users');

        Schema::enableForeignKeyConstraints();
    }
};
