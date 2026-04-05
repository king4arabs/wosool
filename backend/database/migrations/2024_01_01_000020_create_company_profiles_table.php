<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('website')->nullable();
            $table->string('sector')->nullable();
            $table->string('stage')->nullable();
            $table->string('location')->nullable();
            $table->string('country_code', 3)->nullable();
            $table->year('founded_year')->nullable();
            $table->integer('team_size')->nullable();
            $table->boolean('is_hiring')->default(false);
            $table->boolean('is_fundraising')->default(false);
            $table->boolean('is_collaborating')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('company_profiles'); }
};
