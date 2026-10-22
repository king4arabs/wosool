<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            // Hostinger mounts api.wosool.org from /public_html/api. Requests
            // proxied through wosool.org/api therefore arrive with that mount
            // segment removed. Keep the canonical /api routes and register an
            // equivalent unprefixed set for the mounted document root.
            Route::middleware('api')
                ->name('mounted.')
                ->group(base_path('routes/api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->api(prepend: [\App\Http\Middleware\SetLocaleFromHeader::class, \App\Http\Middleware\ApiSecurityHeaders::class]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'member' => \App\Http\Middleware\EnsureUserHasMemberAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
