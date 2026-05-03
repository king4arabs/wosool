<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\NewsItem;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NewsController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request): JsonResponse
    {
        $query = NewsItem::query();

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('author_name', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        $articles = $query->latest('published_at')->latest()->get();

        return response()->json([
            'data' => $articles,
            'meta' => [
                'total' => $articles->count(),
                'published' => $articles->where('status', 'published')->count(),
                'drafts' => $articles->where('status', 'draft')->count(),
                'archived' => $articles->where('status', 'archived')->count(),
                'featured' => $articles->where('is_featured', true)->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['title'], 'news', NewsItem::class);
        $data['author_id'] = $request->user()->id;

        $article = NewsItem::create($data);

        AdminAction::log($request->user()->id, 'news.created', 'news', $article->id, $article->title, null, $article->toArray());

        return response()->json([
            'message' => 'Article created.',
            'data' => $article,
        ], 201);
    }

    public function update(Request $request, NewsItem $news): JsonResponse
    {
        $data = $this->validated($request, $news);
        $beforeState = $news->toArray();

        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'news', NewsItem::class, $news->id)
            : $news->slug;

        $news->update($data);

        AdminAction::log($request->user()->id, 'news.updated', 'news', $news->id, $news->title, $beforeState, $news->fresh()->toArray());

        return response()->json([
            'message' => 'Article updated.',
            'data' => $news->fresh(),
        ]);
    }

    public function destroy(Request $request, NewsItem $news): JsonResponse
    {
        $beforeState = $news->toArray();
        $news->delete();

        AdminAction::log($request->user()->id, 'news.deleted', 'news', $news->id, $news->title, $beforeState, null);

        return response()->json(['message' => 'Article deleted.']);
    }

    private function validated(Request $request, ?NewsItem $news = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('news_items', 'slug')->ignore($news?->id)],
            'excerpt' => ['required', 'string', 'max:1000'],
            'content' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'image_url' => ['nullable', 'url', 'max:255'],
            'author_name' => ['required', 'string', 'max:255'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_public' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'published_at' => ['nullable', 'date'],
        ]);
    }
}
