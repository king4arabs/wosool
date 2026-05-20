<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ThreadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::query()
            ->with(['sender:id,name,email', 'recipient:id,name,email'])
            ->where(function ($builder) use ($userId) {
                $builder->where('sender_id', $userId)->orWhere('recipient_id', $userId);
            })
            ->latest()
            ->get()
            ->groupBy(fn (Message $message) => $message->thread_id ?: $this->legacyThreadId($message));

        $threads = $messages->map(function ($threadMessages, $threadId) use ($userId) {
            /** @var Message $latest */
            $latest = $threadMessages->sortByDesc('created_at')->first();
            $counterparty = $latest->sender_id === $userId ? $latest->recipient : $latest->sender;

            return [
                'thread_id' => $threadId,
                'last_message' => $latest->body,
                'last_message_at' => $latest->created_at?->toIso8601String(),
                'unread_count' => $threadMessages
                    ->where('recipient_id', $userId)
                    ->whereNull('read_at')
                    ->count(),
                'counterparty' => [
                    'id' => $counterparty?->id,
                    'name' => $counterparty?->name,
                    'email' => $counterparty?->email,
                ],
            ];
        })->values();

        return response()->json(['data' => $threads]);
    }

    public function show(Request $request, string $threadId): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::query()
            ->with(['sender:id,name,email', 'recipient:id,name,email'])
            ->where('thread_id', $threadId)
            ->where(function ($builder) use ($userId) {
                $builder->where('sender_id', $userId)->orWhere('recipient_id', $userId);
            })
            ->orderBy('created_at')
            ->get();

        abort_if($messages->isEmpty(), 404, 'Thread not found.');

        Message::query()
            ->where('thread_id', $threadId)
            ->where('recipient_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'data' => [
                'thread_id' => $threadId,
                'messages' => MessageResource::collection($messages->fresh(['sender', 'recipient'])),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recipient_id' => ['required', 'exists:users,id', 'different:' . $request->user()->id],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $threadId = (string) Str::uuid();
        $message = Message::create([
            'thread_id' => $threadId,
            'sender_id' => $request->user()->id,
            'recipient_id' => $data['recipient_id'],
            'body' => $data['body'],
        ]);

        return response()->json([
            'message' => 'Thread created.',
            'data' => [
                'thread_id' => $threadId,
                'message' => new MessageResource($message->load(['sender', 'recipient'])),
            ],
        ], 201);
    }

    public function send(Request $request, string $threadId): JsonResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $existing = Message::query()
            ->where('thread_id', $threadId)
            ->where(function ($builder) use ($request) {
                $builder
                    ->where('sender_id', $request->user()->id)
                    ->orWhere('recipient_id', $request->user()->id);
            })
            ->latest()
            ->firstOrFail();

        $recipientId = $existing->sender_id === $request->user()->id
            ? $existing->recipient_id
            : $existing->sender_id;

        $message = Message::create([
            'thread_id' => $threadId,
            'sender_id' => $request->user()->id,
            'recipient_id' => $recipientId,
            'body' => $data['body'],
        ]);

        return response()->json([
            'message' => 'Message sent.',
            'data' => new MessageResource($message->load(['sender', 'recipient'])),
        ], 201);
    }

    private function legacyThreadId(Message $message): string
    {
        $ids = [$message->sender_id, $message->recipient_id];
        sort($ids);

        return implode(':', $ids);
    }
}
