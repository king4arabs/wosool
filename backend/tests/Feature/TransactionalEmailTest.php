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
        config(['mail.team_address' => 'team@wosool.org']);

        $this->postJson('/api/v1/contact', $this->contact())->assertCreated();

        Mail::assertSent(WosoolMail::class, fn (WosoolMail $mail) => $mail->kind === 'contact-received' && $mail->hasTo('layla@example.com'));
        Mail::assertSent(WosoolMail::class, fn (WosoolMail $mail) => $mail->kind === 'team-alert'
            && $mail->hasTo('team@wosool.org') && $mail->hasReplyTo('layla@example.com'));
        $this->assertDatabaseHas('contact_messages', ['email' => 'layla@example.com', 'category' => 'sponsorship']);
    }

    public function test_mail_outage_does_not_fail_a_saved_submission(): void
    {
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
