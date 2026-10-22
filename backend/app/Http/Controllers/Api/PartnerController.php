<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerResource;
use App\Http\Resources\SponsorResource;
use App\Models\PartnerProfile;
use App\Models\SponsorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PartnerProfile::where('is_public', true)->where('status', 'confirmed')->where('identity_status', 'verified')->where('asset_status', 'verified')->where('designation_status', 'approved')->whereNotNull('logo_url');
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%");
            });
        }

        $partners = $query
            ->orderBy('display_order')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return PartnerResource::collection($partners)->response();
    }

    public function sponsors(Request $request): JsonResponse
    {
        $sponsors = SponsorProfile::where('is_active', true)
            ->when($request->filled('tier'), fn ($query) => $query->where('tier', $request->input('tier')))
            ->orderBy('display_order')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return SponsorResource::collection($sponsors)->response();
    }
}
