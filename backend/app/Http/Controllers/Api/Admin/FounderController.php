<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\FounderResource;
use App\Models\FounderProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FounderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FounderProfile::query()
            ->with(['user', 'companies', 'scorecard'])
            ->withCount('companies');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('tagline', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%"));
            });
        }

        foreach (['status', 'sector', 'stage'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        $founders = $query
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return response()->json([
            'data' => FounderResource::collection(collect($founders->items())),
            'meta' => [
                'total' => $founders->total(),
                'current_page' => $founders->currentPage(),
                'per_page' => $founders->perPage(),
                'active' => FounderProfile::where('status', 'active')->count(),
                'pending' => FounderProfile::where('status', 'pending')->count(),
                'featured' => FounderProfile::where('is_featured', true)->count(),
            ],
            'links' => [
                'next' => $founders->nextPageUrl(),
                'prev' => $founders->previousPageUrl(),
            ],
        ]);
    }
}
