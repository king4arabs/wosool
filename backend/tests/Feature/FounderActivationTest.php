<?php
namespace Tests\Feature;

use App\Models\{CompanyProfile, FounderInvitation, FounderProfile, User};
use App\Notifications\FounderActivationInvitation;
use App\Services\FounderDirectoryImporter;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Hash, Notification};
use Tests\TestCase;

class FounderActivationTest extends TestCase
{
    use RefreshDatabase;
    private User $admin;
    private string $code;
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
        $this->admin = User::factory()->create(); $this->admin->assignRole('admin');
        Notification::fake(); config(['mail.default' => 'smtp', 'app.frontend_url' => 'https://wosool.org']);
    }
    private function profile(): FounderProfile
    {
        return FounderProfile::create(['slug' => 'invited-founder', 'display_name' => 'Invited Founder', 'directory_key' => 'invited-founder', 'status' => 'active', 'is_public' => true]);
    }
    private function invite(FounderProfile $profile, string $email = 'owner@example.com'): string
    {
        $this->actingAs($this->admin)->postJson('/api/v1/admin/founders/'.$profile->id.'/invite', ['email' => $email, 'recipient_evidence' => 'Confirmed directly with the founder.', 'recipient_verified' => true])->assertOk()->assertJsonPath('data.status', 'sent');
        $tokens = [];
        Notification::assertSentOnDemand(FounderActivationInvitation::class, function ($notification) use (&$tokens) {
            parse_str(parse_url($notification->activationUrl, PHP_URL_FRAGMENT), $parts); $tokens[] = $parts['token']; $this->code = $notification->code; return true;
        });
        $this->app['auth']->forgetGuards();
        return end($tokens);
    }
    private function activate(string $token, array $data = [])
    {
        return $this->postJson('/api/v1/founder-activation/activate', array_merge(['token' => $token, 'code' => $this->code, 'password' => 'SecureFounder2026', 'password_confirmation' => 'SecureFounder2026', 'privacy_accepted' => true], $data));
    }
    public function test_import_is_repeatable_preserves_edits_and_never_creates_accounts_or_sends_mail(): void
    {
        $count = User::count(); $first = app(FounderDirectoryImporter::class)->run();
        $this->assertSame(150, $first['founders_created']); $this->assertSame(83, $first['companies_created']); $this->assertSame($count, User::count());
        $profile = FounderProfile::first(); $profile->update(['bio' => 'Owner edited biography']);
        $second = app(FounderDirectoryImporter::class)->run();
        $this->assertSame(0, $second['founders_created']); $this->assertSame(150, $second['preserved']); $this->assertSame('Owner edited biography', $profile->fresh()->bio);
        Notification::assertNothingSent();
        $this->getJson('/api/v1/founders/salman-butt', ['X-Locale' => 'ar'])->assertOk()->assertJsonPath('data.name', 'سلمان بت')->assertJsonPath('data.activation_status', 'unclaimed')->assertJsonPath('data.can_communicate', false)->assertJsonPath('data.companies.0.name', 'سلة');
        $this->getJson('/api/v1/founders?community=1')->assertOk()->assertJsonCount(0, 'data');
    }
    public function test_admin_and_verified_recipient_are_required(): void
    {
        $p = $this->profile(); $u = User::factory()->create(); $u->assignRole('member');
        $this->actingAs($u)->postJson('/api/v1/admin/founders/import')->assertForbidden();
        $this->postJson('/api/v1/admin/founders/'.$p->id.'/invite', [])->assertForbidden();
        $this->patchJson('/api/v1/admin/founders/'.$p->id, ['is_public' => false])->assertForbidden();
        $this->actingAs($this->admin)->postJson('/api/v1/admin/founders/'.$p->id.'/invite', ['email' => 'owner@example.com'])->assertUnprocessable(); Notification::assertNothingSent();
    }
    public function test_activation_verifies_email_enables_community_and_never_exposes_secrets(): void
    {
        $p = $this->profile(); $token = $this->invite($p); $invite = FounderInvitation::first();
        $this->assertSame(hash('sha256', $token), $invite->token_hash); $this->assertNotSame('owner@example.com', $invite->getRawOriginal('email'));
        $this->assertNotSame($this->code, $invite->otp_hash);
        $this->getJson('/api/v1/founders/'.$p->slug)->assertOk()->assertJsonMissing(['email' => 'owner@example.com'])->assertJsonMissingPath('data.invitation');
        $this->postJson('/api/v1/founder-activation/preview', ['token' => $token])->assertOk()->assertJsonPath('data.existing_account', false);
        $this->activate($token)->assertOk(); $user = User::where('email', 'owner@example.com')->firstOrFail();
        $this->assertNotNull($user->email_verified_at); $this->assertTrue($user->hasRole('member')); $this->assertTrue($p->fresh()->communityActive());
        $this->activate($token)->assertUnprocessable();
        $this->actingAs($user)->getJson('/api/v1/member/founder-profile')->assertOk()->assertJsonPath('data.slug', $p->slug);
        $this->getJson('/api/v1/member/scorecard')->assertOk()->assertJsonPath('data.founder_profile_id', $p->id);
        $this->getJson('/api/v1/member/chat/rooms')->assertOk();
    }
    public function test_activation_requires_email_code_and_limits_guesses(): void
    {
        // Exercise the per-invitation OTP lockout itself; the route-level IP throttle is covered separately.
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
        $p = $this->profile(); $token = $this->invite($p);
        $mail = new FounderActivationInvitation('<Founder>', 'https://wosool.org/activate-founder#token='.$token, $this->code);
        $message = $mail->toMail($this->admin);
        $html = (string) app(\Illuminate\Mail\Markdown::class)->render($message->markdown, $message->viewData);
        $this->assertStringContainsString($this->code, $html);
        $this->assertStringContainsString('&lt;Founder&gt;', $html);
        $this->assertStringContainsString('wosool-network-logo.png', $html);
        $this->assertStringContainsString('Founders to Founders', $html);
        $this->activate($token, ['code' => '123'])->assertUnprocessable();
        $wrong = $this->code === '000000' ? '999999' : '000000';
        for ($i = 0; $i < 5; $i++) {
            $this->activate($token, ['code' => $wrong])->assertUnprocessable();
        }
        $this->assertSame(5, FounderInvitation::first()->otp_attempts);
        $this->activate($token)->assertUnprocessable();
        $this->assertNull($p->fresh()->user_id);
    }
    public function test_invalid_expired_revoked_and_suspended_invitations_fail(): void
    {
        $p = $this->profile(); $token = $this->invite($p); $this->activate(str_repeat('x', 64))->assertUnprocessable();
        FounderInvitation::query()->update(['expires_at' => now()->subSecond()]); $this->activate($token)->assertUnprocessable();
        FounderInvitation::query()->update(['expires_at' => now()->addDay(), 'status' => 'revoked']); $this->activate($token)->assertUnprocessable();
        FounderInvitation::query()->update(['status' => 'sent']); $p->update(['status' => 'suspended']); $this->activate($token)->assertConflict(); $this->assertNull($p->fresh()->user_id);
    }
    public function test_existing_account_requires_its_password_without_resetting_it(): void
    {
        $u = User::factory()->create(['email' => 'owner@example.com', 'password' => 'OriginalPassword2026']); $p = $this->profile(); $token = $this->invite($p);
        $this->activate($token)->assertUnprocessable(); $this->assertNull($p->fresh()->user_id);
        $this->activate($token, ['password' => 'OriginalPassword2026'])->assertOk(); $this->assertSame($u->id, $p->fresh()->user_id);
        $this->assertTrue(Hash::check('OriginalPassword2026', $u->fresh()->getAuthPassword()));
    }
    public function test_password_strength_and_consent_are_required_without_consuming_link(): void
    {
        $p = $this->profile(); $t = $this->invite($p);
        $this->activate($t, ['password' => 'weak', 'password_confirmation' => 'weak'])->assertUnprocessable(); $this->activate($t, ['privacy_accepted' => false])->assertUnprocessable();
        $this->assertSame('sent', FounderInvitation::first()->status); $this->assertNull($p->fresh()->user_id);
    }
    public function test_mail_failures_are_reported_and_log_mailer_is_rejected(): void
    {
        $p = $this->profile(); config(['mail.default' => 'log']);
        $payload = ['email' => 'owner@example.com', 'recipient_evidence' => 'Direct confirmation.', 'recipient_verified' => true];
        $this->actingAs($this->admin)->postJson('/api/v1/admin/founders/'.$p->id.'/invite', $payload)->assertStatus(503); $this->assertSame(0, FounderInvitation::count());
        config(['mail.default' => 'smtp']); Notification::shouldReceive('send')->once()->andThrow(new \RuntimeException('Transport unavailable'));
        $this->postJson('/api/v1/admin/founders/'.$p->id.'/invite', $payload)->assertStatus(503); $this->assertSame('failed', FounderInvitation::first()->status);
    }
    public function test_resend_invalidates_previous_and_admin_can_revoke_latest(): void
    {
        $p = $this->profile(); $old = $this->invite($p); $this->travel(2)->minutes(); $new = $this->invite($p);
        $this->activate($old)->assertUnprocessable();
        $this->actingAs($this->admin)->deleteJson('/api/v1/admin/founders/'.$p->id.'/invitation')->assertOk(); $this->app['auth']->forgetGuards(); $this->activate($new)->assertUnprocessable();
    }
    public function test_connections_are_private_idempotent_and_require_activation(): void
    {
        $a = User::factory()->create(); $a->assignRole('member'); $b = User::factory()->create(); $b->assignRole('member'); $p = $this->profile();
        $this->actingAs($a)->postJson('/api/v1/member/founders/'.$p->id.'/connect')->assertConflict(); $p->update(['user_id' => $b->id, 'claimed_at' => now()]);
        $room = $this->postJson('/api/v1/member/founders/'.$p->id.'/connect')->assertOk()->json('data.room_id'); $this->postJson('/api/v1/member/founders/'.$p->id.'/connect')->assertJsonPath('data.room_id', $room);
        $this->postJson('/api/v1/member/chat/rooms/'.$room.'/messages', ['body' => 'Hello founder'])->assertCreated();
        $this->actingAs($b)->getJson('/api/v1/member/chat/rooms/'.$room)->assertOk();
        $outsider = User::factory()->create(); $outsider->assignRole('member'); $this->actingAs($outsider)->getJson('/api/v1/member/chat/rooms/'.$room)->assertNotFound();
        $p->update(['status' => 'suspended']); $this->actingAs($b)->getJson('/api/v1/member/chat/rooms')->assertForbidden();
    }
    public function test_profile_edits_preserve_arrays_supersede_translations_and_hide_public_page(): void
    {
        app(FounderDirectoryImporter::class)->run(); $p = FounderProfile::where('directory_key', 'salla')->firstOrFail(); $u = User::factory()->create(); $u->assignRole('member');
        $p->update(['user_id' => $u->id, 'claimed_at' => now(), 'needs' => ['Mentors'], 'skills' => ['Commerce']]);
        $this->actingAs($u)->getJson('/api/v1/member/founder-profile')->assertOk()->assertJsonPath('data.needs', ['Mentors'])->assertJsonPath('data.skills', ['Commerce']);
        $this->putJson('/api/v1/member/founder-profile', ['bio' => 'My updated biography', 'is_public' => false, 'display_name' => 'Founder Name', 'position' => 'Founder', 'avatar_url' => '/startup-directory/unifonic-portrait.png'])->assertOk(); $this->assertNull($p->fresh()->translations);
        $this->getJson('/api/v1/founders/'.$p->slug)->assertNotFound(); $this->putJson('/api/v1/member/founder-profile', ['website_url' => 'javascript:alert(1)'])->assertUnprocessable();
    }
    public function test_unlinking_company_does_not_delete_cofounder_record(): void
    {
        app(FounderDirectoryImporter::class)->run(); $f = FounderProfile::where('directory_key', 'salla')->firstOrFail(); $u = User::factory()->create(); $u->assignRole('member'); $f->update(['user_id' => $u->id, 'claimed_at' => now()]); $c = $f->companies()->first();
        $this->actingAs($u)->deleteJson('/api/v1/member/companies/'.$c->id)->assertOk(); $this->assertNotNull(CompanyProfile::find($c->id)); $this->assertSame(1, $c->founders()->count());
    }
}
