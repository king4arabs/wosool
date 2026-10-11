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

    public function __construct(public string $message) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('Wosool | EO Riyadh Accelerator')
            ->line($this->message)->action('Open your account / افتح حسابك', rtrim(config('app.frontend_url'), '/').'/EOA/account')
            ->line('Documents and financial details stay in your account / تتاح المستندات والتفاصيل المالية داخل حسابك فقط.');
    }
}
