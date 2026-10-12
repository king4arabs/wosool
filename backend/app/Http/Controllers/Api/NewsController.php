<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsItemResource;
use App\Models\NewsItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NewsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NewsItem::where('status', 'published')->where('is_public', true);
        $query->where(function ($builder) {
            $builder->whereNull('published_at')->orWhere('published_at', '<=', now());
        });

        $request->validate([
            'company' => ['nullable', 'string', 'max:255'],
            'companies' => ['nullable', 'string', 'max:2559'],
        ]);
        $aliases = array_values(array_filter(array_map('trim', [
            ...explode(',', (string) $request->input('companies', '')),
            (string) $request->input('company', ''),
        ]), fn ($alias) => $alias !== ''));
        if (count($aliases) > 10 || collect($aliases)->contains(fn ($alias) => mb_strlen($alias) > 255)) {
            throw ValidationException::withMessages(['companies' => 'Provide at most 10 company aliases, each up to 255 characters.']);
        }
        if ($aliases !== []) {
            $query->where(function ($builder) use ($aliases) {
                foreach (array_unique($aliases) as $alias) {
                    $builder->orWhereJsonContains('companies', $alias)
                        ->orWhereJsonContains('tags', $alias);
                }
            });
        }

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
            ->paginate(max(1, min(50, $request->integer('per_page', 10))))
            ->withQueryString();

        return NewsItemResource::collection($news)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $item = NewsItem::where('slug', $slug)
            ->where('status', 'published')
            ->where('is_public', true)
            ->where(function ($builder) {
                $builder->whereNull('published_at')->orWhere('published_at', '<=', now());
            })
            ->firstOrFail();

        return response()->json([
            'data' => new NewsItemResource($item),
        ]);
    }
}
