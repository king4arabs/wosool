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
        return (new MailMessage)
            ->subject('دعوة لتفعيل ملفك في وصول | Activate your Wosool founder profile')
            ->markdown('mail.founder-activation', [
                'founderName' => $this->founderName,
                'activationUrl' => $this->activationUrl,
                'code' => $this->code,
            ]);
    }
}
