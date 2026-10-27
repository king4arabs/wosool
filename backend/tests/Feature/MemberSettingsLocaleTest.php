<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * /dashboard/settings shows the API's first field error as written, so the
 * messages for the account fields must follow the request language.
 */
class MemberSettingsLocaleTest extends TestCase
{
    use RefreshDatabase;

    private function member(): User
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->create(['password' => bcrypt('Password1')]);
        $user->assignRole('member');

        return $user;
    }

    private function payload(array $account): array
    {
        return [
            'account' => $account + ['name' => 'Sara', 'email' => 'sara@example.com'],
            'privacy' => ['profile_visibility' => true, 'show_founder_score' => true, 'activity_visibility' => true, 'appear_in_directory' => true],
            'notifications' => ['new_match_suggestions' => true, 'direct_messages' => true, 'event_reminders' => true, 'program_updates' => true, 'community_activity' => false, 'weekly_digest' => true],
            'visibility' => ['allow_intro_requests' => true, 'show_email_to_matches' => false, 'discoverable_for_matching' => true],
        ];
    }

    public function test_wrong_current_password_is_reported_in_the_request_language(): void
    {
        $user = $this->member();
        $account = ['current_password' => 'Wrong1234', 'new_password' => 'NewPassword1', 'new_password_confirmation' => 'NewPassword1'];

        $this->actingAs($user)->putJson('/api/v1/member/settings', $this->payload($account), ['X-Locale' => 'ar'])
            ->assertStatus(422)
            ->assertJson(['errors' => ['account.current_password' => ['كلمة المرور الحالية غير صحيحة.']]]);

        $this->actingAs($user)->putJson('/api/v1/member/settings', $this->payload($account), ['X-Locale' => 'en'])
            ->assertStatus(422)
            ->assertJson(['errors' => ['account.current_password' => ['The current password is incorrect.']]]);
    }

    public function test_account_field_errors_use_field_names_not_request_keys(): void
    {
        $user = $this->member();

        $ar = $this->actingAs($user)->putJson('/api/v1/member/settings', $this->payload(['name' => '', 'email' => 'not-an-email', 'new_password' => 'NewPassword1', 'new_password_confirmation' => 'Other1234']), ['X-Locale' => 'ar'])
            ->assertStatus(422)
            ->json('errors');

        $this->assertSame('حقل الاسم مطلوب.', $ar['account.name'][0]);
        $this->assertStringContainsString('البريد الإلكتروني', $ar['account.email'][0]);
        $this->assertStringContainsString('كلمة المرور الجديدة', $ar['account.new_password'][0]);
        $this->assertStringContainsString('كلمة المرور الحالية', $ar['account.current_password'][0]);
        foreach ($ar as $messages) {
            $this->assertStringNotContainsString('account', $messages[0]);
        }

        $en = $this->actingAs($user)->putJson('/api/v1/member/settings', $this->payload(['name' => '', 'email' => 'not-an-email']), ['X-Locale' => 'en'])
            ->assertStatus(422)
            ->json('errors');

        $this->assertSame('The name field is required.', $en['account.name'][0]);
        $this->assertSame('The email field must be a valid email address.', $en['account.email'][0]);
    }
}
