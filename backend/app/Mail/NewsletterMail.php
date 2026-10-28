<?php
namespace App\Mail;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Address, Content, Envelope};
class NewsletterMail extends Mailable
{
    public function __construct(public string $kind, public string $language, public string $actionUrl, public string $unsubscribeUrl, public array $stories = [], public array $members = [], public array $events = [], public string $period = '') {}
    public function envelope(): Envelope
    {
        $subjects = ['confirm' => ['أكّد اشتراكك في نشرة وصول', 'Confirm your Wosool subscription'], 'welcome' => ['أهلاً بك في نشرة وصول', 'Welcome to Wosool updates'], 'digest' => ['نشرة وصول الشهرية', 'Your monthly Wosool update']];
        return new Envelope(subject: $subjects[$this->kind][$this->language === 'ar' ? 0 : 1].($this->period ? ' — '.$this->period : ''), replyTo: [new Address('info@wosool.org', 'Wosool')], tags: ['wosool', 'newsletter-'.$this->kind]);
    }
    public function content(): Content { return new Content(view: 'mail.newsletter', text: 'mail.newsletter-text'); }
}
