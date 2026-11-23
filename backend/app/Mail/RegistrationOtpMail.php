<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Address, Content, Envelope};

/**
 * Six-digit email verification code. Sent when an account is created and again when a
 * member changes the email address in settings ($emailChange), with wording for each case.
 */
class RegistrationOtpMail extends Mailable
{
    public function __construct(public string $code, public bool $emailChange = false) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailChange ? 'أكّد بريدك الجديد في وصول | Confirm your new Wosool email' : 'رمز التحقق من بريدك | Wosool verification code',
            replyTo: [new Address('info@wosool.org', 'Wosool')],
            tags: ['wosool', $this->emailChange ? 'email-change-otp' : 'registration-otp'],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.registration-otp', text: 'mail.registration-otp-text');
    }
}
