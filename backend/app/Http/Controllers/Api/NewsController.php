<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NewsItem::where('status', 'published')->where('is_public', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $news = $query->orderBy('published_at', 'desc')->paginate($request->integer('per_page', 10));
        return response()->json($news);
    }

    public function show(string $slug): JsonResponse
    {
        $item = NewsItem::where('slug', $slug)->where('status', 'published')->firstOrFail();
        return response()->json($item);
    }
}
