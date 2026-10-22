<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('X-Locale')
            ?? $request->header('X-Local')
            ?? $request->header('X-Language')
            ?? $request->getPreferredLanguage(['ar', 'en'])
            ?? config('app.locale', 'en');

        $normalized = strtolower(substr((string) $locale, 0, 2));
        if (! in_array($normalized, ['ar', 'en'], true)) {
            $normalized = config('app.locale', 'en');
        }

        app()->setLocale($normalized);

        return $next($request);
    }
}
