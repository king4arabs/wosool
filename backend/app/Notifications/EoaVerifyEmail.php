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
        return \App\Mail\BilingualEmail::message('توثيق حسابك في مسرّعة EO الرياض', 'Verify your EO Riyadh Accelerator account', \App\Mail\BilingualEmail::data(
            ar: ['title' => 'وثّق بريدك لحفظ طلبك', 'lines' => [
                'تحتاج إلى بريد موثّق لحفظ طلبك في مسرّعة EO الرياض وتقديمه.',
                'الرابط صالح لمدة 60 دقيقة.',
            ], 'after' => ['إذا لم تنشئ هذا الحساب فتجاهل الرسالة.']],
            en: ['title' => 'Verify your email to save your application', 'lines' => [
                'You need a verified email to save and submit your EO Riyadh Accelerator application.',
                'The link is valid for 60 minutes.',
            ], 'after' => ['If you did not create this account, you can ignore this email.']],
            action: \App\Mail\BilingualEmail::action($url, 'توثيق البريد', 'Verify email'),
        ));
    }

    protected function verificationUrl($notifiable): string
    {
        return rtrim(config('app.frontend_url'), '/').URL::temporarySignedRoute(
            'eoa.verify', now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())], absolute: false
        );
    }
}
