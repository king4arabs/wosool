<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'starts_at', 'ends_at', 'location',
        'type', 'format', 'virtual_link', 'image_url', 'max_attendees',
        'is_public', 'requires_rsvp', 'status', 'tags', 'created_by',
        'short_description', 'full_description', 'category', 'cover_image_url',
        'gallery_images', 'organizer_type', 'organizer_name', 'organizer_reference_id',
        'visibility', 'registration_deadline', 'timezone', 'mode', 'venue_name',
        'city', 'country', 'google_maps_url', 'online_meeting_url', 'capacity_limit',
        'waitlist_enabled', 'rsvp_required', 'allow_public_registration',
        'allow_guest_registration', 'requires_approval', 'auto_approve_trusted_members',
        'targeting_rules', 'invites', 'featured_attendees', 'sponsor_partner_blocks',
        'ai_settings', 'rsvp_settings', 'discussion_thread_id', 'post_event_recap',
        'status_flow',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'tags' => 'array',
        'gallery_images' => 'array',
        'targeting_rules' => 'array',
        'invites' => 'array',
        'featured_attendees' => 'array',
        'sponsor_partner_blocks' => 'array',
        'ai_settings' => 'array',
        'rsvp_settings' => 'array',
        'is_public' => 'boolean',
        'requires_rsvp' => 'boolean',
        'waitlist_enabled' => 'boolean',
        'rsvp_required' => 'boolean',
        'allow_public_registration' => 'boolean',
        'allow_guest_registration' => 'boolean',
        'requires_approval' => 'boolean',
        'auto_approve_trusted_members' => 'boolean',
        'registration_deadline' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_rsvps')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function agendaItems(): HasMany
    {
        return $this->hasMany(EventAgendaItem::class)->orderBy('sort_order');
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(EventSpeaker::class)->orderBy('sort_order');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(EventResource::class)->orderBy('sort_order');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(EventBookmark::class);
    }
}
