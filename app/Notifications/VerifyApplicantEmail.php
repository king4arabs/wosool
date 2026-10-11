<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyApplicantEmail extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 4;

    public function __construct()
    {
        $this->afterCommit();
    }

    public function backoff(): array
    {
        return [30, 120, 600];
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $path = URL::temporarySignedRoute('gateway.verification', now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())], absolute: false);
        $url = rtrim(config('app.frontend_url'), '/').'/verify-email?'.http_build_query(['path' => $path]);

        return (new MailMessage)->subject('Wosool | تأكيد البريد الإلكتروني')
            ->line('Confirm your email to start your EO Riyadh Accelerator application. أكّد بريدك الإلكتروني لبدء طلبك.')
            ->action('Verify email | تأكيد البريد', $url)
            ->line('This link expires in 60 minutes. تنتهي صلاحية الرابط خلال ٦٠ دقيقة.');
    }
}
