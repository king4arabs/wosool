<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatRoomResource;
use App\Models\ChatRoom;
use App\Models\HelpRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatModerationController extends Controller
{
    public function rooms(Request $request): JsonResponse
    {
        $query = ChatRoom::query()->with(['participants.user:id,name,email'])->latest();

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('type')) {
            $query->where('type', (string) $request->input('type'));
        }

        $rooms = $query->paginate($request->integer('per_page', 30));

        return ChatRoomResource::collection($rooms)->response();
    }

    public function unresolvedHelpRequests(Request $request): JsonResponse
    {
        $rows = HelpRequest::query()
            ->whereNotIn('status', ['resolved', 'closed'])
            ->latest()
            ->paginate($request->integer('per_page', 30));

        return response()->json($rows);
    }

    public function updateRoomStatus(Request $request, ChatRoom $room): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:open,pending,resolved,archived,closed']]);

        $room->update([
            'status' => $data['status'],
            'archived_at' => $data['status'] === 'archived' ? now() : null,
        ]);

        return response()->json(['message' => 'تم تحديث حالة الغرفة.']);
    }
}
