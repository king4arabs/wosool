<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $shortDescription = $this->eventAttr('short_description');
        $fullDescription = $this->eventAttr('full_description');
        $registrationDeadline = $this->eventAttr('registration_deadline');
        $timezone = $this->eventAttr('timezone');
        $venueName = $this->eventAttr('venue_name');
        $city = $this->eventAttr('city');
        $country = $this->eventAttr('country');
        $googleMapsUrl = $this->eventAttr('google_maps_url');
        $category = $this->eventAttr('category');
        $mode = $this->eventAttr('mode');
        $onlineMeetingUrl = $this->eventAttr('online_meeting_url');
        $coverImageUrl = $this->eventAttr('cover_image_url');
        $galleryImages = $this->eventAttr('gallery_images', []);
        $capacityLimit = $this->eventAttr('capacity_limit');
        $visibility = $this->eventAttr('visibility');
        $rsvpRequired = $this->eventAttr('rsvp_required', $this->requires_rsvp);
        $waitlistEnabled = $this->eventAttr('waitlist_enabled', false);
        $allowPublicRegistration = $this->eventAttr('allow_public_registration', true);
        $allowGuestRegistration = $this->eventAttr('allow_guest_registration', false);
        $requiresApproval = $this->eventAttr('requires_approval', false);
        $autoApproveTrustedMembers = $this->eventAttr('auto_approve_trusted_members', true);
        $statusFlow = $this->eventAttr('status_flow', $this->status);
        $organizerType = $this->eventAttr('organizer_type');
        $organizerName = $this->eventAttr('organizer_name');
        $organizerReferenceId = $this->eventAttr('organizer_reference_id');
        $targetingRules = $this->eventAttr('targeting_rules', []);
        $invites = $this->eventAttr('invites', []);
        $featuredAttendees = $this->eventAttr('featured_attendees', []);
        $sponsorPartnerBlocks = $this->eventAttr('sponsor_partner_blocks', []);
        $aiSettings = $this->eventAttr('ai_settings', []);
        $rsvpSettings = $this->eventAttr('rsvp_settings', []);
        $discussionThreadId = $this->eventAttr('discussion_thread_id');
        $postEventRecap = $this->eventAttr('post_event_recap');

        // These namespaces are protected by backend member/admin middleware.
        $memberOrAdmin = $request->is('api/v1/member/*', 'api/v1/admin/*');
        $admin = $request->is('api/v1/admin/*');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => is_string($shortDescription) ? $shortDescription : null,
            'full_description' => is_string($fullDescription) ? $fullDescription : null,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'registration_deadline' => $registrationDeadline instanceof \DateTimeInterface
                ? $registrationDeadline->format(DATE_ATOM)
                : (is_string($registrationDeadline) ? $registrationDeadline : null),
            'timezone' => is_string($timezone) ? $timezone : null,
            'location' => $this->location,
            'venue_name' => is_string($venueName) ? $venueName : null,
            'city' => is_string($city) ? $city : null,
            'country' => is_string($country) ? $country : null,
            'google_maps_url' => is_string($googleMapsUrl) ? $googleMapsUrl : null,
            'type' => $this->type,
            'category' => is_string($category) ? $category : null,
            'format' => $this->format,
            'mode' => is_string($mode) ? $mode : null,
            'virtual_link' => $this->when($memberOrAdmin, $this->virtual_link),
            'online_meeting_url' => $this->when($memberOrAdmin, is_string($onlineMeetingUrl) ? $onlineMeetingUrl : null),
            'image_url' => $this->image_url,
            'cover_image_url' => is_string($coverImageUrl) ? $coverImageUrl : null,
            'gallery_images' => is_array($galleryImages) ? $galleryImages : [],
            'max_attendees' => $this->max_attendees,
            'capacity_limit' => is_numeric($capacityLimit) ? (int) $capacityLimit : null,
            'is_public' => (bool) $this->is_public,
            'visibility' => is_string($visibility) ? $visibility : null,
            'requires_rsvp' => (bool) $this->requires_rsvp,
            'rsvp_required' => (bool) $rsvpRequired,
            'waitlist_enabled' => (bool) $waitlistEnabled,
            'allow_public_registration' => (bool) $allowPublicRegistration,
            'allow_guest_registration' => (bool) $allowGuestRegistration,
            'requires_approval' => (bool) $requiresApproval,
            'auto_approve_trusted_members' => (bool) $autoApproveTrustedMembers,
            'status' => $this->status,
            'status_flow' => is_string($statusFlow) ? $statusFlow : $this->status,
            'tags' => $this->tags ?? [],
            'organizer_type' => is_string($organizerType) ? $organizerType : null,
            'organizer_name' => is_string($organizerName) ? $organizerName : null,
            'organizer_reference_id' => is_numeric($organizerReferenceId) ? (int) $organizerReferenceId : null,
            'targeting_rules' => $this->when($admin, is_array($targetingRules) ? $targetingRules : []),
            'invites' => $this->when($admin, is_array($invites) ? $invites : []),
            'featured_attendees' => is_array($featuredAttendees) ? $featuredAttendees : [],
            'sponsor_partner_blocks' => is_array($sponsorPartnerBlocks) ? $sponsorPartnerBlocks : [],
            'ai_settings' => $this->when($admin, is_array($aiSettings) ? $aiSettings : []),
            'rsvp_settings' => $this->when($admin, is_array($rsvpSettings) ? $rsvpSettings : []),
            'discussion_thread_id' => $this->when($memberOrAdmin, is_string($discussionThreadId) ? $discussionThreadId : null),
            'post_event_recap' => is_string($postEventRecap) ? $postEventRecap : null,
            'agenda' => $this->whenLoaded('agendaItems', fn () => $this->agendaItems->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'speaker' => $item->speaker_name,
                'starts_at' => $item->starts_at?->toIso8601String(),
                'ends_at' => $item->ends_at?->toIso8601String(),
                'agenda_type' => $item->agenda_type,
                'sort_order' => $item->sort_order,
            ])->values()),
            'speakers' => $this->whenLoaded('speakers', fn () => $this->speakers->map(fn ($speaker) => [
                'id' => $speaker->id,
                'name' => $speaker->name,
                'role' => $speaker->role,
                'company' => $speaker->company,
                'bio' => $speaker->bio,
                'avatar_url' => $speaker->avatar_url,
                'social_links' => $speaker->social_links ?? [],
                'is_featured' => (bool) $speaker->is_featured,
                'sort_order' => $speaker->sort_order,
            ])->values()),
            'resources' => $this->whenLoaded('resources', fn () => $this->resources->map(fn ($resource) => [
                'id' => $resource->id,
                'title' => $resource->title,
                'resource_type' => $resource->resource_type,
                'url' => $resource->url,
                'file_path' => $resource->file_path,
                'description' => $resource->description,
                'sort_order' => $resource->sort_order,
            ])->values()),
            'rsvp_count' => $this->whenCounted('attendees'),
            'is_saved' => (bool) ($this->is_saved ?? false),
            'relevance_score' => (int) ($this->relevance_score ?? 0),
            'why_recommended' => $this->why_recommended ?? null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    private function eventAttr(string $key, mixed $default = null): mixed
    {
        if (! method_exists($this->resource, 'getAttributes')) {
            return $default;
        }

        $attributes = $this->resource->getAttributes();

        if (! array_key_exists($key, $attributes)) {
            return $default;
        }

        return $this->resource->{$key};
    }
}
