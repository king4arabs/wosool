<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\CompanyProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CompanyProfile::with(['founders.user'])
            ->where('status', 'active')
            ->where('is_public', true);

        if ($request->filled('sector')) {
            $query->where('sector', $request->sector);
        }
        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }
        if ($request->boolean('hiring')) {
            $query->where('is_hiring', true);
        }
        if ($request->boolean('fundraising')) {
            $query->where('is_fundraising', true);
        }
        if ($request->boolean('collaborating')) {
            $query->where('is_collaborating', true);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $companies = $query
            ->withCount('founders')
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return CompanyResource::collection($companies)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $company = CompanyProfile::with(['founders.user'])
            ->where('slug', $slug)
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json([
            'data' => new CompanyResource($company),
        ]);
    }
}
