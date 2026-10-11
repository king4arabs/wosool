<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Public profiles are separate from private program_mentors assignments.
        Schema::create('eoa_mentor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coach_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('slug', 160);
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('position_en');
            $table->string('position_ar')->nullable();
            foreach (['company_name_en', 'company_name_ar', 'company_role_en', 'company_role_ar'] as $field) {
                $table->string($field)->nullable();
            }
            $table->text('bio_en')->nullable();
            $table->text('bio_ar')->nullable();
            $table->json('expertise_en')->nullable();
            $table->json('expertise_ar')->nullable();
            foreach (['company_url', 'linkedin_url', 'twitter_url'] as $field) {
                $table->string($field, 2048)->nullable();
            }
            $table->string('portrait_path', 500)->nullable();
            $table->string('portrait_alt_en')->nullable();
            $table->string('portrait_alt_ar')->nullable();
            $table->string('portrait_position', 32)->default('50% 35%');
            $table->unsignedInteger('display_order')->default(100);
            $table->boolean('is_active')->default(true);
            $table->string('publication_status', 20)->default('draft');
            $table->string('appointment_status', 20)->default('draft');
            $table->text('appointment_reference')->nullable();
            $table->boolean('public_consent')->default(false);
            $table->text('consent_reference')->nullable();
            $table->json('source_references')->nullable();
            $table->date('verified_at')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['program_id', 'slug']);
            $table->index(['program_id', 'publication_status', 'is_active', 'display_order'], 'eoa_mentor_public_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eoa_mentor_profiles');
    }
};
