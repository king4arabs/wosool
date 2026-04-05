<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Resource::query()
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->filled('type')) {
            $query->byType($request->input('type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->boolean('members_only')) {
            $query->where('is_members_only', true);
        } else {
            $query->public();
        }

        $resources = $query->paginate($request->input('per_page', 15));

        return response()->json($resources);
    }

    public function show(string $slug): JsonResponse
    {
        $resource = Resource::where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $resource]);
    }
}
