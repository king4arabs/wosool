<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Application::query()->with(['reviewer:id,name']);

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($stage = $request->input('stage')) {
            $query->where('stage', $stage);
        }

        $applications = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => $applications->items(),
            'meta' => [
                'total' => $applications->total(),
                'submitted' => Application::where('status', 'submitted')->count(),
                'reviewing' => Application::where('status', 'reviewing')->count(),
                'approved' => Application::where('status', 'approved')->count(),
                'rejected' => Application::where('status', 'rejected')->count(),
                'waitlisted' => Application::where('status', 'waitlisted')->count(),
            ],
        ]);
    }

    public function update(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['submitted', 'reviewing', 'approved', 'rejected', 'waitlisted'])],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $beforeState = $application->only(['status', 'admin_notes', 'reviewed_by', 'reviewed_at']);

        $application->fill($data);
        $application->reviewed_by = $request->user()->id;
        $application->reviewed_at = now();
        $application->save();

        if ($application->status === 'approved' && $application->user && method_exists($application->user, 'assignRole') && ! $application->user->hasRole('member')) {
            $application->user->assignRole('member');
        }

        AdminAction::log(
            adminId: $request->user()->id,
            action: 'application.updated',
            entityType: 'application',
            entityId: $application->id,
            notes: "Application moved to {$application->status}",
            beforeState: $beforeState,
            afterState: $application->only(['status', 'admin_notes', 'reviewed_by', 'reviewed_at']),
        );

        return response()->json([
            'message' => 'Application updated.',
            'data' => $application->load('reviewer:id,name'),
        ]);
    }
}
