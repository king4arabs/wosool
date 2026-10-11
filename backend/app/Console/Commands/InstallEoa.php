<?php

namespace App\Console\Commands;

use App\Models\Program;
use App\Models\EoaBoardMember;
use App\Services\Eoa\ProgramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

class InstallEoa extends Command
{
    protected $signature = 'eoa:install';

    protected $description = 'Install EO Accelerator defaults and sourced ecosystem records without overwriting local decisions.';

    public function handle(): int
    {
        if (Program::onlyTrashed()->where('slug', ProgramService::SLUG)->exists()) {
            $this->error('A historical EOA program exists. Review and restore it explicitly before installation.');

            return self::FAILURE;
        }
        DB::transaction(function () {
            foreach (['eoa_applicant', 'eoa_lead', 'eoa_staff', 'eoa_reviewer', 'eoa_coach'] as $role) {
                Role::findOrCreate($role, 'web');
            }
            $program = Program::firstOrCreate(['slug' => ProgramService::SLUG], [
                'name' => 'EO Riyadh Accelerator', 'title' => 'EO Riyadh Accelerator', 'category' => 'growth',
                'description' => 'Wosool digital gateway for EO Riyadh Accelerator. Saudi Founders. Global Connections. Extraordinary Growth.',
                'duration' => '2 years', 'program_type' => 'accelerator', 'city_region' => 'Riyadh', 'language' => 'ar',
                'visibility' => 'public', 'is_open' => false, 'status_flow' => 'draft', 'format' => 'cohort-based',
                'settings' => ['eoa' => ['approval_status' => 'draft', 'local_fee_status' => 'draft']],
            ]);
            if (! DB::table('eoa_tracks')->where('program_id', $program->id)->exists()) {
                DB::table('eoa_tracks')->insert(['program_id' => $program->id, 'name_ar' => 'مسار EO Riyadh Accelerator', 'name_en' => 'EO Riyadh Accelerator', 'description_ar' => 'تعلم ونمو ومساءلة للمؤسسين استعداداً لعضوية EO.', 'description_en' => 'Learning, growth and accountability for founders preparing for EO membership.', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
            }
            $rows = json_decode(file_get_contents(database_path('data/eoa-organizations.json')), true, 512, JSON_THROW_ON_ERROR);
            foreach ($rows as $row) {
                // Research imports are repeatable; existing confirmations and editorial changes survive.
                if (! DB::table('ecosystem_organizations')->where('slug', $row['slug'])->exists()) {
                    DB::table('ecosystem_organizations')->insert($row + ['created_at' => now(), 'updated_at' => now()]);
                }
            }
            $boardFile = database_path('data/eoa-board-2026-27.json');
            if (Schema::hasTable('eoa_board_members') && is_file($boardFile)) {
                foreach (json_decode(file_get_contents($boardFile), true, 512, JSON_THROW_ON_ERROR) as $row) {
                    // Insert only: every local edit, publication decision and later board term survives reinstallation.
                    EoaBoardMember::firstOrCreate(['program_id' => $program->id, 'slug' => $row['slug']], $row);
                }
            }
        });
        $this->info('EOA installed. No accounts, launch approvals, enrollments or partnership confirmations were created.');

        return self::SUCCESS;
    }
}
