<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatRoomResource;
use App\Mail\WosoolMail;
use App\Models\AnalyticsEvent;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\HelpRequest;
use App\Models\HelpRequestSuggestedHelper;
use App\Models\User;
use App\Services\ChatRoomService;
use App\Services\Mailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HelpRequestController extends Controller
{
    public function __construct(private readonly ChatRoomService $rooms)
    {
    }

    /** Questions a member may see from others (never their own, never closed ones). */
    private const SHARED_VISIBILITY = ['community_public', 'founder_circle'];

    private const ACTIVE_HELP = ['invited', 'volunteered'];

    private const TOPIC_KEYWORDS = [
        'fundraising' => ['fundrais', 'investor', 'venture', 'seed', 'series', 'تمويل', 'مستثمر'],
        'growth' => ['growth', 'sales', 'go-to-market', 'expansion', 'نمو', 'مبيعات', 'توسع'],
        'product' => ['product', 'ux', 'design', 'منتج', 'تصميم'],
        'hiring' => ['hiring', 'recruit', 'talent', 'people', 'توظيف', 'مواهب'],
        'legal' => ['legal', 'law', 'contract', 'compliance', 'قانون', 'عقود', 'امتثال'],
        'finance' => ['finance', 'cfo', 'accounting', 'pricing', 'مالي', 'محاسبة', 'تسعير'],
        'technology' => ['engineering', 'tech', 'software', 'cto', 'data', 'تقني', 'برمجة'],
        'partnerships' => ['partnership', 'business development', 'شراكات', 'شراكة'],
        'marketing' => ['marketing', 'brand', 'content', 'تسويق', 'علامة'],
        'operations' => ['operations', 'logistics', 'supply', 'process', 'عمليات', 'تشغيل'],
        'founder_wellness' => ['coach', 'leadership', 'mentor', 'قيادة', 'إرشاد'],
    ];

    public function index(Request $request): JsonResponse
    {
        if ($request->input('scope') === 'community') {
            return $this->community($request);
        }

        $query = HelpRequest::query()
            ->with(['room.participants.user:id,name', 'suggestedHelpers.helper:id,name'])
            ->withCount(['suggestedHelpers as helpers_count' => fn ($helpers) => $helpers->whereIn('status', self::ACTIVE_HELP)]);

        if (! $request->user()->isPlatformAdmin() || $request->input('scope') === 'mine') {
            $query->where('requester_user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $rows = $query->latest()->paginate(min(50, max(1, $request->integer('per_page', 20))));

        return response()->json($rows);
    }

    /** Open questions shared with the community, plus ones where this member was suggested as a helper. */
    private function community(Request $request): JsonResponse
    {
        $me = $request->user()->id;
        $query = HelpRequest::query()
            ->where('requester_user_id', '<>', $me)
            ->whereNotIn('status', ['resolved', 'closed'])
            ->where(fn ($visible) => $visible
                ->whereIn('visibility', self::SHARED_VISIBILITY)
                ->orWhere(fn ($matched) => $matched
                    ->where('visibility', 'matched_founders')
                    ->whereHas('suggestedHelpers', fn ($helpers) => $helpers->where('helper_user_id', $me))))
            ->with('requester:id,name')
            ->withCount(['suggestedHelpers as helpers_count' => fn ($helpers) => $helpers->whereIn('status', self::ACTIVE_HELP)])
            ->withExists(['suggestedHelpers as offered_by_me' => fn ($helpers) => $helpers->where('helper_user_id', $me)->whereIn('status', self::ACTIVE_HELP)]);

        if ($request->filled('category')) {
            $query->where('category', (string) $request->input('category'));
        }
        if ($request->filled('q')) {
            $needle = '%'.mb_substr(trim((string) $request->input('q')), 0, 100).'%';
            $query->where(fn ($text) => $text->where('title', 'like', $needle)->orWhere('description', 'like', $needle));
        }

        $rows = $query->orderByRaw("case urgency when 'high' then 0 when 'normal' then 1 else 2 end")
            ->latest()
            ->paginate(min(50, max(1, $request->integer('per_page', 20))));

        $rows->getCollection()->transform(fn (HelpRequest $item) => $this->communityItem($item));

        return response()->json($rows);
    }

    /** What another member may see: no email addresses, and the room only once they have joined it. */
    private function communityItem(HelpRequest $item): array
    {
        return [
            'id' => $item->id,
            'title' => $item->title,
            'description' => $item->description,
            'category' => $item->category,
            'urgency' => $item->urgency,
            'status' => $item->status,
            'created_at' => $item->created_at,
            'requester' => ['name' => $item->requester?->name],
            'helpers_count' => (int) $item->helpers_count,
            'offered_by_me' => (bool) $item->offered_by_me,
            'chat_room_id' => $item->offered_by_me ? $item->chat_room_id : null,
        ];
    }

    private function canSee(HelpRequest $helpRequest, User $user): bool
    {
        if ($helpRequest->requester_user_id === $user->id || $user->isPlatformAdmin()) {
            return true;
        }
        if (in_array($helpRequest->status, ['resolved', 'closed'], true)) {
            return false;
        }

        if (in_array($helpRequest->visibility, self::SHARED_VISIBILITY, true)) {
            return true;
        }

        // A suggestion only grants access while the owner still shares the question with matched founders.
        return $helpRequest->visibility === 'matched_founders'
            && $helpRequest->suggestedHelpers()->where('helper_user_id', $user->id)->exists();
    }

    public function show(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $isOwner = $helpRequest->requester_user_id === $request->user()->id;
        $isAdmin = $request->user()->isPlatformAdmin();
        abort_unless($this->canSee($helpRequest, $request->user()), 403);

        if (! $isOwner && ! $isAdmin) {
            $item = HelpRequest::query()->whereKey($helpRequest->id)
                ->with('requester:id,name')
                ->withCount(['suggestedHelpers as helpers_count' => fn ($helpers) => $helpers->whereIn('status', self::ACTIVE_HELP)])
                ->withExists(['suggestedHelpers as offered_by_me' => fn ($helpers) => $helpers->where('helper_user_id', $request->user()->id)->whereIn('status', self::ACTIVE_HELP)])
                ->firstOrFail();

            return response()->json(['data' => $this->communityItem($item)]);
        }

        return response()->json([
            'data' => $helpRequest->load(['room.participants.user:id,name', 'suggestedHelpers.helper:id,name']),
        ]);
    }

    /** A member volunteers: they join the question's private room and the requester is emailed. */
    public function offerHelp(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $helper = $request->user();
        abort_if($helpRequest->requester_user_id === $helper->id, 422, 'You cannot offer help on your own question.');
        abort_unless($this->canSee($helpRequest, $helper), 403);
        abort_if(in_array($helpRequest->status, ['resolved', 'closed'], true), 409, 'This question is already resolved.');

        $data = $request->validate(['note' => ['nullable', 'string', 'max:2000']]);

        $existing = HelpRequestSuggestedHelper::query()
            ->where('help_request_id', $helpRequest->id)
            ->where('helper_user_id', $helper->id)
            ->first();
        $alreadyHelping = $existing && in_array($existing->status, self::ACTIVE_HELP, true);

        $room = DB::transaction(function () use ($helpRequest, $helper, $data, $alreadyHelping) {
            $requester = $helpRequest->requester()->firstOrFail();
            $room = $helpRequest->chat_room_id ? ChatRoom::query()->find($helpRequest->chat_room_id) : null;
            if (! $room) {
                $room = $this->rooms->ensureRoom([
                    'type' => 'founder_help_room',
                    'title' => 'طلب مساعدة: '.$helpRequest->title,
                    'description' => $helpRequest->description,
                    'status' => 'open',
                    'created_by_user_id' => $requester->id,
                    'owner_user_id' => $requester->id,
                    'related_type' => 'help_request',
                    'related_id' => $helpRequest->id,
                    'visibility' => 'private',
                ], [['user_id' => $requester->id, 'role' => 'owner']]);
                $helpRequest->update(['chat_room_id' => $room->id]);
            }

            $this->rooms->addParticipant($room->id, $helper->id, 'helper');
            HelpRequestSuggestedHelper::updateOrCreate(
                ['help_request_id' => $helpRequest->id, 'helper_user_id' => $helper->id],
                ['status' => 'volunteered', 'reason' => 'Offered to help from the community questions list.', 'score' => 80]
            );

            if (! empty($data['note']) && trim($data['note']) !== '') {
                ChatMessage::create([
                    'room_id' => $room->id,
                    'sender_user_id' => $helper->id,
                    'message_type' => 'text',
                    'body' => trim($data['note']),
                    'metadata' => ['source' => 'help_offer'],
                ]);
                $room->forceFill(['last_message_at' => now()])->save();
            }

            if (in_array($helpRequest->status, ['open', 'matching', 'helpers_invited'], true)) {
                $helpRequest->update(['status' => 'in_progress']);
            }

            if (! $alreadyHelping) {
                Mailer::safely($requester->email, WosoolMail::helpOffered($requester->name, $helper->name, $helpRequest->title, $room->id), ['help_request_id' => $helpRequest->id]);
                AnalyticsEvent::track(
                    eventName: 'help_offered',
                    userId: $helper->id,
                    entityType: 'help_request',
                    entityId: $helpRequest->id,
                    properties: ['category' => $helpRequest->category]
                );
            }

            return $room;
        });

        return response()->json([
            'message' => $alreadyHelping ? 'You are already helping with this question.' : 'Thanks — you joined the conversation for this question.',
            'data' => ['chat_room_id' => $room->id, 'already_helping' => $alreadyHelping],
        ], $alreadyHelping ? 200 : 201);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:fundraising,growth,product,hiring,legal,finance,technology,partnerships,marketing,operations,founder_wellness,other'],
            'urgency' => ['required', 'in:low,normal,high'],
            'description' => ['required', 'string', 'max:12000'],
            'related_type' => ['nullable', 'string', 'max:80'],
            'related_id' => ['nullable', 'integer'],
            'visibility' => ['required', 'in:private_admin,matched_founders,founder_circle,community_public'],
            'allow_ai_matching' => ['nullable', 'boolean'],
        ]);

        $requester = $request->user();

        $room = $this->rooms->ensureRoom([
            'type' => 'founder_help_room',
            'title' => 'طلب مساعدة: ' . $data['title'],
            'description' => $data['description'],
            'status' => 'open',
            'created_by_user_id' => $requester->id,
            'owner_user_id' => $requester->id,
            'related_type' => 'help_request',
            'related_id' => null,
            'visibility' => 'private',
            'is_ai_assisted' => (bool) ($data['allow_ai_matching'] ?? false),
        ], [
            ['user_id' => $requester->id, 'role' => 'owner'],
        ]);

        $helpRequest = HelpRequest::create([
            'requester_user_id' => $requester->id,
            'title' => $data['title'],
            'category' => $data['category'],
            'urgency' => $data['urgency'],
            'description' => $data['description'],
            'related_type' => $data['related_type'] ?? null,
            'related_id' => $data['related_id'] ?? null,
            'visibility' => $data['visibility'],
            'status' => 'open',
            'allow_ai_matching' => (bool) ($data['allow_ai_matching'] ?? false),
            'chat_room_id' => $room->id,
        ]);

        $room->update(['related_id' => $helpRequest->id]);

        AnalyticsEvent::track(
            eventName: 'help_request_created',
            userId: $requester->id,
            entityType: 'help_request',
            entityId: $helpRequest->id,
            properties: ['category' => $helpRequest->category, 'urgency' => $helpRequest->urgency]
        );

        return response()->json([
            'message' => 'تم إنشاء طلب المساعدة وفتح غرفة المحادثة.',
            'data' => [
                'help_request' => $helpRequest,
                'chat_room' => new ChatRoomResource($room->load('participants.user:id,name,email')),
            ],
        ], 201);
    }

    public function update(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $isOwner = $helpRequest->requester_user_id === $request->user()->id;
        $isAdmin = $request->user()->isPlatformAdmin();
        abort_unless($isOwner || $isAdmin, 403);

        $data = $request->validate([
            'status' => ['nullable', 'in:open,matching,helpers_invited,in_progress,resolved,closed'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:12000'],
            'visibility' => ['nullable', 'in:private_admin,matched_founders,founder_circle,community_public'],
        ]);

        $helpRequest->update($data);

        return response()->json(['message' => 'تم تحديث طلب المساعدة.', 'data' => $helpRequest->fresh()]);
    }

    public function suggestHelpers(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $isOwner = $helpRequest->requester_user_id === $request->user()->id;
        $isAdmin = $request->user()->isPlatformAdmin();
        abort_unless($isOwner || $isAdmin, 403);

        // Rank members whose profile says they can help with this topic; fall back to other active members.
        $keywords = self::TOPIC_KEYWORDS[$helpRequest->category] ?? [];
        $eligible = fn () => User::query()
            ->where('id', '<>', $helpRequest->requester_user_id)
            ->whereHas('roles', fn ($roles) => $roles->whereIn('name', ['member', 'admin']))
            ->whereNotNull('email_verified_at')
            ->with('founderProfile:id,user_id,offers,skills,skills_tags,bio,tagline,sector');

        // Filter on the profile text in SQL so topic matches are found however large the community is.
        $matching = $keywords ? $eligible()
            ->whereHas('founderProfile', function ($profile) use ($keywords) {
                $profile->where(function ($text) use ($keywords) {
                    foreach ($keywords as $word) {
                        foreach (['offers', 'skills', 'skills_tags', 'bio', 'tagline', 'sector'] as $column) {
                            $text->orWhereRaw('lower('.$column.') like ?', ['%'.mb_strtolower($word).'%']);
                        }
                    }
                });
            })
            ->limit(100)
            ->get() : collect();
        $fallback = $eligible()->whereNotIn('id', $matching->pluck('id'))->latest('id')->limit(5)->get();

        $candidates = $matching->concat($fallback)
            ->map(function (User $user) use ($keywords) {
                $profile = $user->founderProfile;
                $text = mb_strtolower(json_encode([$profile?->offers, $profile?->skills, $profile?->skills_tags, $profile?->bio, $profile?->tagline, $profile?->sector], JSON_UNESCAPED_UNICODE) ?: '');
                $hits = collect($keywords)->filter(fn ($word) => str_contains($text, mb_strtolower($word)))->count();

                return ['user' => $user, 'hits' => $hits, 'has_profile' => (bool) $profile];
            })
            ->sortByDesc(fn ($row) => [$row['hits'], $row['has_profile']])
            ->take(5)
            ->values();

        foreach ($candidates as $idx => $row) {
            HelpRequestSuggestedHelper::updateOrCreate(
                ['help_request_id' => $helpRequest->id, 'helper_user_id' => $row['user']->id],
                [
                    'reason' => $row['hits'] > 0 ? 'Profile mentions experience with this topic.' : 'Active member who may be able to help.',
                    'score' => min(99, ($row['hits'] > 0 ? 80 : 60) + min(15, $row['hits'] * 5) - $idx),
                    'status' => 'suggested',
                ]
            );
        }

        return response()->json([
            'message' => 'تم اقتراح مساعدين للطلب.',
            'data' => $helpRequest->fresh('suggestedHelpers.helper:id,name'),
        ]);
    }

    public function inviteHelper(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $isOwner = $helpRequest->requester_user_id === $request->user()->id;
        $isAdmin = $request->user()->isPlatformAdmin();
        abort_unless($isOwner || $isAdmin, 403);

        $data = $request->validate(['helper_user_id' => ['required', 'integer', 'exists:users,id']]);

        $suggestion = HelpRequestSuggestedHelper::updateOrCreate(
            ['help_request_id' => $helpRequest->id, 'helper_user_id' => (int) $data['helper_user_id']],
            ['status' => 'invited', 'reason' => 'دعوة مباشرة من صاحب الطلب أو الإدارة.', 'score' => 75]
        );

        if ($helpRequest->chat_room_id) {
            $this->rooms->addParticipant($helpRequest->chat_room_id, (int) $data['helper_user_id'], 'helper');
        }

        $helpRequest->update(['status' => 'helpers_invited']);

        return response()->json(['message' => 'تمت دعوة المساعد.', 'data' => $suggestion->fresh('helper:id,name,email')]);
    }

    public function resolve(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $isOwner = $helpRequest->requester_user_id === $request->user()->id;
        $isAdmin = $request->user()->isPlatformAdmin();
        abort_unless($isOwner || $isAdmin, 403);

        $helpRequest->update(['status' => 'resolved']);

        if ($helpRequest->chat_room_id) {
            $helpRequest->room?->update(['status' => 'resolved']);
        }

        return response()->json(['message' => 'تم حل طلب المساعدة.', 'data' => $helpRequest->fresh()]);
    }
}
