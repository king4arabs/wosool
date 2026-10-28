<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('founder_outreach', function (Blueprint $table) {
            $table->id();
            $table->foreignId('founder_profile_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('research_queued')->index();
            $table->text('email')->nullable();
            $table->text('evidence')->nullable();
            $table->string('source_url', 2048)->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('next_attempt_at')->nullable()->index();
            $table->string('last_error')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('founder_outreach'); }
};
