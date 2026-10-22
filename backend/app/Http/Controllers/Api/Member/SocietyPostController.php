<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\SocietyPostCommentResource;
use App\Http\Resources\SocietyPostResource;
use App\Models\AnalyticsEvent;
use App\Models\FounderProfile;
use App\Models\SocietyPost;
use App\Models\SocietyPostComment;
use App\Models\SocietyPostHelpOffer;
use App\Models\SocietyPostReaction;
use App\Models\SocietyPostReport;
use App\Models\SocietyPostSave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SocietyPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tab' => ['nullable', Rule::in(['all', 'asks', 'offers'])],
            'sector' => ['nullable', 'string', 'max:80'],
            'sort' => ['nullable', Rule::in(['latest', 'priority', 'relevance'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $tab = (string) ($validated['tab'] ?? 'all');
        $sort = (string) ($validated['sort'] ?? 'latest');
        $perPage = (int) ($validated['per_page'] ?? 15);

        $query = SocietyPost::query()
            ->with(['author:id,name', 'founderProfile', 'companyProfile'])
            ->withCount(['reactions', 'comments', 'helpOffers', 'reports'])
            ->with('reactions')
            ->where('moderation_status', 'published');

        if ($tab === 'asks') {
            $query->where('post_type', 'ask');
        } elseif ($tab === 'offers') {
            $query->where('post_type', 'offer');
        }

        if (! empty($validated['sector'])) {
            $query->where('sector', $validated['sector']);
        }

        if ($sort === 'priority') {
            $query->orderByRaw("CASE WHEN priority = 'urgent' THEN 0 ELSE 1 END");
            $query->orderByDesc('created_at');
        } elseif ($sort === 'relevance') {
            $query->orderByDesc('help_offers_count')->orderByDesc('comments_count')->orderByDesc('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        $posts = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => SocietyPostResource::collection($posts->items()),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'tab' => $tab,
                'sort' => $sort,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'post_type' => ['required', Rule::in(['ask', 'offer'])],
            'title' => ['required', 'string', 'max:220'],
            'content' => ['required', 'string', 'max:10000'],
            'sector' => ['nullable', 'string', 'max:80'],
            'priority' => ['nullable', Rule::in(['normal', 'urgent'])],
            'attachments' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $profile = FounderProfile::query()->where('user_id', $user->id)->first();
        $company = $profile?->companies()->first();

        $post = SocietyPost::create([
            'author_user_id' => $user->id,
            'author_founder_profile_id' => $profile?->id,
            'author_company_profile_id' => $company?->id,
            'post_type' => $validated['post_type'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'sector' => $validated['sector'] ?? ($company?->sector ?? null),
            'priority' => $validated['priority'] ?? 'normal',
            'attachments' => $validated['attachments'] ?? [],
            'moderation_status' => 'published',
            'published_at' => now(),
        ]);

        AnalyticsEvent::track(
            eventName: 'post_created',
            userId: $user->id,
            entityType: 'society_post',
            entityId: $post->id,
            properties: [
                'post_type' => $post->post_type,
                'priority' => $post->priority,
                'sector' => $post->sector,
            ]
        );

        $post->load(['author:id,name', 'founderProfile', 'companyProfile', 'reactions'])
            ->loadCount(['reactions', 'comments', 'helpOffers', 'reports']);

        return response()->json([
            'message' => 'Society post created.',
            'data' => new SocietyPostResource($post),
        ], 201);
    }

    public function show(Request $request, SocietyPost $post): JsonResponse
    {
        if ($post->moderation_status !== 'published' && (int) $post->author_user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Post not available.'], 404);
        }

        $post->load(['author:id,name', 'founderProfile', 'companyProfile', 'reactions'])
            ->loadCount(['reactions', 'comments', 'helpOffers', 'reports']);

        return response()->json(['data' => new SocietyPostResource($post)]);
    }

    public function update(Request $request, SocietyPost $post): JsonResponse
    {
        if ((int) $post->author_user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:220'],
            'content' => ['sometimes', 'string', 'max:10000'],
            'sector' => ['sometimes', 'nullable', 'string', 'max:80'],
            'priority' => ['sometimes', Rule::in(['normal', 'urgent'])],
        ]);

        $post->fill($validated);
        $post->save();

        return response()->json([
            'message' => 'Society post updated.',
            'data' => new SocietyPostResource($post->fresh()->load(['author:id,name', 'reactions'])->loadCount(['reactions', 'comments', 'helpOffers', 'reports'])),
        ]);
    }

    public function destroy(Request $request, SocietyPost $post): JsonResponse
    {
        if ((int) $post->author_user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Society post archived.']);
    }

    public function addReaction(Request $request, SocietyPost $post): JsonResponse
    {
        $validated = $request->validate([
            'reaction_type' => ['required', Rule::in(['like', 'insightful', 'support'])],
        ]);

        SocietyPostReaction::firstOrCreate([
            'society_post_id' => $post->id,
            'user_id' => $request->user()->id,
            'reaction_type' => $validated['reaction_type'],
        ]);

        AnalyticsEvent::track('post_reacted', $request->user()->id, 'society_post', $post->id, [
            'reaction_type' => $validated['reaction_type'],
        ]);

        return response()->json(['message' => 'Reaction saved.']);
    }

    public function removeReaction(Request $request, SocietyPost $post, string $type): JsonResponse
    {
        if (! in_array($type, ['like', 'insightful', 'support'], true)) {
            return response()->json(['message' => 'Invalid reaction type.'], 422);
        }

        SocietyPostReaction::query()
            ->where('society_post_id', $post->id)
            ->where('user_id', $request->user()->id)
            ->where('reaction_type', $type)
            ->delete();

        return response()->json(['message' => 'Reaction removed.']);
    }

    public function comments(Request $request, SocietyPost $post): JsonResponse
    {
        $comments = SocietyPostComment::query()
            ->with('user:id,name')
            ->where('society_post_id', $post->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => SocietyPostCommentResource::collection($comments->items()),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    public function addComment(Request $request, SocietyPost $post): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:4000'],
        ]);

        $comment = SocietyPostComment::create([
            'society_post_id' => $post->id,
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        AnalyticsEvent::track('post_commented', $request->user()->id, 'society_post', $post->id, [
            'comment_id' => $comment->id,
        ]);

        return response()->json([
            'message' => 'Comment posted.',
            'data' => new SocietyPostCommentResource($comment->load('user:id,name')),
        ], 201);
    }

    public function savePost(Request $request, SocietyPost $post): JsonResponse
    {
        SocietyPostSave::firstOrCreate([
            'society_post_id' => $post->id,
            'user_id' => $request->user()->id,
        ]);

        AnalyticsEvent::track('post_saved', $request->user()->id, 'society_post', $post->id, null);

        return response()->json(['message' => 'Post saved.']);
    }

    public function unsavePost(Request $request, SocietyPost $post): JsonResponse
    {
        SocietyPostSave::query()
            ->where('society_post_id', $post->id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Post unsaved.']);
    }

    public function report(Request $request, SocietyPost $post): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:120'],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);

        $openReportsCount = SocietyPostReport::query()
            ->where('reporter_user_id', $request->user()->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($openReportsCount >= 10) {
            return response()->json([
                'message' => 'Too many report actions. Please slow down.',
                'errors' => ['report' => ['Rate limit reached for reports.']],
            ], 429);
        }

        SocietyPostReport::updateOrCreate(
            [
                'society_post_id' => $post->id,
                'reporter_user_id' => $request->user()->id,
            ],
            [
                'reason' => $validated['reason'] ?? null,
                'details' => $validated['details'] ?? null,
                'status' => 'open',
                'resolved_by_user_id' => null,
                'resolved_at' => null,
            ]
        );

        if ($post->moderation_status === 'published') {
            $post->update(['moderation_status' => 'flagged']);
        }

        AnalyticsEvent::track('post_reported', $request->user()->id, 'society_post', $post->id, [
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json(['message' => 'Report submitted.']);
    }

    public function helpOffer(Request $request, SocietyPost $post): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $offer = SocietyPostHelpOffer::updateOrCreate(
            [
                'society_post_id' => $post->id,
                'helper_user_id' => $request->user()->id,
            ],
            [
                'message' => $validated['message'] ?? null,
                'status' => 'submitted',
            ]
        );

        AnalyticsEvent::track('help_offer_submitted', $request->user()->id, 'society_post', $post->id, [
            'help_offer_id' => $offer->id,
        ]);

        return response()->json(['message' => 'Help offer submitted.']);
    }

    public function aiMatch(Request $request, SocietyPost $post): JsonResponse
    {
        AnalyticsEvent::track('ai_match_triggered', $request->user()->id, 'society_post', $post->id, [
            'source' => 'society_post',
        ]);

        return response()->json([
            'message' => 'AI match trigger recorded.',
            'data' => [
                'status' => 'queued',
                'post_id' => $post->id,
            ],
        ]);
    }
}
