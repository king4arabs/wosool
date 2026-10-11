<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsItemResource;
use App\Models\NewsItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NewsItem::where('status', 'published')->where('is_public', true);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $news = $query
            ->orderBy('published_at', 'desc')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return NewsItemResource::collection($news)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $item = NewsItem::where('slug', $slug)
            ->where('status', 'published')
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json([
            'data' => new NewsItemResource($item),
        ]);
    }
}
