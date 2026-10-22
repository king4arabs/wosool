<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('founder_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->string('directory_key')->nullable()->unique();
            $table->string('display_name')->nullable();
            $table->string('position')->nullable();
            $table->json('translations')->nullable();
            $table->json('source_urls')->nullable();
            $table->date('source_reviewed_at')->nullable();
            $table->timestamp('claimed_at')->nullable();
        });
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('directory_key')->nullable()->unique();
            $table->json('translations')->nullable();
            $table->json('source_urls')->nullable();
            $table->date('source_reviewed_at')->nullable();
        });
        Schema::create('founder_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('founder_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by')->constrained('users');
            $table->text('email'); // Encrypted; never included in public resources.
            $table->text('recipient_evidence');
            $table->string('token_hash', 64)->unique();
            $table->string('status')->default('pending');
            $table->timestamp('expires_at');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
            $table->index(['founder_profile_id', 'status']);
        });
    }

    public function down(): void
    {
        // Keep researched records and ownership history during an application rollback.
        // Removing this schema requires an explicit data-retention decision.
        throw new LogicException('Founder ownership data must be retained. Roll back application code only; review schema removal separately.');
    }
};
