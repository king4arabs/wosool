<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data(): void
    {
        $application = Application::create([
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+966500000000',
            'company_name' => 'Test Co',
            'sector' => 'SaaS',
            'stage' => 'Seed',
            'location' => 'Riyadh',
            'motivation' => 'Join network',
            'status' => 'approved',
            'invite_token' => 'test-invitation-token',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
            'invite_token' => 'test-invitation-token',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        $this->assertSame($response->json('user.id'), $application->fresh()->user_id);
        $this->assertNull($application->fresh()->invite_token);
    }

    public function test_registration_requires_the_invitation_for_the_approved_email(): void
    {
        Application::create([
            'full_name' => 'Approved User', 'email' => 'approved@example.com',
            'status' => 'approved', 'invite_token' => 'private-invitation',
        ]);

        $payload = ['name' => 'Approved User', 'email' => 'approved@example.com',
            'password' => 'Password1', 'password_confirmation' => 'Password1'];
        $this->postJson('/api/v1/auth/register', $payload)->assertUnprocessable()->assertJsonValidationErrors('invite_token');
        $this->postJson('/api/v1/auth/register', $payload + ['invite_token' => 'wrong'])->assertUnprocessable()->assertJsonValidationErrors('invite_token');
        $this->assertDatabaseMissing('users', ['email' => 'approved@example.com']);
    }

    public function test_existing_account_links_approved_applications_only_after_sign_in(): void
    {
        $user = User::factory()->create(['email' => 'owner@example.com', 'password' => 'Password1']);
        $approved = Application::create(['full_name' => 'Owner', 'email' => 'OWNER@example.com', 'status' => 'approved']);
        $pending = Application::create(['full_name' => 'Owner', 'email' => 'owner@example.com', 'status' => 'submitted']);

        $this->postJson('/api/v1/auth/login', ['email' => 'owner@example.com', 'password' => 'wrong'])->assertUnprocessable();
        $this->assertNull($approved->fresh()->user_id);
        $this->postJson('/api/v1/auth/login', ['email' => 'owner@example.com', 'password' => 'Password1'])->assertOk();
        $this->assertSame($user->id, $approved->fresh()->user_id);
        $this->assertNull($pending->fresh()->user_id);
    }

    public function test_register_returns_validation_errors_for_invalid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'not-an-email',
            'password' => 'short',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        Application::create([
            'full_name' => 'Taken User',
            'email' => 'taken@example.com',
            'phone' => '+966500000010',
            'company_name' => 'Taken Co',
            'sector' => 'SaaS',
            'stage' => 'Seed',
            'location' => 'Riyadh',
            'motivation' => 'Join network',
            'status' => 'approved',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Another User',
            'email' => 'taken@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_requires_approved_application(): void
    {
        Application::create([
            'full_name' => 'Pending User',
            'email' => 'pending@example.com',
            'phone' => '+966500000011',
            'company_name' => 'Pending Co',
            'sector' => 'SaaS',
            'stage' => 'Seed',
            'location' => 'Riyadh',
            'motivation' => 'Join network',
            'status' => 'submitted',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Pending User',
            'email' => 'pending@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'member@example.com',
            'password' => bcrypt('Password1'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'member@example.com',
            'password' => 'Password1',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'member@example.com',
            'password' => bcrypt('Password1'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'member@example.com',
            'password' => 'WrongPassword1',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/auth/me');

        $response
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_unauthenticated_user_cannot_get_profile(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/auth/logout');

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');
    }
}
