<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eoa_tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->string('name_ar');
            $table->string('name_en');
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['program_id', 'name_en']);
        });
        foreach (['program_applications', 'program_participants'] as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->foreignId('eoa_track_id')->nullable()->constrained('eoa_tracks')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (['program_participants', 'program_applications'] as $name) {
            Schema::table($name, fn (Blueprint $table) => $table->dropConstrainedForeignId('eoa_track_id'));
        }
        Schema::dropIfExists('eoa_tracks');
    }
};
