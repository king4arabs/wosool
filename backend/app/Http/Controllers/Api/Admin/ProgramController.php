<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\Program;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProgramController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request): JsonResponse
    {
        $query = Program::query()->withCount(['applications', 'cohorts']);

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('open')) {
            $query->where('is_open', $request->boolean('open'));
        }

        $programs = $query->latest()->get();

        return response()->json([
            'data' => $programs,
            'meta' => [
                'total' => $programs->count(),
                'open' => $programs->where('is_open', true)->count(),
                'applicants' => $programs->sum('applications_count'),
                'cohorts' => $programs->sum('cohorts_count'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug($data['name'], 'program', Program::class);

        $program = Program::create($data);

        AdminAction::log($request->user()->id, 'program.created', 'program', $program->id, $program->name, null, $program->toArray());

        return response()->json([
            'message' => 'Program created.',
            'data' => $program,
        ], 201);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        $data = $this->validated($request, $program);
        $beforeState = $program->toArray();

        $data['slug'] = ($data['slug'] ?? null)
            ? $this->uniqueSlug($data['slug'], 'program', Program::class, $program->id)
            : $program->slug;

        $program->update($data);

        AdminAction::log($request->user()->id, 'program.updated', 'program', $program->id, $program->name, $beforeState, $program->fresh()->toArray());

        return response()->json([
            'message' => 'Program updated.',
            'data' => $program->fresh(),
        ]);
    }

    public function destroy(Request $request, Program $program): JsonResponse
    {
        $beforeState = $program->toArray();
        $program->delete();

        AdminAction::log($request->user()->id, 'program.deleted', 'program', $program->id, $program->name, $beforeState, null);

        return response()->json(['message' => 'Program deleted.']);
    }

    private function validated(Request $request, ?Program $program = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('programs', 'slug')->ignore($program?->id)],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'duration' => ['nullable', 'string', 'max:100'],
            'target_stages' => ['nullable', 'array'],
            'target_stages.*' => ['string', 'max:100'],
            'cohort_size' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'benefits' => ['nullable', 'array'],
            'benefits.*' => ['string', 'max:255'],
            'is_open' => ['sometimes', 'boolean'],
            'application_deadline' => ['nullable', 'date'],
        ]);
    }
}
