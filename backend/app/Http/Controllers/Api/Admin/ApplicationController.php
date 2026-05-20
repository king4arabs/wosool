<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\AdminAction;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

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

        if ($application->status === 'approved' && empty($application->invite_token)) {
            $application->invite_token = Str::random(64);
        }

        $application->save();

        if ($application->status === 'approved' && $application->user && method_exists($application->user, 'assignRole') && ! $application->user->hasRole('member')) {
            try {
                $application->user->assignRole('member');
            } catch (Throwable) {
                // Role seeding might not be initialized in some environments.
            }
        }

        if ($application->status === 'approved' && is_null($application->invite_sent_at) && $this->canSendInvitationEmail()) {
            $inviteUrl = rtrim((string) config('app.frontend_url'), '/') . '/register?email=' . urlencode((string) $application->email) . '&invite=' . urlencode((string) $application->invite_token);
            $this->sendInviteEmail($application->email, $application->full_name, $inviteUrl);
            $application->forceFill(['invite_sent_at' => now()])->save();
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

    private function canSendInvitationEmail(): bool
    {
        return filled(config('mail.mailers.smtp.host'))
            && filled(config('mail.from.address'));
    }

    private function sendInviteEmail(string $email, string $name, string $inviteUrl): void
    {
        try {
            Mail::raw(
                "Hello {$name},\n\nYour Wosool application has been approved.\nUse this private invitation link to create your account:\n{$inviteUrl}\n\nThis link is unique to your application.",
                static function ($message) use ($email): void {
                    $message
                        ->to($email)
                        ->subject('Your Wosool invitation link');
                }
            );
        } catch (Throwable $exception) {
            Log::warning('Failed to send invitation email.', [
                'email' => $email,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
