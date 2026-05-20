<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIntroductionRequest;
use App\Http\Resources\IntroductionResource;
use App\Models\AnalyticsEvent;
use App\Models\FounderProfile;
use App\Models\IntroductionLedger;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IntroductionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $founder = $this->resolveFounderProfile($request);

        if (! $founder) {
            return response()->json([
                'message' => 'Founder profile not found for authenticated user.',
            ], 404);
        }

        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        $outbound = IntroductionLedger::query()
            ->with(['targetFounder'])
            ->where('source_founder_id', $founder->id)
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'outbound_page')
            ->withQueryString();

        $inbound = IntroductionLedger::query()
            ->with(['sourceFounder'])
            ->where('target_founder_id', $founder->id)
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'inbound_page')
            ->withQueryString();

        return response()->json([
            'data' => [
                'outbound' => IntroductionResource::collection($outbound->items()),
                'inbound' => IntroductionResource::collection($inbound->items()),
            ],
            'meta' => [
                'outbound' => [
                    'current_page' => $outbound->currentPage(),
                    'last_page' => $outbound->lastPage(),
                    'per_page' => $outbound->perPage(),
                    'total' => $outbound->total(),
                ],
                'inbound' => [
                    'current_page' => $inbound->currentPage(),
                    'last_page' => $inbound->lastPage(),
                    'per_page' => $inbound->perPage(),
                    'total' => $inbound->total(),
                ],
            ],
        ]);
    }

    public function store(StoreIntroductionRequest $request): JsonResponse
    {
        $sourceFounder = $this->resolveFounderProfile($request);

        if (! $sourceFounder) {
            return response()->json([
                'message' => 'Founder profile not found for authenticated user.',
            ], 404);
        }

        $activePendingCount = IntroductionLedger::query()
            ->where('source_founder_id', $sourceFounder->id)
            ->where('routing_status', 'INTRO_PENDING')
            ->count();

        if ($activePendingCount >= 3) {
            return response()->json([
                'message' => 'Maximum active introduction requests reached.',
                'errors' => [
                    'active_pending_limit' => [
                        'You already have 3 active INTRO_PENDING requests. Approve, decline, or wait for expiration before creating a new route.',
                    ],
                ],
                'meta' => [
                    'limit' => 3,
                    'current_active_pending' => $activePendingCount,
                ],
            ], 422);
        }

        $validated = $request->validated();

        $intro = DB::transaction(function () use ($validated, $sourceFounder): IntroductionLedger {
            $introduction = IntroductionLedger::create([
                'source_founder_id' => $sourceFounder->id,
                'target_founder_id' => $validated['target_founder_id'],
                'routing_status' => 'INTRO_PENDING',
                'payload_context_brief' => $validated['payload_context_brief'],
                'tracking_notes' => null,
                'expires_at' => CarbonImmutable::now()->addWeekdays(5),
            ]);

            event('wosool.introduction.created', [
                'introduction_id' => $introduction->id,
                'source_founder_id' => $introduction->source_founder_id,
                'target_founder_id' => $introduction->target_founder_id,
                'routing_status' => $introduction->routing_status,
                'expires_at' => $introduction->expires_at?->toIso8601String(),
            ]);

            AnalyticsEvent::track(
                eventName: 'introduction.created',
                userId: auth()->id(),
                entityType: 'introduction_ledger',
                entityId: $introduction->id,
                properties: [
                    'source_founder_id' => $introduction->source_founder_id,
                    'target_founder_id' => $introduction->target_founder_id,
                    'routing_status' => $introduction->routing_status,
                    'expires_at' => $introduction->expires_at?->toIso8601String(),
                    'channel' => 'system_broadcast',
                ],
            );

            return $introduction;
        });

        $intro->load(['sourceFounder', 'targetFounder']);

        return response()->json([
            'message' => 'Introduction route created successfully.',
            'data' => new IntroductionResource($intro),
        ], 201);
    }

    public function approve(Request $request, IntroductionLedger $intro): JsonResponse
    {
        $founder = $this->resolveFounderProfile($request);

        if (! $founder) {
            return response()->json([
                'message' => 'Founder profile not found for authenticated user.',
            ], 404);
        }

        if ($intro->target_founder_id !== $founder->id) {
            return response()->json([
                'message' => 'You are not authorized to approve this introduction route.',
            ], 403);
        }

        if ($intro->routing_status !== 'INTRO_PENDING') {
            return response()->json([
                'message' => 'Only INTRO_PENDING routes can be approved.',
                'errors' => [
                    'routing_status' => [
                        'Current status is '.$intro->routing_status.'.',
                    ],
                ],
            ], 422);
        }

        $intro->update([
            'routing_status' => 'INTRO_APPROVED',
        ]);

        $locale = $request->getPreferredLanguage(['en', 'fr', 'ar']) ?? app()->getLocale();

        $localizedMessages = [
            'en' => 'Introduction route approved successfully.',
            'fr' => 'La mise en relation a ete approuvee avec succes.',
            'ar' => 'تمت الموافقة على طلب الربط بنجاح.',
        ];

        AnalyticsEvent::track(
            eventName: 'introduction.approved',
            userId: $request->user()?->id,
            entityType: 'introduction_ledger',
            entityId: $intro->id,
            properties: [
                'locale' => $locale,
                'message' => $localizedMessages[$locale] ?? $localizedMessages['en'],
                'source_founder_id' => $intro->source_founder_id,
                'target_founder_id' => $intro->target_founder_id,
            ],
        );

        event('wosool.introduction.approved', [
            'introduction_id' => $intro->id,
            'source_founder_id' => $intro->source_founder_id,
            'target_founder_id' => $intro->target_founder_id,
            'locale' => $locale,
        ]);

        $intro->load(['sourceFounder', 'targetFounder']);

        return response()->json([
            'message' => $localizedMessages[$locale] ?? $localizedMessages['en'],
            'data' => new IntroductionResource($intro),
        ]);
    }



    public function decline(Request $request, IntroductionLedger $intro): JsonResponse
    {
        $founder = $this->resolveFounderProfile($request);

        if (! $founder) {
            return response()->json([
                'message' => 'Founder profile not found for authenticated user.',
            ], 404);
        }

        if (! in_array($founder->id, [$intro->source_founder_id, $intro->target_founder_id], true)) {
            return response()->json([
                'message' => 'You are not authorized to decline this introduction route.',
            ], 403);
        }

        if ($intro->routing_status !== 'INTRO_PENDING') {
            return response()->json([
                'message' => 'Only INTRO_PENDING routes can be declined.',
                'errors' => [
                    'routing_status' => [
                        'Current status is '.$intro->routing_status.'.',
                    ],
                ],
            ], 422);
        }

        $intro->update([
            'routing_status' => 'DECLINED',
        ]);

        AnalyticsEvent::track(
            eventName: 'introduction.declined',
            userId: $request->user()?->id,
            entityType: 'introduction_ledger',
            entityId: $intro->id,
            properties: [
                'source_founder_id' => $intro->source_founder_id,
                'target_founder_id' => $intro->target_founder_id,
            ],
        );

        event('wosool.introduction.declined', [
            'introduction_id' => $intro->id,
            'source_founder_id' => $intro->source_founder_id,
            'target_founder_id' => $intro->target_founder_id,
        ]);

        $intro->load(['sourceFounder', 'targetFounder']);

        return response()->json([
            'message' => 'Introduction route declined successfully.',
            'data' => new IntroductionResource($intro),
        ]);
    }

    private function resolveFounderProfile(Request $request): ?FounderProfile
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        return $user->founderProfile()->first();
    }
}
