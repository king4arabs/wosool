<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Program::withCount('cohorts');
        if ($request->boolean('open')) {
            $query->where('is_open', true);
        }
        $programs = $query->get();
        return response()->json($programs);
    }

    public function show(string $slug): JsonResponse
    {
        $program = Program::with('cohorts')->where('slug', $slug)->firstOrFail();
        return response()->json($program);
    }
}
