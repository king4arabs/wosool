<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AccountLoginSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function key(string $email): string
    {
        return 'login-account:'.hash_hmac('sha256', $email, (string) config('app.key'));
    }

    public function test_account_limit_is_shared_across_ips_and_mounts(): void
    {
        $email = 'login-limit@example.com';
        User::factory()->create(['email' => $email, 'password' => 'Password123']);
        $key = $this->key($email);
        RateLimiter::clear($key);
        try {
            for ($i = 1; $i <= 10; $i++) {
                $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.$i])
                    ->postJson('/api/v1/auth/login', ['email' => strtoupper($email), 'password' => 'incorrect'])
                    ->assertUnprocessable();
            }
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.20'])
                ->postJson('/v1/auth/login', ['email' => $email, 'password' => 'Password123'])
                ->assertStatus(429)->assertHeader('Retry-After');
            $this->assertGuest('web');
        } finally {
            RateLimiter::clear($key);
        }
    }

    public function test_successful_login_clears_failed_attempts(): void
    {
        $email = 'login-success@example.com';
        User::factory()->create(['email' => $email, 'password' => 'Password123']);
        $key = $this->key($email);
        RateLimiter::clear($key);
        try {
            $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => 'incorrect'])->assertUnprocessable();
            $this->assertSame(1, RateLimiter::attempts($key));
            $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => 'Password123'])->assertOk();
            $this->assertSame(0, RateLimiter::attempts($key));
        } finally {
            RateLimiter::clear($key);
        }
    }

    public function test_unknown_email_is_also_counted_and_oversized_credentials_are_rejected(): void
    {
        $email = 'unknown-login@example.com';
        $key = $this->key($email);
        RateLimiter::clear($key);
        try {
            $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => 'incorrect'])->assertUnprocessable();
            $this->assertSame(1, RateLimiter::attempts($key));
            $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => str_repeat('a', 1025)])
                ->assertUnprocessable()->assertJsonValidationErrors('password');
            $this->assertSame(1, RateLimiter::attempts($key));
        } finally {
            RateLimiter::clear($key);
        }
    }
}
