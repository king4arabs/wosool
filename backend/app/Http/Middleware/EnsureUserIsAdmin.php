<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isPlatformAdmin()) {
            abort(response()->json(['message' => 'Admin access is required.'], 403));
        }
        if (! $user->hasVerifiedEmail()) {
            abort(response()->json([
                'message' => __('messages.registration.admin_verification_required'),
                'reason' => 'email_unverified',
                'next' => '/onboarding',
            ], 403));
        }

        return $next($request);
    }
}
