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

        return \App\Mail\BilingualEmail::message('توثيق حساب المؤسس', 'Verify your founder account', \App\Mail\BilingualEmail::data(
            ar: ['title' => 'وثّق حساب المؤسس', 'lines' => [
                'أكّد بريدك الإلكتروني لنضع علامة التوثيق على ملفك في وصول.',
                'سجّل الدخول بالحساب نفسه الذي وصله هذا البريد قبل فتح الرابط. الرابط صالح لمدة 60 دقيقة.',
            ]],
            en: ['title' => 'Verify your founder account', 'lines' => [
                'Confirm your email so we can mark your Wosool profile as verified.',
                'Sign in with the account that received this email before opening the link. The link is valid for 60 minutes.',
            ]],
            action: \App\Mail\BilingualEmail::action($url, 'توثيق البريد', 'Verify email'),
        ));
    }
}
