<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class FounderActivationInvitation extends Notification
{
    public function __construct(public string $founderName, public string $activationUrl) {}

    public function via(object $notifiable): array { return ['mail']; }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('دعوة لتفعيل ملفك في وصول | Activate your Wosool founder profile')
            ->greeting('مرحباً / Hello '.$this->founderName)
            ->line('ندعوك لتفعيل ملفك في وصول، مجتمع من المؤسسين إلى المؤسسين. بعد التفعيل يمكنك مراجعة بياناتك وشركتك والتواصل مع المجتمع.')
            ->line('You are invited to claim your Wosool founder profile. Activate it to review your profile and company information and connect with the community.')
            ->action('تفعيل الملف | Activate profile', $this->activationUrl)
            ->line('تنتهي صلاحية الدعوة خلال 7 أيام ويمكن استخدامها مرة واحدة. التفعيل اختياري؛ إذا لم تكن صاحب الملف فلا تستخدم الرابط.')
            ->line('This personal invitation expires in 7 days and can be used once. Activation is optional. If this profile is not yours, please do not use the link.')
            ->salutation('Wosool | وصول');
    }
}
