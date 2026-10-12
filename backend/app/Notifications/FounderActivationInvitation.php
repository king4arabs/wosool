<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class FounderActivationInvitation extends Notification
{
    public function __construct(public string $founderName, public string $activationUrl, public string $code) {}

    public function via(object $notifiable): array { return ['mail']; }

    public function toMail(object $notifiable): MailMessage
    {
        return \App\Mail\BilingualEmail::message('فعّل ملفك في وصول', 'Activate your Wosool founder profile', \App\Mail\BilingualEmail::data(
            ar: ['title' => 'ملفك في وصول جاهز للتفعيل', 'greeting' => "مرحباً {$this->founderName}،", 'lines' => [
                'أضفنا ملفاً لك ولشركتك في دليل مؤسسي وصول بناءً على مصادر منشورة. بتفعيله تراجع بياناتك وتعدّلها وتبدأ التواصل مع المؤسسين.',
                'افتح الرابط ثم أدخل الرمز أدناه.',
            ], 'after' => ['الرابط والرمز صالحان لمدة 7 أيام ولمرة واحدة. التفعيل اختياري، وإذا لم يكن الملف لك فتجاهل الرسالة ولا تشارك الرمز.']],
            en: ['title' => 'Your Wosool profile is ready to activate', 'greeting' => "Hello {$this->founderName},", 'lines' => [
                'We added a profile for you and your company to the Wosool founder directory, based on published sources. Activate it to review and edit your details and start talking with other founders.',
                'Open the link, then enter the code below.',
            ], 'after' => ['The link and code are valid for 7 days and work once. Activation is optional. If this profile is not yours, ignore this email and do not share the code.']],
            action: \App\Mail\BilingualEmail::action($this->activationUrl, 'تفعيل الملف', 'Activate profile'),
            code: $this->code,
        ));
    }
}
