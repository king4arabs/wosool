<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company_name')->nullable();
            $table->string('company_website')->nullable();
            $table->string('sector')->nullable();
            $table->string('stage')->nullable();
            $table->string('location')->nullable();
            $table->text('motivation')->nullable();
            $table->text('what_you_offer')->nullable();
            $table->text('what_you_need')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('referral_source')->nullable();
            $table->string('referrer_name')->nullable();
            $table->string('status')->default('submitted'); // submitted, reviewing, approved, rejected, waitlisted
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('applications'); }
};
