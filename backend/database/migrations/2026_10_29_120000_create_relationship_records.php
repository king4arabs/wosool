<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('relationship_records', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 10);
            $table->string('name');
            $table->string('organization')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('stage', 30);
            $table->string('priority', 10)->default('normal');
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('follow_up_on')->nullable();
            $table->string('campaign')->nullable();
            $table->string('coverage_url', 2048)->nullable();
            $table->text('notes')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index(['kind', 'stage', 'follow_up_on']);
        });
        Schema::create('relationship_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('relationship_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relationship_activities');
        Schema::dropIfExists('relationship_records');
    }
};
