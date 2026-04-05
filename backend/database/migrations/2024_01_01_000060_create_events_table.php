<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('location')->nullable();
            $table->string('type'); // wosool, partner, public, sponsor, private
            $table->string('format')->default('in-person'); // in-person, virtual, hybrid
            $table->string('virtual_link')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('max_attendees')->nullable();
            $table->boolean('is_public')->default(true);
            $table->boolean('requires_rsvp')->default(true);
            $table->string('status')->default('upcoming'); // draft, upcoming, live, completed, cancelled
            $table->json('tags')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('event_rsvps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('confirmed'); // confirmed, waitlisted, cancelled
            $table->timestamps();
            $table->unique(['event_id', 'user_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('event_rsvps');
        Schema::dropIfExists('events');
    }
};
