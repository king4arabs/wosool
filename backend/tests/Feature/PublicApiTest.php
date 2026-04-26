<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_founders_index_returns_paginated_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->getJson('/api/v1/founders');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    ['id', 'slug'],
                ],
                'per_page',
                'total',
            ]);

        $this->assertNotEmpty($response->json('data'));
    }

    public function test_founder_show_returns_seeded_record(): void
    {
        $this->seed(DatabaseSeeder::class);

        $listing = $this->getJson('/api/v1/founders')->assertOk();
        $slug = $listing->json('data.0.slug');

        $this->getJson("/api/v1/founders/{$slug}")
            ->assertOk()
            ->assertJsonPath('slug', $slug);
    }

    public function test_programs_endpoint_returns_seeded_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->getJson('/api/v1/programs');

        $response->assertOk();
        $this->assertNotEmpty($response->json());
    }
}
