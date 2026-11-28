<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_operation_audits', function (Blueprint $table): void {
            $table->id();
            $table->uuid('request_id')->unique();
            $table->string('project', 40)->index();
            $table->string('actor_id', 120);
            $table->string('operation', 80);
            $table->string('status', 20);
            $table->string('target_type', 80);
            $table->unsignedBigInteger('target_id');
            $table->string('target_key', 190);
            $table->string('field', 80);
            $table->string('source_url', 2048);
            $table->string('reason', 500);
            $table->char('before_hash', 64);
            $table->char('after_hash', 64);
            $table->timestamps();

            $table->index(['actor_id', 'status', 'created_at'], 'data_operation_actor_status_idx');
            $table->index(['target_type', 'target_id', 'created_at'], 'data_operation_target_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_operation_audits');
    }
};
