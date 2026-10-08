<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerResource;
use App\Models\AdminAction;
use App\Models\PartnerProfile;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PartnerController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request): JsonResponse
    {
        $query = PartnerProfile::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%");
            });
        }

        foreach (['status', 'type'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        $partners = $query->orderBy('display_order')->orderBy('name')->get();

        return response()->json([
            'data' => PartnerResource::collection($partners),
            'meta' => [
                'total' => $partners->count(),
                'confirmed' => $partners->where('status', 'confirmed')->count(),
                'prospective' => $partners->where('status', 'prospective')->count(),
                'types' => $partners->pluck('type')->filter()->unique()->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['name'], 'partner', PartnerProfile::class);

        $partner = PartnerProfile::create($data);
        AdminAction::log($request->user()->id, 'partner.created', 'partner', $partner->id, $partner->name, null, $partner->toArray());

        return response()->json([
            'message' => 'Partner created.',
            'data' => new PartnerResource($partner),
        ], 201);
    }

    public function update(Request $request, PartnerProfile $partner): JsonResponse
    {
        $data = $this->validated($request, $partner);
        $before = $partner->toArray();
        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'partner', PartnerProfile::class, $partner->id)
            : $partner->slug;

        $partner->update($data);
        AdminAction::log($request->user()->id, 'partner.updated', 'partner', $partner->id, $partner->name, $before, $partner->fresh()->toArray());

        return response()->json([
            'message' => 'Partner updated.',
            'data' => new PartnerResource($partner->fresh()),
        ]);
    }

    public function destroy(Request $request, PartnerProfile $partner): JsonResponse
    {
        $before = $partner->toArray();
        $partner->delete();
        AdminAction::log($request->user()->id, 'partner.deleted', 'partner', $partner->id, $partner->name, $before, null);

        return response()->json(['message' => 'Partner deleted.']);
    }

    private function validated(Request $request, ?PartnerProfile $partner = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('partner_profiles', 'slug')->ignore($partner?->id)],
            'description' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string', 'max:255', 'regex:~^(https://[^\s]+|/partners/[a-zA-Z0-9._-]+\.(svg|png))$~'],
            'name_ar' => ['nullable', 'string', 'max:255'], 'name_en' => ['nullable', 'string', 'max:255'],
            'identity_status' => ['required', 'in:verified,needs_review'], 'asset_status' => ['required', 'in:verified,needs_review'],
            'designation_status' => ['required', 'in:approved,needs_review'], 'logo_source_url' => ['nullable', 'url:https', 'max:2048'],
            'approval_note' => ['nullable', 'string', 'max:2000'],
            'website' => ['nullable', 'url', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(['confirmed', 'prospective', 'ecosystem-aligned', 'past-collaborator'])],
            'sector' => ['nullable', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'is_public' => ['sometimes', 'boolean'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ]);
        if (($data['is_public'] ?? $partner?->is_public) && $data['status'] === 'confirmed') {
            if ($data['identity_status'] !== 'verified' || $data['asset_status'] !== 'verified' || $data['designation_status'] !== 'approved' || empty($data['logo_url']) || empty($data['logo_source_url']) || empty($data['approval_note']) || empty($data['website'])) {
                throw ValidationException::withMessages(['approval_note' => ['Confirm identity, official asset source, website and partnership/brand approval before publishing.']]);
            }
            $data['approved_at'] = now();
        }

        return $data;
    }
}
