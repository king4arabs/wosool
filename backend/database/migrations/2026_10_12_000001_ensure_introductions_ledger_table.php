<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fresh installs skip the legacy 2026_05_20 core-table migration because the 2024
 * baseline schema already exists, which left `introductions_ledger` uncreated and
 * broke introductions, matches, scorecards and the admin intro console.
 * This migration creates the table (with the activation-flow columns) when missing
 * and is a no-op on databases that already have it.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('introductions_ledger')) {
            return;
        }

        Schema::create('introductions_ledger', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('source_founder_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->foreignId('target_founder_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->string('routing_status', 32)->default('INTRO_PENDING')->index();
            $table->text('payload_context_brief');
            $table->text('tracking_notes')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('source_credit_consumed_at')->nullable()->index();
            $table->timestamp('intro_email_sent_at')->nullable()->index();
            $table->string('thread_id')->nullable()->index();
            $table->timestamps();

            $table->index(['source_founder_id', 'target_founder_id'], 'introductions_ledger_route_idx');
        });
    }

    public function down(): void
    {
        // Intentionally left in place: dropping would destroy introduction history
        // on databases where the table pre-existed this migration.
    }
};
