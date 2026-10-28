<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->timestamp('community_registration_started_at')->nullable());
        Schema::table('applications', fn (Blueprint $table) => $table->json('onboarding_data')->nullable());
        Schema::create('registration_email_otps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('code_hash', 64)->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('sent_at');
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('registration_email_otps');
        Schema::table('applications', fn (Blueprint $table) => $table->dropColumn('onboarding_data'));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('community_registration_started_at'));
    }
};
