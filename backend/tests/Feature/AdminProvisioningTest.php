<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminProvisioningTest extends TestCase
{
    use RefreshDatabase;

    public function test_inspection_does_not_grant_and_missing_accounts_are_not_created(): void
    {
        $user = User::factory()->create();
        $this->artisan('wosool:admin', ['email' => $user->email])->assertSuccessful();
        $this->assertFalse($user->fresh()->hasRole('admin'));
        $this->artisan('wosool:admin', ['email' => 'missing@example.com', '--grant' => true, '--reason' => 'QA-1'])->assertFailed();
        $this->assertDatabaseCount('users', 1);
    }

    public function test_grant_requires_verified_email_and_change_reference(): void
    {
        $user = User::factory()->unverified()->create();
        $this->artisan('wosool:admin', ['email' => $user->email, '--grant' => true, '--reason' => 'QA-2'])->assertFailed();
        $this->assertFalse($user->fresh()->hasRole('admin'));
        $this->assertNull($user->fresh()->email_verified_at);
        $user->markEmailAsVerified();
        $this->artisan('wosool:admin', ['email' => $user->email, '--grant' => true])->assertFailed();
        $this->assertFalse($user->fresh()->hasRole('admin'));
    }

    public function test_explicit_grant_is_idempotent_and_does_not_change_credentials_or_other_roles(): void
    {
        $user = User::factory()->create(['email' => 'qa-admin@example.com']);
        $password = $user->getAuthPassword();
        $user->assignRole(Role::findOrCreate('member', 'web'));
        $options = ['email' => ' QA-ADMIN@example.com ', '--grant' => true, '--reason' => 'QA-3'];
        $this->artisan('wosool:admin', $options)->assertSuccessful();
        $this->artisan('wosool:admin', $options)->assertSuccessful();
        $this->assertTrue($user->fresh()->hasAllRoles(['admin', 'member']));
        $this->assertSame($password, $user->fresh()->getAuthPassword());
        $this->actingAs($user->fresh())->getJson('/api/v1/admin/dashboard')->assertOk();
    }

    public function test_registration_cannot_self_assign_admin_or_email_verification(): void
    {
        \Illuminate\Support\Facades\Mail::fake();
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.transport' => 'smtp', 'mail.from.address' => 'hello@wosool.org']);
        $this->postJson('/api/v1/auth/register', [
            'name' => 'QA Founder', 'email' => 'qa-founder@example.com', 'password' => 'TestPassword123',
            'password_confirmation' => 'TestPassword123', 'consent' => true,
            'roles' => ['admin'], 'role_token' => 'admin', 'is_admin' => true, 'email_verified_at' => now()->toISOString(),
        ])->assertCreated()->assertJsonPath('user.is_admin', false)->assertJsonPath('user.email_verified_at', null);
        $user = User::where('email', 'qa-founder@example.com')->firstOrFail();
        $this->assertFalse($user->isPlatformAdmin());
        $this->assertFalse($user->hasVerifiedEmail());
    }

    #[\PHPUnit\Framework\Attributes\TestWith(['/api/v1'])]
    #[\PHPUnit\Framework\Attributes\TestWith(['/v1'])]
    public function test_admin_routes_require_verified_email_and_private_registration_headers(string $prefix): void
    {
        $user = User::factory()->unverified()->create();
        $user->assignRole(Role::findOrCreate('admin', 'web'));
        $this->actingAs($user)->getJson($prefix.'/admin/dashboard')->assertForbidden()->assertJsonPath('reason', 'email_unverified');
        $this->getJson($prefix.'/registration/application')->assertForbidden()
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $user->markEmailAsVerified();
        $this->actingAs($user->fresh())->getJson($prefix.'/admin/dashboard')->assertOk()->assertJsonPath('stats.total_members', 0);
    }
}
