<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('events')) {
            Schema::table('events', function (Blueprint $table): void {
                if (! Schema::hasColumn('events', 'short_description')) {
                    $table->string('short_description', 500)->nullable()->after('description');
                }
                if (! Schema::hasColumn('events', 'full_description')) {
                    $table->longText('full_description')->nullable()->after('short_description');
                }
                if (! Schema::hasColumn('events', 'category')) {
                    $table->string('category', 100)->nullable()->after('type');
                }
                if (! Schema::hasColumn('events', 'cover_image_url')) {
                    $table->string('cover_image_url')->nullable()->after('image_url');
                }
                if (! Schema::hasColumn('events', 'gallery_images')) {
                    $table->json('gallery_images')->nullable()->after('cover_image_url');
                }
                if (! Schema::hasColumn('events', 'organizer_type')) {
                    $table->string('organizer_type', 50)->default('wosool')->after('tags');
                }
                if (! Schema::hasColumn('events', 'organizer_name')) {
                    $table->string('organizer_name')->nullable()->after('organizer_type');
                }
                if (! Schema::hasColumn('events', 'organizer_reference_id')) {
                    $table->unsignedBigInteger('organizer_reference_id')->nullable()->after('organizer_name');
                }
                if (! Schema::hasColumn('events', 'visibility')) {
                    $table->string('visibility', 40)->default('public')->after('is_public');
                }
                if (! Schema::hasColumn('events', 'registration_deadline')) {
                    $table->timestamp('registration_deadline')->nullable()->after('ends_at');
                }
                if (! Schema::hasColumn('events', 'timezone')) {
                    $table->string('timezone', 64)->default('Asia/Riyadh')->after('registration_deadline');
                }
                if (! Schema::hasColumn('events', 'mode')) {
                    $table->string('mode', 20)->default('in-person')->after('format');
                }
                if (! Schema::hasColumn('events', 'venue_name')) {
                    $table->string('venue_name')->nullable()->after('location');
                }
                if (! Schema::hasColumn('events', 'city')) {
                    $table->string('city', 120)->nullable()->after('venue_name');
                }
                if (! Schema::hasColumn('events', 'country')) {
                    $table->string('country', 120)->nullable()->after('city');
                }
                if (! Schema::hasColumn('events', 'google_maps_url')) {
                    $table->string('google_maps_url')->nullable()->after('country');
                }
                if (! Schema::hasColumn('events', 'online_meeting_url')) {
                    $table->string('online_meeting_url')->nullable()->after('google_maps_url');
                }
                if (! Schema::hasColumn('events', 'capacity_limit')) {
                    $table->integer('capacity_limit')->nullable()->after('max_attendees');
                }
                if (! Schema::hasColumn('events', 'waitlist_enabled')) {
                    $table->boolean('waitlist_enabled')->default(true)->after('capacity_limit');
                }
                if (! Schema::hasColumn('events', 'rsvp_required')) {
                    $table->boolean('rsvp_required')->default(true)->after('waitlist_enabled');
                }
                if (! Schema::hasColumn('events', 'allow_public_registration')) {
                    $table->boolean('allow_public_registration')->default(true)->after('rsvp_required');
                }
                if (! Schema::hasColumn('events', 'allow_guest_registration')) {
                    $table->boolean('allow_guest_registration')->default(false)->after('allow_public_registration');
                }
                if (! Schema::hasColumn('events', 'requires_approval')) {
                    $table->boolean('requires_approval')->default(false)->after('allow_guest_registration');
                }
                if (! Schema::hasColumn('events', 'auto_approve_trusted_members')) {
                    $table->boolean('auto_approve_trusted_members')->default(true)->after('requires_approval');
                }
                if (! Schema::hasColumn('events', 'targeting_rules')) {
                    $table->json('targeting_rules')->nullable()->after('auto_approve_trusted_members');
                }
                if (! Schema::hasColumn('events', 'invites')) {
                    $table->json('invites')->nullable()->after('targeting_rules');
                }
                if (! Schema::hasColumn('events', 'featured_attendees')) {
                    $table->json('featured_attendees')->nullable()->after('invites');
                }
                if (! Schema::hasColumn('events', 'sponsor_partner_blocks')) {
                    $table->json('sponsor_partner_blocks')->nullable()->after('featured_attendees');
                }
                if (! Schema::hasColumn('events', 'ai_settings')) {
                    $table->json('ai_settings')->nullable()->after('sponsor_partner_blocks');
                }
                if (! Schema::hasColumn('events', 'rsvp_settings')) {
                    $table->json('rsvp_settings')->nullable()->after('ai_settings');
                }
                if (! Schema::hasColumn('events', 'discussion_thread_id')) {
                    $table->string('discussion_thread_id', 100)->nullable()->after('rsvp_settings');
                }
                if (! Schema::hasColumn('events', 'post_event_recap')) {
                    $table->longText('post_event_recap')->nullable()->after('discussion_thread_id');
                }
                if (! Schema::hasColumn('events', 'status_flow')) {
                    $table->string('status_flow', 40)->default('draft')->after('status');
                }
            });
        }

        if (! Schema::hasTable('event_agenda_items')) {
            Schema::create('event_agenda_items', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('speaker_name')->nullable();
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->string('agenda_type', 50)->default('talk');
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('event_speakers')) {
            Schema::create('event_speakers', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->string('name');
                $table->string('role')->nullable();
                $table->string('company')->nullable();
                $table->text('bio')->nullable();
                $table->string('avatar_url')->nullable();
                $table->json('social_links')->nullable();
                $table->boolean('is_featured')->default(false);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('event_resources')) {
            Schema::create('event_resources', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->string('title');
                $table->string('resource_type', 50)->default('document');
                $table->string('url')->nullable();
                $table->string('file_path')->nullable();
                $table->text('description')->nullable();
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('event_bookmarks')) {
            Schema::create('event_bookmarks', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['event_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('event_bookmarks');
        Schema::dropIfExists('event_resources');
        Schema::dropIfExists('event_speakers');
        Schema::dropIfExists('event_agenda_items');
    }
};

