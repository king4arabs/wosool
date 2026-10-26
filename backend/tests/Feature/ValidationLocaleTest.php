<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Forms show the API's field messages as written, so they must follow the
 * X-Locale header the frontend sends.
 */
class ValidationLocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_arabic_translation_covers_every_framework_rule(): void
    {
        $flatten = function (array $lines, string $prefix = '') use (&$flatten): array {
            $keys = [];
            foreach ($lines as $key => $value) {
                if (in_array($prefix.$key, ['custom', 'attributes'], true)) {
                    continue;
                }
                $keys = is_array($value)
                    ? array_merge($keys, $flatten($value, $prefix.$key.'.'))
                    : array_merge($keys, [$prefix.$key]);
            }

            return $keys;
        };

        $english = $flatten(require base_path('vendor/laravel/framework/src/Illuminate/Translation/lang/en/validation.php'));
        $arabic = $flatten(require lang_path('ar/validation.php'));

        $this->assertSame([], array_values(array_diff($english, $arabic)), 'Arabic validation messages are missing for these rules.');
    }

    public function test_generic_rule_messages_follow_the_requested_language(): void
    {
        $payload = ['name' => 'Sara', 'email' => 'sara@example.com', 'category' => 'general', 'subject' => 'Hello', 'message' => str_repeat('a', 3001)];

        $this->postJson('/api/v1/contact', $payload, ['X-Locale' => 'ar'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.message.0', 'يجب ألا يتجاوز حقل الرسالة 3000 حرفًا.');

        $this->postJson('/api/v1/contact', $payload, ['X-Locale' => 'en'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.message.0', 'The message field must not be greater than 3000 characters.');

        $this->postJson('/api/v1/contact', ['email' => 'sara@example.com', 'category' => 'general', 'subject' => 'Hi', 'message' => 'Hello', 'name' => 'Sara', 'company' => str_repeat('b', 256)], ['X-Locale' => 'ar'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.company.0', 'يجب ألا يتجاوز حقل الشركة أو الجهة 255 حرفًا.');
    }

    public function test_form_specific_messages_follow_the_requested_language(): void
    {
        $this->postJson('/api/v1/contact', ['email' => 'not-an-email'], ['X-Locale' => 'ar'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.name.0', 'اكتب اسمك.')
            ->assertJsonPath('errors.email.0', 'اكتب بريدًا إلكترونيًا صحيحًا.');

        $this->postJson('/api/v1/contact', ['email' => 'not-an-email'], ['X-Locale' => 'en'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.name.0', 'Please enter your name.')
            ->assertJsonPath('errors.email.0', 'Please enter a valid email address.');

        $this->postJson('/api/v1/applications', ['company_website' => 'not a url'], ['X-Locale' => 'ar'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.full_name.0', 'اكتب اسمك الكامل.')
            ->assertJsonPath('errors.company_website.0', 'يجب أن يكون حقل موقع الشركة رابطًا صحيحًا يبدأ بـ http أو https.');
    }

    public function test_program_application_messages_are_no_longer_arabic_only(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);
        $user = User::factory()->member()->create();
        $program = Program::create(['name' => 'Growth Sprint', 'slug' => 'growth-sprint-locale', 'category' => 'growth', 'is_open' => true]);

        $this->actingAs($user)->postJson("/api/v1/member/programs/{$program->slug}/apply", ['motivation' => 'short'], ['X-Locale' => 'en'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.motivation.0', 'Write at least 20 characters about why you want to join.');

        $this->actingAs($user)->postJson("/api/v1/member/programs/{$program->slug}/apply", ['motivation' => 'short'], ['X-Locale' => 'ar'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.motivation.0', 'يرجى كتابة 20 حرفًا على الأقل في حقل الدافع.');
    }
}
