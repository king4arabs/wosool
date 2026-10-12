<?php

namespace App\Providers;

use App\Mail\BilingualEmail;
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
        $resetUrl = fn ($user, string $token) =>
            rtrim(config('app.frontend_url'), '/').($user->is_accelerator_applicant || $user->hasAnyRole(['eoa_applicant','eoa_lead','eoa_staff','eoa_reviewer','eoa_coach']) ? '/EOA/reset-password?' : '/reset-password?').http_build_query([
                'token' => $token,
                'email' => $user->getEmailForPasswordReset(),
            ]);
        ResetPassword::createUrlUsing($resetUrl);
        ResetPassword::toMailUsing(function ($user, string $token) use ($resetUrl) {
            $minutes = (int) config('auth.passwords.users.expire');

            return BilingualEmail::message('إعادة تعيين كلمة المرور', 'Reset your password', BilingualEmail::data(
                ar: ['title' => 'إعادة تعيين كلمة المرور', 'lines' => [
                    'وصلنا طلب لإعادة تعيين كلمة المرور لحسابك في وصول.',
                    "الرابط صالح لمدة {$minutes} دقيقة ويُستخدم مرة واحدة.",
                ], 'after' => ['إذا لم تطلب ذلك فلا داعي لأي إجراء، وستبقى كلمة المرور الحالية كما هي.']],
                en: ['title' => 'Reset your password', 'lines' => [
                    'We received a request to reset the password for your Wosool account.',
                    "This link expires in {$minutes} minutes and can be used once.",
                ], 'after' => ['If you did not ask for this, no action is needed and your current password stays the same.']],
                action: BilingualEmail::action($resetUrl($user, $token), 'تعيين كلمة مرور جديدة', 'Choose a new password'),
            ));
        });

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
