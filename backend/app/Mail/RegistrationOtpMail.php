<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Content, Envelope};

class RegistrationOtpMail extends Mailable
{
    public function __construct(public string $code) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'رمز التحقق من بريدك | Wosool verification code', replyTo: [new \Illuminate\Mail\Mailables\Address('info@wosool.org', 'Wosool')], tags: ['wosool', 'registration-otp']);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.registration-otp', text: 'mail.registration-otp-text');
    }
}
