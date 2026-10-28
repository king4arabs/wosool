<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id(); $table->string('email')->unique(); $table->string('locale', 2)->default('ar');
            $table->string('status')->default('pending')->index(); $table->boolean('explicit_opt_in')->default(false);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('confirmation_hash', 64)->nullable(); $table->timestamp('confirmation_expires_at')->nullable();
            $table->timestamp('confirmation_sent_at')->nullable(); $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable(); $table->timestamps();
        });
        Schema::create('newsletter_deliveries', function (Blueprint $table) {
            $table->id(); $table->foreignId('subscriber_id')->constrained('newsletter_subscribers')->cascadeOnDelete();
            $table->string('campaign'); $table->string('status')->default('pending');
            $table->unsignedSmallInteger('attempts')->default(0); $table->timestamp('sent_at')->nullable(); $table->timestamps();
            $table->unique(['subscriber_id', 'campaign']);
        });
    }
    public function down(): void { Schema::dropIfExists('newsletter_deliveries'); Schema::dropIfExists('newsletter_subscribers'); }
};
