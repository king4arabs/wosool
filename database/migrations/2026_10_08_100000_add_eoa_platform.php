<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program_applications', function (Blueprint $table) {
            $table->text('eoa_data')->nullable(); // encrypted cast; never public financial data
            $table->unsignedInteger('eoa_version')->default(0);
            $table->timestamp('eoa_submitted_at')->nullable();
        });
        Schema::create('eoa_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cohort_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('coach_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('meeting_link')->nullable();
            $table->timestamps();
        });
        Schema::table('program_participants', function (Blueprint $table) {
            $table->json('eoa_onboarding')->nullable();
            $table->text('eoa_finance')->nullable();
            $table->foreignId('eoa_group_id')->nullable()->constrained('eoa_groups')->nullOnDelete();
        });
        Schema::create('eoa_reviewers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('program_applications')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unique(['application_id', 'user_id']);
        });
        Schema::create('eoa_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('program_applications')->cascadeOnDelete();
            $table->string('path');
            $table->string('name');
            $table->string('mime', 80);
            $table->unsignedBigInteger('size');
            $table->timestamps();
        });
        Schema::create('eoa_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('event', 80);
            $table->string('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
        Schema::create('eoa_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['program_session_id', 'user_id']);
        });
        Schema::create('ecosystem_organizations', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('type');
            $table->string('sector');
            $table->string('location');
            $table->string('website');
            $table->text('support_en');
            $table->text('support_ar');
            $table->string('source_url');
            $table->date('verified_at')->nullable();
            $table->string('verification_status', 40)->default('unverified');
            $table->string('relationship_status', 40)->default('ecosystem');
            $table->text('relationship_evidence')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('logo_source_url', 2048)->nullable();
            $table->unsignedInteger('sort_order')->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ecosystem_organizations');
        Schema::dropIfExists('eoa_registrations');
        Schema::dropIfExists('eoa_notifications');
        Schema::dropIfExists('eoa_documents');
        Schema::dropIfExists('eoa_reviewers');
        Schema::table('program_participants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('eoa_group_id');
            $table->dropColumn(['eoa_onboarding', 'eoa_finance']);
        });
        Schema::dropIfExists('eoa_groups');
        Schema::table('program_applications', fn (Blueprint $table) => $table->dropColumn(['eoa_data', 'eoa_version', 'eoa_submitted_at']));
    }
};
