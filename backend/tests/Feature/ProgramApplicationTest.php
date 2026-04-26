<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function makeProgram(array $attrs = []): Program
    {
        return Program::create(array_merge([
            'name' => 'Growth Sprint',
            'slug' => 'growth-sprint-' . uniqid(),
            'category' => 'growth',
            'is_open' => true,
        ], $attrs));
    }

    public function test_unauthenticated_user_cannot_apply(): void
    {
        $program = $this->makeProgram();
        $this->postJson("/api/v1/member/programs/{$program->slug}/apply", [
            'motivation' => str_repeat('a', 30),
        ])->assertUnauthorized();
    }

    public function test_member_can_apply_to_open_program(): void
    {
        $user = User::factory()->create();
        $program = $this->makeProgram();

        $response = $this->actingAs($user)->postJson(
            "/api/v1/member/programs/{$program->slug}/apply",
            ['motivation' => 'I want to grow my company through this program.']
        );

        $response->assertCreated();
        $this->assertDatabaseHas('program_applications', [
            'program_id' => $program->id,
            'user_id' => $user->id,
            'status' => 'submitted',
        ]);
    }

    public function test_motivation_is_required_and_min_length(): void
    {
        $user = User::factory()->create();
        $program = $this->makeProgram();

        $this->actingAs($user)
            ->postJson("/api/v1/member/programs/{$program->slug}/apply", ['motivation' => 'short'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['motivation']);
    }

    public function test_member_cannot_apply_to_closed_program(): void
    {
        $user = User::factory()->create();
        $program = $this->makeProgram(['is_open' => false]);

        $this->actingAs($user)
            ->postJson(
                "/api/v1/member/programs/{$program->slug}/apply",
                ['motivation' => 'I want to grow my company through this program.']
            )
            ->assertUnprocessable();
    }

    public function test_member_cannot_apply_after_deadline(): void
    {
        $user = User::factory()->create();
        $program = $this->makeProgram(['application_deadline' => now()->subDay()]);

        $this->actingAs($user)
            ->postJson(
                "/api/v1/member/programs/{$program->slug}/apply",
                ['motivation' => 'I want to grow my company through this program.']
            )
            ->assertUnprocessable();
    }

    public function test_member_cannot_apply_twice_to_same_program(): void
    {
        $user = User::factory()->create();
        $program = $this->makeProgram();
        $payload = ['motivation' => 'I want to grow my company through this program.'];

        $this->actingAs($user)
            ->postJson("/api/v1/member/programs/{$program->slug}/apply", $payload)
            ->assertCreated();

        $this->actingAs($user)
            ->postJson("/api/v1/member/programs/{$program->slug}/apply", $payload)
            ->assertUnprocessable();
    }

    public function test_member_can_list_their_applications(): void
    {
        $user = User::factory()->create();
        $program = $this->makeProgram();
        $this->actingAs($user)->postJson(
            "/api/v1/member/programs/{$program->slug}/apply",
            ['motivation' => 'I want to grow my company through this program.']
        )->assertCreated();

        $response = $this->actingAs($user)->getJson('/api/v1/member/program-applications');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }
}
