<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::create('wow_event_registrations', function (Blueprint $table) {
   $table->id();
   $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
   $table->string('phone',50);
   $table->string('company',255);
   $table->boolean('eo_interest')->default(false);
   $table->boolean('eoa_interest')->default(false);
   $table->timestamp('consented_at');
   $table->timestamp('ticket_email_sent_at')->nullable();
   $table->timestamps();
  });
 }
 public function down(): void { Schema::dropIfExists('wow_event_registrations'); }
};
