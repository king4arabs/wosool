<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use App\Models\SocietyPost;
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

    public function test_feed_tab_counts_cover_every_page_and_follow_the_sector_filter(): void
    {
        $user = $this->makeMemberWithProfile();

        $posts = [
            ['ask', 'fintech'], ['ask', 'fintech'], ['ask', 'saas'],
            ['offer', 'fintech'], ['offer', 'ai'],
        ];
        foreach ($posts as $index => [$type, $sector]) {
            $this->actingAs($user)->postJson('/api/v1/member/society/posts', [
                'post_type' => $type,
                'title' => "Post {$index}",
                'content' => 'Details',
                'sector' => $sector,
            ])->assertCreated();
        }

        $hidden = SocietyPost::query()->latest('id')->first();
        $hidden->update(['moderation_status' => 'hidden']);

        // One post per page, asks tab: the badges still count the whole feed.
        $this->actingAs($user)
            ->getJson('/api/v1/member/society/posts?tab=asks&per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.counts', ['all' => 4, 'asks' => 3, 'offers' => 1]);

        $this->actingAs($user)
            ->getJson('/api/v1/member/society/posts?tab=offers&sector=fintech')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.counts', ['all' => 3, 'asks' => 2, 'offers' => 1]);
    }
}
