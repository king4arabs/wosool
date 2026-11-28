<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DataReadinessTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/v1/admin/data-readiness';

    private function administrator(array $overrides = []): User
    {
        $admin = User::factory()->create(array_replace(['email_verified_at' => now()], $overrides));
        $admin->assignRole(Role::findOrCreate('admin', 'web'));

        return $admin;
    }

    public function test_database_readiness_is_disabled_and_does_not_grant_admin(): void
    {
        config(['data_operations.operator_user_id' => null]);
        $this->getJson(self::ENDPOINT)->assertUnauthorized();

        $admin = $this->administrator();
        $this->actingAs($admin)->getJson(self::ENDPOINT)->assertForbidden();
        $this->actingAs($admin)->postJson(self::ENDPOINT)->assertMethodNotAllowed();

        $member = User::factory()->create(['email_verified_at' => now()]);
        config(['data_operations.operator_user_id' => (string) $member->getKey()]);
        $this->actingAs($member)->getJson(self::ENDPOINT)->assertForbidden();
    }

    public function test_only_a_named_verified_platform_admin_can_inspect_fixed_status(): void
    {
        $operator = $this->administrator();
        config(['data_operations.operator_user_id' => (string) $operator->getKey()]);
        $this->actingAs($this->administrator())->getJson(self::ENDPOINT)->assertForbidden();

        $this->actingAs($operator)->getJson(self::ENDPOINT.'?table=users')
            ->assertOk()->assertExactJson(['status' => 'ready']);
        $this->actingAs($operator)->getJson(self::ENDPOINT)->assertHeader('Cache-Control');

        $unverified = $this->administrator(['email_verified_at' => null]);
        config(['data_operations.operator_user_id' => (string) $unverified->getKey()]);
        $this->actingAs($unverified)->getJson(self::ENDPOINT)->assertForbidden();
    }

    public function test_database_errors_are_not_returned(): void
    {
        $operator = $this->administrator();
        config(['data_operations.operator_user_id' => (string) $operator->getKey()]);
        DB::shouldReceive('table')->with('users')->once()->andThrow(new \RuntimeException('internal test diagnostic'));

        $this->actingAs($operator)->getJson(self::ENDPOINT)
            ->assertServiceUnavailable()->assertExactJson(['status' => 'unavailable']);
    }
}
