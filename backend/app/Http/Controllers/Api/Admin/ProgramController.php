<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use App\Models\AdminAction;
use App\Models\Program;
use App\Support\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class ProgramController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request): JsonResponse
    {
        $query = Program::query()->withCount(['applications', 'cohorts', 'participants', 'sessions']);

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
            'data' => ProgramResource::collection($programs),
            'meta' => [
                'total' => $programs->count(),
                'open' => $programs->where('is_open', true)->count(),
                'applicants' => $programs->sum('applications_count'),
                'cohorts' => $programs->sum('cohorts_count'),
                'participants' => $programs->sum('participants_count'),
                'sessions' => $programs->sum('sessions_count'),
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
            'data' => new ProgramResource($program),
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
            'data' => new ProgramResource($program->fresh()),
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
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('programs', 'slug')->ignore($program?->id)],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string'],
            'full_description' => ['nullable', 'string'],
            'program_type' => ['nullable', 'string', 'max:120'],
            'category' => ['required', 'string', 'max:100'],
            'duration' => ['nullable', 'string', 'max:100'],
            'format' => ['nullable', 'in:online,in-person,hybrid,self-paced,cohort-based'],
            'language' => ['nullable', 'string', 'max:10'],
            'city_region' => ['nullable', 'string', 'max:120'],
            'target_stages' => ['nullable', 'array'],
            'target_stages.*' => ['string', 'max:100'],
            'cohort_size' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'benefits' => ['nullable', 'array'],
            'benefits.*' => ['string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:80'],
            'is_open' => ['sometimes', 'boolean'],
            'visibility' => ['nullable', 'in:public,members_only,founder_only,invite_only,application_required'],
            'status_flow' => ['nullable', 'in:draft,pending_review,published,applications_open,applications_closed,active,completed,cancelled,archived'],
            'application_deadline' => ['nullable', 'date'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'cover_image_url' => ['nullable', 'string', 'max:2048'],
            'objective' => ['nullable', 'string'],
            'who_it_is_for' => ['nullable', 'string'],
            'expected_outcomes' => ['nullable', 'string'],
            'program_manager_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'organizer_type' => ['nullable', 'in:wosool,partner,sponsor,founder,external_ecosystem'],
            'organizer_id' => ['nullable', 'integer'],
            'eligibility_criteria' => ['nullable', 'array'],
            'application_process' => ['nullable', 'array'],
            'faqs' => ['nullable', 'array'],
            'targeting_rules' => ['nullable', 'array'],
            'ai_settings' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
        ]);

        if (Schema::hasColumn('programs', 'title') && empty($validated['title'] ?? null)) {
            $validated['title'] = $validated['name'];
        }

        return $validated;
    }
}
