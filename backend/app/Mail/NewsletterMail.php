<?php
namespace App\Mail;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Address, Content, Envelope, Headers};
class NewsletterMail extends Mailable
{
    public function __construct(public string $kind, public string $language, public string $actionUrl, public string $unsubscribeUrl, public array $stories = [], public array $members = [], public array $events = [], public string $period = '', public string $oneClickUrl = '') {}
    public function envelope(): Envelope
    {
        $subjects = ['confirm' => ['أكّد اشتراكك في نشرة وصول', 'Confirm your Wosool subscription'], 'welcome' => ['أهلاً بك في نشرة وصول', 'Welcome to Wosool updates'], 'digest' => ['نشرة وصول الشهرية', 'Your monthly Wosool update']];
        return new Envelope(subject: $subjects[$this->kind][$this->language === 'ar' ? 0 : 1].($this->period ? ' — '.$this->period : ''), replyTo: [new Address('info@wosool.org', 'Wosool')], tags: ['wosool', 'newsletter-'.$this->kind]);
    }
    public function headers(): Headers
    {
        // RFC 8058: only a signed POST unsubscribes; ordinary link scanners cannot mutate state.
        return new Headers(text: $this->kind !== 'confirm' && str_starts_with($this->oneClickUrl, 'https://') ? [
            'List-Unsubscribe' => '<'.$this->oneClickUrl.'>',
            'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
        ] : []);
    }
    public function content(): Content { return new Content(view: 'mail.newsletter', text: 'mail.newsletter-text'); }
}
