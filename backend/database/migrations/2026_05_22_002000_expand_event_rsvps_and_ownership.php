<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('events')) {
            Schema::table('events', function (Blueprint $table): void {
                if (! Schema::hasColumn('events', 'organizer_id')) {
                    $table->unsignedBigInteger('organizer_id')->nullable()->after('organizer_type');
                }
                if (! Schema::hasColumn('events', 'managed_by_user_id')) {
                    $table->foreignId('managed_by_user_id')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('events', 'created_by_user_id')) {
                    $table->foreignId('created_by_user_id')->nullable()->after('managed_by_user_id')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('events', 'approved_by_user_id')) {
                    $table->foreignId('approved_by_user_id')->nullable()->after('created_by_user_id')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('events', 'published_by_user_id')) {
                    $table->foreignId('published_by_user_id')->nullable()->after('approved_by_user_id')->constrained('users')->nullOnDelete();
                }
            });
        }

        if (Schema::hasTable('event_rsvps')) {
            Schema::table('event_rsvps', function (Blueprint $table): void {
                if (! Schema::hasColumn('event_rsvps', 'attendance_type')) {
                    $table->string('attendance_type', 20)->nullable()->after('status');
                }
                if (! Schema::hasColumn('event_rsvps', 'reason_to_attend')) {
                    $table->text('reason_to_attend')->nullable()->after('attendance_type');
                }
                if (! Schema::hasColumn('event_rsvps', 'what_user_is_looking_for')) {
                    $table->text('what_user_is_looking_for')->nullable()->after('reason_to_attend');
                }
                if (! Schema::hasColumn('event_rsvps', 'allow_ai_networking_suggestions')) {
                    $table->boolean('allow_ai_networking_suggestions')->default(true)->after('what_user_is_looking_for');
                }
                if (! Schema::hasColumn('event_rsvps', 'calendar_sync_option')) {
                    $table->string('calendar_sync_option', 20)->nullable()->after('allow_ai_networking_suggestions');
                }
                if (! Schema::hasColumn('event_rsvps', 'approved_by_user_id')) {
                    $table->foreignId('approved_by_user_id')->nullable()->after('calendar_sync_option')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('event_rsvps', 'decision_at')) {
                    $table->timestamp('decision_at')->nullable()->after('approved_by_user_id');
                }
                if (! Schema::hasColumn('event_rsvps', 'rejection_reason')) {
                    $table->text('rejection_reason')->nullable()->after('decision_at');
                }
                if (! Schema::hasColumn('event_rsvps', 'waitlist_promoted_at')) {
                    $table->timestamp('waitlist_promoted_at')->nullable()->after('rejection_reason');
                }
                if (! Schema::hasColumn('event_rsvps', 'waitlist_confirmation_deadline')) {
                    $table->timestamp('waitlist_confirmation_deadline')->nullable()->after('waitlist_promoted_at');
                }
                if (! Schema::hasColumn('event_rsvps', 'checked_in_at')) {
                    $table->timestamp('checked_in_at')->nullable()->after('waitlist_confirmation_deadline');
                }
                if (! Schema::hasColumn('event_rsvps', 'no_show_at')) {
                    $table->timestamp('no_show_at')->nullable()->after('checked_in_at');
                }
                if (! Schema::hasColumn('event_rsvps', 'cancelled_by_user')) {
                    $table->boolean('cancelled_by_user')->default(false)->after('no_show_at');
                }
            });
        }
    }

    public function down(): void
    {
        // Keep backward-safe; no destructive rollback for shared environments.
    }
};

