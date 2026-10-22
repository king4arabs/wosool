<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('chat_rooms')) {
            Schema::create('chat_rooms', function (Blueprint $table): void {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->string('type', 60);
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('status', 30)->default('open');
                $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('owner_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('related_type', 80)->nullable();
                $table->unsignedBigInteger('related_id')->nullable();
                $table->string('visibility', 40)->default('private');
                $table->boolean('is_ai_assisted')->default(false);
                $table->timestamp('last_message_at')->nullable();
                $table->timestamp('archived_at')->nullable();
                $table->timestamps();
                $table->index(['related_type', 'related_id']);
            });
        }

        if (! Schema::hasTable('chat_room_participants')) {
            Schema::create('chat_room_participants', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('room_id')->constrained('chat_rooms')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('role', 30)->default('participant');
                $table->string('status', 30)->default('active');
                $table->timestamp('joined_at')->nullable();
                $table->unsignedBigInteger('last_read_message_id')->nullable();
                $table->timestamp('last_read_at')->nullable();
                $table->timestamps();
                $table->unique(['room_id', 'user_id'], 'chat_room_participants_room_user_uq');
            });
        }

        if (! Schema::hasTable('chat_messages')) {
            Schema::create('chat_messages', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('room_id')->constrained('chat_rooms')->cascadeOnDelete();
                $table->foreignId('sender_user_id')->constrained('users')->cascadeOnDelete();
                $table->string('message_type', 20)->default('text');
                $table->longText('body')->nullable();
                $table->json('metadata')->nullable();
                $table->foreignId('parent_message_id')->nullable()->constrained('chat_messages')->nullOnDelete();
                $table->timestamp('edited_at')->nullable();
                $table->softDeletes();
                $table->timestamps();
                $table->index(['room_id', 'created_at']);
            });
        }

        if (! Schema::hasTable('chat_message_reads')) {
            Schema::create('chat_message_reads', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('message_id')->constrained('chat_messages')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('read_at');
                $table->timestamps();
                $table->unique(['message_id', 'user_id'], 'chat_message_reads_msg_user_uq');
            });
        }

        if (! Schema::hasTable('chat_message_reactions')) {
            Schema::create('chat_message_reactions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('message_id')->constrained('chat_messages')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('reaction', 24);
                $table->timestamps();
                $table->unique(['message_id', 'user_id', 'reaction'], 'chat_message_reactions_msg_user_react_uq');
            });
        }

        if (! Schema::hasTable('help_requests')) {
            Schema::create('help_requests', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('requester_user_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->string('category', 80);
                $table->string('urgency', 20)->default('normal');
                $table->longText('description');
                $table->string('related_type', 80)->nullable();
                $table->unsignedBigInteger('related_id')->nullable();
                $table->string('visibility', 40)->default('private_admin');
                $table->string('status', 30)->default('open');
                $table->boolean('allow_ai_matching')->default(false);
                $table->foreignId('chat_room_id')->nullable()->constrained('chat_rooms')->nullOnDelete();
                $table->timestamps();
                $table->index(['related_type', 'related_id']);
            });
        }

        if (! Schema::hasTable('help_request_suggested_helpers')) {
            Schema::create('help_request_suggested_helpers', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('help_request_id')->constrained('help_requests')->cascadeOnDelete();
                $table->foreignId('helper_user_id')->constrained('users')->cascadeOnDelete();
                $table->text('reason')->nullable();
                $table->unsignedTinyInteger('score')->default(0);
                $table->string('status', 20)->default('suggested');
                $table->timestamps();
                $table->unique(['help_request_id', 'helper_user_id'], 'help_req_suggested_helpers_req_helper_uq');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('help_request_suggested_helpers');
        Schema::dropIfExists('help_requests');
        Schema::dropIfExists('chat_message_reactions');
        Schema::dropIfExists('chat_message_reads');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_room_participants');
        Schema::dropIfExists('chat_rooms');
    }
};
