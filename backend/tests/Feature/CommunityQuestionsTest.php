<?php

namespace Tests\Feature;

use App\Mail\WosoolMail;
use App\Models\ChatMessage;
use App\Models\ChatRoomParticipant;
use App\Models\FounderProfile;
use App\Models\HelpRequest;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CommunityQuestionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function member(string $name): User
    {
        $user = User::factory()->create(['name' => $name]);
        $user->assignRole('member');

        return $user;
    }

    private function ask(User $as, string $visibility = 'community_public', string $title = 'How did you price your first enterprise contract?'): HelpRequest
    {
        $this->actingAs($as)->postJson('/api/v1/member/help-requests', [
            'title' => $title,
            'category' => 'growth',
            'urgency' => 'normal',
            'description' => 'We sell B2B SaaS in Riyadh and are about to quote our first large customer.',
            'visibility' => $visibility,
            'allow_ai_matching' => false,
        ])->assertCreated();

        return HelpRequest::query()->latest('id')->firstOrFail();
    }

    public function test_community_feed_shows_shared_open_questions_without_emails(): void
    {
        $asker = $this->member('Sara Asker');
        $reader = $this->member('Omar Reader');
        $shared = $this->ask($asker);
        $this->ask($asker, 'private_admin', 'Private question for the team');
        $this->ask($reader, 'community_public', 'My own question');

        $response = $this->actingAs($reader)->getJson('/api/v1/member/help-requests?scope=community')->assertOk();

        $response->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $shared->id)
            ->assertJsonPath('data.0.requester.name', 'Sara Asker')
            ->assertJsonPath('data.0.offered_by_me', false)
            ->assertJsonPath('data.0.chat_room_id', null);
        $this->assertStringNotContainsString($asker->email, $response->getContent());
    }

    public function test_resolved_questions_leave_the_feed_and_search_filters(): void
    {
        $asker = $this->member('Sara Asker');
        $reader = $this->member('Omar Reader');
        $pricing = $this->ask($asker);
        $this->ask($asker, 'community_public', 'Which payroll provider do you use?');

        $this->actingAs($reader)->getJson('/api/v1/member/help-requests?scope=community&q=payroll')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Which payroll provider do you use?');

        $pricing->update(['status' => 'resolved']);
        $this->actingAs($reader)->getJson('/api/v1/member/help-requests?scope=community')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($reader)->getJson("/api/v1/member/help-requests/{$pricing->id}")->assertForbidden();
    }

    public function test_member_can_offer_help_join_the_room_and_requester_is_emailed(): void
    {
        Mail::fake();
        $asker = $this->member('Sara Asker');
        $helper = $this->member('Omar Helper');
        $question = $this->ask($asker);

        $this->actingAs($helper)->postJson("/api/v1/member/help-requests/{$question->id}/offer-help", [
            'note' => 'We priced per seat with an annual minimum. Happy to share the sheet.',
        ])->assertCreated()->assertJsonPath('data.chat_room_id', $question->chat_room_id);

        $this->assertTrue(ChatRoomParticipant::query()->where('room_id', $question->chat_room_id)->where('user_id', $helper->id)->where('role', 'helper')->exists());
        $this->assertSame('in_progress', $question->fresh()->status);
        $this->assertSame(1, ChatMessage::query()->where('room_id', $question->chat_room_id)->where('sender_user_id', $helper->id)->count());
        Mail::assertSent(WosoolMail::class, fn (WosoolMail $mail) => $mail->kind === 'help-offered' && $mail->hasTo($asker->email));

        // A second offer is idempotent: no duplicate email.
        $this->actingAs($helper)->postJson("/api/v1/member/help-requests/{$question->id}/offer-help")
            ->assertOk()->assertJsonPath('data.already_helping', true);
        Mail::assertSent(WosoolMail::class, 1);

        $this->actingAs($helper)->getJson('/api/v1/member/help-requests?scope=community')
            ->assertJsonPath('data.0.offered_by_me', true)
            ->assertJsonPath('data.0.helpers_count', 1)
            ->assertJsonPath('data.0.chat_room_id', $question->chat_room_id);
    }

    public function test_offer_help_respects_visibility_and_ownership(): void
    {
        $asker = $this->member('Sara Asker');
        $other = $this->member('Omar Other');
        $private = $this->ask($asker, 'private_admin');
        $matched = $this->ask($asker, 'matched_founders');
        $shared = $this->ask($asker);

        $this->actingAs($other)->postJson("/api/v1/member/help-requests/{$private->id}/offer-help")->assertForbidden();
        $this->actingAs($other)->postJson("/api/v1/member/help-requests/{$matched->id}/offer-help")->assertForbidden();
        $this->actingAs($asker)->postJson("/api/v1/member/help-requests/{$shared->id}/offer-help")->assertUnprocessable();

        // Once suggested as a helper, a matched question becomes visible to that member.
        $matched->suggestedHelpers()->create(['helper_user_id' => $other->id, 'status' => 'suggested', 'reason' => 'Test', 'score' => 70]);
        $this->actingAs($other)->getJson('/api/v1/member/help-requests?scope=community')
            ->assertJsonFragment(['id' => $matched->id]);
    }

    public function test_suggested_helpers_prefer_members_with_matching_experience(): void
    {
        $asker = $this->member('Sara Asker');
        $generalist = $this->member('Omar Generalist');
        $seller = $this->member('Lina Sales');
        FounderProfile::create(['user_id' => $seller->id, 'slug' => 'lina-sales', 'display_name' => 'Lina Sales', 'status' => 'active', 'offers' => ['B2B sales playbooks', 'GCC expansion']]);
        $question = $this->ask($asker, 'matched_founders');

        $this->actingAs($asker)->postJson("/api/v1/member/help-requests/{$question->id}/suggest-helpers")->assertOk();

        $ranked = $question->suggestedHelpers()->orderByDesc('score')->pluck('helper_user_id')->all();
        $this->assertSame($seller->id, $ranked[0]);
        $this->assertContains($generalist->id, $ranked);
        $this->actingAs($seller)->getJson('/api/v1/member/help-requests?scope=community')->assertJsonFragment(['id' => $question->id]);
    }

    public function test_non_members_cannot_browse_or_offer(): void
    {
        $asker = $this->member('Sara Asker');
        $question = $this->ask($asker);
        $outsider = User::factory()->create();

        $this->actingAs($outsider)->getJson('/api/v1/member/help-requests?scope=community')->assertForbidden();
        $this->actingAs($outsider)->postJson("/api/v1/member/help-requests/{$question->id}/offer-help")->assertForbidden();
    }
}
