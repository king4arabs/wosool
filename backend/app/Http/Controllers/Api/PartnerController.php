<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartnerProfile;
use App\Models\SponsorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PartnerProfile::where('is_public', true);
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        $partners = $query->orderBy('display_order')->get();
        return response()->json($partners);
    }

    public function sponsors(Request $request): JsonResponse
    {
        $sponsors = SponsorProfile::where('is_active', true)
            ->orderBy('display_order')
            ->get();
        return response()->json($sponsors);
    }
}
