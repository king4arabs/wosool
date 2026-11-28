<?php

namespace Tests\Feature;

use App\Mail\WosoolMail;
use App\Models\User;
use App\Notifications\EoaNotice;
use App\Notifications\FounderActivationInvitation;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TransactionalEmailTest extends TestCase
{
    use RefreshDatabase;

    private function contact(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Layla Al-Harbi', 'email' => 'layla@example.com', 'category' => 'sponsorship',
            'subject' => 'Founders dinner sponsorship', 'message' => 'We would like to sponsor the next dinner.', 'company' => 'Acme',
        ], $overrides);
    }

    public function test_contact_message_confirms_to_sender_and_alerts_the_team_with_reply_to(): void
    {
        Mail::fake();
        config(['mail.default' => 'smtp', 'mail.team_address' => 'team@wosool.org']);

        $this->postJson('/api/v1/contact', $this->contact())->assertCreated();

        Mail::assertSent(WosoolMail::class, fn (WosoolMail $mail) => $mail->kind === 'contact-received' && $mail->hasTo('layla@example.com'));
        Mail::assertSent(WosoolMail::class, fn (WosoolMail $mail) => $mail->kind === 'team-alert'
            && $mail->hasTo('team@wosool.org') && $mail->hasReplyTo('layla@example.com'));
        $this->assertDatabaseHas('contact_messages', ['email' => 'layla@example.com', 'category' => 'sponsorship']);
    }

    public function test_mail_outage_does_not_fail_a_saved_submission(): void
    {
        config(['mail.default' => 'smtp']);
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP down'));

        $this->postJson('/api/v1/contact', $this->contact())->assertCreated();
        $this->assertDatabaseHas('contact_messages', ['email' => 'layla@example.com']);
    }

    public function test_bilingual_layout_puts_arabic_rtl_first_and_escapes_user_content(): void
    {
        config(['app.frontend_url' => 'https://wosool.org']);
        $html = WosoolMail::contactReceived('<script>x</script>', 'Hello')->render();

        $this->assertStringContainsString('dir="rtl"', $html);
        $this->assertLessThan(strpos($html, 'lang-block lang-en'), strpos($html, 'lang-block lang-ar'));
        $this->assertStringNotContainsString('<script>x</script>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringNotContainsString('Regards', $html);
        $this->assertStringContainsString('Founders to Founders', $html);
    }

    public function test_plain_text_part_is_readable_and_links_to_the_public_site(): void
    {
        config(['mail.default' => 'array', 'app.url' => 'https://api.wosool.org', 'app.frontend_url' => 'https://wosool.org', 'mail.from.address' => 'hello@wosool.org']);

        Mail::to('layla@example.com')->send(WosoolMail::helpOffered('Ali & Sara', "O'Neil", 'How do I price B2B & SaaS?', 5));
        User::factory()->create()->notify(new FounderActivationInvitation('Layla', 'https://wosool.org/activate-founder#token=a', '123456'));

        $messages = array_map(fn ($sent) => $sent->getOriginalMessage(), iterator_to_array(app('mailer')->getSymfonyTransport()->messages()));
        $this->assertCount(2, $messages);
        [$help, $activation] = array_values($messages);

        foreach ([$help, $activation] as $email) {
            $text = $email->getTextBody();
            $this->assertStringStartsWith('وصول | Wosool — https://wosool.org', $text);
            $this->assertStringNotContainsString('api.wosool.org', $text);
            $this->assertStringNotContainsString('If the button does not work', $text);
            $this->assertStringNotContainsString('All rights reserved', $text);
            $this->assertStringContainsString("https://wosool.org · hello@wosool.org\nإذا لم تطلب هذه الرسالة، يمكنك تجاهلها.\nIf you did not request this message, please ignore it.", $text);
            $this->assertDoesNotMatchRegularExpression('/&(amp|#0?39|quot|lt|gt);/', $text);
            // The HTML part keeps the button and its copy-the-link fallback.
            $this->assertStringContainsString('button-primary', $email->getHtmlBody());
            $this->assertStringContainsString('If the button does not work', $email->getHtmlBody());
        }

        $text = $help->getTextBody();
        $this->assertStringContainsString('السؤال: How do I price B2B & SaaS?', $text);
        $this->assertStringContainsString('Question: How do I price B2B & SaaS?', $text);
        $this->assertStringContainsString("فتح المحادثة:\nhttps://wosool.org/dashboard/messages?room=5", $text);
        $this->assertStringContainsString("Open the conversation:\nhttps://wosool.org/dashboard/messages?room=5", $text);
        $this->assertStringContainsString("O'Neil offered to help", $text);
        $this->assertStringContainsString('class="details"', $help->getHtmlBody());

        $text = $activation->getTextBody();
        $this->assertStringContainsString("Activation code\n123456", $text);
        $this->assertStringContainsString("Activate my account at Wosool:\nhttps://wosool.org/activate-founder#token=a", $text);
    }

    public function test_every_notification_uses_the_bilingual_layout(): void
    {
        config(['app.frontend_url' => 'https://wosool.org']);
        $user = User::factory()->create();
        $markdown = app(\Illuminate\Mail\Markdown::class);

        foreach ([
            (new ResetPassword('token'))->toMail($user),
            (new EoaNotice('fallback', 'review_updated'))->toMail($user),
            (new FounderActivationInvitation('Layla', 'https://wosool.org/activate-founder#token=a', '123456'))->toMail($user),
        ] as $message) {
            $this->assertSame('mail.bilingual', $message->markdown);
            $this->assertStringContainsString(' | ', $message->subject);
            $html = (string) $markdown->render($message->markdown, $message->viewData);
            $this->assertStringContainsString('lang-ar', $html);
            $this->assertStringContainsString('lang-en', $html);
        }
    }
}
