<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class EoaVerifyEmail extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    protected function buildMailMessage($url)
    {
        return (new MailMessage)
            ->subject('Verify your account / توثيق حسابك — EO Riyadh Accelerator')
            ->line('Verify your email to save and submit your application / وثّق بريدك لحفظ طلبك وتقديمه.')
            ->action('Verify email / توثيق البريد', $url)
            ->line('This link expires in 60 minutes / تنتهي صلاحية الرابط خلال 60 دقيقة.')
            ->line('If you did not create this account, ignore this email / إذا لم تنشئ هذا الحساب، تجاهل الرسالة.');
    }

    protected function verificationUrl($notifiable): string
    {
        return rtrim(config('app.frontend_url'), '/').URL::temporarySignedRoute(
            'eoa.verify', now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())], absolute: false
        );
    }
}
