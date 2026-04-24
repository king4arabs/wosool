<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramApplicationRequest;
use App\Models\Program;
use App\Models\ProgramApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProgramApplicationController extends Controller
{
    /**
     * List the authenticated user's program applications.
     */
    public function index(Request $request): JsonResponse
    {
        $applications = ProgramApplication::with('program')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $applications]);
    }

    /**
     * Apply to a program.
     */
    public function store(StoreProgramApplicationRequest $request, string $slug): JsonResponse
    {
        $program = Program::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if (! $program->is_open) {
            throw ValidationException::withMessages([
                'program' => ['This program is not currently accepting applications.'],
            ]);
        }

        if ($program->application_deadline && $program->application_deadline->isPast()) {
            throw ValidationException::withMessages([
                'program' => ['The application deadline has passed.'],
            ]);
        }

        $existing = ProgramApplication::where('program_id', $program->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'program' => ['You have already applied to this program.'],
            ]);
        }

        $data = $request->validated();
        $application = ProgramApplication::create([
            'program_id' => $program->id,
            'user_id' => $user->id,
            'cohort_id' => $data['cohort_id'] ?? null,
            'motivation' => $data['motivation'],
            'relevant_experience' => $data['relevant_experience'] ?? null,
            'status' => 'submitted',
        ]);

        return response()->json([
            'message' => 'Application submitted. We will review it and get back to you.',
            'data' => $application,
        ], 201);
    }
}
