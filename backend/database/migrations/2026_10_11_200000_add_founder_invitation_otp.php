<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('founder_invitations', function (Blueprint $table) {
            $table->string('otp_hash', 64)->nullable();
            $table->unsignedTinyInteger('otp_attempts')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('founder_invitations', function (Blueprint $table) {
            $table->dropColumn(['otp_hash', 'otp_attempts']);
        });
    }
};
