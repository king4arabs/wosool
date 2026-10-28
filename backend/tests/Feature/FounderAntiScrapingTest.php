<?php

namespace Tests\Feature;

use App\Models\{FounderProfile, Scorecard, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FounderAntiScrapingTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_founder_redacts_sensitive_data_while_owner_can_read_their_profile(): void
    {
        $user = User::factory()->create(['name' => 'Public Founder']);
        $founder = FounderProfile::create([
            'user_id' => $user->id, 'slug' => 'public-founder', 'display_name' => 'Public Founder',
            'legal_name' => 'Confidential Legal Name', 'status' => 'active', 'is_public' => true,
            'needs' => ['Private investment request'], 'offers' => ['Private mentor offer'],
            'skills' => ['private skill'], 'linkedin_url' => 'https://linkedin.com/in/private',
            'twitter_url' => 'https://x.com/private', 'claimed_at' => now(),
        ]);
        Scorecard::create(['founder_profile_id' => $founder->id, 'aggregate_score' => 25,
            'historical_logs' => [['notes' => 'Confidential financial note']]]);

        $this->getJson('/api/v1/founders/public-founder')->assertOk()
            ->assertJsonPath('data.name', 'Public Founder')
            ->assertJsonPath('data.legal_name', 'Public Founder')
            ->assertJsonPath('data.user', null)
            ->assertJsonPath('data.scorecard', null)
            ->assertJsonPath('data.claimed_at', null)
            ->assertJsonPath('data.linkedin_url', null)
            ->assertJsonPath('data.twitter_url', null)
            ->assertJsonPath('data.needs', [])
            ->assertJsonPath('data.offers', [])
            ->assertJsonPath('data.skills', [])
            ->assertDontSee('Confidential')
            ->assertDontSee('Private investment request');

        $this->actingAs($user)->getJson('/api/v1/member/founder-profile')->assertOk()
            ->assertJsonPath('data.legal_name', 'Confidential Legal Name')
            ->assertJsonPath('data.needs.0', 'Private investment request');
    }

    public function test_public_directory_routes_are_throttled(): void
    {
        foreach (['/api/v1/founders', '/api/v1/founders/example',
            '/api/v1/companies', '/api/v1/companies/example'] as $url) {
            $route = app('router')->getRoutes()->match(\Illuminate\Http\Request::create($url, 'GET'));
            $this->assertContains('throttle:30,1', $route->gatherMiddleware());
        }
    }
}
