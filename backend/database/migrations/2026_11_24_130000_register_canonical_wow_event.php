<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Preserve existing administrator decisions, including soft-deleted records.
        if (DB::table('events')->where('slug', 'eo-riyadh-wow-2026')->exists()) return;
        DB::table('events')->insert([
            'slug' => 'eo-riyadh-wow-2026',
            'title' => 'EO Riyadh WOW Event',
            'description' => 'Golf, entrepreneurial conversations, networking and dinner with EO Riyadh and EO Riyadh Accelerator.',
            'starts_at' => '2026-12-11 11:00:00',
            'ends_at' => '2026-12-11 21:00:00',
            'timezone' => 'Asia/Riyadh',
            'location' => 'Golf Club Wadi Safar, Diriyah',
            'venue_name' => 'Golf Club Wadi Safar',
            'city' => 'Diriyah',
            'country' => 'Saudi Arabia',
            'google_maps_url' => 'https://maps.app.goo.gl/G4XGAB566UbG4Lsn9',
            'type' => 'Networking Event',
            'format' => 'in-person',
            'mode' => 'in-person',
            'organizer_name' => 'EO Riyadh',
            'organizer_type' => 'partner',
            'cover_image_url' => 'https://wosool.org/events/wow-2026/hero-golf-sunset.jpg',
            'is_public' => true,
            'visibility' => 'public',
            'status' => 'upcoming',
            'status_flow' => 'published',
            'requires_rsvp' => true,
            'rsvp_required' => true,
            'requires_approval' => true,
            'allow_public_registration' => true,
            'allow_guest_registration' => true,
            'auto_approve_trusted_members' => false,
            'tags' => json_encode(['EO Riyadh', 'EOA', 'golf', 'networking']),
            'rsvp_settings' => json_encode(['provider' => 'luma', 'url' => 'https://luma.com/8fccrqkx']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Intentionally retain the operational record and related registrations.
        // Administrators can archive it; rollback must not erase participant data.
    }
};
