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
            ])
            ->assertJsonPath('status', 'healthy');
    }
}
