<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_health_endpoint_returns_expected_payload(): void
    {
        $response = $this->getJson('/api/health');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'status',
                'version',
                'timestamp',
                'revision',
            ])
            ->assertJsonPath('status', 'healthy')
            ->assertJsonPath('revision', null)
            ->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_health_endpoint_exposes_only_a_normalized_git_revision(): void
    {
        config(['app.revision' => ' ABCDEF1234567 ']);

        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('revision', 'abcdef1234567');

        config(['app.revision' => 'private-environment-value']);

        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('revision', null);
    }
}
