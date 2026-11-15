<?php

namespace App\Services;

use App\Models\{AdminAction, Application, FounderIdentityReview, FounderProfile, User};
use Illuminate\Support\Facades\DB;

/** Identity suggestions are private evidence for an administrator, never a claim token. */
final class FounderIdentityService
{
    public static function normalize(?string $value): string
    {
        $value = mb_strtolower(trim($value ?? ''));
        $value = strtr($value, ['أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ى' => 'ي']);
        $value = preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}]/u', '', $value);
        return trim(preg_replace('/[^\p{L}\p{N}]+/u', ' ', $value));
    }

    public static function website(?string $value, bool $linkedin = false): ?string
    {
        $url = parse_url(trim($value ?? ''));
        if (! $url || ! in_array(strtolower($url['scheme'] ?? ''), ['https', 'http'], true) || isset($url['user']) || isset($url['pass'])) return null;
        $host = preg_replace('/^www\./', '', strtolower($url['host'] ?? ''));
        $path = rtrim($url['path'] ?? '', '/');
        if (! $host || ($linkedin && ($host !== 'linkedin.com' && ! str_ends_with($host, '.linkedin.com')))) return null;
        if ($linkedin && ! str_starts_with($path, '/in/')) return null;
        return ($linkedin ? 'linkedin.com' : $host).(isset($url['port']) ? ':'.$url['port'] : '').$path;
    }

    public function refresh(User $user): ?FounderIdentityReview
    {
        if (! $user->hasVerifiedEmail()) return null;
        return DB::transaction(function () use ($user) {
            $user = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            if (! $user->hasVerifiedEmail()) return null;
            $review = FounderIdentityReview::firstOrNew(['user_id' => $user->id]);
            if ($review->reviewed_at || $user->founderProfile()->exists()) return $review->exists ? $review : null;
            $application = Application::where('user_id', $user->id)->latest('id')->first();
            $review->candidates = $this->candidates($user, $application);
            $review->save();
            return $review;
        });
    }

    public function candidates(User $user, ?Application $application): array
    {
        if (! $user->hasVerifiedEmail()) return [];
        $names = array_filter(array_unique([self::normalize($user->name), self::normalize($application?->full_name)]));
        $website = self::website($application?->company_website);
        $linkedin = self::website($application?->linkedin_url, true);
        $companyName = self::normalize($application?->company_name);
        $matches = [];
        foreach (FounderProfile::whereNotNull('directory_key')->whereNull('user_id')->where('status', 'active')->where('is_public', true)->with(['companies', 'outreach', 'invitations'])->get() as $profile) {
            $signals = [];
            $aliases = [$profile->display_name, ...collect($profile->translations ?? [])->pluck('name')->all()];
            if (array_intersect($names, array_filter(array_map(self::normalize(...), $aliases)))) $signals[] = 'name';
            if ($linkedin && $linkedin === self::website($profile->linkedin_url, true)) $signals[] = 'linkedin';
            $email = mb_strtolower(trim($user->email));
            if ($profile->outreach?->verified_at && mb_strtolower(trim($profile->outreach->email ?? '')) === $email) $signals[] = 'verified_contact_email';
            if ($profile->invitations->contains(fn ($invite) => mb_strtolower(trim($invite->email)) === $email &&
                (($invite->status === 'sent' && $invite->expires_at->isFuture()) || ($invite->status === 'accepted' && $invite->accepted_at)))) $signals[] = 'verified_invitation_email';
            // A company match alone cannot identify one of its several co-founders.
            if (! $signals) continue;
            if ($website && $profile->companies->contains(fn ($company) => self::website($company->website) === $website)) $signals[] = 'company_website';
            if ($companyName && $profile->companies->contains(fn ($company) => in_array($companyName, array_filter([self::normalize($company->name), self::normalize($company->translations['ar']['name'] ?? null)]), true))) $signals[] = 'company_name';
            $company = $profile->companies->first(fn ($item) => (bool) $item->pivot->is_primary) ?? $profile->companies->first();
            $weights = ['name' => 30, 'linkedin' => 60, 'verified_contact_email' => 90, 'verified_invitation_email' => 100, 'company_website' => 35, 'company_name' => 15];
            $matches[] = ['id' => $profile->id, 'founder_uid' => $profile->founder_uid, 'slug' => $profile->slug,
                'name' => $profile->display_name, 'company' => $company?->name, 'website' => $company?->website,
                'signals' => $signals, 'score' => array_sum(array_map(fn ($signal) => $weights[$signal], $signals))];
        }
        usort($matches, fn ($a, $b) => ($b['score'] <=> $a['score']) ?: ($a['id'] <=> $b['id']));
        return $matches;
    }

    /** Called inside the approval transaction with the account lock already held. */
    public function claim(Application $application, User $admin, array $decision): ?FounderProfile
    {
        $user = $application->user;
        abort_unless($user?->hasVerifiedEmail() && $admin->isPlatformAdmin(), 409, __('identity.review'));
        $candidates = $this->candidates($user, $application);
        $id = $decision['matched_founder_id'] ?? null;
        $createNew = (bool) ($decision['create_new_profile'] ?? false);
        abort_if($id && $createNew, 422, __('identity.choice'));
        abort_if(($id || ($createNew && $candidates)) && ! ($decision['identity_verified'] ?? false), 422, __('identity.evidence'));
        abort_if($candidates && ! $id && ! $createNew, 409, __('identity.match'));
        $profile = null;
        if ($id) {
            abort_unless(collect($candidates)->contains('id', (int) $id), 409, __('identity.stale'));
            $profile = FounderProfile::whereKey($id)->lockForUpdate()->firstOrFail();
            abort_if($profile->user_id || $profile->status !== 'active' || ! $profile->is_public, 409, __('identity.unavailable'));
            $profile->update(['user_id' => $user->id, 'claimed_at' => now(), 'status' => 'pending']);
            $profile->invitations()->whereIn('status', ['sent', 'pending'])->update(['status' => 'revoked']);
            $profile->outreach?->update(['status' => 'cancelled', 'next_attempt_at' => null]);
        }
        FounderIdentityReview::updateOrCreate(['user_id' => $user->id], ['candidates' => $candidates, 'founder_profile_id' => $profile?->id,
            'decision' => $profile ? 'linked' : 'new', 'reviewed_by' => $admin->id, 'reviewed_at' => now()]);
        AdminAction::log($admin->id, $profile ? 'founder_identity_linked' : 'founder_identity_new', 'user', $user->id, 'Application '.$application->id.($profile ? '; canonical founder '.$profile->id : '; reviewed new identity'));
        return $profile;
    }

    public function verify(FounderProfile $profile, User $admin): void
    {
        abort_unless($profile->user?->hasVerifiedEmail(), 409, __('identity.email'));
        $profile->forceFill(['is_verified' => true, 'vetted_status' => true, 'admin_verified_at' => now(), 'admin_verified_by' => $admin->id])->save();
        FounderIdentityReview::where('user_id', $profile->user_id)->update(['founder_profile_id' => $profile->id]);
    }
}
