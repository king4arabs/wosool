<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\{AdminAction, RelationshipRecord, User};
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RelationshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(array_keys(RelationshipRecord::STAGES))],
            'stage' => ['nullable', 'string', 'max:30'], 'search' => ['nullable', 'string', 'max:120'],
            'due' => ['nullable', 'boolean'], 'owner_id' => ['nullable', 'integer'],
            'page' => ['nullable', 'integer', 'min:1'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $base = RelationshipRecord::where('kind', $data['kind']);
        $query = (clone $base)->with('owner:id,name');
        if ($request->filled('stage')) $query->where('stage', $data['stage']);
        if ($request->filled('owner_id')) $query->where('owner_id', $data['owner_id']);
        if ($request->boolean('due')) $query->due();
        if ($search = trim($data['search'] ?? '')) {
            $term = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search).'%';
            $query->where(fn ($q) => $q->whereRaw("name LIKE ? ESCAPE '!'", [$term])
                ->orWhereRaw("organization LIKE ? ESCAPE '!'", [$term])->orWhereRaw("campaign LIKE ? ESCAPE '!'", [$term])
                ->orWhereRaw("email LIKE ? ESCAPE '!'", [$term]));
        }
        $page = $query->orderByRaw('CASE WHEN follow_up_on IS NULL THEN 1 ELSE 0 END')->orderBy('follow_up_on')->latest('id')->paginate($data['per_page'] ?? 20);
        return response()->json([
            'data' => $page->items(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            'summary' => ['total' => (clone $base)->count(), 'open' => (clone $base)->open()->count(), 'due' => (clone $base)->due()->count(),
                'unassigned' => (clone $base)->open()->whereNull('owner_id')->count(),
                'stages' => (clone $base)->selectRaw('stage, COUNT(*) as total')->groupBy('stage')->pluck('total', 'stage')],
            'owners' => User::role('admin')->orderBy('name')->get(['id', 'name']),
        ])->header('Cache-Control', 'no-store');
    }

    public function show(RelationshipRecord $relationship): JsonResponse
    {
        return response()->json(['data' => $relationship->load(['owner:id,name', 'activities' => fn ($q) => $q->with('author:id,name')->latest('id')->limit(100)])])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $record = DB::transaction(function () use ($request, $data) {
            $record = RelationshipRecord::create($data);
            AdminAction::log($request->user()->id, 'relationship.created', 'relationship_record', $record->id, afterState: $record->only(['kind', 'stage', 'priority', 'owner_id', 'follow_up_on']));
            return $record;
        });
        return response()->json(['data' => $record->load('owner:id,name')], 201);
    }

    public function update(Request $request, RelationshipRecord $relationship): JsonResponse
    {
        $data = $this->validated($request, $relationship);
        $request->validate(['version' => ['required', 'integer', 'min:1']]);
        $record = DB::transaction(function () use ($request, $relationship, $data) {
            $record = RelationshipRecord::lockForUpdate()->findOrFail($relationship->id);
            abort_unless($record->version === $request->integer('version'), 409, 'This record changed. Reload it before saving.');
            $before = $record->only(['kind', 'stage', 'priority', 'owner_id', 'follow_up_on']);
            $record->fill($data);
            $record->version++;
            $record->save();
            AdminAction::log($request->user()->id, 'relationship.updated', 'relationship_record', $record->id, beforeState: $before, afterState: $record->only(array_keys($before)));
            return $record;
        });
        return response()->json(['data' => $record->load('owner:id,name')]);
    }

    public function activity(Request $request, RelationshipRecord $relationship): JsonResponse
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:3000']]);
        $activity = DB::transaction(function () use ($request, $relationship, $data) {
            $activity = $relationship->activities()->create(['body' => $data['body'], 'author_id' => $request->user()->id]);
            AdminAction::log($request->user()->id, 'relationship.note_added', 'relationship_record', $relationship->id);
            return $activity;
        });
        return response()->json(['data' => $activity->load('author:id,name')], 201);
    }

    private function validated(Request $request, ?RelationshipRecord $record = null): array
    {
        $kind = $record?->kind ?? $request->input('kind');
        $data = $request->validate([
            'kind' => [$record ? 'prohibited' : 'required', Rule::in(array_keys(RelationshipRecord::STAGES))],
            'name' => ['required', 'string', 'max:255'], 'organization' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'], 'phone' => ['nullable', 'string', 'max:50'],
            'stage' => ['required', Rule::in(RelationshipRecord::STAGES[is_string($kind) ? $kind : ''] ?? [])],
            'priority' => ['required', Rule::in(['normal', 'high'])], 'owner_id' => ['nullable', 'integer'],
            'follow_up_on' => ['nullable', 'date_format:Y-m-d'], 'campaign' => ['nullable', 'string', 'max:255'],
            'coverage_url' => ['nullable', 'url:http,https', 'max:2048'], 'notes' => ['nullable', 'string', 'max:5000'],
        ]);
        if (! empty($data['owner_id']) && ! User::role('admin')->whereKey($data['owner_id'])->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages(['owner_id' => 'Choose an administrator as the owner.']);
        }
        return $data;
    }
}
