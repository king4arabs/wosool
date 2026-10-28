<?php
namespace Tests\Feature;
use App\Mail\NewsletterMail;
use App\Models\{NewsletterSubscriber, NewsItem, User, UserSetting};
use App\Services\{Mailer, Newsletter};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{DB, Mail};
use Spatie\Permission\Models\Role;
use Tests\TestCase;
class NewsletterTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp(); Mail::fake();
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.transport' => 'smtp', 'mail.from.address' => 'info@wosool.org']);
        $this->travelTo(now()->setDate(2026, 10, 28)->setTime(12, 0));
    }
    private function member(string $email): User
    {
        $user = User::factory()->create(['email' => $email]); $user->assignRole(Role::findOrCreate('member', 'web')); return $user;
    }
    public function test_public_subscription_requires_email_confirmation_and_welcomes_once(): void
    {
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => ' Reader@Example.com ', 'locale' => 'ar', 'consent' => true])->assertStatus(202);
        $s = NewsletterSubscriber::firstOrFail(); $mail = Mail::sent(NewsletterMail::class)->first();
        $this->assertSame('reader@example.com', $s->email); $this->assertSame('pending', $s->status);
        parse_str(parse_url($mail->actionUrl, PHP_URL_FRAGMENT), $parts); $token = $parts['token'];
        $this->assertNotSame($token, $s->confirmation_hash);
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => $s->email, 'locale' => 'ar', 'consent' => true])->assertStatus(202);
        Mail::assertSentCount(1);
        app(Newsletter::class)->dispatch(true); Mail::assertSentCount(1);
        $this->postJson('/api/v1/newsletter/confirm', ['id' => $s->id, 'token' => str_repeat('x',64)])->assertUnprocessable();
        $this->postJson('/api/v1/newsletter/confirm', ['id' => $s->id, 'token' => $token])->assertOk();
        $this->assertSame('active', $s->fresh()->status); Mail::assertSentCount(2);
        app(Newsletter::class)->dispatch(false); Mail::assertSentCount(2);
        $this->postJson('/api/v1/newsletter/confirm', ['id' => $s->id, 'token' => $token])->assertUnprocessable();
    }
    public function test_active_members_receive_welcome_and_weekly_public_news_only_once(): void
    {
        $this->member('active@example.com'); $muted = $this->member('muted@example.com');
        UserSetting::create(['user_id' => $muted->id, ...UserSetting::defaults(), 'notifications' => ['weekly_digest' => false]]);
        User::factory()->unverified()->create(['email' => 'unverified@example.com']); User::factory()->create(['email' => 'pending@example.com']);
        foreach ([['public-story',true,'published','2026-10-23'],['private-story',false,'published','2026-10-23'],['draft-story',true,'draft','2026-10-23'],['future-story',true,'published','2026-11-23']] as [$slug,$public,$status,$date]) NewsItem::create(['title' => $slug, 'slug' => $slug, 'excerpt' => 'A brief update.', 'content' => 'Content', 'category' => 'Funding', 'is_public' => $public, 'status' => $status, 'published_at' => $date]);
        $service = app(Newsletter::class); $service->dispatch(true); $service->dispatch(true);
        Mail::assertSentCount(2);
        Mail::assertSent(NewsletterMail::class, fn($m) => $m->hasTo('active@example.com') && $m->kind === 'digest' && count($m->stories) === 1 && $m->stories[0]['title'] === 'public-story');
        $this->assertDatabaseCount('newsletter_subscribers',1);
        $this->assertSame(2, DB::table('newsletter_deliveries')->where('status','sent')->count());
    }
    public function test_unsubscribe_updates_member_preferences_and_is_not_undone_by_sync(): void
    {
        $user = $this->member('member@example.com'); $service = app(Newsletter::class); $service->dispatch(false);
        $s = NewsletterSubscriber::firstOrFail(); $token = $service->unsubscribeToken($s);
        $this->postJson('/api/v1/newsletter/unsubscribe', ['id' => $s->id, 'token' => str_repeat('x',64)])->assertUnprocessable();
        $this->postJson('/api/v1/newsletter/unsubscribe', ['id' => $s->id, 'token' => $token])->assertOk();
        $service->dispatch(true); Mail::assertSentCount(1);
        $this->assertFalse(UserSetting::where('user_id',$user->id)->first()->notifications['weekly_digest']);
        $this->assertSame('unsubscribed', $s->fresh()->status);
    }
    public function test_list_and_member_email_are_deduplicated_and_expired_confirmation_is_rejected(): void
    {
        $this->member('same@example.com');
        NewsletterSubscriber::create(['email' => 'same@example.com', 'locale' => 'en', 'status' => 'active', 'explicit_opt_in' => true, 'confirmed_at' => now()]);
        app(Newsletter::class)->dispatch(false); app(Newsletter::class)->dispatch(false);
        Mail::assertSentCount(1); $this->assertDatabaseCount('newsletter_subscribers',1);
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'expired@example.com', 'locale' => 'en', 'consent' => true])->assertStatus(202);
        $s = NewsletterSubscriber::where('email','expired@example.com')->firstOrFail();
        parse_str(parse_url(Mail::sent(NewsletterMail::class)->last()->actionUrl, PHP_URL_FRAGMENT), $parts);
        $this->travel(49)->hours();
        $this->postJson('/api/v1/newsletter/confirm', ['id' => $s->id, 'token' => $parts['token']])->assertUnprocessable();
        $this->assertSame('pending',$s->fresh()->status);
    }
    public function test_site_correspondence_goes_to_info_with_full_message_and_sender_reply_address(): void
    {
        $body = str_repeat('Message ', 210);
        $this->postJson('/api/v1/contact', ['name' => 'Sender', 'email' => 'sender@example.com', 'category' => 'general', 'subject' => 'Question', 'message' => $body])->assertCreated();
        Mail::assertSent(\App\Mail\WosoolMail::class, function ($mail) use ($body) {
            return $mail->kind === 'team-alert' && $mail->hasTo('info@wosool.org') && $mail->replyToAddress === 'sender@example.com'
                && collect($mail->data['details'])->contains(fn ($row) => $row['value'] === trim($body));
        });
    }
    public function test_log_mailer_does_not_pretend_to_send_and_templates_have_branding(): void
    {
        config(['mail.default' => 'log']);
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'reader@example.com', 'locale' => 'en', 'consent' => true])->assertStatus(503);
        $this->assertDatabaseCount('newsletter_subscribers',0);
        foreach (['ar','en'] as $locale) {
            $html = (new NewsletterMail('welcome',$locale,'https://wosool.org/news','https://wosool.org/newsletter'))->render();
            $this->assertStringContainsString('data:image/png;base64,',$html); $this->assertStringContainsString('info@wosool.org',$html);
        }
        $this->assertSame('info@wosool.org',Mailer::team());
    }
}
