<?php
namespace Tests\Feature;
use App\Mail\RegistrationOtpMail;
use App\Models\{Application, User, FounderProfile};
use App\Services\RegistrationOtp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{DB, Mail, Schema};
use Spatie\Permission\Models\Role;
use Tests\TestCase;
class MembershipRegistrationTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp(); Mail::fake();
        config(['sanctum.stateful' => ['localhost'], 'mail.default' => 'smtp', 'mail.mailers.smtp.transport' => 'smtp', 'mail.from.address' => 'hello@wosool.org']);
        $this->withHeaders(['Origin' => 'http://localhost']);
    }
    private function applicant(): User { return User::factory()->unverified()->create(['community_registration_started_at' => now()]); }
    private function code(User $user): string { app(RegistrationOtp::class)->send($user); return Mail::sent(RegistrationOtpMail::class)->last()->code; }
    private function profile(): array
    {
        return ['full_name' => 'Test Founder', 'phone' => '+966500000000', 'company_name' => 'Test Company',
            'company_website' => 'https://example.com', 'sector' => 'Software', 'stage' => 'Seed', 'location' => 'Riyadh',
            'motivation' => 'Meet founders', 'what_you_offer' => 'Product advice', 'what_you_need' => 'Growth support',
            'country_code' => 'SA', 'position' => 'Founder', 'bio' => 'Founder building useful software for businesses.',
            'company_description' => 'Software that helps growing businesses collaborate.', 'founded_year' => 2024,
            'team_size' => 5, 'public_profile_consent' => true];
    }
    #[\PHPUnit\Framework\Attributes\TestWith(['/api/v1'])]
    #[\PHPUnit\Framework\Attributes\TestWith(['/v1'])]
    public function test_registration_login_activation_and_session_resume_on_both_mounts(string $prefix): void
    {
        $credentials = ['email' => 'new-founder@example.com', 'password' => 'Password123'];
        $this->postJson($prefix.'/auth/register', $credentials + ['name' => 'New Founder',
            'password_confirmation' => 'Password123', 'consent' => true])
            ->assertCreated()->assertJsonPath('user.registration_step', 'verify');
        $this->assertFalse(Mail::sent(RegistrationOtpMail::class)->last()->emailChange);
        $code = Mail::sent(RegistrationOtpMail::class)->last()->code;
        $this->getJson($prefix.'/auth/me')->assertOk()->assertJsonPath('user.registration_step', 'verify');
        $this->postJson($prefix.'/auth/logout')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->postJson($prefix.'/auth/login', array_replace($credentials, ['email' => ' NEW-FOUNDER@example.com ']))
            ->assertOk()->assertJsonPath('user.registration_step', 'verify');
        $this->postJson($prefix.'/auth/registration/verify', ['code' => $code])->assertOk()
            ->assertJsonPath('user.registration_step', 'profile');
        $this->app['auth']->forgetGuards();
        $this->postJson($prefix.'/registration/application', $this->profile())->assertCreated()
            ->assertJsonPath('step', 'review');
        $this->postJson($prefix.'/auth/logout')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->postJson($prefix.'/auth/login', $credentials)->assertOk()->assertJsonPath('user.registration_step', 'review');
        $this->getJson($prefix.'/registration/application')->assertOk()->assertJsonPath('step', 'review');
        $this->getJson($prefix.'/member/dashboard')->assertForbidden();
    }

    public function test_legacy_account_can_resume_verification_after_password_login_without_granting_access(): void
    {
        $user = User::factory()->unverified()->create(['email' => 'legacy@example.com', 'password' => 'Password123']);
        $this->postJson('/api/v1/auth/login', ['email' => 'legacy@example.com', 'password' => 'wrong'])->assertUnprocessable();
        $this->assertNull($user->fresh()->community_registration_started_at);
        $this->postJson('/api/v1/auth/login', ['email' => ' LEGACY@example.com ', 'password' => 'Password123'])
            ->assertOk()->assertJsonPath('user.registration_step', 'verify');
        $this->assertNull($user->fresh()->privacy_accepted_at);
        $this->postJson('/api/v1/auth/registration/resend')->assertOk();
        $code = Mail::sent(RegistrationOtpMail::class)->last()->code;
        $this->postJson('/api/v1/auth/registration/verify', ['code' => $code])->assertOk()
            ->assertJsonPath('user.registration_step', 'profile');
        $this->getJson('/api/v1/member/dashboard')->assertForbidden();
    }

    public function test_legacy_recovery_preserves_accelerator_and_existing_member_journeys(): void
    {
        $accelerator = User::factory()->create(['is_accelerator_applicant' => true]);
        $member = User::factory()->create(); $member->assignRole(Role::findOrCreate('member', 'web'));
        foreach ([$accelerator, $member] as $user) {
            app(\App\Services\MembershipRegistration::class)->resumeLegacyRegistration($user);
            $this->assertNull($user->fresh()->community_registration_started_at);
        }
    }

    public function test_legacy_founder_token_can_verify_email_and_resume_without_an_extra_application(): void
    {
        if (! Schema::hasColumn('users', 'role_token')) {
            Schema::table('users', fn ($table) => $table->string('role_token')->nullable());
        }
        $user = User::factory()->unverified()->create(['email' => 'legacy-token@example.com', 'password' => 'Password123', 'role_token' => 'founder']);
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'Password123'])->assertOk()->assertJsonPath('user.registration_step', 'verify');
        $this->assertNull($user->fresh()->community_registration_started_at);
        $this->getJson('/api/v1/member/dashboard')->assertForbidden();
        $code = $this->code($user);
        $this->postJson('/api/v1/auth/registration/verify', ['code' => $code])->assertOk();
        $this->actingAs($user->fresh())->getJson('/api/v1/registration/application')->assertOk()->assertJsonPath('step', 'active');
        $this->getJson('/api/v1/member/dashboard')->assertOk();
        $profile = FounderProfile::create(['user_id' => $user->id, 'slug' => 'inactive-legacy-token', 'status' => 'pending']);
        $this->actingAs($user->fresh())->getJson('/api/v1/registration/application')->assertOk()->assertJsonPath('step', null);
        $profile->update(['status' => 'suspended']);
        $this->actingAs($user->fresh())->getJson('/api/v1/registration/application')->assertOk()->assertJsonPath('step', null);
    }

    public function test_verification_is_required_and_code_is_single_use(): void
    {
        $user = $this->applicant(); $code = $this->code($user);
        $this->assertNotSame($code, DB::table('registration_email_otps')->value('code_hash'));
        $this->actingAs($user)->postJson('/api/v1/registration/application', $this->profile())->assertForbidden();
        $this->getJson('/api/v1/member/dashboard')->assertForbidden();
        $this->postJson('/api/v1/auth/registration/verify', ['code' => $code])->assertOk()->assertJsonPath('user.registration_step', 'profile');
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertNull(DB::table('registration_email_otps')->value('code_hash'));
        $this->actingAs($user->fresh())->postJson('/api/v1/auth/registration/verify', ['code' => $code])->assertStatus(409);
        $this->getJson('/api/v1/member/dashboard')->assertForbidden();
    }
    public function test_wrong_attempts_persist_and_resend_resets_challenge(): void
    {
        $user = $this->applicant(); $code = $this->code($user);
        $this->actingAs($user)->postJson('/api/v1/auth/registration/resend')->assertStatus(429);
        $wrong = $code === '000000' ? '111111' : '000000';
        for ($i = 0; $i < 5; $i++) $this->postJson('/api/v1/auth/registration/verify', ['code' => $wrong])->assertUnprocessable();
        $this->assertSame(5, DB::table('registration_email_otps')->value('attempts'));
        $this->postJson('/api/v1/auth/registration/verify', ['code' => $code])->assertUnprocessable();
        $this->travel(61)->seconds();
        $this->postJson('/api/v1/auth/registration/resend')->assertOk();
        $this->assertSame(0, DB::table('registration_email_otps')->value('attempts'));
        $newCode = Mail::sent(RegistrationOtpMail::class)->last()->code;
        $this->postJson('/api/v1/auth/registration/verify', ['code' => $newCode])->assertOk();
    }
    public function test_expired_code_and_non_delivering_mailer_are_rejected(): void
    {
        $user = $this->applicant(); $code = $this->code($user); $this->travel(11)->minutes();
        $this->actingAs($user)->postJson('/api/v1/auth/registration/verify', ['code' => $code])->assertUnprocessable();
        config(['mail.default' => 'log']);
        $this->postJson('/api/v1/auth/registration/resend')->assertStatus(503);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }
    public function test_approval_publishes_founder_and_unlocks_services_and_rejection_revokes_access(): void
    {
        $user = $this->applicant(); $user->markEmailAsVerified();
        $this->actingAs($user->fresh())->postJson('/api/v1/registration/application', $this->profile() + ['email' => 'forged@example.com'])->assertCreated()->assertJsonPath('step', 'review');
        $application = Application::firstOrFail(); $this->assertSame($user->email, $application->email);
        $this->assertDatabaseCount('founder_profiles', 0);
        $this->getJson('/api/v1/member/dashboard')->assertForbidden();
        $this->postJson('/api/v1/registration/application', $this->profile())->assertStatus(409);
        $this->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertForbidden();
        $admin = User::factory()->create(); $admin->assignRole(Role::findOrCreate('admin', 'web'));
        $this->actingAs($admin)->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertOk();
        $this->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertOk();
        $this->assertDatabaseCount('founder_profiles', 1); $this->assertDatabaseCount('company_profiles', 1); $this->assertDatabaseCount('scorecards', 1);
        $this->assertTrue($user->fresh()->hasRole('member')); $profile = FounderProfile::firstOrFail();
        $this->assertTrue($profile->is_public); $this->assertTrue($profile->communityActive());
        $uid = $profile->founder_uid;
        $this->assertTrue(\Illuminate\Support\Str::isUuid($uid));
        $this->getJson('/api/v1/founders?community=1')->assertOk()->assertJsonFragment(['slug' => $profile->slug])->assertDontSee($user->email);
        $this->actingAs($user->fresh());
        foreach (['dashboard', 'founder-profile', 'companies', 'events/catalog', 'events/rsvps', 'program-applications', 'scorecard', 'matches', 'threads', 'chat/rooms'] as $path) $this->getJson('/api/v1/member/'.$path)->assertOk();
        $this->getJson('/api/v1/member/scorecard')->assertJsonPath('data.founder_uid', $uid);
        $this->getJson('/api/v1/member/founder-profile')->assertJsonPath('data.founder_uid', $uid);
        $this->getJson('/api/v1/admin/applications')->assertForbidden();
        $this->actingAs($admin)->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'rejected'])->assertOk();
        $this->assertFalse($profile->fresh()->is_public);
        $this->actingAs($user->fresh())->getJson('/api/v1/member/dashboard')->assertForbidden();
        $this->getJson('/api/v1/founders?community=1')->assertJsonMissing(['slug' => $profile->slug]);
    }
    #[\PHPUnit\Framework\Attributes\TestWith(['Founder'])]
    #[\PHPUnit\Framework\Attributes\TestWith(['Co-founder'])]
    #[\PHPUnit\Framework\Attributes\TestWith(['مؤسس'])]
    #[\PHPUnit\Framework\Attributes\TestWith(['شريك مؤسس'])]
    public function test_approved_founder_roles_appear_in_both_public_directory_views(string $position): void
    {
        $user = $this->applicant(); $user->markEmailAsVerified();
        $data = array_replace($this->profile(), ['position' => $position]);
        $this->actingAs($user->fresh())->postJson('/api/v1/registration/application', $data)->assertCreated();
        $application = Application::firstOrFail();
        $this->getJson('/api/v1/founders')->assertJsonCount(0, 'data');
        $admin = User::factory()->create(); $admin->assignRole(Role::findOrCreate('admin', 'web'));
        $this->actingAs($admin)->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertOk();
        $profile = FounderProfile::firstOrFail();
        $this->assertDatabaseHas('scorecards', ['founder_profile_id' => $profile->id]);
        foreach (['ar', 'en'] as $locale) {
            // The carousel and grid share this public collection. No featured flag or score is required.
            $this->withHeader('X-Locale', $locale)->getJson('/api/v1/founders?search=Test&per_page=24')->assertOk()
                ->assertJsonPath('data.0.slug', $profile->slug)->assertJsonPath('data.0.position', $position)
                ->assertJsonPath('data.0.activation_status', 'active')->assertJsonPath('data.0.scorecard', null)
                ->assertDontSee($user->email)->assertDontSee($data['phone']);
        }
        $this->getJson('/api/v1/founders?community=1')->assertOk()->assertJsonFragment(['slug' => $profile->slug]);
        $this->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertOk();
        $this->assertDatabaseCount('founder_profiles', 1);
        $this->assertDatabaseCount('scorecards', 1);
    }
    public function test_failed_delivery_does_not_create_an_account(): void
    {
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('Transport unavailable'));
        $this->postJson('/api/v1/auth/register', ['name' => 'New Founder', 'email' => 'new@example.com',
            'password' => 'Password123', 'password_confirmation' => 'Password123', 'consent' => true])->assertStatus(503);
        $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);
        $this->assertDatabaseCount('registration_email_otps', 0);
    }
    public function test_approval_requires_completed_verified_application(): void
    {
        $user = $this->applicant();
        $application = Application::create(['user_id' => $user->id, 'full_name' => $user->name, 'email' => $user->email, 'status' => 'submitted']);
        $admin = User::factory()->create(); $admin->assignRole(Role::findOrCreate('admin', 'web'));
        $this->actingAs($admin)->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertStatus(409);
        $user->markEmailAsVerified();
        $this->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'approved'])->assertStatus(409);
        $this->assertDatabaseCount('founder_profiles', 0);
    }
    public function test_uploaded_assets_are_bound_to_the_verified_applicant(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        $user = $this->applicant(); $user->markEmailAsVerified();
        $image = \Illuminate\Http\UploadedFile::fake()->createWithContent('logo.png', file_get_contents(resource_path('mail/wosool-logo.png')));
        $response = $this->actingAs($user->fresh())->postJson('/api/v1/registration/image', ['kind' => 'logo', 'image' => $image])->assertOk();
        $url = $response->json('url');
        $this->assertStringStartsWith('/storage/registration/'.$user->id.'/', $url);
        $this->postJson('/api/v1/registration/application', $this->profile() + ['logo_url' => 'https://example.com/forged.png'])->assertCreated();
        $this->assertSame($url, Application::firstOrFail()->onboarding_data['logo_url']);
    }
    public function test_verification_email_uses_the_shared_bilingual_layout(): void
    {
        $mail = new RegistrationOtpMail('123456');
        $html = $mail->render();
        $this->assertSame(\App\Mail\BilingualEmail::VIEW, $mail->content()->markdown, 'The code email shares the layout of every other transactional email.');
        $this->assertStringContainsString('123456', $html);
        $this->assertStringContainsString('lang="ar" dir="rtl"', $html);
        $this->assertStringContainsString('lang="en" dir="ltr"', $html);
        $this->assertStringContainsString('رمز التحقق', $html);
        $this->assertStringContainsString('Verification code', $html);
        $this->assertStringNotContainsString('Activation code', $html, 'A sign-up code is not an activation code.');
        $this->assertStringContainsString('continue your Wosool registration', $html);
        $this->assertStringContainsString('expires in '.RegistrationOtpMail::EXPIRES_MINUTES.' minutes', $html);
        $this->assertStringContainsString('صالح لمدة '.RegistrationOtpMail::EXPIRES_MINUTES.' دقائق', $html);
        $this->assertSame('رمز التحقق من بريدك | Wosool verification code', $mail->envelope()->subject);
        $this->assertContains('registration-otp', $mail->envelope()->tags);
        $this->assertSame('info@wosool.org', $mail->envelope()->replyTo[0]->address);
        preg_match_all('/<p class="code"[^>]*style="([^"]*)"/', $html, $codes);
        $this->assertCount(2, $codes[1]);
        foreach ($codes[1] as $style) {
            $this->assertMatchesRegularExpression('/font-size: 26px;(?!.*font-size)/', $style, 'The Arabic code box keeps the large monospace code instead of body text size.');
            $this->assertStringContainsString('monospace', $style);
        }
    }

    public function test_other_codes_keep_the_activation_label(): void
    {
        $html = (new \App\Mail\WosoolMail('founder-activation', 'تفعيل', 'Activate', \App\Mail\BilingualEmail::data(
            ar: ['title' => 'تفعيل'], en: ['title' => 'Activate'], code: '777111',
        )))->render();
        $this->assertStringContainsString('رمز التفعيل', $html);
        $this->assertStringContainsString('Activation code', $html);
    }

    public function test_stored_code_expires_when_the_email_says_it_does(): void
    {
        $user = $this->applicant();
        $this->travelTo(now()->startOfMinute());
        app(RegistrationOtp::class)->send($user);
        $expires = DB::table('registration_email_otps')->where('user_id', $user->id)->value('expires_at');
        $this->assertSame(now()->addMinutes(RegistrationOtpMail::EXPIRES_MINUTES)->toDateTimeString(), now()->parse($expires)->toDateTimeString());
    }

    public function test_email_change_code_is_not_worded_as_a_registration(): void
    {
        $mail = new RegistrationOtpMail('654321', emailChange: true);
        $html = $mail->render();
        $this->assertStringContainsString('654321', $html);
        $this->assertStringContainsString('confirm the new address', $html);
        $this->assertStringContainsString('أكّد بريدك الجديد', $html);
        $this->assertStringNotContainsString('registration', $html);
        $this->assertStringNotContainsString('If you did not register', $html);
        $this->assertStringNotContainsString('التسجيل', $html);
        $this->assertSame('أكّد بريدك الجديد في وصول | Confirm your new Wosool email', $mail->envelope()->subject);
        $this->assertContains('email-change-otp', $mail->envelope()->tags);
    }
}
