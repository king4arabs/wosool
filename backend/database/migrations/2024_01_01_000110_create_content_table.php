<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('news_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('category'); // founder-update, company-milestone, announcement, event-recap, partner-news, sponsor-highlight, ecosystem, opportunity, digest, editorial
            $table->string('image_url')->nullable();
            $table->string('author_name')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);
            $table->string('status')->default('draft'); // draft, published, archived
            $table->json('tags')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('type'); // guide, template, video, tool, report
            $table->string('category')->nullable();
            $table->string('file_url')->nullable();
            $table->string('external_url')->nullable();
            $table->boolean('is_members_only')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down(): void {
        Schema::dropIfExists('resources');
        Schema::dropIfExists('news_items');
    }
};
