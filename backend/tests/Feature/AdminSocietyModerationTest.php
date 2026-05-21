<?php

namespace Tests\Feature;

use App\Models\SocietyPost;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSocietyModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_and_moderate_society_posts(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@wosool.org')->firstOrFail();
        $member = User::where('email', 'founder1@wosool.org')->first() ?? User::factory()->create();

        $post = SocietyPost::create([
            'author_user_id' => $member->id,
            'post_type' => 'offer',
            'title' => 'Reusable growth experimentation framework',
            'content' => 'Sharing internal playbook.',
            'sector' => 'saas',
            'priority' => 'normal',
            'moderation_status' => 'published',
            'published_at' => now(),
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/society/posts')
            ->assertOk();

        $this->actingAs($admin)
            ->patchJson("/api/v1/admin/society/posts/{$post->id}/status", ['moderation_status' => 'hidden'])
            ->assertOk()
            ->assertJsonPath('data.moderation_status', 'hidden');
    }
}
