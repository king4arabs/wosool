<?php

namespace Tests\Feature;

use App\Models\EoaMentorProfile;
use App\Models\Program;
use App\Models\User;
use App\Services\Eoa\ProgramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EoaMentorProfilesTest extends TestCase
{
    use RefreshDatabase;

    private const PORTRAIT_FILE = 'eoa/mentors/e56f7544-029e-43fa-89d5-1dff6f3b7bed.jpg';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('eoa:install')->assertSuccessful();
        Role::findOrCreate('admin', 'web');
        Storage::fake('public');
        Storage::disk('public')->putFileAs('eoa/mentors', UploadedFile::fake()->image('portrait.jpg', 320, 320), basename(self::PORTRAIT_FILE));
    }

    private function account(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function payload(array $extra = []): array
    {
        return array_replace([
            'slug' => 'test-mentor', 'name_en' => 'Test Mentor', 'name_ar' => 'مرشد للاختبار',
            'position_en' => 'Growth mentor', 'position_ar' => 'مرشد النمو',
            'bio_en' => 'Supports founders in building sustainable companies.', 'bio_ar' => 'يدعم المؤسسين في بناء الشركات.',
            'expertise_en' => ['Leadership', 'Growth'], 'expertise_ar' => ['القيادة', 'النمو'],
            'is_active' => true, 'publication_status' => 'draft', 'appointment_status' => 'draft', 'public_consent' => false,
            'portrait_path' => '/storage/'.self::PORTRAIT_FILE, 'display_order' => 10,
            'source_references' => [['label' => 'Internal research', 'note' => 'PRIVATE mentor review note.']],
        ], $extra);
    }

    private function confirmed(array $extra = []): array
    {
        return array_replace([
            'publication_status' => 'published', 'appointment_status' => 'confirmed', 'appointment_reference' => 'PRIVATE appointment reference',
            'public_consent' => true, 'consent_reference' => 'PRIVATE consent reference',
        ], $extra);
    }

    private function profile(array $extra = []): EoaMentorProfile
    {
        return EoaMentorProfile::create($this->payload($extra) + ['program_id' => ProgramService::program()->id]);
    }

    public function test_board_members_and_private_mentor_assignments_never_become_public_profiles_automatically(): void
    {
        $coach = $this->account('eoa_coach');
        DB::table('program_mentors')->insert(['program_id' => ProgramService::program()->id, 'user_id' => $coach->id, 'mentor_notes' => 'PRIVATE assignment note.']);
        $response = $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.mentors', [])
            ->assertDontSee($coach->email)->assertDontSee('PRIVATE assignment note.');
        $this->assertNotEmpty($response->json('data.board_members'));
        $this->artisan('eoa:install')->assertSuccessful();
        $this->assertDatabaseCount('eoa_mentor_profiles', 0);
    }

    public function test_public_profiles_require_all_visibility_conditions_and_never_expose_approval_or_account_metadata(): void
    {
        $coach = $this->account('eoa_coach');
        $first = $this->profile($this->confirmed(['slug' => 'first', 'display_order' => 1, 'coach_user_id' => $coach->id, 'verified_at' => now()->toDateString()]));
        $last = $this->profile($this->confirmed(['slug' => 'last', 'display_order' => 20]));
        foreach ([
            ['slug' => 'draft', 'publication_status' => 'draft'], ['slug' => 'inactive', 'is_active' => false],
            ['slug' => 'appointment-draft', 'appointment_status' => 'draft'], ['slug' => 'no-consent', 'public_consent' => false],
            ['slug' => 'no-appointment-reference', 'appointment_reference' => null], ['slug' => 'blank-appointment-reference', 'appointment_reference' => '  '],
            ['slug' => 'no-consent-reference', 'consent_reference' => null], ['slug' => 'blank-consent-reference', 'consent_reference' => '   '],
        ] as $extra) $this->profile($this->confirmed($extra));
        $other = Program::create(['name' => 'Other program', 'slug' => 'other-mentor-program', 'category' => 'growth']);
        $this->profile($this->confirmed(['slug' => 'foreign', 'program_id' => $other->id]));

        $response = $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonCount(2, 'data.mentors')
            ->assertJsonPath('data.mentors.0.id', $first->id)->assertJsonPath('data.mentors.1.id', $last->id)
            ->assertJsonPath('data.mentors.0.expertise_en', ['Leadership', 'Growth'])->assertDontSee('PRIVATE')->assertDontSee($coach->email);
        foreach ($response->json('data.mentors') as $row) {
            foreach (['program_id', 'coach_user_id', 'source_references', 'verified_at', 'appointment_status', 'appointment_reference', 'public_consent', 'consent_reference', 'version'] as $privateField) {
                $this->assertArrayNotHasKey($privateField, $row);
            }
        }
    }

    public function test_public_program_remains_available_before_mentor_migration(): void
    {
        Schema::drop('eoa_mentor_profiles');
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.mentors', []);
    }

    public function test_only_verified_staff_can_manage_mentor_profiles(): void
    {
        $this->getJson('/api/v1/eoa/operations/mentors')->assertUnauthorized();
        foreach (['eoa_applicant', 'eoa_reviewer', 'eoa_coach'] as $role) {
            $this->actingAs($this->account($role))->getJson('/api/v1/eoa/operations/mentors')->assertForbidden();
            $this->postJson('/api/v1/eoa/operations/mentors', $this->payload())->assertForbidden();
        }
        $unverified = User::factory()->unverified()->create();
        $unverified->assignRole('eoa_staff');
        $this->actingAs($unverified)->postJson('/api/v1/eoa/operations/mentors', $this->payload())->assertForbidden();
    }

    public function test_staff_prepare_drafts_but_leads_confirm_appointment_consent_and_publication(): void
    {
        $staff = $this->account('eoa_staff');
        $id = $this->actingAs($staff)->postJson('/api/v1/eoa/operations/mentors', $this->payload())->assertCreated()->assertJsonPath('data.version', 1)->json('data.id');
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$id, ['version' => 1, 'bio_en' => 'Updated draft biography.'])->assertOk()->assertJsonPath('data.version', 2);
        foreach ([['appointment_status' => 'confirmed'], ['public_consent' => true], ['appointment_reference' => 'Unapproved'], ['publication_status' => 'published']] as $changes) {
            $this->patchJson('/api/v1/eoa/operations/mentors/'.$id, $changes + ['version' => 2])->assertForbidden();
        }
        $lead = $this->account('eoa_lead');
        $this->actingAs($lead)->patchJson('/api/v1/eoa/operations/mentors/'.$id, $this->confirmed(['version' => 2]))->assertOk()->assertJsonPath('data.version', 3);
        $this->getJson('/api/v1/eoa/program')->assertJsonCount(1, 'data.mentors');
        $this->actingAs($staff)->patchJson('/api/v1/eoa/operations/mentors/'.$id, ['version' => 3, 'bio_en' => 'Unreviewed live change.'])->assertForbidden();
        $this->actingAs($lead)->patchJson('/api/v1/eoa/operations/mentors/'.$id, ['version' => 3, 'publication_status' => 'draft', 'public_consent' => false])->assertOk();
        $this->getJson('/api/v1/eoa/program')->assertJsonCount(0, 'data.mentors');
        $this->assertDatabaseHas('admin_actions', ['admin_id' => $staff->id, 'action' => 'eoa.mentor_created', 'entity_id' => $id]);
        $this->assertDatabaseHas('admin_actions', ['admin_id' => $lead->id, 'action' => 'eoa.mentor_updated', 'entity_id' => $id]);
    }

    public function test_publishing_requires_a_complete_profile_confirmed_appointment_and_public_consent(): void
    {
        $profile = $this->profile();
        $this->actingAs($this->account('eoa_lead'));
        foreach ([['portrait_path' => null], ['bio_en' => null], ['appointment_status' => 'draft'], ['appointment_reference' => null], ['public_consent' => false], ['consent_reference' => null]] as $missing) {
            $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, $this->confirmed($missing + ['version' => 1]))
                ->assertUnprocessable()->assertJsonValidationErrors(array_key_first($missing));
        }
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, $this->confirmed(['version' => 1]))->assertOk();
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, ['version' => 2, 'portrait_path' => null])->assertUnprocessable();
    }

    public function test_stale_updates_cannot_overwrite_newer_changes_and_foreign_program_profiles_are_scoped(): void
    {
        $profile = $this->profile();
        $this->actingAs($this->account('admin'))->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, ['version' => 1, 'name_en' => 'New approved spelling'])->assertOk();
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, ['version' => 1, 'name_en' => 'Stale spelling'])->assertConflict();
        $this->assertSame('New approved spelling', $profile->fresh()->name_en);
        $other = Program::create(['name' => 'Other program', 'slug' => 'private-mentors', 'category' => 'growth']);
        $foreign = $this->profile(['slug' => 'foreign', 'program_id' => $other->id]);
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$foreign->id, ['version' => 1, 'name_en' => 'Changed'])->assertNotFound();
        $this->getJson('/api/v1/eoa/operations/mentors')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_a_guessed_or_missing_portrait_cannot_be_published_but_a_successful_upload_can(): void
    {
        $profile = $this->profile(['portrait_path' => '/storage/eoa/mentors/955f7544-029e-43fa-89d5-1dff6f3b7bed.jpg']);
        $this->actingAs($this->account('eoa_lead'));
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, $this->confirmed(['version' => 1]))
            ->assertUnprocessable()->assertJsonValidationErrors('portrait_path');
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, $this->confirmed(['version' => 1, 'portrait_path' => '/eoa/mentors/guessed-photo.webp']))
            ->assertUnprocessable()->assertJsonValidationErrors('portrait_path');
        $this->assertDatabaseHas('eoa_mentor_profiles', ['id' => $profile->id, 'version' => 1, 'publication_status' => 'draft']);

        $upload = $this->post('/api/v1/eoa/operations/mentors/'.$profile->id.'/portrait', [
            'version' => 1, 'portrait' => UploadedFile::fake()->image('approved-portrait.png', 320, 320),
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.version', 2);
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, $this->confirmed(['version' => 2]))
            ->assertOk()->assertJsonPath('data.publication_status', 'published');
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonCount(1, 'data.mentors')
            ->assertJsonPath('data.mentors.0.portrait_path', $upload->json('data.portrait_path'));
    }

    public function test_links_expertise_and_optional_coach_account_are_validated_without_granting_roles(): void
    {
        $profile = $this->profile();
        $this->actingAs($this->account('eoa_lead'));
        foreach ([
            ['company_url' => 'javascript:alert(1)'], ['company_url' => 'https://name:password@example.com'],
            ['linkedin_url' => 'https://linkedin.com.evil.example/in/person'], ['linkedin_url' => 'https://linkedin.com/login'],
            ['twitter_url' => 'https://x.com/person/status/123'], ['twitter_url' => 'https://example.com/person'],
            ['portrait_path' => '/storage/eoa/mentors/../../file.php'], ['portrait_path' => 'https://example.com/photo.jpg'],
            ['expertise_en' => ['1', '2', '3', '4', '5', '6', '7']], ['expertise_en' => ['Leadership', 'Leadership']],
        ] as $invalid) {
            $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, $invalid + ['version' => 1])->assertUnprocessable();
        }
        $applicant = $this->account('eoa_applicant');
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, ['version' => 1, 'coach_user_id' => $applicant->id])->assertUnprocessable();
        $this->assertFalse($applicant->fresh()->hasRole('eoa_coach'));
        $coach = $this->account('eoa_coach');
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, ['version' => 1, 'coach_user_id' => $coach->id, 'company_url' => 'https://example.com/', 'linkedin_url' => 'https://sa.linkedin.com/in/person', 'twitter_url' => 'https://x.com/person'])->assertOk();
        $unverified = User::factory()->unverified()->create();
        $unverified->assignRole('eoa_coach');
        $this->patchJson('/api/v1/eoa/operations/mentors/'.$profile->id, ['version' => 2, 'coach_user_id' => $unverified->id])->assertUnprocessable();
    }

    public function test_portrait_uploads_are_versioned_audited_and_reject_unsafe_files_or_live_staff_edits(): void
    {
        Storage::fake('public');
        $profile = $this->profile();
        $this->actingAs($this->account('eoa_staff'));
        $response = $this->post('/api/v1/eoa/operations/mentors/'.$profile->id.'/portrait', [
            'version' => 1, 'portrait' => UploadedFile::fake()->image('untrusted.php.jpg', 320, 320),
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.version', 2);
        $path = $response->json('data.portrait_path');
        $this->assertMatchesRegularExpression('~^/storage/eoa/mentors/[a-f0-9-]{36}\.jpg$~', $path);
        Storage::disk('public')->assertExists(substr($path, strlen('/storage/')));
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.mentor_portrait_updated', 'entity_id' => $profile->id]);
        $this->post('/api/v1/eoa/operations/mentors/'.$profile->id.'/portrait', ['version' => 1, 'portrait' => UploadedFile::fake()->image('stale.jpg', 320, 320)], ['Accept' => 'application/json'])->assertConflict();
        foreach ([UploadedFile::fake()->create('script.svg', 20, 'image/svg+xml'), UploadedFile::fake()->image('large.jpg', 320, 320)->size(2049)] as $file) {
            $this->post('/api/v1/eoa/operations/mentors/'.$profile->id.'/portrait', ['version' => 2, 'portrait' => $file], ['Accept' => 'application/json'])->assertUnprocessable();
        }
        $profile->update($this->confirmed());
        $this->post('/api/v1/eoa/operations/mentors/'.$profile->id.'/portrait', ['version' => 2, 'portrait' => UploadedFile::fake()->image('portrait.jpg', 320, 320)], ['Accept' => 'application/json'])->assertForbidden();
        $this->assertCount(1, Storage::disk('public')->allFiles('eoa/mentors'));
    }
}
