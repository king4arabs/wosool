<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\AdminAction;
use App\Models\Event;
use App\Models\EventAgendaItem;
use App\Models\EventResource as EventResourceModel;
use App\Models\EventSpeaker;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    use GeneratesUniqueSlug;
    private const EVENT_TYPES = [
        'Wosool Event',
        'Founder Circle',
        'Founder Dinner',
        'Founder-led Session',
        'Office Hours',
        'Workshop',
        'Demo Day',
        'Partner Event',
        'Sponsor Event',
        'Public Ecosystem Event',
        'Webinar',
        'Networking Event',
        'Wellness Session',
        'Private Roundtable',
        'Investor Session',
    ];

    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->withCount(['attendees as rsvp_count']);

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($format = $request->input('format')) {
            $query->where('format', $format);
        }

        if ($status = $request->input('status')) {
            if (Schema::hasColumn('events', 'status_flow')) {
                $query->where(function ($builder) use ($status) {
                    $builder->where('status', $status)->orWhere('status_flow', $status);
                });
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('visibility') && Schema::hasColumn('events', 'visibility')) {
            $query->where('visibility', $request->input('visibility'));
        }

        $events = $query->with(['agendaItems', 'speakers', 'resources'])->orderBy('starts_at')->get();

        return response()->json([
            'data' => EventResource::collection($events),
            'meta' => [
                'total' => $events->count(),
                'upcoming' => Schema::hasColumn('events', 'status_flow')
                    ? ($events->where('status', 'upcoming')->count() + $events->where('status_flow', 'published')->count())
                    : $events->where('status', 'upcoming')->count(),
                'in_person' => $events->where('format', 'in-person')->count(),
                'virtual' => $events->where('format', 'virtual')->count(),
                'total_rsvps' => $events->sum('rsvp_count'),
                'waitlist_enabled' => Schema::hasColumn('events', 'waitlist_enabled') ? $events->where('waitlist_enabled', true)->count() : 0,
                'draft' => Schema::hasColumn('events', 'status_flow') ? $events->where('status_flow', 'draft')->count() : $events->where('status', 'draft')->count(),
                'published' => Schema::hasColumn('events', 'status_flow') ? $events->where('status_flow', 'published')->count() : $events->where('status', 'upcoming')->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['title'], 'event', Event::class);
        $data['created_by'] = $request->user()->id;

        $event = Event::create($this->normalizePayload($data));
        $this->syncRichRelations($event, $data);

        AdminAction::log($request->user()->id, 'event.created', 'event', $event->id, $event->title, null, $event->toArray());

        return response()->json([
            'message' => 'Event created.',
            'data' => new EventResource($event),
        ], 201);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $this->validated($request, $event);
        $beforeState = $event->toArray();

        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'event', Event::class, $event->id)
            : $event->slug;

        $event->update($this->normalizePayload($data));
        $this->syncRichRelations($event, $data);

        AdminAction::log($request->user()->id, 'event.updated', 'event', $event->id, $event->title, $beforeState, $event->fresh()->toArray());

        return response()->json([
            'message' => 'Event updated.',
            'data' => new EventResource($event->fresh()),
        ]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $beforeState = $event->toArray();
        $event->delete();

        AdminAction::log($request->user()->id, 'event.deleted', 'event', $event->id, $event->title, $beforeState, null);

        return response()->json(['message' => 'Event deleted.']);
    }

    private function validated(Request $request, ?Event $event = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('events', 'slug')->ignore($event?->id)],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'full_description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'registration_deadline' => ['nullable', 'date', 'before_or_equal:starts_at'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'location' => ['required', 'string', 'max:255'],
            'venue_name' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:120'],
            'google_maps_url' => ['nullable', 'url', 'max:255'],
            'type' => ['required', Rule::in(self::EVENT_TYPES)],
            'category' => ['nullable', 'string', 'max:100'],
            'format' => ['required', Rule::in(['virtual', 'in-person'])],
            'mode' => ['nullable', Rule::in(['in-person', 'online', 'hybrid'])],
            'virtual_link' => ['nullable', 'url', 'max:255'],
            'online_meeting_url' => ['nullable', 'url', 'max:255'],
            'image_url' => ['nullable', 'url', 'max:255'],
            'cover_image_url' => ['nullable', 'url', 'max:255'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['string', 'max:500'],
            'max_attendees' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'capacity_limit' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'is_public' => ['sometimes', 'boolean'],
            'visibility' => ['nullable', Rule::in(['public', 'members_only', 'founder_only', 'invite_only', 'circle_only'])],
            'requires_rsvp' => ['sometimes', 'boolean'],
            'rsvp_required' => ['sometimes', 'boolean'],
            'waitlist_enabled' => ['sometimes', 'boolean'],
            'allow_public_registration' => ['sometimes', 'boolean'],
            'allow_guest_registration' => ['sometimes', 'boolean'],
            'requires_approval' => ['sometimes', 'boolean'],
            'auto_approve_trusted_members' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(['draft', 'upcoming', 'live', 'completed', 'cancelled', 'pending_approval', 'hidden'])],
            'status_flow' => ['nullable', Rule::in(['draft', 'pending_review', 'published', 'registration_closed', 'live_now', 'completed', 'cancelled', 'archived'])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'organizer_type' => ['nullable', Rule::in(['wosool', 'founder', 'partner', 'sponsor', 'external_ecosystem'])],
            'organizer_name' => ['nullable', 'string', 'max:255'],
            'organizer_reference_id' => ['nullable', 'integer', 'min:1'],
            'targeting_rules' => ['nullable', 'array'],
            'invites' => ['nullable', 'array'],
            'featured_attendees' => ['nullable', 'array'],
            'sponsor_partner_blocks' => ['nullable', 'array'],
            'ai_settings' => ['nullable', 'array'],
            'rsvp_settings' => ['nullable', 'array'],
            'post_event_recap' => ['nullable', 'string'],
            'agenda' => ['nullable', 'array'],
            'agenda.*.title' => ['required_with:agenda', 'string', 'max:255'],
            'agenda.*.description' => ['nullable', 'string'],
            'agenda.*.speaker' => ['nullable', 'string', 'max:255'],
            'agenda.*.starts_at' => ['nullable', 'date'],
            'agenda.*.ends_at' => ['nullable', 'date'],
            'agenda.*.agenda_type' => ['nullable', Rule::in(['talk', 'networking', 'workshop', 'q&a', 'roundtable', 'break', 'demo', 'office_hour'])],
            'speakers' => ['nullable', 'array'],
            'speakers.*.name' => ['required_with:speakers', 'string', 'max:255'],
            'speakers.*.role' => ['nullable', 'string', 'max:255'],
            'speakers.*.company' => ['nullable', 'string', 'max:255'],
            'speakers.*.bio' => ['nullable', 'string'],
            'speakers.*.avatar_url' => ['nullable', 'url', 'max:500'],
            'speakers.*.social_links' => ['nullable', 'array'],
            'resources' => ['nullable', 'array'],
            'resources.*.title' => ['required_with:resources', 'string', 'max:255'],
            'resources.*.resource_type' => ['nullable', Rule::in(['pdf', 'slides', 'recording', 'link', 'template', 'document'])],
            'resources.*.url' => ['nullable', 'url', 'max:500'],
            'resources.*.file_path' => ['nullable', 'string', 'max:500'],
            'resources.*.description' => ['nullable', 'string'],
        ]);
    }

    private function normalizePayload(array $data): array
    {
        if (! isset($data['mode']) && isset($data['format'])) {
            $data['mode'] = $data['format'] === 'virtual' ? 'online' : 'in-person';
        }
        if (! isset($data['capacity_limit']) && isset($data['max_attendees'])) {
            $data['capacity_limit'] = $data['max_attendees'];
        }
        if (! isset($data['rsvp_required']) && isset($data['requires_rsvp'])) {
            $data['rsvp_required'] = $data['requires_rsvp'];
        }
        if (! isset($data['visibility']) && array_key_exists('is_public', $data)) {
            $data['visibility'] = $data['is_public'] ? 'public' : 'members_only';
        }
        if (! isset($data['full_description']) && isset($data['description'])) {
            $data['full_description'] = $data['description'];
        }
        if (! isset($data['short_description']) && isset($data['description'])) {
            $data['short_description'] = mb_substr((string) $data['description'], 0, 180);
        }
        if (! isset($data['status_flow']) && isset($data['status'])) {
            $data['status_flow'] = match ($data['status']) {
                'draft' => 'draft',
                'upcoming' => 'published',
                'live' => 'live_now',
                'completed' => 'completed',
                'cancelled' => 'cancelled',
                default => 'draft',
            };
        }

        return $data;
    }

    private function syncRichRelations(Event $event, array $data): void
    {
        if (array_key_exists('agenda', $data)) {
            $event->agendaItems()->delete();
            foreach ($data['agenda'] ?? [] as $index => $item) {
                EventAgendaItem::create([
                    'event_id' => $event->id,
                    'title' => $item['title'],
                    'description' => $item['description'] ?? null,
                    'speaker_name' => $item['speaker'] ?? null,
                    'starts_at' => $item['starts_at'] ?? null,
                    'ends_at' => $item['ends_at'] ?? null,
                    'agenda_type' => $item['agenda_type'] ?? 'talk',
                    'sort_order' => $index,
                ]);
            }
        }

        if (array_key_exists('speakers', $data)) {
            $event->speakers()->delete();
            foreach ($data['speakers'] ?? [] as $index => $speaker) {
                EventSpeaker::create([
                    'event_id' => $event->id,
                    'name' => $speaker['name'],
                    'role' => $speaker['role'] ?? null,
                    'company' => $speaker['company'] ?? null,
                    'bio' => $speaker['bio'] ?? null,
                    'avatar_url' => $speaker['avatar_url'] ?? null,
                    'social_links' => $speaker['social_links'] ?? [],
                    'is_featured' => (bool) ($speaker['is_featured'] ?? false),
                    'sort_order' => $index,
                ]);
            }
        }

        if (array_key_exists('resources', $data)) {
            $event->resources()->delete();
            foreach ($data['resources'] ?? [] as $index => $resource) {
                EventResourceModel::create([
                    'event_id' => $event->id,
                    'title' => $resource['title'],
                    'resource_type' => $resource['resource_type'] ?? 'document',
                    'url' => $resource['url'] ?? null,
                    'file_path' => $resource['file_path'] ?? null,
                    'description' => $resource['description'] ?? null,
                    'sort_order' => $index,
                ]);
            }
        }
    }
}
