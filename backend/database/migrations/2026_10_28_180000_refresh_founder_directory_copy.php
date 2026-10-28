<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Frozen before/after copy: do not derive historical changes from a future catalog.
        $patches = json_decode(file_get_contents(database_path('data/founder-copy-refresh-2026-10-28.json')), true, 512, JSON_THROW_ON_ERROR);

        DB::transaction(function () use ($patches) {
            foreach ($patches as $patch) {
                $profile = DB::table('founder_profiles')->where('directory_key', $patch['slug'])
                    ->whereNull('user_id')->whereNull('claimed_at')->lockForUpdate()->first();
                if (! $profile) {
                    continue;
                }

                $changes = $patch['changes'];
                $updates = [];
                foreach (['role_en' => 'position', 'founder_brief_en' => 'bio'] as $source => $column) {
                    if (isset($changes[$source]) && $profile->{$column} === $changes[$source]['from']) {
                        $updates[$column] = $changes[$source]['to'];
                    }
                }
                if (isset($changes['role_en']) && $profile->tagline === $changes['role_en']['from'].' · '.$patch['company_name_en']) {
                    $updates['tagline'] = $changes['role_en']['to'].' · '.$patch['company_name_en'];
                }

                $translations = json_decode($profile->translations ?? '{}', true, 512, JSON_THROW_ON_ERROR);
                $translated = false;
                if (is_array($translations) && isset($translations['ar']) && is_array($translations['ar'])) {
                    foreach (['role_ar' => 'position', 'founder_brief_ar' => 'bio'] as $source => $column) {
                        if (isset($changes[$source]) && ($translations['ar'][$column] ?? null) === $changes[$source]['from']) {
                            $translations['ar'][$column] = $changes[$source]['to'];
                            $translated = true;
                        }
                    }
                    if (isset($changes['role_ar']) && ($translations['ar']['tagline'] ?? null) === $changes['role_ar']['from'].' · '.$patch['company_name_ar']) {
                        $translations['ar']['tagline'] = $changes['role_ar']['to'].' · '.$patch['company_name_ar'];
                        $translated = true;
                    }
                }
                if ($translated) {
                    $updates['translations'] = json_encode($translations, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
                }
                if ($updates) {
                    DB::table('founder_profiles')->where('id', $profile->id)->update([...$updates, 'updated_at' => now()]);
                }
                if (isset($changes['role_en'])) {
                    DB::table('founder_company_links')->where('founder_profile_id', $profile->id)
                        ->whereIn('company_profile_id', DB::table('company_profiles')->select('id')->where('directory_key', $patch['company_key']))
                        ->where('role', $changes['role_en']['from'])
                        ->update(['role' => $changes['role_en']['to'], 'updated_at' => now()]);
                }
            }
        });
    }

    public function down(): void
    {
        // Preserve corrected wording and subsequent editorial changes on rollback.
    }
};
