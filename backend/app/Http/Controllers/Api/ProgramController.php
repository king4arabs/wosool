<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('open')) {
            $query->where('is_open', true);
        }

        $programs = $query
            ->latest()
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return ProgramResource::collection($programs)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $program = Program::with('cohorts')->where('slug', $slug)->firstOrFail();

        return response()->json([
            'data' => new ProgramResource($program),
        ]);
    }
}
