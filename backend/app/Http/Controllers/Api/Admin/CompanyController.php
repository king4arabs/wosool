<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminCompanyResource;
use App\Models\AdminAction;
use App\Models\CompanyProfile;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    use GeneratesUniqueSlug;

    /** Founder user columns read by FounderResource, including the admin email-verification flag. */
    private const FOUNDER_USERS = 'founders.user:id,name,email,email_verified_at';

    public function index(Request $request): JsonResponse
    {
        $query = CompanyProfile::query()
            ->with([self::FOUNDER_USERS])
            ->withCount('founders');

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('translations->ar->name', 'like', "%{$search}%")
                    ->orWhere('translations->ar->sector', 'like', "%{$search}%")
                    ->orWhere('translations->ar->location', 'like', "%{$search}%");
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
            'data' => AdminCompanyResource::collection($companies),
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
        $data = $this->withArabic($this->validated($request));
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['name'], 'company', CompanyProfile::class);

        $company = CompanyProfile::create($data);

        AdminAction::log($request->user()->id, 'company.created', 'company', $company->id, $company->name, null, $company->toArray());

        return response()->json([
            'message' => 'Company created.',
            'data' => new AdminCompanyResource($company->load(self::FOUNDER_USERS)),
        ], 201);
    }

    public function update(Request $request, CompanyProfile $company): JsonResponse
    {
        $data = $this->withArabic($this->validated($request, $company), $company);
        $beforeState = $company->toArray();

        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'company', CompanyProfile::class, $company->id)
            : $company->slug;

        $company->update($data);

        AdminAction::log($request->user()->id, 'company.updated', 'company', $company->id, $company->name, $beforeState, $company->fresh()->toArray());

        return response()->json([
            'message' => 'Company updated.',
            'data' => new AdminCompanyResource($company->fresh()->load(self::FOUNDER_USERS)),
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
            'name_ar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description_ar' => ['sometimes', 'nullable', 'string'],
            'sector_ar' => ['sometimes', 'nullable', 'string', 'max:100'],
            'location_ar' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);
    }

    /**
     * Moves the optional Arabic fields into `translations.ar`, which the public pages show to
     * Arabic readers. Only the Arabic fields that were sent change; other translation keys are
     * kept, a blank field removes that Arabic text, and a request without Arabic fields leaves
     * the translations untouched.
     */
    private function withArabic(array $data, ?CompanyProfile $company = null): array
    {
        $sent = [];
        foreach (AdminCompanyResource::ARABIC_FIELDS as $field) {
            if (array_key_exists("{$field}_ar", $data)) {
                $sent[$field] = $data["{$field}_ar"];
            }
            unset($data["{$field}_ar"]);
        }

        if ($sent === []) {
            return $data;
        }

        $translations = $company?->translations ?? [];
        $arabic = $translations['ar'] ?? [];
        foreach ($sent as $field => $value) {
            $value = is_string($value) ? trim($value) : '';
            if ($value === '') {
                unset($arabic[$field]);
            } else {
                $arabic[$field] = $value;
            }
        }

        if ($arabic === []) {
            unset($translations['ar']);
        } else {
            $translations['ar'] = $arabic;
        }
        $data['translations'] = $translations === [] ? null : $translations;

        return $data;
    }
}
