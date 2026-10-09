<?php

namespace App\Services\Eoa;

use App\Models\ProgramApplication;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class Access
{
    public static function platformAdmin(User $user): bool
    {
        return ($user->getAttributes()['role_token'] ?? '') === 'admin' || $user->hasRole('admin');
    }

    public static function lead(User $user): bool
    {
        return ($user->getAttributes()['role_token'] ?? '') === 'admin' || $user->hasAnyRole(['admin', 'eoa_lead']);
    }

    public static function staff(User $user): bool
    {
        return self::lead($user) || $user->hasRole('eoa_staff');
    }

    public static function reviewer(User $user): bool
    {
        return self::staff($user) || $user->hasRole('eoa_reviewer');
    }

    public static function application(User $user, ProgramApplication $application): bool
    {
        return self::staff($user) || ($user->hasRole('eoa_reviewer') && DB::table('eoa_reviewers')
            ->where('application_id', $application->id)->where('user_id', $user->id)->exists());
    }
}
