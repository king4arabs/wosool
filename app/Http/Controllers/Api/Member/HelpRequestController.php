<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatRoomResource;
use App\Models\AnalyticsEvent;
use App\Models\HelpRequest;
use App\Models\HelpRequestSuggestedHelper;
use App\Models\User;
use App\Services\ChatRoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HelpRequestController extends Controller
{
    public function __construct(private readonly ChatRoomService $rooms)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = HelpRequest::query()->with(['room.participants.user:id,name,email', 'suggestedHelpers.helper:id,name,email']);

        if ($request->user()->role_token !== 'admin') {
            $query->where('requester_user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $rows = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json($rows);
    }

    public function show(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $isOwner = $helpRequest->requester_user_id === $request->user()->id;
        $isAdmin = $request->user()->role_token === 'admin';
        abort_unless($isOwner || $isAdmin, 403);

        return response()->json([
            'data' => $helpRequest->load(['room.participants.user:id,name,email', 'suggestedHelpers.helper:id,name,email']),
        ]);
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
        $isAdmin = $request->user()->role_token === 'admin';
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
        $isAdmin = $request->user()->role_token === 'admin';
        abort_unless($isOwner || $isAdmin, 403);

        $helpers = User::query()
            ->where('id', '<>', $helpRequest->requester_user_id)
            ->whereIn('role_token', ['founder', 'mentor', 'admin'])
            ->limit(5)
            ->get();

        foreach ($helpers as $idx => $helper) {
            HelpRequestSuggestedHelper::updateOrCreate(
                ['help_request_id' => $helpRequest->id, 'helper_user_id' => $helper->id],
                [
                    'reason' => 'تطابق أولي بناءً على الدور واحتياج الطلب.',
                    'score' => max(60, 95 - ($idx * 7)),
                    'status' => 'suggested',
                ]
            );
        }

        return response()->json([
            'message' => 'تم اقتراح مساعدين للطلب.',
            'data' => $helpRequest->fresh('suggestedHelpers.helper:id,name,email'),
        ]);
    }

    public function inviteHelper(Request $request, HelpRequest $helpRequest): JsonResponse
    {
        $isOwner = $helpRequest->requester_user_id === $request->user()->id;
        $isAdmin = $request->user()->role_token === 'admin';
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
        $isAdmin = $request->user()->role_token === 'admin';
        abort_unless($isOwner || $isAdmin, 403);

        $helpRequest->update(['status' => 'resolved']);

        if ($helpRequest->chat_room_id) {
            $helpRequest->room?->update(['status' => 'resolved']);
        }

        return response()->json(['message' => 'تم حل طلب المساعدة.', 'data' => $helpRequest->fresh()]);
    }
}
