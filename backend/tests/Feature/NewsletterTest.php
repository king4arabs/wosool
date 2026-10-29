<?php
namespace Tests\Feature;
use App\Mail\NewsletterMail;
use App\Models\{Event, FounderProfile, NewsletterSubscriber, NewsItem, User, UserSetting};
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
        $this->travelTo(now()->setDate(2026, 11, 1)->setTime(6, 0));
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
    public function test_active_members_receive_welcome_and_monthly_public_news_only_once(): void
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
    public function test_monthly_window_uses_riyadh_time_and_prevents_mid_month_backfill(): void
    {
        $this->member('timing@example.com');
        NewsItem::create(['title' => 'October update', 'slug' => 'october', 'excerpt' => 'Update', 'category' => 'Funding', 'is_public' => true, 'status' => 'published', 'published_at' => '2026-10-20 00:00:00']);
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-11-01 05:59:59', 'UTC'));
        $service = app(Newsletter::class); $service->dispatch(true); Mail::assertSentCount(1);
        $this->travel(1)->seconds(); $service->dispatch(true); $service->dispatch(true); Mail::assertSentCount(2);
        $this->assertDatabaseHas('newsletter_deliveries', ['campaign' => 'monthly:2026-11', 'status' => 'sent']);
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-11-15 12:00:00', 'UTC'));
        $this->member('later@example.com'); $service->dispatch(true); Mail::assertSentCount(3);
        Mail::assertNotSent(NewsletterMail::class, fn ($m) => $m->hasTo('later@example.com') && $m->kind === 'digest');
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-12-01 06:00:00', 'UTC'));
        NewsItem::create(['title' => 'November update', 'slug' => 'november', 'excerpt' => 'Update', 'category' => 'Funding', 'is_public' => true, 'status' => 'published', 'published_at' => '2026-11-20 00:00:00']);
        $service->dispatch(true); Mail::assertSentCount(5);
        $this->assertSame(2, DB::table('newsletter_deliveries')->where('campaign','monthly:2026-12')->where('status','sent')->count());
    }
    public function test_monthly_welcome_features_only_visible_active_new_members_and_public_events(): void
    {
        foreach (['visible','private','hidden-setting','unclaimed','suspended'] as $name) {
            $user = $this->member($name.'@example.com');
            $profile = new FounderProfile;
            $profile->forceFill(['user_id' => $user->id, 'slug' => $name, 'display_name' => $name, 'status' => $name === 'suspended' ? 'suspended' : 'active', 'is_public' => $name !== 'private', 'directory_key' => $name === 'unclaimed' ? 'unclaimed-import' : null, 'created_at' => '2026-10-15 12:00:00'])->save();
            if ($name === 'hidden-setting') UserSetting::create(['user_id' => $user->id, ...UserSetting::defaults(), 'privacy' => ['appear_in_directory' => false]]);
        }
        foreach (['public','private'] as $visibility) Event::create(['title' => $visibility.' event', 'slug' => $visibility.'-event', 'type' => 'wosool', 'format' => 'in-person', 'is_public' => true, 'visibility' => $visibility, 'status' => 'upcoming', 'status_flow' => 'published', 'starts_at' => '2026-11-10 10:00:00']);
        app(Newsletter::class)->dispatch(true);
        Mail::assertSent(NewsletterMail::class, function ($mail) {
            if ($mail->kind !== 'digest' || ! $mail->hasTo('visible@example.com')) return false;
            $this->assertSame(['visible'], array_column($mail->members, 'name'));
            $this->assertSame(['public event'], array_column($mail->events, 'title'));
            $html = $mail->render();
            $this->assertStringContainsString('أهلاً بالأعضاء الجدد', $html);
            $this->assertStringNotContainsString('hidden-setting', $html);
            $this->assertStringNotContainsString('visible@example.com', $html);
            return true;
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

    public function test_failed_confirmation_send_rolls_back_and_allows_immediate_retry(): void
    {
        $mailFake = Mail::getFacadeRoot();
        $pending = \Mockery::mock(\Illuminate\Mail\PendingMail::class);
        Mail::shouldReceive('to')->once()->with('retry@example.com')->andReturn($pending);
        $pending->shouldReceive('send')->once()->andThrow(new \RuntimeException('Transport unavailable'));
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'retry@example.com', 'locale' => 'en', 'consent' => true])->assertStatus(503);
        $this->assertDatabaseCount('newsletter_subscribers', 0);
        Mail::swap($mailFake);
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'retry@example.com', 'locale' => 'en', 'consent' => true])->assertStatus(202);
        Mail::assertSentCount(1);
    }

    public function test_muted_member_can_explicitly_resubscribe_after_confirmation(): void
    {
        $user = $this->member('muted-again@example.com');
        $service = app(Newsletter::class); $service->dispatch(false);
        $settings = UserSetting::firstOrCreate(['user_id' => $user->id], UserSetting::defaults());
        $settings->update(['notifications' => ['weekly_digest' => false]]);
        Mail::fake();
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => $user->email, 'locale' => 'en', 'consent' => true])->assertStatus(202);
        $s = NewsletterSubscriber::firstOrFail(); $this->assertSame('pending', $s->status);
        $service->dispatch(true); Mail::assertSentCount(1);
        parse_str(parse_url(Mail::sent(NewsletterMail::class)->first()->actionUrl, PHP_URL_FRAGMENT), $parts);
        $this->postJson('/api/v1/newsletter/confirm', ['id' => $s->id, 'token' => $parts['token']])->assertOk();
        $this->assertTrue($settings->fresh()->notifications['weekly_digest']);
        $this->assertSame('en', $s->fresh()->locale);
        Mail::assertSentCount(1); // Welcome already delivered; resubscribe does not duplicate it.
    }

    public function test_unsubscribed_reader_can_request_a_fresh_confirmation_immediately(): void
    {
        $s = NewsletterSubscriber::create(['email' => 'return@example.com', 'locale' => 'ar', 'status' => 'active', 'explicit_opt_in' => true, 'confirmation_sent_at' => now()]);
        $service = app(Newsletter::class);
        $service->unsubscribe($s->id, $service->unsubscribeToken($s));
        $service->requestSubscription($s->email, 'en');
        $this->assertSame('pending', $s->fresh()->status);
        Mail::assertSent(NewsletterMail::class, fn ($mail) => $mail->kind === 'confirm' && $mail->language === 'en');
        $service->dispatch(false); Mail::assertSentCount(1);
    }

    public function test_delivery_failure_retries_then_sends_only_once(): void
    {
        $s = NewsletterSubscriber::create(['email' => 'failed@example.com', 'locale' => 'ar', 'status' => 'active', 'explicit_opt_in' => true]);
        $mailFake = Mail::getFacadeRoot();
        $pending = \Mockery::mock(\Illuminate\Mail\PendingMail::class);
        Mail::shouldReceive('to')->once()->with($s->email)->andReturn($pending);
        $pending->shouldReceive('send')->once()->andThrow(new \RuntimeException('Temporary failure'));
        $service = app(Newsletter::class);
        $this->assertSame(['sent' => 0, 'failed' => 1], $service->dispatch(false));
        $this->assertDatabaseHas('newsletter_deliveries', ['subscriber_id' => $s->id, 'status' => 'failed', 'attempts' => 1]);
        Mail::swap($mailFake); $service->dispatch(false); $service->dispatch(false);
        Mail::assertSentCount(1);
        $this->assertDatabaseHas('newsletter_deliveries', ['subscriber_id' => $s->id, 'status' => 'sent', 'attempts' => 2]);
    }

    public function test_exhausted_and_ambiguous_deliveries_are_not_resent(): void
    {
        foreach (['failed', 'sending'] as $status) {
            $s = NewsletterSubscriber::create(['email' => $status.'@example.com', 'status' => 'active', 'explicit_opt_in' => true]);
            DB::table('newsletter_deliveries')->insert(['subscriber_id' => $s->id, 'campaign' => 'welcome', 'status' => $status, 'attempts' => $status === 'failed' ? 3 : 1, 'created_at' => now()->subDay(), 'updated_at' => now()->subDay()]);
        }
        $service = app(Newsletter::class); $service->dispatch(false);
        Mail::assertNothingSent();
        $this->assertSame(1, $service->status()['unresolved']);
        $this->assertSame(1, $service->status()['failed']);
    }

    public function test_readiness_check_never_subscribes_members_or_sends_and_dispatch_records_status(): void
    {
        $this->member('check@example.com');
        $this->artisan('wosool:newsletter --check')->assertExitCode(0);
        Mail::assertNothingSent(); $this->assertDatabaseCount('newsletter_subscribers', 0);
        $this->artisan('wosool:newsletter')->assertExitCode(0);
        $status = app(Newsletter::class)->status();
        $this->assertTrue($status['scheduler_recent']);
        $this->assertSame('completed', $status['last_run']['status']);
        $this->assertSame(1, $status['sent_30_days']);
        $this->assertStringNotContainsString('check@example.com', json_encode($status));
        $this->travel(3)->hours();
        $this->assertFalse(app(Newsletter::class)->status()['scheduler_recent']);
        config(['mail.default' => 'log']);
        $this->artisan('wosool:newsletter --check')->assertExitCode(1);
        $this->artisan('wosool:newsletter')->assertExitCode(1);
        $this->assertSame('failed', app(Newsletter::class)->status()['last_run']['status']);
    }

    public function test_invalid_address_missing_consent_and_unsupported_locale_do_not_create_subscriptions(): void
    {
        foreach ([['email' => 'invalid', 'locale' => 'en', 'consent' => true], ['email' => 'valid@example.com', 'locale' => 'en'], ['email' => 'valid@example.com', 'locale' => 'fr', 'consent' => true]] as $data) {
            $this->postJson('/api/v1/newsletter/subscribe', $data)->assertUnprocessable();
        }
        Mail::assertNothingSent(); $this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_one_click_unsubscribe_requires_signed_post_and_does_not_need_a_login(): void
    {
        config(['app.url' => 'https://api.wosool.org']);
        $this->member('oneclick@example.com'); $service = app(Newsletter::class); $service->dispatch(false);
        $mail = Mail::sent(NewsletterMail::class)->first();
        $headers = $mail->headers()->text;
        $this->assertSame('List-Unsubscribe=One-Click', $headers['List-Unsubscribe-Post']);
        $this->assertSame('<'.$mail->oneClickUrl.'>', $headers['List-Unsubscribe']);
        $path = parse_url($mail->oneClickUrl, PHP_URL_PATH);
        $this->getJson($path)->assertStatus(405);
        $this->postJson($path, [])->assertUnprocessable();
        $s = NewsletterSubscriber::firstOrFail();
        $this->assertSame('active', $s->fresh()->status);
        $this->post('/api/v1/newsletter/one-click/'.$s->id.'/'.str_repeat('0', 64), ['List-Unsubscribe' => 'One-Click'])->assertStatus(422);
        $this->post($path, ['List-Unsubscribe' => 'One-Click'])->assertNoContent();
        $this->post($path, ['List-Unsubscribe' => 'One-Click'])->assertNoContent();
        $service->dispatch(false); Mail::assertSentCount(1);
        $this->assertSame('unsubscribed', $s->fresh()->status);
        $this->assertSame([], (new NewsletterMail('confirm', 'en', 'https://wosool.org', ''))->headers()->text);
    }

    public function test_bilingual_templates_escape_content_and_include_reading_and_subscription_links(): void
    {
        foreach (['ar', 'en'] as $locale) foreach (['confirm', 'welcome', 'digest'] as $kind) {
            $mail = new NewsletterMail($kind, $locale, 'https://wosool.org/founders', 'https://wosool.org/newsletter?unsubscribe=1#token='.str_repeat('a', 64),
                [['title' => '<script>Example update</script>', 'excerpt' => 'A concise community update for founders.', 'date' => '2026-10-29', 'url' => 'https://wosool.org/news/example']],
                [['name' => 'Example founder', 'company' => 'Example company', 'url' => 'https://wosool.org/founders/example']],
                [['title' => 'Founder meetup', 'date' => '2026-11-10', 'url' => 'https://wosool.org/events/example']], 'October 2026');
            $html = $mail->render();
            $this->assertStringNotContainsString('<script>', $html);
            $this->assertStringContainsString('dir="'.($locale === 'ar' ? 'rtl' : 'ltr').'"', $html);
            $this->assertStringContainsString('Example company', $html);
            if ($kind !== 'confirm') $this->assertStringContainsString('https://wosool.org/newsletter?unsubscribe=1', $html);
            if ($directory = getenv('NEWSLETTER_PREVIEW_DIR')) {
                if (!is_dir($directory)) mkdir($directory, 0755, true);
                file_put_contents($directory.'/newsletter-'.$kind.'-'.$locale.'.html', $html);
            }
        }
    }
}
