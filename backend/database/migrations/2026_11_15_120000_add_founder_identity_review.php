<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('founder_identity_reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('candidates')->nullable();
            $table->foreignId('founder_profile_id')->nullable()->constrained()->nullOnDelete();
            $table->string('decision')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
        Schema::table('founder_profiles', function (Blueprint $table): void {
            $table->timestamp('admin_verified_at')->nullable();
            $table->foreignId('admin_verified_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        throw new LogicException('Roll back application code without discarding identity-review and ownership records.');
    }
};
