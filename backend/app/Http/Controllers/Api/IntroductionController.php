<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIntroductionRequest;
use App\Http\Resources\IntroductionResource;
use App\Models\AnalyticsEvent;
use App\Models\FounderProfile;
use App\Models\IntroductionLedger;
use App\Models\Message;
use App\Models\Scorecard;
use App\Services\ChatRoomService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class IntroductionController extends Controller
{
    private const MONTHLY_INTRO_CREDIT_LIMIT = 3;

    public function index(Request $request): JsonResponse
    {
        $founder = $this->resolveFounderProfile($request);

        if (! $founder) {
            return response()->json([
                'message' => __('messages.intro.founder_not_found'),
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

        $consumedCreditsThisMonth = IntroductionLedger::query()
            ->where('source_founder_id', $founder->id)
            ->whereNotNull('source_credit_consumed_at')
            ->whereBetween('source_credit_consumed_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

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
                'credits' => [
                    'monthly_limit' => self::MONTHLY_INTRO_CREDIT_LIMIT,
                    'used' => $consumedCreditsThisMonth,
                    'remaining' => max(0, self::MONTHLY_INTRO_CREDIT_LIMIT - $consumedCreditsThisMonth),
                ],
            ],
        ]);
    }

    public function store(StoreIntroductionRequest $request): JsonResponse
    {
        $sourceFounder = $this->resolveFounderProfile($request);

        if (! $sourceFounder) {
            return response()->json([
                'message' => __('messages.intro.founder_not_found'),
            ], 404);
        }

        $activePendingCount = IntroductionLedger::query()
            ->where('source_founder_id', $sourceFounder->id)
            ->where('routing_status', 'INTRO_PENDING')
            ->count();

        if ($activePendingCount >= 3) {
            return response()->json([
                'message' => __('messages.intro.active_limit_reached'),
                'errors' => [
                    'active_pending_limit' => [
                        __('messages.intro.active_limit_detail'),
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
            'message' => __('messages.intro.created'),
            'data' => new IntroductionResource($intro),
        ], 201);
    }

    public function approve(Request $request, IntroductionLedger $intro): JsonResponse
    {
        $founder = $this->resolveFounderProfile($request);

        if (! $founder) {
            return response()->json([
                'message' => __('messages.intro.founder_not_found'),
            ], 404);
        }

        if ($intro->target_founder_id !== $founder->id) {
            return response()->json([
                'message' => __('messages.intro.approve_unauthorized'),
            ], 403);
        }

        if ($intro->routing_status !== 'INTRO_PENDING') {
            return response()->json([
                'message' => __('messages.intro.approve_invalid_status'),
                'errors' => [
                    'routing_status' => [
                        'Current status is '.$intro->routing_status.'.',
                    ],
                ],
            ], 422);
        }

        $sourceFounder = FounderProfile::query()->with('user')->find($intro->source_founder_id);
        $targetFounder = FounderProfile::query()->with('user')->find($intro->target_founder_id);

        if (! $sourceFounder || ! $targetFounder || ! $sourceFounder->user || ! $targetFounder->user) {
            return response()->json([
                'message' => 'Unable to complete introduction workflow due to missing founder users.',
            ], 422);
        }

        $consumedCreditsThisMonth = IntroductionLedger::query()
            ->where('source_founder_id', $sourceFounder->id)
            ->whereNotNull('source_credit_consumed_at')
            ->whereBetween('source_credit_consumed_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        if (is_null($intro->source_credit_consumed_at) && $consumedCreditsThisMonth >= self::MONTHLY_INTRO_CREDIT_LIMIT) {
            return response()->json([
                'message' => 'Monthly introduction credit limit reached for requester.',
                'errors' => [
                    'credits' => ['No remaining monthly introduction credits.'],
                ],
                'meta' => [
                    'limit' => self::MONTHLY_INTRO_CREDIT_LIMIT,
                    'used' => $consumedCreditsThisMonth,
                    'remaining' => 0,
                ],
            ], 422);
        }

        $threadId = (string) Str::uuid();

        DB::transaction(function () use ($intro, $sourceFounder, $targetFounder, $threadId): void {
            $intro->update([
                'routing_status' => 'INTRO_APPROVED',
                'source_credit_consumed_at' => $intro->source_credit_consumed_at ?? now(),
                'thread_id' => $intro->thread_id ?? $threadId,
                'intro_email_sent_at' => $intro->intro_email_sent_at ?? now(),
            ]);

            $channelThreadId = $intro->thread_id ?? $threadId;

            Message::create([
                'thread_id' => $channelThreadId,
                'sender_id' => $sourceFounder->user_id,
                'recipient_id' => $targetFounder->user_id,
                'body' => 'تم فتح قناة تواصل مباشرة عبر منصة وصول. يسعدنا بدء النقاش حول طلب التقديم.',
            ]);

            Message::create([
                'thread_id' => $channelThreadId,
                'sender_id' => $targetFounder->user_id,
                'recipient_id' => $sourceFounder->user_id,
                'body' => 'تم قبول الربط. جاهز/ة للمساعدة، يمكننا تنسيق خطوات العمل هنا مباشرة.',
            ]);

            $helperScorecard = Scorecard::query()->firstOrCreate(
                ['founder_profile_id' => $targetFounder->id],
                [
                    'aggregate_score' => 0,
                    'momentum' => 0,
                    'growth' => 0,
                    'readiness' => 0,
                    'support_delta' => 0,
                    'historical_logs' => [],
                ]
            );

            $helperScorecard->aggregate_score = min(100, (int) $helperScorecard->aggregate_score + 3);
            $helperScorecard->momentum = min(100, (int) $helperScorecard->momentum + 2);

            $logs = is_array($helperScorecard->historical_logs) ? $helperScorecard->historical_logs : [];
            $logs[] = [
                'timestamp' => now()->toIso8601String(),
                'event' => 'introduction.approved',
                'community_points' => 3,
                'intro_id' => $intro->id,
                'note' => 'Accepted helping another founder via direct introduction.',
            ];
            $helperScorecard->historical_logs = array_slice($logs, -50);
            $helperScorecard->save();
        });

        $this->sendIntroEmailIfPossible(
            $sourceFounder->user->email,
            $targetFounder->user->email,
            (string) ($sourceFounder->user->name ?? $sourceFounder->legal_name ?? 'Founder A'),
            (string) ($targetFounder->user->name ?? $targetFounder->legal_name ?? 'Founder B')
        );

        /** @var ChatRoomService $chatRooms */
        $chatRooms = app(ChatRoomService::class);
        $introRoom = $chatRooms->ensureRoom([
            'type' => 'intro_room',
            'title' => 'غرفة ربط مباشر بين المؤسسين',
            'description' => 'تم إنشاء هذه الغرفة بعد قبول طلب الربط.',
            'created_by_user_id' => $request->user()?->id,
            'owner_user_id' => $sourceFounder->user_id,
            'related_type' => 'introduction',
            'related_id' => $intro->id,
            'visibility' => 'private',
            'is_ai_assisted' => true,
        ], [
            ['user_id' => $sourceFounder->user_id, 'role' => 'owner'],
            ['user_id' => $targetFounder->user_id, 'role' => 'participant'],
        ]);

        Message::create([
            'thread_id' => $introRoom->uuid,
            'sender_id' => $sourceFounder->user_id,
            'recipient_id' => $targetFounder->user_id,
            'body' => 'غرفة الربط المباشر جاهزة. يمكنكم متابعة النقاش هنا أيضًا.',
        ]);

        $locale = app()->getLocale();

        AnalyticsEvent::track(
            eventName: 'introduction.approved',
            userId: $request->user()?->id,
            entityType: 'introduction_ledger',
            entityId: $intro->id,
            properties: [
                'locale' => $locale,
                'message' => __('messages.intro.approved'),
                'source_founder_id' => $intro->source_founder_id,
                'target_founder_id' => $intro->target_founder_id,
                'thread_id' => $intro->fresh()->thread_id,
                'source_credit_consumed_at' => $intro->fresh()->source_credit_consumed_at?->toIso8601String(),
                'intro_email_sent_at' => $intro->fresh()->intro_email_sent_at?->toIso8601String(),
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
            'message' => __('messages.intro.approved'),
            'data' => new IntroductionResource($intro),
        ]);
    }

    public function decline(Request $request, IntroductionLedger $intro): JsonResponse
    {
        $founder = $this->resolveFounderProfile($request);

        if (! $founder) {
            return response()->json([
                'message' => __('messages.intro.founder_not_found'),
            ], 404);
        }

        if (! in_array($founder->id, [$intro->source_founder_id, $intro->target_founder_id], true)) {
            return response()->json([
                'message' => __('messages.intro.decline_unauthorized'),
            ], 403);
        }

        if ($intro->routing_status !== 'INTRO_PENDING') {
            return response()->json([
                'message' => __('messages.intro.decline_invalid_status'),
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
            'message' => __('messages.intro.declined'),
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

    private function sendIntroEmailIfPossible(string $sourceEmail, string $targetEmail, string $sourceName, string $targetName): void
    {
        if (! $this->canSendEmail()) {
            return;
        }

        try {
            Mail::raw(
                "Wosool Intro: {$sourceName} is now connected with {$targetName}.\n\nYou can continue directly via in-platform messages.",
                static function ($message) use ($sourceEmail, $targetEmail): void {
                    $message
                        ->to([$sourceEmail, $targetEmail])
                        ->subject('Wosool Intro Connection');
                }
            );
        } catch (\Throwable $exception) {
            Log::warning('Failed to send intro email.', [
                'source_email' => $sourceEmail,
                'target_email' => $targetEmail,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function canSendEmail(): bool
    {
        return filled(config('mail.mailers.smtp.host'))
            && filled(config('mail.from.address'));
    }
}
