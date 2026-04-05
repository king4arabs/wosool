<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('founder_company_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('founder_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_profile_id')->constrained()->onDelete('cascade');
            $table->string('role')->nullable();
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
            $table->unique(['founder_profile_id', 'company_profile_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('founder_company_links'); }
};
