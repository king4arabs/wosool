<?php

use App\Models\ChatRoomParticipant;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('chat.room.{roomId}', function ($user, int $roomId) {
    return ChatRoomParticipant::query()
        ->where('room_id', $roomId)
        ->where('user_id', $user->id)
        ->whereIn('status', ['active', 'invited', 'muted'])
        ->exists();
});

Broadcast::channel('chat.room.presence.{roomId}', function ($user, int $roomId) {
    $allowed = ChatRoomParticipant::query()
        ->where('room_id', $roomId)
        ->where('user_id', $user->id)
        ->whereIn('status', ['active', 'invited', 'muted'])
        ->exists();

    if (! $allowed) {
        return false;
    }

    return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email];
});

Broadcast::channel('user.{userId}.notifications', function ($user, int $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('event.{eventId}.room', function ($user, int $eventId) {
    return ChatRoomParticipant::query()
        ->where('user_id', $user->id)
        ->whereHas('room', fn ($q) => $q->where('related_type', 'event')->where('related_id', $eventId))
        ->exists();
});

Broadcast::channel('program.{programId}.room', function ($user, int $programId) {
    return ChatRoomParticipant::query()
        ->where('user_id', $user->id)
        ->whereHas('room', fn ($q) => $q->where('related_type', 'program')->where('related_id', $programId))
        ->exists();
});

Broadcast::channel('cohort.{cohortId}.room', function ($user, int $cohortId) {
    return ChatRoomParticipant::query()
        ->where('user_id', $user->id)
        ->whereHas('room', fn ($q) => $q->where('related_type', 'cohort')->where('related_id', $cohortId))
        ->exists();
});
