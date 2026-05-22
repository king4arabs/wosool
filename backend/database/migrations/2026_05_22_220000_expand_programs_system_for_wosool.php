<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('programs')) {
            Schema::table('programs', function (Blueprint $table): void {
                if (! Schema::hasColumn('programs', 'title')) {
                    $table->string('title')->nullable()->after('name');
                }
                if (! Schema::hasColumn('programs', 'short_description')) {
                    $table->text('short_description')->nullable()->after('description');
                }
                if (! Schema::hasColumn('programs', 'full_description')) {
                    $table->longText('full_description')->nullable()->after('short_description');
                }
                if (! Schema::hasColumn('programs', 'program_type')) {
                    $table->string('program_type', 120)->nullable()->after('category');
                }
                if (! Schema::hasColumn('programs', 'tags')) {
                    $table->json('tags')->nullable()->after('benefits');
                }
                if (! Schema::hasColumn('programs', 'cover_image_url')) {
                    $table->string('cover_image_url')->nullable()->after('tags');
                }
                if (! Schema::hasColumn('programs', 'visibility')) {
                    $table->string('visibility', 40)->default('members_only')->after('cover_image_url');
                }
                if (! Schema::hasColumn('programs', 'status_flow')) {
                    $table->string('status_flow', 40)->default('draft')->after('visibility');
                }
                if (! Schema::hasColumn('programs', 'objective')) {
                    $table->text('objective')->nullable()->after('status_flow');
                }
                if (! Schema::hasColumn('programs', 'who_it_is_for')) {
                    $table->text('who_it_is_for')->nullable()->after('objective');
                }
                if (! Schema::hasColumn('programs', 'expected_outcomes')) {
                    $table->text('expected_outcomes')->nullable()->after('who_it_is_for');
                }
                if (! Schema::hasColumn('programs', 'format')) {
                    $table->string('format', 40)->default('cohort-based')->after('duration');
                }
                if (! Schema::hasColumn('programs', 'language')) {
                    $table->string('language', 10)->default('ar')->after('format');
                }
                if (! Schema::hasColumn('programs', 'city_region')) {
                    $table->string('city_region', 120)->nullable()->after('language');
                }
                if (! Schema::hasColumn('programs', 'capacity')) {
                    $table->unsignedInteger('capacity')->nullable()->after('cohort_size');
                }
                if (! Schema::hasColumn('programs', 'starts_at')) {
                    $table->timestamp('starts_at')->nullable()->after('application_deadline');
                }
                if (! Schema::hasColumn('programs', 'ends_at')) {
                    $table->timestamp('ends_at')->nullable()->after('starts_at');
                }
                if (! Schema::hasColumn('programs', 'program_manager_user_id')) {
                    $table->foreignId('program_manager_user_id')->nullable()->constrained('users')->nullOnDelete()->after('ends_at');
                }
                if (! Schema::hasColumn('programs', 'organizer_type')) {
                    $table->string('organizer_type', 40)->default('wosool')->after('program_manager_user_id');
                }
                if (! Schema::hasColumn('programs', 'organizer_id')) {
                    $table->unsignedBigInteger('organizer_id')->nullable()->after('organizer_type');
                }
                if (! Schema::hasColumn('programs', 'eligibility_criteria')) {
                    $table->json('eligibility_criteria')->nullable()->after('organizer_id');
                }
                if (! Schema::hasColumn('programs', 'application_process')) {
                    $table->json('application_process')->nullable()->after('eligibility_criteria');
                }
                if (! Schema::hasColumn('programs', 'faqs')) {
                    $table->json('faqs')->nullable()->after('application_process');
                }
                if (! Schema::hasColumn('programs', 'targeting_rules')) {
                    $table->json('targeting_rules')->nullable()->after('faqs');
                }
                if (! Schema::hasColumn('programs', 'ai_settings')) {
                    $table->json('ai_settings')->nullable()->after('targeting_rules');
                }
                if (! Schema::hasColumn('programs', 'settings')) {
                    $table->json('settings')->nullable()->after('ai_settings');
                }
            });
        }

        if (Schema::hasTable('cohorts')) {
            Schema::table('cohorts', function (Blueprint $table): void {
                if (! Schema::hasColumn('cohorts', 'code')) {
                    $table->string('code', 80)->nullable()->after('name');
                }
                if (! Schema::hasColumn('cohorts', 'capacity')) {
                    $table->unsignedInteger('capacity')->nullable()->after('code');
                }
                if (! Schema::hasColumn('cohorts', 'city_region')) {
                    $table->string('city_region', 120)->nullable()->after('capacity');
                }
                if (! Schema::hasColumn('cohorts', 'format')) {
                    $table->string('format', 40)->nullable()->after('city_region');
                }
                if (! Schema::hasColumn('cohorts', 'program_manager_user_id')) {
                    $table->foreignId('program_manager_user_id')->nullable()->constrained('users')->nullOnDelete()->after('format');
                }
            });
        }

        if (Schema::hasTable('program_applications')) {
            Schema::table('program_applications', function (Blueprint $table): void {
                if (! Schema::hasColumn('program_applications', 'why_join')) {
                    $table->text('why_join')->nullable()->after('relevant_experience');
                }
                if (! Schema::hasColumn('program_applications', 'current_challenge')) {
                    $table->text('current_challenge')->nullable()->after('why_join');
                }
                if (! Schema::hasColumn('program_applications', 'expected_outcome')) {
                    $table->text('expected_outcome')->nullable()->after('current_challenge');
                }
                if (! Schema::hasColumn('program_applications', 'company_stage')) {
                    $table->string('company_stage', 120)->nullable()->after('expected_outcome');
                }
                if (! Schema::hasColumn('program_applications', 'sector')) {
                    $table->string('sector', 120)->nullable()->after('company_stage');
                }
                if (! Schema::hasColumn('program_applications', 'team_size')) {
                    $table->string('team_size', 60)->nullable()->after('sector');
                }
                if (! Schema::hasColumn('program_applications', 'current_traction')) {
                    $table->text('current_traction')->nullable()->after('team_size');
                }
                if (! Schema::hasColumn('program_applications', 'fundraising_status')) {
                    $table->string('fundraising_status', 120)->nullable()->after('current_traction');
                }
                if (! Schema::hasColumn('program_applications', 'availability_confirmed')) {
                    $table->boolean('availability_confirmed')->default(false)->after('fundraising_status');
                }
                if (! Schema::hasColumn('program_applications', 'consent_share_profile')) {
                    $table->boolean('consent_share_profile')->default(false)->after('availability_confirmed');
                }
                if (! Schema::hasColumn('program_applications', 'attachment_path')) {
                    $table->string('attachment_path')->nullable()->after('consent_share_profile');
                }
                if (! Schema::hasColumn('program_applications', 'internal_note')) {
                    $table->text('internal_note')->nullable()->after('admin_notes');
                }
                if (! Schema::hasColumn('program_applications', 'decision_reason')) {
                    $table->text('decision_reason')->nullable()->after('internal_note');
                }
            });
        }

        if (! Schema::hasTable('program_participants')) {
            Schema::create('program_participants', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->foreignId('application_id')->nullable()->constrained('program_applications')->nullOnDelete();
                $table->string('status', 40)->default('in_progress');
                $table->unsignedTinyInteger('completion_percentage')->default(0);
                $table->boolean('at_risk')->default(false);
                $table->text('manager_notes')->nullable();
                $table->timestamp('enrolled_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
                $table->unique(['program_id', 'user_id']);
            });
        }

        if (! Schema::hasTable('program_sessions')) {
            Schema::create('program_sessions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('session_type', 40)->default('workshop');
                $table->timestamp('starts_at')->nullable();
                $table->unsignedInteger('duration_minutes')->nullable();
                $table->string('location')->nullable();
                $table->string('online_link')->nullable();
                $table->foreignId('mentor_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->boolean('is_required')->default(true);
                $table->json('materials')->nullable();
                $table->string('recording_link')->nullable();
                $table->boolean('attendance_required')->default(true);
                $table->string('status', 40)->default('scheduled');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('program_session_attendance')) {
            Schema::create('program_session_attendance', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_session_id')->constrained('program_sessions')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('status', 30)->default('not_started');
                $table->timestamp('attended_at')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();
                $table->unique(['program_session_id', 'user_id']);
            });
        }

        if (! Schema::hasTable('program_mentors')) {
            Schema::create('program_mentors', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->foreignId('program_session_id')->nullable()->constrained('program_sessions')->nullOnDelete();
                $table->foreignId('participant_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->text('mentor_notes')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('program_resources')) {
            Schema::create('program_resources', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->string('title');
                $table->string('resource_type', 40)->default('pdf');
                $table->string('category', 80)->nullable();
                $table->string('url')->nullable();
                $table->string('file_path')->nullable();
                $table->text('description')->nullable();
                $table->string('visibility', 40)->default('enrolled_only');
                $table->boolean('is_archived')->default(false);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('program_sponsors')) {
            Schema::create('program_sponsors', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->unsignedBigInteger('sponsor_id')->nullable();
                $table->string('name')->nullable();
                $table->string('logo_url')->nullable();
                $table->string('visibility_level', 40)->default('public');
                $table->string('cta_link')->nullable();
                $table->string('contribution_type', 40)->nullable();
                $table->string('sponsorship_tier', 60)->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('program_partners')) {
            Schema::create('program_partners', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->unsignedBigInteger('partner_id')->nullable();
                $table->string('name')->nullable();
                $table->string('logo_url')->nullable();
                $table->string('visibility_level', 40)->default('public');
                $table->string('cta_link')->nullable();
                $table->string('contribution_type', 40)->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('program_feedback')) {
            Schema::create('program_feedback', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('submitted_by_role', 40)->default('member');
                $table->unsignedTinyInteger('satisfaction_score')->nullable();
                $table->unsignedTinyInteger('usefulness_score')->nullable();
                $table->unsignedTinyInteger('mentor_quality_score')->nullable();
                $table->text('what_improved')->nullable();
                $table->text('what_missing')->nullable();
                $table->boolean('testimonial_permission')->default(false);
                $table->text('progress_notes')->nullable();
                $table->string('recommended_next_program')->nullable();
                $table->text('investor_readiness_note')->nullable();
                $table->text('partnership_readiness_note')->nullable();
                $table->text('community_contribution_note')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('program_progress')) {
            Schema::create('program_progress', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->unsignedTinyInteger('completion_percentage')->default(0);
                $table->unsignedInteger('tasks_completed')->default(0);
                $table->unsignedInteger('materials_completed')->default(0);
                $table->unsignedInteger('sessions_attended')->default(0);
                $table->string('status', 30)->default('not_started');
                $table->boolean('at_risk')->default(false);
                $table->text('mentor_feedback')->nullable();
                $table->text('self_assessment')->nullable();
                $table->json('milestones')->nullable();
                $table->timestamps();
                $table->unique(['program_id', 'user_id']);
            });
        }

        if (! Schema::hasTable('program_messages')) {
            Schema::create('program_messages', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->foreignId('sender_user_id')->constrained('users')->cascadeOnDelete();
                $table->string('scope', 30)->default('program');
                $table->string('subject')->nullable();
                $table->text('body');
                $table->json('target_user_ids')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('program_notes')) {
            Schema::create('program_notes', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained('cohorts')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('author_user_id')->constrained('users')->cascadeOnDelete();
                $table->text('note');
                $table->boolean('is_internal')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('program_notes');
        Schema::dropIfExists('program_messages');
        Schema::dropIfExists('program_progress');
        Schema::dropIfExists('program_feedback');
        Schema::dropIfExists('program_partners');
        Schema::dropIfExists('program_sponsors');
        Schema::dropIfExists('program_resources');
        Schema::dropIfExists('program_mentors');
        Schema::dropIfExists('program_session_attendance');
        Schema::dropIfExists('program_sessions');
        Schema::dropIfExists('program_participants');
    }
};
