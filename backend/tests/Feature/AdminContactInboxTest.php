<?php

namespace Tests\Feature;

use App\Mail\WosoolMail;
use App\Models\AdminAction;
use App\Models\ContactMessage;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminContactInboxTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function send(string $category, string $subject): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Layla Al-Harbi', 'email' => 'layla@example.com', 'category' => $category,
            'subject' => $subject, 'message' => 'Hello team.', 'company' => 'Acme',
        ])->assertCreated();
    }

    public function test_only_admins_can_read_or_update_the_inbox(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $member = User::factory()->member()->create();
        $message = ContactMessage::create(['name' => 'A', 'email' => 'a@example.com', 'category' => 'general', 'subject' => 'S', 'message' => 'M']);

        $this->getJson('/api/v1/admin/contact-messages')->assertUnauthorized();
        $this->actingAs($member)->getJson('/api/v1/admin/contact-messages')->assertForbidden();
        $this->actingAs($member)->patchJson("/api/v1/admin/contact-messages/{$message->id}", ['answered' => true])->assertForbidden();
        $this->assertNull($message->fresh()->responded_at);
    }

    public function test_admin_sees_new_messages_with_form_labels_and_without_the_sender_ip(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $this->send('office-hours', 'Fundraising questions');
        $this->send('sponsorship', 'Founders dinner');

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/contact-messages')->assertOk()
            ->assertJsonPath('meta.total', 2)->assertJsonPath('meta.open', 2)->assertJsonPath('meta.answered', 0)
            ->assertJsonPath('data.0.subject', 'Founders dinner')
            ->assertJsonPath('data.1.category_label', ['ar' => 'جلسة مع الفريق', 'en' => 'Time with the team']);
        $this->assertArrayNotHasKey('ip_address', $response->json('data.0'));
        $this->assertNotNull(ContactMessage::first()->ip_address);

        $this->actingAs($admin)->getJson('/api/v1/admin/contact-messages?category=office-hours')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.subject', 'Fundraising questions');
        $this->actingAs($admin)->getJson('/api/v1/admin/contact-messages?category=unknown')->assertUnprocessable();
    }

    public function test_team_alert_uses_the_form_label_and_links_to_the_inbox(): void
    {
        Mail::fake();
        config(['mail.team_address' => 'team@wosool.org']);
        $this->send('office-hours', 'Fundraising questions');

        Mail::assertSent(WosoolMail::class, function (WosoolMail $mail) {
            if ($mail->kind !== 'team-alert') {
                return false;
            }
            $html = $mail->render();

            return str_contains($html, 'Time with the team') && str_contains($html, 'جلسة مع الفريق') && str_contains($html, '/admin/messages');
        });
    }

    public function test_marking_answered_and_reopening_is_recorded_without_the_message_body(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $this->send('general', 'Membership');
        $message = ContactMessage::firstOrFail();

        $this->actingAs($admin)->patchJson("/api/v1/admin/contact-messages/{$message->id}", ['answered' => true])->assertOk()
            ->assertJsonPath('data.responded_by.id', $admin->id);
        $answeredAt = $message->fresh()->responded_at;
        $this->assertNotNull($answeredAt);

        // Marking again keeps the original answer time and person.
        $this->travel(1)->hours();
        $this->actingAs($admin)->patchJson("/api/v1/admin/contact-messages/{$message->id}", ['answered' => true])->assertOk();
        $this->assertTrue($answeredAt->equalTo($message->fresh()->responded_at));

        $this->actingAs($admin)->getJson('/api/v1/admin/contact-messages?status=answered')->assertJsonPath('meta.total', 1);
        $this->actingAs($admin)->getJson('/api/v1/admin/contact-messages?status=open')->assertJsonPath('meta.total', 0);

        $this->actingAs($admin)->patchJson("/api/v1/admin/contact-messages/{$message->id}", ['answered' => false])->assertOk()
            ->assertJsonPath('data.responded_at', null)->assertJsonPath('data.responded_by', null);
        $this->actingAs($admin)->patchJson("/api/v1/admin/contact-messages/{$message->id}", [])->assertUnprocessable();

        $actions = AdminAction::where('entity_type', 'contact_message')->orderBy('id')->pluck('action')->all();
        $this->assertSame(['contact_message.answered', 'contact_message.answered', 'contact_message.reopened'], $actions);
        $logged = json_encode(AdminAction::where('entity_type', 'contact_message')->get()->toArray());
        $this->assertStringNotContainsString('Hello team.', $logged);
    }
}
