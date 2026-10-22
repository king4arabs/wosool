<?php

namespace App\Services;

use App\Jobs\SendApplicationUpdate;
use App\Models\ApplicationEvent;
use App\Models\CompanyProfile;
use App\Models\FounderProfile;
use App\Models\Program;
use App\Models\ProgramApplication;
use App\Models\ProgramParticipant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AcceleratorGateway
{
    public const SLUG = 'eo-riyadh-accelerator';

    public const CONSENT = 'accelerator-2026-10-08';

    public const TRANSITIONS = [
        'draft' => ['submitted'],
        'submitted' => ['under_review'],
        'under_review' => ['information_requested', 'shortlisted', 'waitlisted', 'declined'],
        'information_requested' => ['submitted'],
        'shortlisted' => ['accepted', 'waitlisted', 'declined', 'information_requested'],
        'waitlisted' => ['under_review', 'accepted', 'declined'],
        'accepted' => ['onboarded'],
        'declined' => [],
        'onboarded' => [],
    ];

    public static function program(): Program
    {
        return Program::where('slug', self::SLUG)->firstOrFail();
    }

    public static function defaults(): array
    {
        return ['min_revenue_usd' => 250000, 'max_revenue_usd' => 999999, 'allow_venture_backed' => true,
            'intake_enabled' => false, 'global_fee_usd' => 1750, 'local_fee' => null, 'local_dates' => null,
            'source_url' => 'https://eonetwork.org/accelerator/faqs/', 'verified_at' => '2026-10-08'];
    }

    public static function settings(?Program $program = null): array
    {
        $program ??= Program::where('slug', self::SLUG)->first();
        $settings = array_replace(self::defaults(), ($program?->settings ?? [])['gateway'] ?? []);
        // Compatibility discovery only; /EOA owns all intake approvals and writes.
        $settings['intake_enabled'] = false;

        return $settings;
    }

    public static function eligibility(array $data, ?Program $program = null): array
    {
        $rules = self::settings($program);
        $revenue = $data['annual_revenue_usd'] ?? null;
        $funding = $data['private_funding_usd'] ?? null;
        $inRange = fn ($value) => is_numeric($value) && $value >= $rules['min_revenue_usd'] && $value <= $rules['max_revenue_usd'];
        $revenuePath = $inRange($revenue);
        $venturePath = $rules['allow_venture_backed'] && ($data['venture_backed'] ?? false) && $inRange($funding);
        $eligible = ($data['is_owner'] ?? false) && ($data['is_operating'] ?? false) && ($revenuePath || $venturePath);

        return ['result' => $eligible ? 'potentially_eligible' : 'needs_discussion', 'route' => $revenuePath ? 'revenue' : ($venturePath ? 'venture_backed' : null), 'rules' => $rules];
    }

    public static function isAdmin(User $user): bool
    {
        return $user->hasRole('admin') || ($user->getAttributes()['role_token'] ?? null) === 'admin';
    }

    public static function canReview(User $user, ProgramApplication $application): bool
    {
        return self::isAdmin($user) || ($user->hasRole('accelerator-reviewer') && $application->assigned_reviewer_id === $user->id);
    }

    public function transition(ProgramApplication $application, User $actor, string $target, ?string $message, int $revision): ProgramApplication
    {
        return DB::transaction(function () use ($application, $actor, $target, $message, $revision) {
            $application = ProgramApplication::lockForUpdate()->findOrFail($application->id);
            abort_unless($application->revision === $revision, 409, 'The application changed. Reload before continuing.');
            $from = $application->status;
            if (! in_array($target, self::TRANSITIONS[$from] ?? [], true)) {
                throw ValidationException::withMessages(['status' => ['This status transition is not allowed.']]);
            }
            $ownerAction = in_array($target, ['submitted', 'onboarded'], true);
            abort_unless($ownerAction ? $actor->id === $application->user_id : self::canReview($actor, $application), 403);
            if (in_array($target, ['accepted', 'waitlisted', 'declined'], true)) {
                abort_unless(self::isAdmin($actor), 403);
            }
            if (in_array($target, ['information_requested', 'declined'], true) && ! trim((string) $message)) {
                throw ValidationException::withMessages(['message' => ['Explain the required information or decision.']]);
            }
            $application->status = $target;
            $application->revision++;
            if ($target === 'submitted') {
                $application->submitted_at ??= now();
                $application->consented_at = now();
                $application->consent_version = self::CONSENT;
                $this->createProfiles($application, $actor);
            } elseif (! $ownerAction) {
                $application->reviewed_by = $actor->id;
                $application->reviewed_at = now();
            }
            $application->save();
            if ($target === 'onboarded') {
                ProgramParticipant::updateOrCreate(['program_id' => $application->program_id, 'user_id' => $application->user_id],
                    ['application_id' => $application->id, 'cohort_id' => $application->cohort_id, 'status' => 'enrolled', 'enrolled_at' => now()]);
            }
            $event = ApplicationEvent::create(['application_id' => $application->id, 'actor_id' => $actor->id,
                'from_status' => $from, 'to_status' => $target, 'message' => $message, 'is_internal' => false]);
            if (config('gateway.email_updates')) {
                SendApplicationUpdate::dispatch($event->id);
            }

            return $application;
        });
    }

    private function createProfiles(ProgramApplication $application, User $user): void
    {
        $data = $application->gateway_payload;
        // New applicants remain private; existing community profiles are never overwritten by an application snapshot.
        $founder = FounderProfile::firstOrCreate(['user_id' => $user->id], [
            'slug' => 'applicant-'.Str::uuid(), 'tagline' => $data['founder_role'], 'bio' => $data['founder_bio'],
            'location' => $data['city'], 'sector' => $data['sector'], 'stage' => $data['company_stage'],
            'is_public' => false, 'status' => 'pending',
        ]);
        if (! $application->company_profile_id) {
            $company = CompanyProfile::create(['name' => $data['company_name'], 'slug' => 'applicant-company-'.Str::uuid(),
                'description' => $data['company_description'], 'website' => $data['company_website'] ?? null,
                'sector' => $data['sector'], 'stage' => $data['company_stage'], 'location' => $data['city'],
                'team_size' => $data['team_size'], 'is_public' => false, 'status' => 'pending']);
            $founder->companies()->attach($company->id, ['role' => $data['founder_role'], 'is_primary' => false]);
            $application->company_profile_id = $company->id;
        }
    }
}
