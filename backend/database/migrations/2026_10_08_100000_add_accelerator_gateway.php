<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_accelerator_applicant')->default(false);
            $table->timestamp('privacy_accepted_at')->nullable();
        });
        Schema::table('program_applications', function (Blueprint $table) {
            $table->json('gateway_payload')->nullable();
            $table->unsignedInteger('revision')->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('consented_at')->nullable();
            $table->string('consent_version', 40)->nullable();
            $table->foreignId('assigned_reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('company_profile_id')->nullable()->constrained('company_profiles')->nullOnDelete();
            $table->index(['program_id', 'status', 'submitted_at'], 'application_review_queue');
        });
        Schema::create('application_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('program_applications')->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_status', 40)->nullable();
            $table->string('to_status', 40);
            $table->text('message')->nullable();
            $table->boolean('is_internal')->default(false);
            $table->timestamp('notification_sent_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['application_id', 'created_at']);
        });
        Schema::create('privacy_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40);
            $table->string('status', 30)->default('received');
            $table->text('message')->nullable();
            $table->text('resolution')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
        Schema::create('ecosystem_records', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('entity_type', 30);
            $table->foreignId('organization_id')->nullable()->constrained('ecosystem_records')->restrictOnDelete();
            $table->string('name_ar');
            $table->string('name_en');
            $table->string('category', 80);
            $table->text('description_ar');
            $table->text('description_en');
            $table->string('website_url', 2048);
            $table->string('application_url', 2048)->nullable();
            $table->json('details');
            $table->json('source_urls');
            $table->string('verification_status', 30)->default('needs_review');
            $table->string('application_status', 30)->default('not_announced');
            $table->timestamp('deadline')->nullable();
            $table->date('verified_at')->nullable();
            $table->boolean('editorial_lock')->default(false);
            $table->string('import_hash', 64)->nullable();
            $table->timestamps();
            $table->index(['verification_status', 'entity_type', 'category'], 'ecosystem_discovery');
            $table->index(['application_status', 'deadline']);
        });
        Schema::create('ecosystem_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ecosystem_record_id')->constrained()->restrictOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 40);
            $table->json('before_state')->nullable();
            $table->json('after_state');
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
        Schema::table('partner_profiles', function (Blueprint $table) {
            $table->string('name_ar')->nullable();
            $table->string('name_en')->nullable();
            $table->string('identity_status', 30)->default('needs_review');
            $table->string('asset_status', 30)->default('needs_review');
            $table->string('designation_status', 30)->default('needs_review');
            $table->text('logo_source_url')->nullable();
            $table->text('approval_note')->nullable();
            $table->timestamp('approved_at')->nullable();
        });
    }

    // Forward-only: rollback the application release, retaining applicant and provenance data.
    public function down(): void
    {
        throw new RuntimeException('Gateway data is retained. Roll back application artifacts; use the documented recovery procedure for database incidents.');
    }
};
