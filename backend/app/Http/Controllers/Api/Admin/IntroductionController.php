<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\IntroductionResource;
use App\Models\AdminAction;
use App\Models\IntroductionLedger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntroductionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = IntroductionLedger::query()
            ->with(['sourceFounder', 'targetFounder']);

        if ($request->filled('status')) {
            $query->where('routing_status', $request->string('status')->toString());
        }

        $intros = $query->latest()->paginate($request->integer('per_page', 20))->withQueryString();

        return response()->json([
            'data' => IntroductionResource::collection(collect($intros->items())),
            'meta' => [
                'total' => $intros->total(),
                'current_page' => $intros->currentPage(),
                'per_page' => $intros->perPage(),
                'pending' => IntroductionLedger::where('routing_status', 'INTRO_PENDING')->count(),
                'approved' => IntroductionLedger::where('routing_status', 'INTRO_APPROVED')->count(),
                'expired' => IntroductionLedger::where('routing_status', 'ROUTE_EXPIRED')->count(),
                'declined' => IntroductionLedger::where('routing_status', 'DECLINED')->count(),
            ],
            'links' => [
                'next' => $intros->nextPageUrl(),
                'prev' => $intros->previousPageUrl(),
            ],
        ]);
    }

    public function update(Request $request, IntroductionLedger $intro): JsonResponse
    {
        $validated = $request->validate([
            'routing_status' => ['required', 'in:INTRO_PENDING,INTRO_APPROVED,ROUTE_EXPIRED,DECLINED'],
            'tracking_notes' => ['nullable', 'string', 'max:4000'],
        ]);

        $before = $intro->toArray();

        $intro->update([
            'routing_status' => $validated['routing_status'],
            'tracking_notes' => $validated['tracking_notes'] ?? $intro->tracking_notes,
        ]);

        AdminAction::log(
            adminId: $request->user()->id,
            action: 'intro.status.updated',
            entityType: 'introduction_ledger',
            entityId: $intro->id,
            notes: 'Admin updated intro route status',
            beforeState: $before,
            afterState: $intro->fresh()->toArray(),
        );

        return response()->json([
            'message' => 'Introduction route updated.',
            'data' => new IntroductionResource($intro->fresh(['sourceFounder', 'targetFounder'])),
        ]);
    }
}
