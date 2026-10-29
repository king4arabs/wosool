<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\{DB, Log, Validator};
use Spatie\Permission\Models\Role;

class ManagePlatformAdmin extends Command
{
    protected $signature = 'wosool:admin {email : Existing account email} {--grant : Grant the platform admin role} {--reason= : Non-sensitive change reference}';

    protected $description = 'Inspect an account or explicitly grant admin to an email-verified account. Never creates or verifies accounts.';

    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->argument('email')));
        $reason = trim((string) $this->option('reason'));
        if (Validator::make(['email' => $email], ['email' => 'required|email|max:255'])->fails()) {
            $this->error('Provide a valid account email.');
            return self::FAILURE;
        }
        if ($this->option('grant') && ($reason === '' || strlen($reason) > 120 || preg_match('/[\x00-\x1F\x7F]/', $reason))) {
            $this->error('Grant requires a non-sensitive --reason of 1–120 characters.');
            return self::FAILURE;
        }

        return DB::transaction(function () use ($email, $reason) {
            $users = User::whereRaw('LOWER(email) = ?', [$email])->lockForUpdate()->limit(2)->get();
            if ($users->count() !== 1) {
                $this->error('Expected exactly one existing account; no changes made.');
                return self::FAILURE;
            }
            $user = $users->first();
            $this->line('Account ID: '.$user->id);
            $this->line('Email verified: '.($user->hasVerifiedEmail() ? 'yes' : 'no'));
            $this->line('Platform admin: '.($user->isPlatformAdmin() ? 'yes' : 'no'));
            if (! $this->option('grant')) {
                $this->info('Inspection only; no changes made.');
                return self::SUCCESS;
            }
            if (! $user->hasVerifiedEmail()) {
                $this->error('Complete email verification before granting admin.');
                return self::FAILURE;
            }
            if ($user->isPlatformAdmin()) {
                $this->info('Account already has admin access; no changes made.');
                return self::SUCCESS;
            }
            $user->assignRole(Role::findOrCreate('admin', 'web'));
            DB::afterCommit(fn () => Log::notice('Platform admin granted from console', [
                'user_id' => $user->id, 'change_reference' => $reason,
            ]));
            $this->info('Admin role granted. Verify access with a fresh sign-in.');
            return self::SUCCESS;
        });
    }
}
