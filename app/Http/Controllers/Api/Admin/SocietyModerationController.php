<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SocietyPostResource;
use App\Models\SocietyPost;
use App\Models\SocietyPostReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SocietyModerationController extends Controller
{
    public function posts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['published', 'hidden', 'flagged', 'archived'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = SocietyPost::query()
            ->with(['author:id,name', 'founderProfile', 'companyProfile', 'reactions'])
            ->withCount(['reactions', 'comments', 'helpOffers', 'reports'])
            ->orderByDesc('created_at');

        if (! empty($validated['status'])) {
            $query->where('moderation_status', $validated['status']);
        }

        $posts = $query->paginate((int) ($validated['per_page'] ?? 20))->withQueryString();

        return response()->json([
            'data' => SocietyPostResource::collection($posts->items()),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'resolved', 'dismissed'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = SocietyPostReport::query()
            ->with(['post:id,title,moderation_status', 'reporter:id,name', 'resolver:id,name'])
            ->orderByDesc('created_at');

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $reports = $query->paginate((int) ($validated['per_page'] ?? 20))->withQueryString();

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function updatePostStatus(Request $request, SocietyPost $post): JsonResponse
    {
        $validated = $request->validate([
            'moderation_status' => ['required', Rule::in(['published', 'hidden', 'flagged', 'archived'])],
        ]);

        $post->update([
            'moderation_status' => $validated['moderation_status'],
        ]);

        return response()->json([
            'message' => 'Society post moderation status updated.',
            'data' => new SocietyPostResource($post->fresh()->load(['author:id,name', 'reactions'])->loadCount(['reactions', 'comments', 'helpOffers', 'reports'])),
        ]);
    }

    public function resolveReport(Request $request, SocietyPostReport $report): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['resolved', 'dismissed'])],
        ]);

        $report->update([
            'status' => $validated['status'],
            'resolved_by_user_id' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Report updated.',
            'data' => $report->fresh(['post:id,title,moderation_status', 'reporter:id,name', 'resolver:id,name']),
        ]);
    }

    public function metrics(): JsonResponse
    {
        return response()->json([
            'data' => [
                'posts_total' => SocietyPost::count(),
                'posts_flagged' => SocietyPost::where('moderation_status', 'flagged')->count(),
                'reports_open' => SocietyPostReport::where('status', 'open')->count(),
                'reports_resolved' => SocietyPostReport::where('status', 'resolved')->count(),
            ],
        ]);
    }
}
