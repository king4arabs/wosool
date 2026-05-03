<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\CompanyProfile;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request): JsonResponse
    {
        $query = CompanyProfile::query()
            ->with(['founders.user:id,name'])
            ->withCount('founders');

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($sector = $request->input('sector')) {
            $query->where('sector', $sector);
        }

        if ($stage = $request->input('stage')) {
            $query->where('stage', $stage);
        }

        $companies = $query->latest()->get();

        return response()->json([
            'data' => $companies,
            'meta' => [
                'total' => $companies->count(),
                'hiring' => $companies->where('is_hiring', true)->count(),
                'fundraising' => $companies->where('is_fundraising', true)->count(),
                'collaborating' => $companies->where('is_collaborating', true)->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['name'], 'company', CompanyProfile::class);

        $company = CompanyProfile::create($data);

        AdminAction::log($request->user()->id, 'company.created', 'company', $company->id, $company->name, null, $company->toArray());

        return response()->json([
            'message' => 'Company created.',
            'data' => $company->load('founders.user:id,name'),
        ], 201);
    }

    public function update(Request $request, CompanyProfile $company): JsonResponse
    {
        $data = $this->validated($request, $company);
        $beforeState = $company->toArray();

        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'company', CompanyProfile::class, $company->id)
            : $company->slug;

        $company->update($data);

        AdminAction::log($request->user()->id, 'company.updated', 'company', $company->id, $company->name, $beforeState, $company->fresh()->toArray());

        return response()->json([
            'message' => 'Company updated.',
            'data' => $company->fresh()->load('founders.user:id,name'),
        ]);
    }

    public function destroy(Request $request, CompanyProfile $company): JsonResponse
    {
        $beforeState = $company->toArray();
        $company->delete();

        AdminAction::log($request->user()->id, 'company.deleted', 'company', $company->id, $company->name, $beforeState, null);

        return response()->json(['message' => 'Company deleted.']);
    }

    private function validated(Request $request, ?CompanyProfile $company = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('company_profiles', 'slug')->ignore($company?->id)],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:255'],
            'sector' => ['nullable', 'string', 'max:100'],
            'stage' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'country_code' => ['nullable', 'string', 'size:2'],
            'founded_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'team_size' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'is_hiring' => ['sometimes', 'boolean'],
            'is_fundraising' => ['sometimes', 'boolean'],
            'is_collaborating' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_public' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(['active', 'pending', 'suspended', 'archived'])],
        ]);
    }
}
