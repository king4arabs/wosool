<?php

namespace Tests\Feature;

use App\Models\{FounderProfile, User};
use App\Services\FounderDirectoryImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FounderCopyRefreshTest extends TestCase
{
    use RefreshDatabase;

    private function patches(): array
    {
        return json_decode(file_get_contents(database_path('data/founder-copy-refresh-2026-10-28.json')), true, 512, JSON_THROW_ON_ERROR);
    }

    private function restoreOldCopy(FounderProfile $profile, array $patch): void
    {
        $changes = $patch['changes'];
        $translations = $profile->translations;
        $translations['ar']['bio'] = $changes['founder_brief_ar']['from'];
        $translations['ar']['position'] = $changes['role_ar']['from'];
        $translations['ar']['tagline'] = $changes['role_ar']['from'].' · '.$patch['company_name_ar'];
        $profile->update([
            'bio' => $changes['founder_brief_en']['from'],
            'position' => $changes['role_en']['from'],
            'tagline' => $changes['role_en']['from'].' · '.$patch['company_name_en'],
            'translations' => $translations,
        ]);
        $profile->companies()->updateExistingPivot($profile->companies()->firstOrFail()->id, ['role' => $changes['role_en']['from']]);
    }

    public function test_existing_imports_receive_copy_once_without_changing_evidence_or_membership(): void
    {
        app(FounderDirectoryImporter::class)->run();
        $patch = $this->patches()[0];
        $profile = FounderProfile::where('directory_key', $patch['slug'])->firstOrFail();
        $evidence = $profile->source_urls;
        $reviewDate = $profile->source_reviewed_at;
        $this->restoreOldCopy($profile, $patch);
        $migration = require database_path('migrations/2026_10_28_180000_refresh_founder_directory_copy.php');
        $migration->up();
        $profile->refresh();
        $this->assertSame($patch['changes']['founder_brief_en']['to'], $profile->bio);
        $this->assertSame($patch['changes']['founder_brief_ar']['to'], $profile->translations['ar']['bio']);
        $this->assertSame('Entrepreneur', $profile->position);
        $this->assertSame('رائد أعمال', $profile->translations['ar']['position']);
        $this->assertSame('Entrepreneur · '.$patch['company_name_en'], $profile->tagline);
        $this->assertSame('Entrepreneur', $profile->companies()->firstOrFail()->pivot->role);
        $this->assertSame($evidence, $profile->source_urls);
        $this->assertEquals($reviewDate, $profile->source_reviewed_at);
        $this->assertNull($profile->user_id);
        $this->assertNull($profile->claimed_at);
        $snapshot = $profile->getAttributes();
        $migration->up();
        $this->assertSame($snapshot, $profile->fresh()->getAttributes());
    }

    public function test_custom_copy_other_languages_and_claimed_profiles_are_preserved(): void
    {
        app(FounderDirectoryImporter::class)->run();
        $patches = $this->patches();
        $profile = FounderProfile::where('directory_key', $patches[0]['slug'])->firstOrFail();
        $this->restoreOldCopy($profile, $patches[0]);
        $translations = $profile->translations;
        $translations['ar']['bio'] = 'نبذة حررها المسؤول';
        $translations['fr'] = ['bio' => 'Texte personnalisé'];
        $profile->update(['bio' => 'Edited biography', 'tagline' => 'Edited tagline', 'translations' => $translations]);
        $owned = FounderProfile::where('directory_key', $patches[1]['slug'])->firstOrFail();
        $this->restoreOldCopy($owned, $patches[1]);
        $owned->update(['user_id' => User::factory()->create()->id]);
        $claimed = FounderProfile::where('directory_key', $patches[2]['slug'])->firstOrFail();
        $this->restoreOldCopy($claimed, $patches[2]);
        $claimed->update(['claimed_at' => now()]);
        $ownedSnapshot = $owned->getAttributes();
        $claimedSnapshot = $claimed->getAttributes();
        (require database_path('migrations/2026_10_28_180000_refresh_founder_directory_copy.php'))->up();
        $profile->refresh();
        $this->assertSame('Edited biography', $profile->bio);
        $this->assertSame('Edited tagline', $profile->tagline);
        $this->assertSame('نبذة حررها المسؤول', $profile->translations['ar']['bio']);
        $this->assertSame($translations['fr'], $profile->translations['fr']);
        $this->assertSame($ownedSnapshot, $owned->fresh()->getAttributes());
        $this->assertSame($claimedSnapshot, $claimed->fresh()->getAttributes());
    }
}
