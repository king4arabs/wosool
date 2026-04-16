<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
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
