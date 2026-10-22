<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Eoa\ProgramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EoaPerksTest extends TestCase
{
    use RefreshDatabase;

    public function test_perks_require_approved_offer_confirmed_provider_and_enrolled_participant(): void
    {
        $this->artisan('eoa:install')->assertSuccessful();
        $program = ProgramService::program();
        $org = DB::table('ecosystem_organizations')->where('slug', 'eo-riyadh')->first();
        $lead = User::factory()->create();
        $lead->assignRole('eoa_lead');
        $applicant = User::factory()->create();
        $applicant->assignRole('eoa_applicant');
        $offer = [
            'organization_id' => $org->id, 'title_en' => 'Approved support', 'title_ar' => 'دعم معتمد',
            'details_en' => 'Specific agreed offer', 'details_ar' => 'عرض متفق عليه',
            'sort_order' => 1, 'approval_reference' => 'Agreement reference', 'is_approved' => true,
        ];
        $this->getJson('/api/v1/eoa/perks')->assertUnauthorized();
        $this->actingAs($applicant)->getJson('/api/v1/eoa/perks')->assertForbidden();
        $this->postJson('/api/v1/eoa/operations/perks', $offer)->assertForbidden();
        $this->actingAs($lead)->postJson('/api/v1/eoa/operations/perks', $offer)->assertUnprocessable();
        DB::table('ecosystem_organizations')->where('id', $org->id)->update([
            'relationship_status' => 'confirmed', 'relationship_evidence' => 'Approved relationship',
            'logo_path' => '/partners/eo-riyadh.png',
        ]);
        $this->postJson('/api/v1/eoa/operations/perks', $offer)->assertOk();
        $this->getJson('/api/v1/eoa/program')->assertJsonMissing(['title_en' => 'Approved support']);
        $this->actingAs($applicant)->getJson('/api/v1/eoa/perks')->assertForbidden();
        $participant = $program->participants()->create(['user_id' => $applicant->id, 'status' => 'onboarding']);
        $this->getJson('/api/v1/eoa/perks')->assertForbidden();
        $participant->update(['status' => 'enrolled', 'eoa_finance' => ['global_confirmed' => true]]);
        $this->getJson('/api/v1/eoa/perks')->assertOk()->assertJsonPath('data.0.title_en', 'Approved support')
            ->assertJsonMissing(['approval_reference' => 'Agreement reference']);
        $this->actingAs($lead)->patchJson('/api/v1/eoa/operations/perks/1', array_replace($offer, ['is_approved' => false]))->assertOk();
        $this->actingAs($applicant)->getJson('/api/v1/eoa/perks')->assertJsonCount(0, 'data');
    }
}
