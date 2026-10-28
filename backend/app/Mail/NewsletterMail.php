<?php
namespace App\Mail;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Address, Content, Envelope};
class NewsletterMail extends Mailable
{
    public function __construct(public string $kind, public string $locale, public string $actionUrl, public string $unsubscribeUrl, public array $stories = []) {}
    public function envelope(): Envelope
    {
        $subjects = ['confirm' => ['أكّد اشتراكك في نشرة وصول', 'Confirm your Wosool subscription'], 'welcome' => ['أهلاً بك في نشرة وصول', 'Welcome to Wosool updates'], 'digest' => ['مختارات وصول لهذا الأسبوع', 'Your weekly Wosool highlights']];
        return new Envelope(subject: $subjects[$this->kind][$this->locale === 'ar' ? 0 : 1], replyTo: [new Address('info@wosool.org', 'Wosool')], tags: ['wosool', 'newsletter-'.$this->kind]);
    }
    public function content(): Content { return new Content(view: 'mail.newsletter', text: 'mail.newsletter-text'); }
}
