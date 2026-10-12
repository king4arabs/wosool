<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent separately to each side of an accepted introduction so neither address is exposed in a shared recipient list.
 */
class IntroductionConnectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientName,
        public string $counterpartName,
        public string $actionUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'تم ربطك عبر وصول | Your Wosool introduction is connected');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.introduction-connected');
    }
}
