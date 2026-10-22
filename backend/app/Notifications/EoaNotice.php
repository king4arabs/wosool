<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EoaNotice extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /** Bilingual copy per workflow event; unknown events fall back to the stored message. */
    private const EVENTS = [
        'submitted' => [
            ['تم استلام طلبك', 'وصلنا طلبك في مسرّعة EO الرياض. سيراجعه الفريق وتجد كل تحديث في حسابك.'],
            ['We received your application', 'Your EO Riyadh Accelerator application is in. The team will review it and every update will appear in your account.'],
        ],
        'review_updated' => [
            ['تحديث على طلبك', 'هناك تحديث جديد على طلبك. افتح حسابك للاطلاع على التفاصيل والخطوة التالية.'],
            ['There is an update on your application', 'Your application has a new update. Open your account to see the details and what comes next.'],
        ],
        'onboarding_updated' => [
            ['تحديث على خطوات الانضمام', 'تغيّرت حالة انضمامك إلى المسرّعة. راجع حسابك لمعرفة المطلوب منك.'],
            ['Your onboarding status changed', 'Your accelerator onboarding status has changed. Check your account to see what is needed from you.'],
        ],
    ];

    public function __construct(public string $message, public ?string $event = null) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        [$ar, $en] = self::EVENTS[$this->event] ?? [['تحديث من مسرّعة EO الرياض', $this->message], ['An update from EO Riyadh Accelerator', $this->message]];

        return \App\Mail\BilingualEmail::message($ar[0], $en[0], \App\Mail\BilingualEmail::data(
            ar: ['title' => $ar[0], 'lines' => [$ar[1]], 'after' => ['لحماية خصوصيتك، تبقى المستندات والتفاصيل المالية داخل حسابك ولا تُرسل بالبريد.']],
            en: ['title' => $en[0], 'lines' => [$en[1]], 'after' => ['To protect your privacy, documents and financial details stay in your account and are never sent by email.']],
            action: \App\Mail\BilingualEmail::action(rtrim(config('app.frontend_url'), '/').'/eoa/account', 'فتح حسابي', 'Open my account'),
        ));
    }
}
