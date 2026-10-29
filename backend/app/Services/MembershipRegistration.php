<?php

namespace App\Services;

use App\Models\{Application, CompanyProfile, FounderProfile, Scorecard, User};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

final class MembershipRegistration
{
    public static function state(User $user): ?string
    {
        if (! $user->community_registration_started_at) return null;
        if (! $user->hasVerifiedEmail()) return 'verify';
        $application = Application::where('user_id', $user->id)->latest('id')->first();
        if (! $application?->onboarding_data) return 'profile';
        if ($application->status === 'approved' && $user->hasRole('member') && $user->founderProfile?->status === 'active') return 'active';
        return 'review';
    }

    /** Recover accounts created by the older registration flow after password authentication. */
    public function resumeLegacyRegistration(User $user): void
    {
        if ($user->community_registration_started_at || $user->is_accelerator_applicant
            || filled($user->role_token) || $user->roles()->exists() || $user->founderProfile()->exists()) return;

        // Do not infer consent, verification, approval, or membership from having an account.
        $user->forceFill(['community_registration_started_at' => now()])->save();
    }

    /** Called within the application's approval transaction, and safe to repeat. */
    public function publish(Application $application): void
    {
        $user = $application->user;
        if (! $user?->hasVerifiedEmail()) return;
        $data = $application->onboarding_data;
        if (! $data) {
            if (! $user->community_registration_started_at) $user->assignRole(Role::findOrCreate('member', 'web'));
            return;
        }
        $profile = FounderProfile::where('user_id', $user->id)->lockForUpdate()->first();
        if (! $profile) $profile = new FounderProfile(['user_id' => $user->id, 'slug' => $this->slug(FounderProfile::class, $application->full_name)]);
        // Publish the reviewed application once; repeated approvals preserve subsequent owner edits.
        if (! $profile->exists || $profile->status !== 'active') {
            $profile->fill(['display_name' => $application->full_name, 'position' => $data['position'],
                'tagline' => $data['position'].' · '.$application->company_name, 'bio' => $data['bio'],
                'location' => $application->location, 'country_code' => $data['country_code'],
                'sector' => $application->sector, 'stage' => $application->stage,
                'linkedin_url' => $application->linkedin_url, 'website_url' => $application->company_website,
                'needs' => [$application->what_you_need], 'offers' => [$application->what_you_offer],
                'status' => 'active', 'is_public' => true, 'is_verified' => false,
                'avatar_url' => $data['avatar_url'] ?? null])->save();
        }
        $company = $profile->companies()->wherePivot('is_primary', true)->first();
        if (! $company) {
            $company = CompanyProfile::create(['slug' => $this->slug(CompanyProfile::class, $application->company_name),
                'name' => $application->company_name, 'legal_name' => $application->company_name,
                'description' => $data['company_description'], 'website' => $application->company_website, 'domain_url' => $application->company_website,
                'location' => $application->location, 'hq_location' => $application->location,
                'country_code' => $data['country_code'], 'sector' => $application->sector,
                'stage' => $application->stage, 'operational_stage' => $application->stage,
                'founded_year' => $data['founded_year'], 'team_size' => $data['team_size'],
                'logo_url' => $data['logo_url'] ?? null, 'status' => 'active', 'is_public' => true]);
            $profile->companies()->attach($company->id, ['role' => $data['position'], 'is_primary' => true]);
        }
        if (! $company->is_public && $company->founders()->count() === 1) $company->update(['is_public' => true]);
        Scorecard::firstOrCreate(['founder_profile_id' => $profile->id], ['aggregate_score' => 0, 'momentum' => 0, 'growth' => 0, 'readiness' => 0, 'support_delta' => 0, 'historical_logs' => []]);
        $user->assignRole(Role::findOrCreate('member', 'web'));
    }

    public function linkVerifiedApplications(User $user): void
    {
        if (! $user->hasVerifiedEmail()) return;
        DB::transaction(function () use ($user) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            Application::whereRaw('LOWER(email) = ?', [strtolower($user->email)])->whereNull('user_id')->where('status', 'approved')->update(['user_id' => $user->id, 'invite_token' => null]);
            foreach (Application::where('user_id', $user->id)->where('status', 'approved')->get() as $application) $this->publish($application);
        });
    }

    private function slug(string $model, string $name): string
    {
        $base = Str::slug($name) ?: 'founder';
        return $base.'-'.Str::lower((string) Str::ulid());
    }
}
