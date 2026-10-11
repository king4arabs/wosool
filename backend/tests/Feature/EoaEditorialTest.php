<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Eoa\ProgramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EoaEditorialTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('eoa:install')->assertSuccessful();
    }

    private function account(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function content(int $version = 0, string $action = 'draft'): array
    {
        return [
            'version' => $version, 'action' => $action, 'source_reference' => 'Internal approval memo 2026-10-11',
            'operator' => ['name_en' => 'Operating partner', 'name_ar' => 'الشريك المشغّل', 'description_en' => 'Program coordination.', 'description_ar' => 'تنسيق البرنامج.', 'website' => 'https://example.org/', 'visible' => true],
            'faqs' => [
                ['question_en' => 'How do I apply?', 'question_ar' => 'كيف أتقدم؟', 'answer_en' => 'Create an account.', 'answer_ar' => 'أنشئ حساباً.', 'visible' => true],
                ['question_en' => 'Internal draft question', 'question_ar' => 'سؤال في المسودة', 'answer_en' => 'Not yet published.', 'answer_ar' => 'لم يُنشر بعد.', 'visible' => false],
            ],
        ];
    }

    public function test_editorial_requires_lead_access_and_publishes_only_on_explicit_action(): void
    {
        $this->actingAs($this->account('eoa_staff'))->getJson('/api/v1/eoa/operations/editorial')->assertForbidden();
        $this->putJson('/api/v1/eoa/operations/editorial', $this->content())->assertForbidden();
        $lead = $this->account('eoa_lead');
        $this->actingAs($lead)->getJson('/api/v1/eoa/operations/editorial')->assertOk()->assertJsonPath('data.version', 0);
        $this->putJson('/api/v1/eoa/operations/editorial', $this->content())->assertOk()->assertJsonPath('data.version', 1)->assertJsonPath('published_at', null);
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.editorial', null);
        $this->putJson('/api/v1/eoa/operations/editorial', $this->content(1, 'publish'))->assertOk()->assertJsonPath('data.version', 2);
        $public = $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.editorial.operator.name_en', 'Operating partner')->assertJsonPath('data.editorial.faqs.0.question_en', 'How do I apply?');
        $this->assertArrayNotHasKey('source_reference', $public->json('data.editorial'));
        $this->assertStringNotContainsString('Internal approval memo', $public->getContent());
        $this->assertDatabaseHas('admin_actions', ['admin_id' => $lead->id, 'action' => 'eoa.editorial.publish']);
    }

    public function test_drafts_preserve_the_published_snapshot_and_stale_saves_are_rejected(): void
    {
        $this->actingAs($this->account('eoa_lead'));
        $this->putJson('/api/v1/eoa/operations/editorial', $this->content(0, 'publish'))->assertOk();
        $draft = $this->content(1);
        $draft['operator']['name_en'] = 'Unpublished change';
        $this->putJson('/api/v1/eoa/operations/editorial', $draft)->assertOk()->assertJsonPath('data.version', 2);
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.editorial.operator.name_en', 'Operating partner');
        $this->putJson('/api/v1/eoa/operations/editorial', $this->content(1, 'publish'))->assertConflict();
        $this->getJson('/api/v1/eoa/operations/editorial')->assertOk()->assertJsonPath('data.operator.name_en', 'Unpublished change');
        $this->putJson('/api/v1/eoa/operations/editorial', ['version' => 2, 'action' => 'unpublish'])->assertOk()->assertJsonPath('published_at', null)->assertJsonPath('data.operator.name_en', 'Unpublished change');
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.editorial', null);
    }

    public function test_settings_updates_preserve_editorial_and_partner_roles(): void
    {
        $this->actingAs($this->account('eoa_lead'));
        $this->putJson('/api/v1/eoa/operations/editorial', $this->content(0, 'publish'))->assertOk();
        $program = ProgramService::program();
        $settings = $program->settings;
        $settings['other_feature'] = ['enabled' => true];
        $settings['eoa']['partner_roles'] = ['1' => 'enabler'];
        $program->update(['settings' => $settings]);
        $this->putJson('/api/v1/eoa/operations/settings', ['privacy_status' => 'draft', 'approval_status' => 'draft', 'is_open' => false, 'local_fee_status' => 'draft'])->assertOk();
        $saved = ProgramService::program()->settings;
        $this->assertSame('enabler', $saved['eoa']['partner_roles']['1']);
        $this->assertSame('Operating partner', $saved['eoa']['editorial_published']['operator']['name_en']);
        $this->assertTrue($saved['other_feature']['enabled']);
    }

    public function test_publication_validates_evidence_urls_and_bilingual_content(): void
    {
        $this->actingAs($this->account('eoa_lead'));
        $payload = $this->content(0, 'publish');
        $payload['source_reference'] = '';
        $this->putJson('/api/v1/eoa/operations/editorial', $payload)->assertUnprocessable()->assertJsonValidationErrors('source_reference');
        $payload = $this->content(0, 'publish');
        $payload['operator']['website'] = 'javascript:alert(1)';
        $this->putJson('/api/v1/eoa/operations/editorial', $payload)->assertUnprocessable()->assertJsonValidationErrors('operator.website');
        $payload = $this->content(0, 'publish');
        $payload['operator']['description_ar'] = '';
        $this->putJson('/api/v1/eoa/operations/editorial', $payload)->assertUnprocessable()->assertJsonValidationErrors('operator.description_ar');
    }

    public function test_partner_details_are_editable_without_bypassing_publication_rules(): void
    {
        $organization = DB::table('ecosystem_organizations')->where('slug', 'the-garage')->first();
        $this->actingAs($this->account('eoa_lead'));
        $payload = ['relationship_status' => 'prospective', 'partner_role' => 'enabler', 'support_en' => 'Updated official description.', 'website' => 'https://thegarage.sa/', 'logo_path' => '/partners/the-garage.png'];
        $this->patchJson('/api/v1/eoa/operations/organizations/'.$organization->id, $payload)->assertOk();
        $this->assertSame('enabler', ProgramService::program()->settings['eoa']['partner_roles'][(string) $organization->id]);
        $public = $this->getJson('/api/v1/eoa/program')->assertOk();
        $this->assertArrayNotHasKey((string) $organization->id, $public->json('data.partner_roles'));
        $payload['relationship_status'] = 'confirmed';
        $this->patchJson('/api/v1/eoa/operations/organizations/'.$organization->id, $payload)->assertUnprocessable();
        $payload['relationship_evidence'] = 'Signed partner confirmation.';
        $this->patchJson('/api/v1/eoa/operations/organizations/'.$organization->id, $payload)->assertOk();
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.partner_roles.'. $organization->id, 'enabler');
        $payload['logo_path'] = '/partners/../../private.svg';
        $this->patchJson('/api/v1/eoa/operations/organizations/'.$organization->id, $payload)->assertUnprocessable()->assertJsonValidationErrors('logo_path');
    }
}
