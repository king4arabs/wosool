<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category'); // onboarding, circles, growth, fundraising, technical, wellness, leadership, ecosystem, ai
            $table->string('duration')->nullable();
            $table->json('target_stages')->nullable();
            $table->integer('cohort_size')->nullable();
            $table->json('benefits')->nullable();
            $table->boolean('is_open')->default(false);
            $table->timestamp('application_deadline')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('cohorts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('status')->default('forming'); // forming, active, completed
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('cohorts');
        Schema::dropIfExists('programs');
    }
};
