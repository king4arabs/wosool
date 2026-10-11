<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberScorecardSocietyTest extends TestCase
{
    use RefreshDatabase;

    private function makeMemberWithProfile(): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('member');

        FounderProfile::query()->create([
            'user_id' => $user->id,
            'slug' => 'member-'.$user->id,
            'tagline' => 'Builder',
            'bio' => 'Bio',
            'location' => 'Riyadh',
            'sector' => 'FinTech',
            'stage' => 'seed',
            'status' => 'active',
            'is_public' => true,
            'needs' => ['advice'],
            'offers' => ['mentorship'],
        ]);

        return $user;
    }

    public function test_member_can_submit_scorecard_update_and_receive_scorecard_payload(): void
    {
        $user = $this->makeMemberWithProfile();

        $response = $this->actingAs($user)->postJson('/api/v1/member/scorecard/updates', [
            'update_text' => 'Closed strategic pilot with enterprise customer.',
            'priority' => 'normal',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'aggregate_score',
                    'latest_update_text',
                    'momentum_score',
                    'fundraising_score',
                    'growth_score',
                    'support_need_score',
                ],
            ]);
    }

    public function test_member_society_post_flow_create_react_comment_save_help_and_report(): void
    {
        $user = $this->makeMemberWithProfile();

        $create = $this->actingAs($user)->postJson('/api/v1/member/society/posts', [
            'post_type' => 'ask',
            'title' => 'Need legal support for licensing',
            'content' => 'Looking for an expert who handled this recently.',
            'sector' => 'fintech',
            'priority' => 'urgent',
        ]);

        $create->assertCreated()->assertJsonPath('data.post_type', 'ask');
        $postId = (int) $create->json('data.id');

        $this->actingAs($user)
            ->postJson("/api/v1/member/society/posts/{$postId}/reactions", ['reaction_type' => 'like'])
            ->assertOk();

        $this->actingAs($user)
            ->postJson("/api/v1/member/society/posts/{$postId}/comments", ['content' => 'I can help.'])
            ->assertCreated();

        $this->actingAs($user)
            ->postJson("/api/v1/member/society/posts/{$postId}/save")
            ->assertOk();

        $this->actingAs($user)
            ->postJson("/api/v1/member/society/posts/{$postId}/help-offers", ['message' => 'I can connect you with counsel'])
            ->assertOk();

        $this->actingAs($user)
            ->postJson("/api/v1/member/society/posts/{$postId}/report", ['reason' => 'review_needed'])
            ->assertOk();

        $this->actingAs($user)
            ->getJson('/api/v1/member/society/posts?tab=all&sort=latest')
            ->assertOk()
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }
}
