<?php

namespace Tests\Feature;

use App\Mail\RegistrationOtpMail;
use App\Models\User;
use App\Services\RegistrationOtp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Registration, email-code and newsletter responses are shown to visitors as written
 * (onboarding page, newsletter page and signup box). They must follow X-Locale instead of
 * returning one Arabic-and-English sentence to everyone.
 */
class RegistrationMessageLocaleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        config(['sanctum.stateful' => ['localhost'], 'mail.default' => 'smtp', 'mail.mailers.smtp.transport' => 'smtp', 'mail.from.address' => 'hello@wosool.org']);
        $this->withHeaders(['Origin' => 'http://localhost']);
    }

    public function test_message_keys_exist_in_both_languages_and_each_copy_is_single_language(): void
    {
        foreach (['registration', 'newsletter'] as $group) {
            $en = trans("messages.{$group}", [], 'en');
            $ar = trans("messages.{$group}", [], 'ar');
            $this->assertIsArray($en);
            $this->assertSame(array_keys($en), array_keys($ar), "messages.{$group} keys differ between Arabic and English");
            foreach ($en as $key => $text) {
                $this->assertDoesNotMatchRegularExpression('/\p{Arabic}/u', $text, "en messages.{$group}.{$key} contains Arabic");
                $this->assertMatchesRegularExpression('/\p{Arabic}/u', $ar[$key], "ar messages.{$group}.{$key} is not Arabic");
                $this->assertDoesNotMatchRegularExpression('/[A-Za-z]/', $ar[$key], "ar messages.{$group}.{$key} contains English");
            }
        }
    }

    public function test_api_sources_no_longer_hard_code_bilingual_messages(): void
    {
        foreach ([
            'app/Services/RegistrationOtp.php',
            'app/Services/Newsletter.php',
            'app/Http/Controllers/Api/AuthController.php',
            'app/Http/Controllers/Api/NewsletterController.php',
            'app/Http/Controllers/Api/RegistrationController.php',
        ] as $file) {
            $source = file_get_contents(base_path($file));
            $this->assertDoesNotMatchRegularExpression('/[\'"][^\'"\n]*\p{Arabic}[^\'"\n]*[.!؟]\s+[A-Z][a-z][^\'"\n]*[\'"]/u', $source, "{$file} returns an Arabic+English sentence");
            $this->assertDoesNotMatchRegularExpression('/[\'"][A-Z][^\'"\n]*[.!]\s+[^\'"\n]*\p{Arabic}[^\'"\n]*[\'"]/u', $source, "{$file} returns an English+Arabic sentence");
        }
    }

    public function test_registration_success_follows_the_language(): void
    {
        $payload = ['name' => 'Sara', 'password' => 'Password1', 'password_confirmation' => 'Password1', 'consent' => true];

        $this->postJson('/api/v1/auth/register', $payload + ['email' => 'sara@example.com'], ['X-Locale' => 'en'])
            ->assertCreated()->assertJsonPath('message', 'We sent a verification code to your email.');
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/v1/auth/register', $payload + ['email' => 'nora@example.com'], ['X-Locale' => 'ar'])
            ->assertCreated()->assertJsonPath('message', 'أرسلنا رمز التحقق إلى بريدك.');
    }

    public function test_wrong_code_and_resend_wait_follow_the_language(): void
    {
        $user = User::factory()->unverified()->create(['community_registration_started_at' => now()]);
        app(RegistrationOtp::class)->send($user);
        $code = Mail::sent(RegistrationOtpMail::class)->last()->code;
        $wrong = $code === '000000' ? '111111' : '000000';

        $this->actingAs($user)->postJson('/api/v1/auth/registration/verify', ['code' => $wrong], ['X-Locale' => 'ar'])
            ->assertUnprocessable()->assertJsonPath('errors.code.0', 'الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزًا جديدًا وحاول مجددًا.');
        $this->actingAs($user)->postJson('/api/v1/auth/registration/verify', ['code' => $wrong], ['X-Locale' => 'en'])
            ->assertUnprocessable()->assertJsonPath('errors.code.0', 'The code is wrong or has expired. Request a new code and try again.');

        $this->actingAs($user)->postJson('/api/v1/auth/registration/resend', [], ['X-Locale' => 'en'])
            ->assertStatus(429)->assertJsonPath('message', 'Wait one minute before requesting another code.');
        $this->actingAs($user)->postJson('/api/v1/auth/registration/resend', [], ['X-Locale' => 'ar'])
            ->assertStatus(429)->assertJsonPath('message', 'انتظر دقيقة قبل طلب رمز آخر.');

        $this->actingAs($user)->postJson('/api/v1/auth/registration/verify', ['code' => $code], ['X-Locale' => 'en'])
            ->assertOk()->assertJsonPath('message', 'Your email is verified.');
    }

    public function test_invalid_newsletter_links_follow_the_language(): void
    {
        $body = ['id' => 999, 'token' => str_repeat('a', 64)];

        $this->postJson('/api/v1/newsletter/confirm', $body, ['X-Locale' => 'en'])
            ->assertUnprocessable()->assertJsonPath('message', 'This link is invalid or has expired.');
        $this->postJson('/api/v1/newsletter/unsubscribe', $body, ['X-Locale' => 'ar'])
            ->assertUnprocessable()->assertJsonPath('message', 'الرابط غير صالح أو انتهت صلاحيته.');
    }

    public function test_newsletter_subscription_reply_follows_the_language(): void
    {
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'reader@example.com', 'locale' => 'en', 'consent' => true], ['X-Locale' => 'en'])
            ->assertStatus(202)->assertJsonPath('message', 'Check your inbox to confirm your subscription.');
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'qari@example.com', 'locale' => 'ar', 'consent' => true], ['X-Locale' => 'ar'])
            ->assertStatus(202)->assertJsonPath('message', 'تحقق من بريدك لتأكيد الاشتراك.');
    }
}
