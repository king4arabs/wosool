<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use App\Models\AnalyticsEvent;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Program::query()->withCount(['cohorts', 'applications']);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('program_type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('program_type', (string) $request->input('type'));
        }

        if ($request->filled('visibility') && Schema::hasColumn('programs', 'visibility')) {
            $query->where('visibility', (string) $request->input('visibility'));
        }

        if ($request->filled('status_flow') && Schema::hasColumn('programs', 'status_flow')) {
            $query->where('status_flow', (string) $request->input('status_flow'));
        }

        if ($request->boolean('open')) {
            $query->where('is_open', true);
        }

        $query->where(function ($builder): void {
            if (Schema::hasColumn('programs', 'visibility')) {
                $builder->whereIn('visibility', ['public', 'members_only', 'founder_only']);
            } else {
                $builder->where('is_open', true);
            }
        });

        $programs = $query
            ->latest()
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return ProgramResource::collection($programs)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $program = Program::with(['cohorts', 'sessions', 'resources'])->where('slug', $slug)->firstOrFail();

        AnalyticsEvent::track(
            eventName: 'program_viewed',
            userId: auth('sanctum')->id(),
            entityType: 'program',
            entityId: $program->id,
            properties: ['slug' => $program->slug]
        );

        return response()->json([
            'data' => new ProgramResource($program),
        ]);
    }
}
