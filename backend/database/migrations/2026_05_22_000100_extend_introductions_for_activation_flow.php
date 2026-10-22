<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('introductions_ledger')) {
            return;
        }

        Schema::table('introductions_ledger', function (Blueprint $table): void {
            if (! Schema::hasColumn('introductions_ledger', 'source_credit_consumed_at')) {
                $table->timestamp('source_credit_consumed_at')->nullable()->index();
            }
            if (! Schema::hasColumn('introductions_ledger', 'intro_email_sent_at')) {
                $table->timestamp('intro_email_sent_at')->nullable()->index();
            }
            if (! Schema::hasColumn('introductions_ledger', 'thread_id')) {
                $table->string('thread_id')->nullable()->index();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('introductions_ledger')) {
            return;
        }

        Schema::table('introductions_ledger', function (Blueprint $table): void {
            if (Schema::hasColumn('introductions_ledger', 'thread_id')) {
                $table->dropColumn('thread_id');
            }
            if (Schema::hasColumn('introductions_ledger', 'intro_email_sent_at')) {
                $table->dropColumn('intro_email_sent_at');
            }
            if (Schema::hasColumn('introductions_ledger', 'source_credit_consumed_at')) {
                $table->dropColumn('source_credit_consumed_at');
            }
        });
    }
};
