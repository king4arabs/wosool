<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_existing_and_unknown_addresses_receive_the_same_response(): void
    {
        Notification::fake();
        config(['app.frontend_url' => 'https://wosool.org']);
        $user = User::factory()->create();
        $known = $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])->assertOk();
        $unknown = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'unknown@example.com'])->assertOk();
        $this->assertSame($known->json(), $unknown->json());
        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;
            $this->assertStringStartsWith('https://wosool.org/reset-password?', $url);
            $this->assertStringContainsString('token=', $url);
            $this->assertStringContainsString('email='.urlencode($user->email), $url);
            return true;
        });
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_valid_token_updates_password_and_cannot_be_reused(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);
        $payload = ['email' => $user->email, 'token' => $token, 'password' => 'NewPassword123!', 'password_confirmation' => 'NewPassword123!'];
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertOk();
        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->getAuthPassword()));
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertUnprocessable();
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'NewPassword123!'])->assertOk();
    }

    public function test_invalid_and_expired_tokens_leave_password_unchanged(): void
    {
        $user = User::factory()->create();
        $original = $user->getAuthPassword();
        $token = Password::createToken($user);
        DB::table('password_reset_tokens')->update(['created_at' => now()->subHours(2)]);
        foreach (['invalid-token', $token] as $invalid) {
            $this->postJson('/api/v1/auth/reset-password', [
                'email' => $user->email, 'token' => $invalid,
                'password' => 'NewPassword123!', 'password_confirmation' => 'NewPassword123!',
            ])->assertUnprocessable();
        }
        $this->assertSame($original, $user->fresh()->getAuthPassword());
    }

    public function test_password_confirmation_and_strength_are_validated(): void
    {
        $user = User::factory()->create();
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email, 'token' => Password::createToken($user),
            'password' => 'weak', 'password_confirmation' => 'different',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_recovery_requests_are_rate_limited(): void
    {
        Notification::fake();
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/forgot-password', ['email' => 'unknown@example.com'])->assertOk();
        }
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'unknown@example.com'])->assertTooManyRequests();
    }

    public function test_an_unapproved_user_still_cannot_access_member_routes(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/api/v1/member/program-applications')->assertForbidden();
    }
}
