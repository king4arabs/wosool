<?php

namespace App\Http\Controllers\Api\Member;

use App\Events\ChatMessageCreated;
use App\Events\ChatMessageRead;
use App\Events\ChatTypingUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\ChatMessageResource;
use App\Http\Resources\ChatRoomResource;
use App\Models\AnalyticsEvent;
use App\Models\ChatMessage;
use App\Models\ChatMessageRead as ChatMessageReadModel;
use App\Models\ChatRoom;
use App\Models\ChatRoomParticipant;
use App\Services\ChatRoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatRoomController extends Controller
{
    public function __construct(private readonly ChatRoomService $rooms)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = ChatRoom::query()
            ->with(['participants.user:id,name,email'])
            ->whereHas('participants', fn ($q) => $q->where('user_id', $userId)->whereIn('status', ['active', 'invited', 'muted']));

        if ($request->filled('type')) {
            $query->where('type', (string) $request->input('type'));
        }

        if ($request->filled('q')) {
            $q = trim((string) $request->input('q'));
            $query->where('title', 'like', "%{$q}%");
        }

        $rooms = $query->orderByDesc('last_message_at')->orderByDesc('updated_at')->paginate($request->integer('per_page', 20));

        return ChatRoomResource::collection($rooms)->response();
    }

    public function show(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorizeParticipant($request->user()->id, $room->id);

        $room->load(['participants.user:id,name,email']);
        $messages = ChatMessage::query()
            ->with(['sender:id,name,email', 'reactions'])
            ->where('room_id', $room->id)
            ->orderBy('created_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json([
            'data' => [
                'room' => new ChatRoomResource($room),
                'messages' => ChatMessageResource::collection($messages),
            ],
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'max:60'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'related_type' => ['nullable', 'string', 'max:80'],
            'related_id' => ['nullable', 'integer'],
            'visibility' => ['nullable', 'in:private,community,circle,admins_only'],
            'is_ai_assisted' => ['nullable', 'boolean'],
            'participants' => ['nullable', 'array'],
            'participants.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'participants.*.role' => ['nullable', 'string', 'max:30'],
        ]);

        $participants = collect($data['participants'] ?? [])->push([
            'user_id' => $request->user()->id,
            'role' => 'owner',
        ])->unique('user_id')->values()->all();

        $room = $this->rooms->ensureRoom([
            'type' => $data['type'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'related_type' => $data['related_type'] ?? null,
            'related_id' => $data['related_id'] ?? null,
            'visibility' => $data['visibility'] ?? 'private',
            'is_ai_assisted' => (bool) ($data['is_ai_assisted'] ?? false),
            'created_by_user_id' => $request->user()->id,
            'owner_user_id' => $request->user()->id,
        ], $participants);

        return response()->json([
            'message' => 'تم إنشاء غرفة المحادثة.',
            'data' => new ChatRoomResource($room->load(['participants.user:id,name,email'])),
        ], 201);
    }

    public function sendMessage(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorizeParticipant($request->user()->id, $room->id);

        $data = $request->validate([
            'message_type' => ['nullable', 'in:text,file,system,ai,event'],
            'body' => ['nullable', 'string', 'max:12000'],
            'metadata' => ['nullable', 'array'],
            'parent_message_id' => ['nullable', 'integer', 'exists:chat_messages,id'],
        ]);

        $message = ChatMessage::create([
            'room_id' => $room->id,
            'sender_user_id' => $request->user()->id,
            'message_type' => $data['message_type'] ?? 'text',
            'body' => $data['body'] ?? '',
            'metadata' => $data['metadata'] ?? [],
            'parent_message_id' => $data['parent_message_id'] ?? null,
        ]);

        $room->forceFill(['last_message_at' => now()])->save();

        ChatMessageCreated::dispatch($message->load('sender:id,name,email'));

        AnalyticsEvent::track(
            eventName: 'chat_message_sent',
            userId: $request->user()->id,
            entityType: 'chat_room',
            entityId: $room->id,
            properties: ['message_id' => $message->id, 'type' => $message->message_type]
        );

        return response()->json([
            'message' => 'تم إرسال الرسالة.',
            'data' => new ChatMessageResource($message->load(['sender:id,name,email', 'reactions'])),
        ], 201);
    }

    public function updateMessage(Request $request, ChatMessage $message): JsonResponse
    {
        abort_unless($message->sender_user_id === $request->user()->id, 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:12000'],
            'metadata' => ['nullable', 'array'],
        ]);

        $message->update([
            'body' => $data['body'],
            'metadata' => $data['metadata'] ?? $message->metadata,
            'edited_at' => now(),
        ]);

        return response()->json(['message' => 'تم تعديل الرسالة.', 'data' => new ChatMessageResource($message->fresh('sender'))]);
    }

    public function deleteMessage(Request $request, ChatMessage $message): JsonResponse
    {
        $roomId = $message->room_id;
        $isAdmin = in_array('admin', (array) ($request->user()->roles ?? []), true) || $request->user()->role_token === 'admin';
        abort_unless($message->sender_user_id === $request->user()->id || $isAdmin, 403);
        $message->delete();

        event(new ChatTypingUpdated($roomId, $request->user()->id, false));

        return response()->json(['message' => 'تم حذف الرسالة.']);
    }

    public function typing(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorizeParticipant($request->user()->id, $room->id);
        $data = $request->validate(['is_typing' => ['required', 'boolean']]);

        ChatTypingUpdated::dispatch($room->id, $request->user()->id, (bool) $data['is_typing']);

        return response()->json(['message' => 'تم تحديث حالة الكتابة.']);
    }

    public function read(Request $request, ChatRoom $room): JsonResponse
    {
        $participant = $this->authorizeParticipant($request->user()->id, $room->id);
        $data = $request->validate(['last_read_message_id' => ['nullable', 'integer', 'exists:chat_messages,id']]);

        $lastReadId = $data['last_read_message_id'] ?? ChatMessage::query()->where('room_id', $room->id)->max('id');

        $participant->update(['last_read_message_id' => $lastReadId, 'last_read_at' => now()]);

        if ($lastReadId) {
            $messageIds = ChatMessage::query()->where('room_id', $room->id)->where('id', '<=', $lastReadId)->pluck('id');
            foreach ($messageIds as $messageId) {
                ChatMessageReadModel::updateOrCreate(
                    ['message_id' => $messageId, 'user_id' => $request->user()->id],
                    ['read_at' => now()]
                );
            }
        }

        ChatMessageRead::dispatch($room->id, $request->user()->id, $lastReadId ? (int) $lastReadId : null);

        return response()->json(['message' => 'تم تحديث حالة القراءة.']);
    }

    public function addParticipant(Request $request, ChatRoom $room): JsonResponse
    {
        $owner = $room->participants()->where('user_id', $request->user()->id)->whereIn('role', ['owner', 'admin'])->first();
        abort_unless($owner, 403);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role' => ['nullable', 'in:owner,participant,helper,mentor,admin,partner,sponsor'],
        ]);

        $participant = $this->rooms->addParticipant($room->id, (int) $data['user_id'], (string) ($data['role'] ?? 'participant'));

        return response()->json(['message' => 'تمت إضافة المشارك.', 'data' => $participant]);
    }

    public function removeParticipant(Request $request, ChatRoom $room, int $user): JsonResponse
    {
        $owner = $room->participants()->where('user_id', $request->user()->id)->whereIn('role', ['owner', 'admin'])->first();
        abort_unless($owner, 403);

        $target = $room->participants()->where('user_id', $user)->firstOrFail();
        $target->update(['status' => 'removed']);

        return response()->json(['message' => 'تمت إزالة المشارك.']);
    }

    public function updateStatus(Request $request, ChatRoom $room): JsonResponse
    {
        $owner = $room->participants()->where('user_id', $request->user()->id)->whereIn('role', ['owner', 'admin'])->first();
        abort_unless($owner, 403);

        $data = $request->validate(['status' => ['required', 'in:open,pending,resolved,archived,closed']]);
        $room->update(['status' => $data['status'], 'archived_at' => $data['status'] === 'archived' ? now() : null]);

        return response()->json(['message' => 'تم تحديث حالة الغرفة.']);
    }

    private function authorizeParticipant(int $userId, int $roomId): ChatRoomParticipant
    {
        return ChatRoomParticipant::query()
            ->where('room_id', $roomId)
            ->where('user_id', $userId)
            ->whereIn('status', ['active', 'invited', 'muted'])
            ->firstOrFail();
    }
}
