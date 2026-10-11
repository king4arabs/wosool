<?php

namespace Tests\Feature;

use App\Models\EoaBoardMember;
use App\Models\Program;
use App\Models\User;
use App\Services\Eoa\ProgramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EoaBoardMembersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('eoa:install')->assertSuccessful();
        EoaBoardMember::query()->delete();
        Role::findOrCreate('admin', 'web');
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
            'slug' => 'test-board-member', 'name_en' => 'Board Member', 'name_ar' => 'عضو مجلس الإدارة',
            'position_en' => 'Membership Chair', 'position_ar' => 'رئيس العضوية',
            'board_term' => '2026/27', 'is_active' => true, 'publication_status' => 'draft',
            'portrait_path' => '/eoa/board/test-member.webp', 'display_order' => 10,
            'source_references' => [['label' => 'Board poster', 'note' => 'User-supplied chapter board roster.']],
        ], $extra);
    }

    private function member(array $extra = []): EoaBoardMember
    {
        return EoaBoardMember::create($this->payload($extra) + ['program_id' => ProgramService::program()->id]);
    }

    public function test_public_board_only_exposes_ordered_active_published_members_without_internal_sources(): void
    {
        $first = $this->member(['slug' => 'first', 'publication_status' => 'published', 'display_order' => 1, 'verified_at' => now()->toDateString()]);
        $last = $this->member(['slug' => 'last', 'publication_status' => 'published', 'display_order' => 20]);
        $this->member(['slug' => 'draft']);
        $this->member(['slug' => 'inactive', 'publication_status' => 'published', 'is_active' => false]);
        $otherProgram = Program::create(['name' => 'Other program', 'slug' => 'other-board-program', 'category' => 'growth']);
        $this->member(['slug' => 'other-program', 'program_id' => $otherProgram->id, 'publication_status' => 'published']);

        $response = $this->getJson('/api/v1/eoa/program')->assertOk()
            ->assertJsonCount(2, 'data.board_members')
            ->assertJsonPath('data.board_members.0.id', $first->id)
            ->assertJsonPath('data.board_members.1.id', $last->id);
        foreach ($response->json('data.board_members') as $row) {
            $this->assertArrayNotHasKey('source_references', $row);
            $this->assertArrayNotHasKey('verified_at', $row);
            $this->assertArrayNotHasKey('program_id', $row);
        }
    }

    public function test_board_is_empty_during_an_additive_migration_rollout(): void
    {
        Schema::drop('eoa_board_members');
        $this->getJson('/api/v1/eoa/program')->assertOk()->assertJsonPath('data.board_members', []);
    }

    public function test_applicants_reviewers_coaches_and_unverified_staff_cannot_manage_board_members(): void
    {
        $this->getJson('/api/v1/eoa/operations/board-members')->assertUnauthorized();
        foreach (['eoa_applicant', 'eoa_reviewer', 'eoa_coach'] as $role) {
            $this->actingAs($this->account($role))->getJson('/api/v1/eoa/operations/board-members')->assertForbidden();
            $this->postJson('/api/v1/eoa/operations/board-members', $this->payload())->assertForbidden();
        }
        $unverified = User::factory()->unverified()->create();
        $unverified->assignRole('eoa_staff');
        $this->actingAs($unverified)->postJson('/api/v1/eoa/operations/board-members', $this->payload())->assertForbidden();
    }

    public function test_staff_can_prepare_drafts_but_only_leadership_can_publish_or_change_live_cards(): void
    {
        $staff = $this->account('eoa_staff');
        $id = $this->actingAs($staff)->postJson('/api/v1/eoa/operations/board-members', $this->payload())
            ->assertCreated()->assertJsonPath('data.publication_status', 'draft')->json('data.id');
        $this->patchJson('/api/v1/eoa/operations/board-members/'.$id, ['company_name_en' => 'Example Company'])->assertOk();
        $this->patchJson('/api/v1/eoa/operations/board-members/'.$id, ['publication_status' => 'published'])->assertForbidden();
        $this->postJson('/api/v1/eoa/operations/board-members', $this->payload(['slug' => 'second', 'publication_status' => 'published']))->assertForbidden();
        $this->getJson('/api/v1/eoa/program')->assertJsonCount(0, 'data.board_members');

        $lead = $this->account('eoa_lead');
        $this->actingAs($lead)->patchJson('/api/v1/eoa/operations/board-members/'.$id, ['publication_status' => 'published'])->assertOk();
        $this->getJson('/api/v1/eoa/program')->assertJsonCount(1, 'data.board_members');
        $this->actingAs($staff)->patchJson('/api/v1/eoa/operations/board-members/'.$id, ['company_name_en' => 'Unreviewed change'])->assertForbidden();
        $this->patchJson('/api/v1/eoa/operations/board-members/'.$id, ['publication_status' => 'draft'])->assertForbidden();
        $this->actingAs($lead)->patchJson('/api/v1/eoa/operations/board-members/'.$id, ['is_active' => false])->assertOk();
        $this->getJson('/api/v1/eoa/program')->assertJsonCount(0, 'data.board_members');
        $this->assertDatabaseHas('admin_actions', ['admin_id' => $staff->id, 'action' => 'eoa.board_created', 'entity_id' => $id]);
        $this->assertDatabaseHas('admin_actions', ['admin_id' => $lead->id, 'action' => 'eoa.board_updated', 'entity_id' => $id]);
    }

    public function test_members_cannot_be_edited_outside_the_canonical_program(): void
    {
        $other = Program::create(['name' => 'Other program', 'slug' => 'private-board-program', 'category' => 'growth']);
        $row = $this->member(['program_id' => $other->id]);
        $this->actingAs($this->account('admin'))->patchJson('/api/v1/eoa/operations/board-members/'.$row->id, ['name_en' => 'Changed'])->assertNotFound();
        $this->getJson('/api/v1/eoa/operations/board-members')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_publishing_requires_a_portrait_and_live_cards_cannot_lose_it(): void
    {
        $row = $this->member(['portrait_path' => null]);
        $this->actingAs($this->account('eoa_lead'))->patchJson('/api/v1/eoa/operations/board-members/'.$row->id, ['publication_status' => 'published'])
            ->assertUnprocessable()->assertJsonValidationErrors('portrait_path');
        $this->patchJson('/api/v1/eoa/operations/board-members/'.$row->id, ['publication_status' => 'published', 'portrait_path' => '/eoa/board/verified-portrait.webp'])->assertOk();
        $this->patchJson('/api/v1/eoa/operations/board-members/'.$row->id, ['portrait_path' => null])
            ->assertUnprocessable()->assertJsonValidationErrors('portrait_path');
        $this->patchJson('/api/v1/eoa/operations/board-members/'.$row->id, ['publication_status' => 'draft', 'portrait_path' => null])->assertOk();
    }

    public function test_link_and_portrait_path_validation_blocks_unsafe_or_mislabelled_destinations(): void
    {
        $row = $this->member();
        $this->actingAs($this->account('eoa_lead'));
        foreach ([
            ['company_url' => 'javascript:alert(1)'],
            ['company_url' => 'https://name:secret@example.com'],
            ['company_url' => '//example.com'],
            ['linkedin_url' => 'https://linkedin.com.evil.example/in/person'],
            ['twitter_url' => 'https://example.com/member'],
            ['instagram_url' => 'https://instagram.com/'],
            ['portrait_path' => 'https://example.com/portrait.jpg'],
            ['portrait_path' => '/eoa/board/../../portrait.jpg'],
            ['portrait_path' => '/eoa/board/portrait.svg'],
        ] as $payload) {
            $this->patchJson('/api/v1/eoa/operations/board-members/'.$row->id, $payload)->assertUnprocessable();
        }
        $this->patchJson('/api/v1/eoa/operations/board-members/'.$row->id, [
            'company_url' => 'https://example.com/company', 'linkedin_url' => 'https://www.linkedin.com/in/person/',
            'twitter_url' => 'https://x.com/person', 'facebook_url' => 'https://www.facebook.com/person',
            'instagram_url' => 'https://www.instagram.com/person/',
        ])->assertOk();
    }

    public function test_portrait_uploads_use_generated_names_and_reject_scripts_large_files_and_unauthorized_changes(): void
    {
        Storage::fake('public');
        $row = $this->member();
        $staff = $this->account('eoa_staff');
        $this->actingAs($staff);
        $response = $this->post('/api/v1/eoa/operations/board-members/'.$row->id.'/portrait', [
            'portrait' => UploadedFile::fake()->image('untrusted-name.php.jpg', 320, 320),
        ], ['Accept' => 'application/json'])->assertOk();
        $path = $response->json('data.portrait_path');
        $this->assertMatchesRegularExpression('~^/storage/eoa/board/[a-f0-9-]{36}\.jpg$~', $path);
        Storage::disk('public')->assertExists(substr($path, strlen('/storage/')));
        $this->assertDatabaseHas('admin_actions', ['action' => 'eoa.board_portrait_updated', 'entity_id' => $row->id]);
        foreach ([
            UploadedFile::fake()->create('script.svg', 20, 'image/svg+xml'),
            UploadedFile::fake()->image('oversized.jpg', 320, 320)->size(2049),
        ] as $file) {
            $this->post('/api/v1/eoa/operations/board-members/'.$row->id.'/portrait', ['portrait' => $file], ['Accept' => 'application/json'])->assertUnprocessable();
        }
        $row->update(['publication_status' => 'published']);
        $this->post('/api/v1/eoa/operations/board-members/'.$row->id.'/portrait', ['portrait' => UploadedFile::fake()->image('portrait.jpg', 320, 320)], ['Accept' => 'application/json'])->assertForbidden();
        $this->assertCount(1, Storage::disk('public')->allFiles('eoa/board'));
    }

    public function test_reinstall_does_not_overwrite_local_board_edits_or_publication_decisions(): void
    {
        $this->artisan('eoa:install')->assertSuccessful();
        $member = EoaBoardMember::query()->firstOrFail();
        $count = EoaBoardMember::count();
        $member->update(['name_en' => 'Locally edited name', 'publication_status' => 'draft', 'is_active' => false]);
        $this->artisan('eoa:install')->assertSuccessful();
        $this->assertSame($count, EoaBoardMember::count());
        $this->assertDatabaseHas('eoa_board_members', ['id' => $member->id, 'name_en' => 'Locally edited name', 'publication_status' => 'draft', 'is_active' => false]);
    }
}
