<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->string('invite_token', 96)->nullable()->unique()->after('reviewed_at');
            $table->timestamp('invite_sent_at')->nullable()->after('invite_token');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->dropColumn(['invite_sent_at', 'invite_token']);
        });
    }
};

