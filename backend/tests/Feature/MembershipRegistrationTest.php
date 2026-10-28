<?php
namespace Tests\Feature;
use App\Mail\RegistrationOtpMail;
use App\Models\{Application, User, FounderProfile};
use App\Services\RegistrationOtp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{DB, Mail};
use Spatie\Permission\Models\Role;
use Tests\TestCase;
class MembershipRegistrationTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp(); Mail::fake();
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.transport' => 'smtp', 'mail.from.address' => 'hello@wosool.org']);
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
        $this->getJson('/api/v1/founders?community=1')->assertOk()->assertJsonFragment(['slug' => $profile->slug])->assertDontSee($user->email);
        $this->actingAs($user->fresh());
        foreach (['dashboard', 'founder-profile', 'companies', 'events/catalog', 'events/rsvps', 'program-applications', 'scorecard', 'matches', 'threads', 'chat/rooms'] as $path) $this->getJson('/api/v1/member/'.$path)->assertOk();
        $this->getJson('/api/v1/admin/applications')->assertForbidden();
        $this->actingAs($admin)->patchJson('/api/v1/admin/applications/'.$application->id, ['status' => 'rejected'])->assertOk();
        $this->assertFalse($profile->fresh()->is_public);
        $this->actingAs($user->fresh())->getJson('/api/v1/member/dashboard')->assertForbidden();
        $this->getJson('/api/v1/founders?community=1')->assertJsonMissing(['slug' => $profile->slug]);
    }
    public function test_email_renders_code_and_embedded_logo(): void
    {
        $html = (new RegistrationOtpMail('123456'))->render();
        $this->assertStringContainsString('123456', $html);
        $this->assertStringContainsString('cid:', $html);
        $this->assertStringContainsString('10', $html);
    }
}
