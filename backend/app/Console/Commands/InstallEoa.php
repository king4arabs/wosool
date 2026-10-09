<?php

namespace App\Console\Commands;

use App\Models\Program;
use App\Services\Eoa\ProgramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
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
            Program::firstOrCreate(['slug' => ProgramService::SLUG], [
                'name' => 'EO Riyadh Accelerator', 'title' => 'EO Riyadh Accelerator', 'category' => 'growth',
                'description' => 'Wosool digital gateway for EO Riyadh Accelerator. Saudi Founders. Global Connections. Extraordinary Growth.',
                'duration' => '2 years', 'program_type' => 'accelerator', 'city_region' => 'Riyadh', 'language' => 'ar',
                'visibility' => 'public', 'is_open' => false, 'status_flow' => 'draft', 'format' => 'cohort-based',
                'settings' => ['eoa' => ['approval_status' => 'draft', 'local_fee_status' => 'draft']],
            ]);
            $rows = json_decode(file_get_contents(database_path('data/eoa-organizations.json')), true, 512, JSON_THROW_ON_ERROR);
            foreach ($rows as $row) {
                // Research imports are repeatable; existing confirmations and editorial changes survive.
                if (! DB::table('ecosystem_organizations')->where('slug', $row['slug'])->exists()) {
                    DB::table('ecosystem_organizations')->insert($row + ['created_at' => now(), 'updated_at' => now()]);
                }
            }
        });
        $this->info('EOA installed. No accounts, launch approvals, enrollments or partnership confirmations were created.');

        return self::SUCCESS;
    }
}
