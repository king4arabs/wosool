<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SponsorResource;
use App\Models\AdminAction;
use App\Models\SponsorProfile;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SponsorController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request): JsonResponse
    {
        $query = SponsorProfile::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('tier')) {
            $query->where('tier', $request->input('tier'));
        }

        $sponsors = $query->orderBy('display_order')->orderBy('name')->get();

        return response()->json([
            'data' => SponsorResource::collection($sponsors),
            'meta' => [
                'total' => $sponsors->count(),
                'active' => $sponsors->where('is_active', true)->count(),
                'platinum' => $sponsors->where('tier', 'platinum')->count(),
                'gold' => $sponsors->where('tier', 'gold')->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['name'], 'sponsor', SponsorProfile::class);

        $sponsor = SponsorProfile::create($data);
        AdminAction::log($request->user()->id, 'sponsor.created', 'sponsor', $sponsor->id, $sponsor->name, null, $sponsor->toArray());

        return response()->json([
            'message' => 'Sponsor created.',
            'data' => new SponsorResource($sponsor),
        ], 201);
    }

    public function update(Request $request, SponsorProfile $sponsor): JsonResponse
    {
        $data = $this->validated($request, $sponsor);
        $before = $sponsor->toArray();
        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'sponsor', SponsorProfile::class, $sponsor->id)
            : $sponsor->slug;

        $sponsor->update($data);
        AdminAction::log($request->user()->id, 'sponsor.updated', 'sponsor', $sponsor->id, $sponsor->name, $before, $sponsor->fresh()->toArray());

        return response()->json([
            'message' => 'Sponsor updated.',
            'data' => new SponsorResource($sponsor->fresh()),
        ]);
    }

    public function destroy(Request $request, SponsorProfile $sponsor): JsonResponse
    {
        $before = $sponsor->toArray();
        $sponsor->delete();
        AdminAction::log($request->user()->id, 'sponsor.deleted', 'sponsor', $sponsor->id, $sponsor->name, $before, null);

        return response()->json(['message' => 'Sponsor deleted.']);
    }

    private function validated(Request $request, ?SponsorProfile $sponsor = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('sponsor_profiles', 'slug')->ignore($sponsor?->id)],
            'description' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'url', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'tier' => ['required', Rule::in(['platinum', 'gold', 'silver', 'bronze', 'community'])],
            'is_active' => ['sometimes', 'boolean'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contract_start' => ['nullable', 'date'],
            'contract_end' => ['nullable', 'date', 'after_or_equal:contract_start'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ]);
    }
}
