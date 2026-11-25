<?php

namespace Tests\Feature;

use App\Jobs\SendWowRegistrationMail;
use App\Mail\{RegistrationOtpMail, WosoolMail};
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{DB, Mail, Queue};
use Tests\TestCase;

class WowDirectRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-11-25T09:00:00+03:00'));
        config(['sanctum.stateful' => ['localhost']]);
        $this->withHeaders(['Origin' => 'http://localhost']);
    }

    private function details(): array
    {
        return ['phone' => '+966500000001', 'company' => 'Example', 'eo_interest' => true, 'eoa_interest' => false, 'consent' => true];
    }

    private function signup(): array
    {
        return $this->details() + ['name' => 'Event Guest', 'email' => 'wow-guest@example.test', 'password' => 'ExamplePass123', 'password_confirmation' => 'ExamplePass123', 'account_consent' => true];
    }

    #[\PHPUnit\Framework\Attributes\TestWith(['/api/v1'])]
    #[\PHPUnit\Framework\Attributes\TestWith(['/v1'])]
    public function test_new_account_gets_ticket_link_without_smtp_or_otp_verification(string $prefix): void
    {
        Queue::fake();
        Mail::fake();
        config(['mail.default' => 'log']);
        $this->postJson($prefix.'/auth/wow-register', $this->signup() + ['is_admin' => true, 'email_verified_at' => now()->toIso8601String()])
            ->assertCreated()->assertJsonPath('ticket_url', 'https://luma.com/8fccrqkx');
        $user = User::whereEmail('wow-guest@example.test')->firstOrFail();
        $this->assertFalse($user->hasVerifiedEmail());
        $this->assertFalse($user->hasRole('admin'));
        $this->assertAuthenticatedAs($user, 'web');
        $this->assertDatabaseHas('wow_event_registrations', ['user_id' => $user->id, 'ticket_email_sent_at' => null]);
        Queue::assertPushed(SendWowRegistrationMail::class, fn ($job) => $job->userId === $user->id && $job->kind === 'otp');
        Queue::assertPushed(SendWowRegistrationMail::class, fn ($job) => $job->userId === $user->id && $job->kind === 'ticket');
        Mail::assertNothingSent();
    }

    public function test_invalid_event_data_does_not_create_an_account(): void
    {
        Queue::fake();
        $this->postJson('/api/v1/auth/wow-register', array_replace($this->signup(), ['phone' => '', 'account_consent' => false]))
            ->assertUnprocessable()
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonValidationErrors('account_consent');
        $this->assertDatabaseMissing('users', ['email' => 'wow-guest@example.test']);
        $this->assertDatabaseCount('wow_event_registrations', 0);
        Queue::assertNothingPushed();
    }

    public function test_existing_unverified_account_can_get_link_without_duplicate_registration(): void
    {
        Queue::fake();
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);
        foreach ([1, 2] as $attempt) {
            $this->postJson('/api/v1/wow-registration', $this->details())
                ->assertOk()->assertJsonPath('ticket_url', 'https://luma.com/8fccrqkx');
        }
        $this->assertDatabaseCount('wow_event_registrations', 1);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_queued_mail_jobs_send_once_and_do_not_activate_membership(): void
    {
        Queue::fake();
        Mail::fake();
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.transport' => 'smtp', 'mail.from.address' => 'info@wosool.org']);
        $this->postJson('/api/v1/auth/wow-register', $this->signup())->assertCreated();
        $user = User::whereEmail('wow-guest@example.test')->firstOrFail();
        foreach (['otp', 'ticket'] as $kind) {
            $job = new SendWowRegistrationMail($user->id, $kind);
            $job->handle();
            $job->handle();
        }
        Mail::assertSent(RegistrationOtpMail::class, 1);
        Mail::assertSent(WosoolMail::class, fn ($mail) => $mail->kind === 'wow-rsvp' && $mail->hasTo($user->email));
        $this->assertNotNull(DB::table('wow_event_registrations')->where('user_id', $user->id)->value('ticket_email_sent_at'));
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }
}
