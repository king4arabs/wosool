<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\AnalyticsEvent;
use App\Models\FounderMatch;
use App\Models\FounderProfile;
use App\Models\Intro;
use App\Models\IntroductionLedger;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MatchController extends Controller
{
    private const MONTHLY_INTRO_CREDIT_LIMIT = 3;

    public function index(Request $request): JsonResponse
    {
        $profile = FounderProfile::where('user_id', $request->user()->id)->firstOrFail();

        $matches = FounderMatch::query()
            ->with(['founderA.user', 'founderA.companies', 'founderB.user', 'founderB.companies'])
            ->where(function ($builder) use ($profile) {
                $builder
                    ->where('founder_a_id', $profile->id)
                    ->orWhere('founder_b_id', $profile->id);
            })
            ->latest()
            ->get();

        $used = 0;

        if (
            Schema::hasTable('introductions_ledger')
            && Schema::hasColumn('introductions_ledger', 'source_credit_consumed_at')
        ) {
            $used = IntroductionLedger::query()
                ->where('source_founder_id', $profile->id)
                ->whereNotNull('source_credit_consumed_at')
                ->whereBetween('source_credit_consumed_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count();
        }

        return response()->json([
            'data' => MatchResource::collection($matches),
            'meta' => [
                'credits' => [
                    'monthly_limit' => self::MONTHLY_INTRO_CREDIT_LIMIT,
                    'used' => $used,
                    'remaining' => max(0, self::MONTHLY_INTRO_CREDIT_LIMIT - $used),
                ],
            ],
        ]);
    }

    public function accept(Request $request, FounderMatch $match): JsonResponse
    {
        $actorProfile = $this->authorizeMatch($request, $match);

        DB::transaction(function () use ($match, $actorProfile, $request): void {
            $match->update(['status' => 'accepted']);

            $targetFounderId = (int) ($match->founder_a_id === $actorProfile->id ? $match->founder_b_id : $match->founder_a_id);

            if (Schema::hasTable('introductions_ledger')) {
                $existing = IntroductionLedger::query()
                    ->where('source_founder_id', $actorProfile->id)
                    ->where('target_founder_id', $targetFounderId)
                    ->whereIn('routing_status', ['INTRO_PENDING', 'INTRO_APPROVED'])
                    ->first();

                if (! $existing) {
                    IntroductionLedger::create([
                        'source_founder_id' => $actorProfile->id,
                        'target_founder_id' => $targetFounderId,
                        'routing_status' => 'INTRO_PENDING',
                        'payload_context_brief' => 'Direct introduction request created from Smart Matching.',
                        'tracking_notes' => null,
                        'expires_at' => CarbonImmutable::now()->addWeekdays(5),
                    ]);
                }
            } elseif (Schema::hasTable('intros')) {
                $existingLegacy = Intro::query()
                    ->where('requester_id', $actorProfile->id)
                    ->where('target_id', $targetFounderId)
                    ->whereIn('status', ['requested', 'approved', 'accepted'])
                    ->first();

                if (! $existingLegacy) {
                    Intro::create([
                        'match_id' => $match->id,
                        'requester_id' => $actorProfile->id,
                        'target_id' => $targetFounderId,
                        'message' => 'Direct introduction request created from Smart Matching.',
                        'status' => 'requested',
                    ]);
                }
            }

            AnalyticsEvent::track(
                eventName: 'match.accepted',
                userId: $request->user()?->id,
                entityType: 'match',
                entityId: $match->id,
                properties: [
                    'source_founder_id' => $actorProfile->id,
                    'target_founder_id' => $targetFounderId,
                    'intro_status' => 'INTRO_PENDING',
                ],
            );
        });

        return response()->json([
            'message' => 'Match accepted.',
            'data' => new MatchResource($match->fresh(['founderA.user', 'founderB.user'])),
        ]);
    }

    public function decline(Request $request, FounderMatch $match): JsonResponse
    {
        $this->authorizeMatch($request, $match);
        $match->update(['status' => 'declined']);

        return response()->json([
            'message' => 'Match declined.',
            'data' => new MatchResource($match->fresh(['founderA.user', 'founderB.user'])),
        ]);
    }

    private function authorizeMatch(Request $request, FounderMatch $match): FounderProfile
    {
        $profile = FounderProfile::where('user_id', $request->user()->id)->firstOrFail();

        abort_unless(
            in_array($profile->id, [$match->founder_a_id, $match->founder_b_id], true),
            403,
            'You do not have access to this match.'
        );

        return $profile;
    }
}
