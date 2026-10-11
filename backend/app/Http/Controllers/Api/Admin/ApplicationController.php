<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\AdminAction;
use App\Models\Application;
use App\Models\User;
use App\Services\FounderInvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

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
            'data' => ApplicationResource::collection(collect($applications->items())),
            'meta' => [
                'total' => $applications->total(),
                'current_page' => $applications->currentPage(),
                'per_page' => $applications->perPage(),
                'submitted' => Application::where('status', 'submitted')->count(),
                'reviewing' => Application::where('status', 'reviewing')->count(),
                'approved' => Application::where('status', 'approved')->count(),
                'rejected' => Application::where('status', 'rejected')->count(),
                'waitlisted' => Application::where('status', 'waitlisted')->count(),
                'request_more_info' => Application::where('status', 'request_more_info')->count(),
            ],
        ]);
    }

    public function update(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['submitted', 'reviewing', 'approved', 'rejected', 'waitlisted', 'request_more_info'])],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $beforeState = $application->only(['status', 'admin_notes', 'reviewed_by', 'reviewed_at']);

        $application->fill($data);
        $application->reviewed_by = $request->user()->id;
        $application->reviewed_at = now();

        if ($application->status !== 'approved') {
            $application->invite_token = null;
            $application->invite_sent_at = null;
        }

        $application->save();

        if ($application->status === 'approved' && $application->user && method_exists($application->user, 'assignRole') && ! $application->user->hasRole('member')) {
            try {
                $application->user->assignRole('member');
            } catch (Throwable) {
                // Role seeding might not be initialized in some environments.
            }
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
            'data' => new ApplicationResource($application->load('reviewer:id,name')),
        ]);
    }

    public function sendInvitation(Request $request, Application $application, FounderInvitationService $invitationService): JsonResponse
    {
        abort_unless($application->status === 'approved', 409, 'Only approved applications can be invited.');
        abort_if($application->user_id !== null, 409, 'This application is already linked to an account.');
        abort_unless($invitationService->realMailer((string) config('mail.default')) && filled(config('mail.from.address')), 503, 'A delivery mailer must be configured.');

        $existingUser = User::whereRaw('LOWER(email) = ?', [strtolower($application->email)])->first();
        $token = $existingUser ? null : Str::random(64);
        $inviteUrl = $existingUser
            ? rtrim((string) config('app.frontend_url'), '/') . '/login'
            : rtrim((string) config('app.frontend_url'), '/') . '/register?email=' . urlencode((string) $application->email) . '&invite=' . urlencode($token);
        try {
            Mail::raw(
                "Hello {$application->full_name},\n\nYour Wosool application has been approved.\n" . ($existingUser ? "Sign in with your existing account to activate your membership:\n" : "Use this private invitation link to activate your account:\n") . "{$inviteUrl}",
                static function ($message) use ($application): void {
                    $message->to($application->email)->subject('Your Wosool account activation');
                }
            );
        } catch (\Throwable $exception) {
            Log::warning('Failed to send invitation email.', ['application_id' => $application->id, 'error' => $exception->getMessage()]);
            throw new ServiceUnavailableHttpException(null, 'Could not send the invitation email.');
        }

        $application->forceFill(['invite_token' => $token, 'invite_sent_at' => now()])->save();
        AdminAction::log($request->user()->id, 'application.invitation_sent', 'application', $application->id);

        return response()->json(['message' => 'Invitation sent.', 'data' => new ApplicationResource($application->load('reviewer:id,name'))]);
    }
}
