<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * /dashboard/profile shows the API's first error for each field as written, so list items
 * and the photo link must be described in the visitor's language, never as "skills.1".
 */
class FounderProfileValidationLocaleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function rejected(string $locale, array $payload): array
    {
        $user = User::factory()->member()->create();

        return $this->actingAs($user)
            ->putJson('/api/v1/member/founder-profile', $payload, ['X-Locale' => $locale])
            ->assertStatus(422)
            ->json('errors');
    }

    public function test_list_item_errors_name_the_item_in_words(): void
    {
        $payload = ['skills' => ['Sales', str_repeat('s', 101)], 'needs' => [str_repeat('n', 256)], 'offers' => [str_repeat('o', 256)]];

        $en = $this->rejected('en', $payload);
        $this->assertSame('Keep each skill to 100 characters or fewer.', $en['skills.1'][0]);
        $this->assertSame('Keep each need to 255 characters or fewer.', $en['needs.0'][0]);
        $this->assertSame('Keep each offer to 255 characters or fewer.', $en['offers.0'][0]);

        $ar = $this->rejected('ar', $payload);
        $this->assertSame('اجعل كل مهارة في حدود 100 حرفًا أو أقل.', $ar['skills.1'][0]);
        $this->assertSame('اجعل كل احتياج في حدود 255 حرفًا أو أقل.', $ar['needs.0'][0]);
        $this->assertSame('اجعل كل ما تقدمه في حدود 255 حرفًا أو أقل.', $ar['offers.0'][0]);

        foreach ([...array_values($en), ...array_values($ar)] as $messages) {
            $this->assertDoesNotMatchRegularExpression('/(skills|needs|offers)\.\d/', $messages[0]);
        }
    }

    public function test_photo_link_error_follows_the_request_language(): void
    {
        $payload = ['avatar_url' => 'javascript:alert(1)'];

        $this->assertSame(
            'Enter an image link that starts with http:// or https://, or upload a photo instead.',
            $this->rejected('en', $payload)['avatar_url'][0],
        );
        $ar = $this->rejected('ar', $payload)['avatar_url'][0];
        $this->assertStringContainsString('أدخل رابط صورة', $ar);
        $this->assertDoesNotMatchRegularExpression('/[A-Za-z]{4,}/', str_replace(['http', 'https'], '', $ar));
    }
}
