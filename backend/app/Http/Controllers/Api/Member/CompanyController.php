<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyProfileRequest;
use App\Http\Requests\UpdateCompanyProfileRequest;
use App\Models\CompanyProfile;
use App\Models\FounderProfile;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CompanyController extends Controller
{
    /**
     * List companies linked to the authenticated user's founder profile.
     */
    public function index(Request $request): JsonResponse
    {
        $founder = $this->founderProfileOrFail($request);
        return response()->json(['data' => $founder->companies()->get()]);
    }

    /**
     * Create a new company and link it to the authenticated user's founder profile.
     */
    public function store(StoreCompanyProfileRequest $request): JsonResponse
    {
        $founder = $this->founderProfileOrFail($request);
        $data = $request->validated();

        $role = $data['role'] ?? 'Founder';
        $isPrimary = (bool) ($data['is_primary'] ?? false);
        unset($data['role'], $data['is_primary']);

        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['status'] = 'active';
        $data['is_public'] = $data['is_public'] ?? true;

        $company = CompanyProfile::create($data);
        $founder->companies()->attach($company->id, ['role' => $role, 'is_primary' => $isPrimary]);

        return response()->json([
            'message' => 'Company created.',
            'data' => $company,
        ], 201);
    }

    /**
     * Update a company linked to the authenticated user's founder profile.
     */
    public function update(UpdateCompanyProfileRequest $request, CompanyProfile $company): JsonResponse
    {
        $this->ensureOwnership($request, $company);
        $company->update($request->validated());

        return response()->json([
            'message' => 'Company updated.',
            'data' => $company->fresh(),
        ]);
    }

    /**
     * Remove a company link for the authenticated user's founder profile.
     */
    public function destroy(Request $request, CompanyProfile $company): JsonResponse
    {
        $founder = $this->ensureOwnership($request, $company);
        $founder->companies()->detach($company->id);
        $company->delete();

        return response()->json(['message' => 'Company removed.']);
    }

    private function founderProfileOrFail(Request $request): FounderProfile
    {
        $founder = FounderProfile::where('user_id', $request->user()->id)->first();
        if (! $founder) {
            abort(response()->json([
                'message' => 'You must create a founder profile before managing companies.',
            ], 422));
        }
        return $founder;
    }

    private function ensureOwnership(Request $request, CompanyProfile $company): FounderProfile
    {
        $founder = $this->founderProfileOrFail($request);
        $linked = $founder->companies()->where('company_profiles.id', $company->id)->exists();
        if (! $linked) {
            throw new AuthorizationException('You do not have access to this company.');
        }
        return $founder;
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'company';
        $slug = $base;
        $i = 2;
        while (CompanyProfile::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
