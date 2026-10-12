<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Bilingual approval email sent when an admin invites an approved community applicant.
 * New applicants receive a private registration link; existing accounts are sent to sign in.
 */
class ApplicationInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fullName,
        public string $actionUrl,
        public bool $existingAccount,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'تم قبول طلبك في وصول | Your Wosool account activation');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.application-invitation');
    }
}
