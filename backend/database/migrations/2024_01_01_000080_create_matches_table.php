<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('founder_a_id')->constrained('founder_profiles')->onDelete('cascade');
            $table->foreignId('founder_b_id')->constrained('founder_profiles')->onDelete('cascade');
            $table->decimal('match_score', 5, 2)->default(0);
            $table->json('match_reasons')->nullable();
            $table->string('status')->default('suggested'); // suggested, accepted, declined, connected
            $table->boolean('is_ai_generated')->default(true);
            $table->timestamps();
        });

        Schema::create('intros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->nullable()->constrained('matches')->onDelete('set null');
            $table->foreignId('requester_id')->constrained('founder_profiles')->onDelete('cascade');
            $table->foreignId('target_id')->constrained('founder_profiles')->onDelete('cascade');
            $table->foreignId('facilitator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('message')->nullable();
            $table->string('status')->default('requested'); // requested, approved, sent, accepted, declined
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('intros');
        Schema::dropIfExists('matches');
    }
};
