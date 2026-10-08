<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim(config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
            'token' => $token,
            'email' => $user->getEmailForPasswordReset(),
        ])
        );

        // Enforce strict model behavior in non-production environments
        Model::shouldBeStrict(! $this->app->isProduction());

        // Prevent lazy loading in non-production (catch N+1 queries early)
        Model::preventLazyLoading(! $this->app->isProduction());

        // Force HTTPS in production
        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }

        // Prevent long-running queries in non-production
        if (! $this->app->isProduction()) {
            DB::listen(function ($query) {
                if ($query->time > 1000) {
                    logger()->warning('Slow query detected', [
                        'time' => $query->time,
                    ]);
                }
            });
        }
    }
}
