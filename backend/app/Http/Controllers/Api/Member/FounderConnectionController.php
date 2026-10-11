<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Models\FounderProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FounderConnectionController extends Controller
{
    public function store(Request $request, FounderProfile $founder)
    {
        abort_unless($founder->is_public && $founder->communityActive(), 409, 'This founder has not activated community communication.');
        abort_if($founder->user_id === $request->user()->id, 422, 'You cannot start a conversation with yourself.');
        $ids = [$request->user()->id, $founder->user_id];
        sort($ids);
        $room = DB::transaction(function () use ($ids, $founder, $request) {
            // Lock both users in a stable order so simultaneous clicks cannot create duplicate rooms.
            User::whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get();
            $room = ChatRoom::where('type', 'founder_direct')
                ->where('related_type', 'founder_pair_'.$ids[0])->where('related_id', $ids[1])->first();
            if ($room) {
                abort_unless($room->status === 'open' && $room->participants()->where('status', 'active')->whereIn('user_id', $ids)->count() === 2, 409, 'This conversation is unavailable.');
                return $room;
            }
            $room = ChatRoom::create([
                'uuid' => (string) Str::uuid(), 'type' => 'founder_direct', 'title' => $request->user()->name.' · '.($founder->display_name ?? $founder->user->name),
                'status' => 'open', 'visibility' => 'private', 'created_by_user_id' => $request->user()->id,
                'owner_user_id' => $request->user()->id, 'related_type' => 'founder_pair_'.$ids[0], 'related_id' => $ids[1],
            ]);
            foreach ($ids as $id) { $room->participants()->create(['user_id' => $id, 'role' => 'participant', 'status' => 'active', 'joined_at' => now()]); }
            return $room;
        });
        return response()->json(['data' => ['room_id' => $room->id]]);
    }
}
