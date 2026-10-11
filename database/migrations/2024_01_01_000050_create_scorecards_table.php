<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('scorecards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('founder_profile_id')->constrained()->onDelete('cascade');
            $table->integer('overall_score')->default(0); // 0-100
            $table->integer('profile_completeness')->default(0);
            $table->integer('community_engagement')->default(0);
            $table->integer('execution_track_record')->default(0);
            $table->integer('network_strength')->default(0);
            $table->integer('knowledge_contribution')->default(0);
            $table->text('ai_summary')->nullable();
            $table->json('improvement_suggestions')->nullable();
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('scorecard_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scorecard_id')->constrained()->onDelete('cascade');
            $table->string('metric_key');
            $table->string('metric_label');
            $table->integer('value');
            $table->integer('max_value')->default(100);
            $table->text('explanation')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('scorecard_metrics');
        Schema::dropIfExists('scorecards');
    }
};
