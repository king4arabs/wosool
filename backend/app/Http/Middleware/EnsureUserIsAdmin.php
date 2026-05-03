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

        if (! $user || ! method_exists($user, 'hasRole') || ! $user->hasRole('admin')) {
            abort(response()->json([
                'message' => 'Admin access is required.',
            ], 403));
        }

        return $next($request);
    }
}
