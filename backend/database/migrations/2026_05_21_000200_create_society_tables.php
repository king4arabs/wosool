<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('society_posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('author_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('author_founder_profile_id')->nullable()->constrained('founder_profiles')->nullOnDelete();
            $table->foreignId('author_company_profile_id')->nullable()->constrained('company_profiles')->nullOnDelete();
            $table->enum('post_type', ['ask', 'offer'])->index();
            $table->string('title', 220);
            $table->text('content');
            $table->string('sector', 80)->nullable()->index();
            $table->enum('priority', ['normal', 'urgent'])->default('normal')->index();
            $table->json('attachments')->nullable();
            $table->enum('moderation_status', ['published', 'hidden', 'flagged', 'archived'])->default('published')->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('society_post_reactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('society_post_id')->constrained('society_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('reaction_type', ['like', 'insightful', 'support'])->default('like');
            $table->timestamps();

            $table->unique(['society_post_id', 'user_id', 'reaction_type'], 'society_post_user_reaction_unique');
        });

        Schema::create('society_post_comments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('society_post_id')->constrained('society_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('society_post_saves', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('society_post_id')->constrained('society_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['society_post_id', 'user_id'], 'society_post_user_save_unique');
        });

        Schema::create('society_post_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('society_post_id')->constrained('society_posts')->cascadeOnDelete();
            $table->foreignId('reporter_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 120)->nullable();
            $table->text('details')->nullable();
            $table->enum('status', ['open', 'resolved', 'dismissed'])->default('open')->index();
            $table->foreignId('resolved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->unique(['society_post_id', 'reporter_user_id'], 'society_post_reporter_unique');
        });

        Schema::create('society_post_help_offers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('society_post_id')->constrained('society_posts')->cascadeOnDelete();
            $table->foreignId('helper_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->enum('status', ['submitted', 'accepted', 'declined'])->default('submitted')->index();
            $table->timestamps();

            $table->unique(['society_post_id', 'helper_user_id'], 'society_post_helper_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('society_post_help_offers');
        Schema::dropIfExists('society_post_reports');
        Schema::dropIfExists('society_post_saves');
        Schema::dropIfExists('society_post_comments');
        Schema::dropIfExists('society_post_reactions');
        Schema::dropIfExists('society_posts');
    }
};
