<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FounderAccountCardLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_edits_update_the_same_public_directory_card_without_exposing_private_account_data(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $owner = User::factory()->create(['email' => 'founder-owner@example.test']);
        $owner->assignRole('member');
        $founder = FounderProfile::create([
            'user_id' => $owner->id,
            'slug' => 'linked-founder',
            'display_name' => 'Original Founder',
            'status' => 'active',
            'is_public' => true,
            'country_code' => 'SA',
        ]);

        $this->actingAs($owner)->getJson('/api/v1/member/founder-profile')
            ->assertOk()->assertJsonPath('data.id', $founder->id)->assertJsonPath('data.slug', 'linked-founder');

        $this->actingAs($owner)->putJson('/api/v1/member/founder-profile', [
            'display_name' => 'Updated Founder',
            'position' => 'CEO and Founder',
            'country_code' => 'SA',
            'is_public' => true,
        ])->assertOk()->assertJsonPath('data.id', $founder->id);

        $this->getJson('/api/v1/founders?slug=linked-founder')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.id', $founder->id)
            ->assertJsonPath('data.0.name', 'Updated Founder')->assertJsonPath('data.0.position', 'CEO and Founder')
            ->assertJsonPath('data.0.scorecard', null)
            ->assertDontSee('founder-owner@example.test');
        $this->getJson('/api/v1/founders?slug=not-linked-founder')->assertOk()->assertJsonPath('meta.total', 0);
        $this->assertDatabaseCount('founder_profiles', 1);

        $this->actingAs($owner)->putJson('/api/v1/member/founder-profile', ['is_public' => false])->assertOk();
        $this->getJson('/api/v1/founders?slug=linked-founder')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/founders/linked-founder')->assertNotFound();
        $this->actingAs($owner)->getJson('/api/v1/member/founder-profile')
            ->assertOk()->assertJsonPath('data.id', $founder->id)->assertJsonPath('data.is_public', false);
    }
}
