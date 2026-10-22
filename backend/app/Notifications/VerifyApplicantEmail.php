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

        return \App\Mail\BilingualEmail::message('تأكيد بريدك الإلكتروني', 'Confirm your email', \App\Mail\BilingualEmail::data(
            ar: ['title' => 'أكّد بريدك الإلكتروني', 'lines' => [
                'خطوة واحدة قبل أن تبدأ طلبك في مسرّعة EO الرياض: أكّد أن هذا البريد يخصك.',
                'الرابط صالح لمدة 60 دقيقة.',
            ]],
            en: ['title' => 'Confirm your email', 'lines' => [
                'One step before you start your EO Riyadh Accelerator application: confirm this email address is yours.',
                'The link is valid for 60 minutes.',
            ]],
            action: \App\Mail\BilingualEmail::action($url, 'تأكيد البريد', 'Confirm email'),
        ));
    }
}
