<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiSecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        if (! $response->headers->has('Referrer-Policy')) {
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        }

        // Cover canonical and Hostinger-mounted routes, including auth errors.
        if (preg_match('#^(?:api/)?v1/(?:auth|member|admin|chat|help-requests)(?:/|$)#', $request->decodedPath())) {
            $response->headers->set('Cache-Control', 'private, no-store, max-age=0');
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        // Only the HTML profile pages should be indexable; API headers alone
        // are a crawler deterrent, never an authentication mechanism.
        if (preg_match('#^(?:api/)?v1/(?:founders|companies)(?:/|$)#', $request->decodedPath())) {
            $response->headers->set('Cache-Control', 'private, no-store, max-age=0');
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }

        return $response;
    }
}
