<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Privacy-safe status nudge: never includes review details, only a sign-in link.
 */
class ApplicationUpdateMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $actionUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'تحديث على طلبك في وصول | Wosool application update');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.application-update');
    }
}
