<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        if ($request->has('sector')) {
            $query->where('sector', $request->sector);
        }
        if ($request->has('stage')) {
            $query->where('stage', $request->stage);
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

        $companies = $query->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 12));

        return response()->json($companies);
    }

    public function show(string $slug): JsonResponse
    {
        $company = CompanyProfile::with(['founders.user'])
            ->where('slug', $slug)
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json($company);
    }
}
