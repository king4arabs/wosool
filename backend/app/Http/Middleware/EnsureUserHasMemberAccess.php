<?php

namespace App\Http\Middleware;

use App\Models\Application;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasMemberAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(response()->json(['message' => 'Authentication required.'], 401));
        }

        if (($user->is_accelerator_applicant || $user->hasRole('eoa_applicant')) && ! $user->hasAnyRole(['member', 'admin'])) {
            abort(403, 'Use the EO Accelerator workspace. Wosool membership is separate.');
        }

        $profile = $user->founderProfile()->first();
        if ($profile && ($profile->status === 'suspended' || ($profile->directory_key && ! $profile->communityActive())) && ! $user->hasRole('admin')) {
            // Same refusal as before; `reason` lets pages tell a profile under review from an inactive one.
            abort(response()->json([
                'message' => 'Your founder profile must be active to access the community.',
                'reason' => $profile->status === 'pending' ? 'profile_pending' : 'profile_inactive',
            ], 403));
        }

        $hasMemberRole = method_exists($user, 'hasRole') && ($user->hasRole('member') || $user->hasRole('admin'));
        $hasMemberToken = in_array((string) ($user->role_token ?? ''), ['founder', 'admin'], true);

        $hasFounderProfile = method_exists($user, 'founderProfile') && $user->founderProfile()->exists();
        $hasApprovedApplication = Application::query()
            ->where(function ($query) use ($user) {
                $query
                    ->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->where('status', 'approved')
            ->exists();

        if (! $hasMemberRole && ! $hasMemberToken && ! $hasFounderProfile && ! $hasApprovedApplication) {
            abort(response()->json([
                'message' => 'Member access is required.',
            ], 403));
        }

        return $next($request);
    }
}
