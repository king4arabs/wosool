<?php

namespace Tests\Feature;

use App\Mail\WosoolMail;
use App\Models\ChatRoom;
use App\Models\FounderProfile;
use App\Models\IntroductionLedger;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class IntroductionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function founder(string $name, bool $member = true): array
    {
        $user = User::factory()->create(['name' => $name]);
        if ($member) {
            $user->assignRole('member');
        }
        $profile = FounderProfile::create([
            'user_id' => $user->id,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'display_name' => $name,
            'tagline' => 'Building something useful for founders',
            'status' => 'active',
            'is_public' => true,
        ]);

        return [$user, $profile];
    }

    private function request(User $as, FounderProfile $target, string $brief = 'I would value your advice on GCC expansion and hiring.')
    {
        return $this->actingAs($as)->postJson('/api/v1/member/introductions', [
            'target_founder_id' => $target->id,
            'payload_context_brief' => $brief,
        ]);
    }

    public function test_fresh_install_has_the_introductions_ledger_table(): void
    {
        $this->assertTrue(Schema::hasTable('introductions_ledger'));
        $this->assertTrue(Schema::hasColumns('introductions_ledger', ['source_credit_consumed_at', 'intro_email_sent_at', 'thread_id']));
    }

    public function test_member_can_request_and_target_can_approve_an_introduction(): void
    {
        Mail::fake();
        config(['mail.mailers.smtp.host' => 'smtp.example.com', 'mail.from.address' => 'hello@wosool.org']);
        [$alice, $aliceProfile] = $this->founder('Alice Founder');
        [$bob, $bobProfile] = $this->founder('Bob Founder');

        $id = $this->request($alice, $bobProfile)->assertCreated()
            ->assertJsonPath('data.routing_status', 'INTRO_PENDING')
            ->assertJsonPath('data.target_founder.legal_name', 'Bob Founder')
            ->json('data.id');

        $this->actingAs($bob)->getJson('/api/v1/member/introductions')->assertOk()
            ->assertJsonPath('data.inbound.0.id', $id)
            ->assertJsonPath('data.inbound.0.source_founder.legal_name', 'Alice Founder');

        // The requester cannot approve their own request.
        $this->actingAs($alice)->patchJson("/api/v1/member/introductions/{$id}/approve")->assertForbidden();

        $this->actingAs($bob)->patchJson("/api/v1/member/introductions/{$id}/approve")->assertOk()
            ->assertJsonPath('data.routing_status', 'INTRO_APPROVED');

        $intro = IntroductionLedger::findOrFail($id);
        $this->assertNotNull($intro->thread_id);
        $this->assertNotNull($intro->source_credit_consumed_at);
        $this->assertTrue(ChatRoom::where('related_type', 'introduction')->where('related_id', $id)->exists());

        // Each side gets a separate email so neither address is exposed to the other.
        Mail::assertSent(WosoolMail::class, 2);
        Mail::assertSent(WosoolMail::class, fn ($mail) => $mail->hasTo($alice->email) && ! $mail->hasTo($bob->email));
        Mail::assertSent(WosoolMail::class, fn ($mail) => $mail->hasTo($bob->email) && ! $mail->hasTo($alice->email));

        $this->actingAs($bob)->patchJson("/api/v1/member/introductions/{$id}/approve")->assertUnprocessable();
    }

    public function test_duplicate_self_and_unapproved_requests_are_rejected(): void
    {
        [$alice] = $this->founder('Alice Founder');
        [$bob, $bobProfile] = $this->founder('Bob Founder');
        [$guest] = $this->founder('Guest Founder', member: false);
        $aliceProfile = $alice->founderProfile()->first();

        $this->request($alice, $bobProfile)->assertCreated();
        $this->request($alice, $bobProfile)->assertStatus(409);
        $this->request($bob, $aliceProfile)->assertStatus(409);
        $this->request($alice, $aliceProfile)->assertUnprocessable();
        $this->request($alice, $bobProfile, 'too short')->assertUnprocessable();
        $this->actingAs($guest)->postJson('/api/v1/member/introductions', [
            'target_founder_id' => $bobProfile->id,
            'payload_context_brief' => 'I would value your advice on GCC expansion and hiring.',
        ])->assertForbidden();
    }

    public function test_either_side_can_decline_and_admin_console_lists_routes(): void
    {
        [$alice] = $this->founder('Alice Founder');
        [$bob, $bobProfile] = $this->founder('Bob Founder');
        $id = $this->request($alice, $bobProfile)->assertCreated()->json('data.id');

        $this->actingAs($bob)->patchJson("/api/v1/member/introductions/{$id}/decline")->assertOk()
            ->assertJsonPath('data.routing_status', 'DECLINED');

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin)->getJson('/api/v1/admin/intros')->assertOk()
            ->assertJsonPath('meta.declined', 1)
            ->assertJsonPath('data.0.source_founder.legal_name', 'Alice Founder');
        $this->actingAs($admin)->patchJson("/api/v1/admin/intros/{$id}", ['routing_status' => 'ROUTE_EXPIRED', 'tracking_notes' => 'Closed by operator'])
            ->assertOk()->assertJsonPath('data.routing_status', 'ROUTE_EXPIRED');
    }

    public function test_pending_requests_are_capped_at_three(): void
    {
        [$alice] = $this->founder('Alice Founder');
        foreach (range(1, 3) as $i) {
            [, $target] = $this->founder("Target {$i}");
            $this->request($alice, $target)->assertCreated();
        }
        [, $fourth] = $this->founder('Target 4');
        $this->request($alice, $fourth)->assertUnprocessable()->assertJsonPath('meta.limit', 3);
    }

    public function test_members_without_a_profile_get_empty_lists_not_errors(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user)->getJson('/api/v1/member/companies')->assertOk()->assertJsonPath('data', []);
        $this->actingAs($user)->getJson('/api/v1/member/matches')->assertOk()->assertJsonPath('meta.profile_required', true);
    }

    public function test_admin_can_verify_a_founder_for_introductions(): void
    {
        [, $profile] = $this->founder('Verify Me');
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin)->patchJson("/api/v1/admin/founders/{$profile->id}", ['is_verified' => true])->assertOk()
            ->assertJsonPath('data.is_verified', true);
        $this->assertTrue($profile->fresh()->vetted_status);
    }

    public function test_help_requests_and_admin_companies_load_on_current_schema(): void
    {
        [$alice] = $this->founder('Alice Founder');
        $this->actingAs($alice)->getJson('/api/v1/member/help-requests')->assertOk();
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin)->getJson('/api/v1/admin/companies')->assertOk();
    }

    public function test_member_can_upload_replace_and_remove_profile_photo(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        [$alice] = $this->founder('Alice Founder');

        $first = $this->actingAs($alice)->post('/api/v1/member/founder-profile/avatar', [
            'avatar' => \Illuminate\Http\UploadedFile::fake()->image('me.png', 400, 400),
        ], ['Accept' => 'application/json'])->assertOk()->json('data.avatar_url');
        $this->assertMatchesRegularExpression('~^/storage/founders/avatars/[a-f0-9-]+\.png$~', $first);
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists(substr($first, strlen('/storage/')));

        $second = $this->actingAs($alice)->post('/api/v1/member/founder-profile/avatar', [
            'avatar' => \Illuminate\Http\UploadedFile::fake()->image('me.jpg', 400, 400),
        ], ['Accept' => 'application/json'])->assertOk()->json('data.avatar_url');
        \Illuminate\Support\Facades\Storage::disk('public')->assertMissing(substr($first, strlen('/storage/')));

        // The uploaded path survives a normal profile save.
        $this->actingAs($alice)->putJson('/api/v1/member/founder-profile', ['avatar_url' => $second])->assertOk();

        $this->actingAs($alice)->post('/api/v1/member/founder-profile/avatar', [
            'avatar' => \Illuminate\Http\UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertUnprocessable();
        $this->actingAs($alice)->post('/api/v1/member/founder-profile/avatar', [
            'avatar' => \Illuminate\Http\UploadedFile::fake()->image('tiny.png', 40, 40),
        ], ['Accept' => 'application/json'])->assertUnprocessable();

        $this->actingAs($alice)->deleteJson('/api/v1/member/founder-profile/avatar')->assertOk()->assertJsonPath('data.avatar_url', null);
        \Illuminate\Support\Facades\Storage::disk('public')->assertMissing(substr($second, strlen('/storage/')));
    }
}
