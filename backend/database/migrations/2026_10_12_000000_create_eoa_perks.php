<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eoa_perks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained('ecosystem_organizations')->restrictOnDelete();
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('details_en');
            $table->text('details_ar');
            $table->string('approval_reference', 500)->nullable();
            $table->boolean('is_approved')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eoa_perks');
    }
};
