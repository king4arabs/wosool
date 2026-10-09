<?php

namespace App\Console\Commands;

use App\Services\Eoa\ProgramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckGatewayReadiness extends Command
{
    protected $signature = 'wosool:check-readiness {--production : Require live-intake configuration}';

    protected $description = 'Check required services and production intake settings without printing secrets.';

    public function handle(): int
    {
        $checks = [];
        try {
            DB::select('select 1');
            $checks['database'] = true;
            $program = ProgramService::program();
            $checks['eoa_program'] = (bool) $program;
            DB::table('eoa_documents')->limit(1)->count();
            DB::table('eoa_notifications')->limit(1)->count();
            $checks['eoa_schema'] = true;
            $checks['migrations'] = count(array_diff(array_keys(app('migrator')->getMigrationFiles(database_path('migrations'))), app('migration.repository')->getRan())) === 0;
        } catch (\Throwable) {
            $checks['database_and_schema'] = false;
        }
        $checks['application_key'] = (bool) config('app.key');
        if ($this->option('production') || app()->isProduction()) {
            $checks['production_environment'] = app()->isProduction();
            $checks['debug_disabled'] = ! config('app.debug');
            $checks['https_frontend'] = str_starts_with((string) config('app.frontend_url'), 'https://');
            $checks['https_backend'] = str_starts_with((string) config('app.url'), 'https://');
            $checks['secure_session_cookie'] = (bool) config('session.secure');
            $checks['persistent_sessions'] = in_array(config('session.driver'), ['database', 'redis'], true);
            $checks['persistent_queue'] = in_array(config('queue.default'), ['database', 'redis', 'sqs'], true);
            $checks['persistent_cache'] = in_array(config('cache.default'), ['database', 'redis'], true);
            $checks['delivery_transport'] = ! in_array(config('mail.default'), ['log', 'array', null], true);
            $settings = isset($program) ? ProgramService::settings($program) : [];
            $checks['privacy_approved'] = isset($program) && ProgramService::collectionReady();
            $checks['program_approved'] = ($settings['approval_status'] ?? '') === 'approved' && ! empty($settings['approval_reference']);
            $checks['participation_terms'] = ! empty($settings['participation_terms_ar']) && ! empty($settings['participation_terms_en']);
            $checks['local_fees_approved'] = ($settings['local_fee_status'] ?? '') === 'approved';
            $checks['legacy_applications_reviewed'] = isset($program) && ! $program->applications()->whereNotNull('gateway_payload')->exists();
            $checks['verified_lead'] = \App\Models\User::role(['admin', 'eoa_lead'])->whereNotNull('email_verified_at')->exists();
        }
        foreach ($checks as $name => $ok) {
            $this->line(($ok ? 'PASS ' : 'FAIL ').$name);
        }
        $this->line('Worker supervision, mail delivery, backup recovery and browser acceptance require separate evidence.');

        return in_array(false, $checks, true) ? self::FAILURE : self::SUCCESS;
    }
}
