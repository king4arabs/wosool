<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Every transactional Wosool email, rendered with the shared bilingual layout.
 * Use the named constructors so subjects and copy stay consistent.
 */
class WosoolMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $kind,
        public string $subjectAr,
        public string $subjectEn,
        public array $data,
        public ?string $replyToAddress = null,
        public ?string $replyToName = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: BilingualEmail::subject($this->subjectAr, $this->subjectEn),
            replyTo: $this->replyToAddress ? [new Address($this->replyToAddress, $this->replyToName)] : [],
            tags: ['wosool', $this->kind],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: BilingualEmail::VIEW, with: $this->data);
    }

    private static function url(string $path): string
    {
        return rtrim((string) config('app.frontend_url'), '/').$path;
    }

    /** Approved community applicant: private registration link, or sign-in for an existing account. */
    public static function applicationInvitation(string $name, string $url, bool $existingAccount): self
    {
        return new self('application-invitation', 'تم قبول طلبك في وصول', 'Your Wosool application is approved', BilingualEmail::data(
            ar: ['title' => 'أهلاً بك في وصول', 'greeting' => "مرحباً {$name}،", 'lines' => [
                'راجع الفريق طلبك ووافق على انضمامك إلى مجتمع وصول.',
                $existingAccount ? 'لديك حساب بهذا البريد، سجّل الدخول وستُفعَّل عضويتك مباشرة.' : 'أنشئ حسابك من الرابط الخاص أدناه، وستُفعَّل عضويتك مباشرة.',
            ], 'after' => $existingAccount ? [] : ['الرابط خاص بك، فلا تشاركه.']],
            en: ['title' => 'Welcome to Wosool', 'greeting' => "Hello {$name},", 'lines' => [
                'The team reviewed your application and approved your membership in the Wosool community.',
                $existingAccount ? 'You already have an account with this email. Sign in and your membership activates right away.' : 'Create your account from the private link below and your membership activates right away.',
            ], 'after' => $existingAccount ? [] : ['This link is personal to you, so please do not share it.']],
            action: BilingualEmail::action($url, $existingAccount ? 'تسجيل الدخول' : 'إنشاء الحساب', $existingAccount ? 'Sign in' : 'Create your account'),
        ));
    }

    /** Sent separately to each founder once an introduction is accepted. */
    public static function introductionConnected(string $recipient, string $counterpart): self
    {
        return new self('introduction-connected', "أصبحت على تواصل مع {$counterpart}", "You're now connected with {$counterpart}", BilingualEmail::data(
            ar: ['title' => 'تم قبول التعارف', 'greeting' => "مرحباً {$recipient}،", 'lines' => [
                "قبل {$counterpart} طلب التعارف، وفتحنا لكما محادثة خاصة في وصول.",
                'ابدأ بتعريف قصير بنفسك وما تأمل أن تتحدثا عنه.',
            ]],
            en: ['title' => 'Your introduction was accepted', 'greeting' => "Hello {$recipient},", 'lines' => [
                "{$counterpart} accepted the introduction and we opened a private conversation for you both on Wosool.",
                'Start with a short note about yourself and what you hope to discuss.',
            ]],
            action: BilingualEmail::action(self::url('/dashboard/messages'), 'فتح المحادثة', 'Open the conversation'),
        ));
    }

    /** Privacy-safe nudge: no review details, only a sign-in link. */
    public static function applicationUpdate(string $url): self
    {
        return new self('application-update', 'تحديث على طلبك', 'An update on your application', BilingualEmail::data(
            ar: ['title' => 'هناك تحديث على طلبك', 'lines' => ['سجّل الدخول لمعرفة التفاصيل والخطوة التالية.']],
            en: ['title' => 'There is an update on your application', 'lines' => ['Sign in to see the details and the next step.']],
            action: BilingualEmail::action($url, 'عرض الطلب', 'View application'),
        ));
    }

    /** Confirmation to the applicant after a community membership application. */
    public static function applicationReceived(string $name, string $reference): self
    {
        return new self('application-received', 'استلمنا طلب انضمامك', 'We received your membership application', BilingualEmail::data(
            ar: ['title' => 'شكراً لتقديمك على وصول', 'greeting' => "مرحباً {$name}،", 'lines' => [
                "وصلنا طلبك برقم {$reference}. يراجع الفريق كل طلب بنفسه، وعادة نرد خلال 5 إلى 7 أيام عمل.",
                'إذا قُبل الطلب ستصلك رسالة برابط إنشاء حسابك.',
            ]],
            en: ['title' => 'Thanks for applying to Wosool', 'greeting' => "Hello {$name},", 'lines' => [
                "We received your application, reference {$reference}. The team reviews every application personally and usually replies within 5–7 business days.",
                'If it is approved, you will get an email with a link to create your account.',
            ]],
            details: [['ar' => 'رقم الطلب', 'en' => 'Reference', 'value' => $reference]],
        ));
    }

    /** Tells a member that another founder offered to help with their question; no contact details are shared. */
    public static function helpOffered(string $recipient, string $helper, string $question, ?int $roomId): self
    {
        return new self('help-offered', "{$helper} يريد المساعدة في سؤالك", "{$helper} offered to help with your question", BilingualEmail::data(
            ar: ['title' => 'عرض مساعدة جديد', 'greeting' => "مرحباً {$recipient}،", 'lines' => [
                "عرض {$helper} المساعدة في سؤالك، وانضم إلى غرفة المحادثة الخاصة به.",
                'ردّ عليه من المحادثة، وعلّم السؤال «تم الحل» عندما تحصل على ما تحتاجه.',
            ]],
            en: ['title' => 'Someone offered to help', 'greeting' => "Hello {$recipient},", 'lines' => [
                "{$helper} offered to help with your question and joined its private conversation.",
                'Reply in the conversation, and mark the question resolved once you have what you need.',
            ]],
            action: BilingualEmail::action(self::url($roomId ? "/dashboard/messages?room={$roomId}" : '/dashboard/help-requests'), 'فتح المحادثة', 'Open the conversation'),
            details: [['ar' => 'السؤال', 'en' => 'Question', 'value' => $question]],
        ));
    }

    /** Confirmation to the sender of a contact or sponsorship message. */
    public static function contactReceived(string $name, string $subject): self
    {
        return new self('contact-received', 'وصلتنا رسالتك', 'We received your message', BilingualEmail::data(
            ar: ['title' => 'شكراً لتواصلك معنا', 'greeting' => "مرحباً {$name}،", 'lines' => [
                'وصلتنا رسالتك وسيرد عليك أحد أعضاء الفريق خلال يومين إلى ثلاثة أيام عمل.',
                'يمكنك الرد على هذا البريد إذا أردت إضافة أي تفاصيل.',
            ]],
            en: ['title' => 'Thanks for getting in touch', 'greeting' => "Hello {$name},", 'lines' => [
                'Your message reached us and someone from the team will reply within 2–3 business days.',
                'You can reply to this email if you want to add anything.',
            ]],
            details: [['ar' => 'الموضوع', 'en' => 'Subject', 'value' => $subject]],
        ));
    }

    /** Operational alert to the team inbox; replies go straight to the person who wrote in. */
    public static function teamAlert(string $titleAr, string $titleEn, array $details, string $adminPath, ?string $replyTo = null, ?string $replyName = null): self
    {
        return new self('team-alert', $titleAr, $titleEn, BilingualEmail::data(
            ar: ['title' => $titleAr, 'lines' => ['التفاصيل أدناه. يمكنك الرد على هذا البريد للتواصل مع المرسل مباشرة.']],
            en: ['title' => $titleEn, 'lines' => ['Details are below. Reply to this email to reach the sender directly.']],
            action: BilingualEmail::action(self::url($adminPath), 'فتح لوحة الإدارة', 'Open in admin'),
            details: $details,
        ), $replyTo, $replyName);
    }
}
