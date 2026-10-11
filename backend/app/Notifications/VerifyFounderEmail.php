<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyFounderEmail extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $path = URL::temporarySignedRoute('gateway.verification', now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())], absolute: false);
        $url = rtrim(config('app.frontend_url'), '/').'/verify-email?'.http_build_query(['path' => $path, 'return_to' => 'dashboard']);

        return (new MailMessage)->subject('Wosool | Verify your founder account / تأكيد حساب المؤسس')
            ->line('Confirm your email to verify your Wosool founder account. أكّد بريدك الإلكتروني لتوثيق حساب المؤسس في وصول.')
            ->action('Verify email / تأكيد البريد', $url)
            ->line('Sign in to the account that received this email before opening the link. سجّل الدخول إلى الحساب صاحب البريد قبل فتح الرابط.')
            ->line('This link expires in 60 minutes. تنتهي صلاحية الرابط خلال ٦٠ دقيقة.');
    }
}
