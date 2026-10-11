<?php

namespace App\Services;

use App\Models\AdminAction;
use App\Models\FounderInvitation;
use App\Models\FounderProfile;
use App\Models\User;
use App\Notifications\FounderActivationInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FounderInvitationService
{
    public function send(FounderProfile $profile, User $admin, string $email, string $evidence): FounderInvitation
    {
        // A log/array fallback must never be reported to the operator as an invitation sent.
        abort_unless($this->realMailer((string) config('mail.default')), 503, 'Configure a delivering mail transport before sending invitations.');
        $token = Str::random(64);
        $code = (string) random_int(100000, 999999);
        $invitation = DB::transaction(function () use ($profile, $admin, $email, $evidence, $token, $code) {
            $profile = FounderProfile::lockForUpdate()->findOrFail($profile->id);
            abort_if($profile->user_id !== null || $profile->status !== 'active', 409, 'Only unclaimed, active profiles can be invited.');
            abort_if($profile->invitations()->whereIn('status', ['pending', 'sent'])->where('created_at', '>', now()->subMinute())->exists(), 429, 'Wait a minute before resending.');
            $existing = User::whereRaw('LOWER(email) = ?', [strtolower($email)])->first();
            abort_if($existing?->founderProfile()->exists(), 409, 'This recipient already owns a founder profile.');
            $profile->invitations()->whereIn('status', ['pending', 'sent'])->update(['status' => 'revoked']);
            $invite = $profile->invitations()->create([
                'invited_by' => $admin->id, 'email' => strtolower($email), 'recipient_evidence' => $evidence,
                'token_hash' => hash('sha256', $token), 'otp_hash' => hash_hmac('sha256', $code, config('app.key')),
                'expires_at' => now()->addDays(7), 'status' => 'pending',
            ]);
            AdminAction::log($admin->id, 'founder_invitation_created', 'founder_profile', $profile->id, 'Recipient verified by administrator. Invitation '.$invite->id);
            return $invite;
        });
        $url = rtrim(config('app.frontend_url'), '/').'/activate-founder#token='.$token;
        try {
            Notification::route('mail', $email)->notify(new FounderActivationInvitation($profile->display_name ?? $profile->slug, $url, $code));
        } catch (\Throwable) {
            $invitation->update(['status' => 'failed']);
            AdminAction::log($admin->id, 'founder_invitation_failed', 'founder_profile', $profile->id, 'Mail transport did not accept the invitation.');
            abort(503, 'The invitation could not be sent. Check mail configuration and retry.');
        }
        FounderInvitation::whereKey($invitation->id)->where('status', 'pending')->update(['status' => 'sent', 'sent_at' => now()]);
        $invitation->refresh();
        abort_if($invitation->status !== 'sent', 409, 'The invitation was revoked while mail was sending. The emailed link is inactive.');
        AdminAction::log($admin->id, 'founder_invitation_sent', 'founder_profile', $profile->id, 'Accepted by mail transport; inbox delivery is not confirmed.');
        return $invitation;
    }

    public function resolve(string $token, bool $lock = false): FounderInvitation
    {
        $query = FounderInvitation::where('token_hash', hash('sha256', $token));
        if ($lock) { $query->lockForUpdate(); }
        $invite = $query->first();
        if (! $invite || $invite->status !== 'sent' || $invite->expires_at->isPast()) {
            throw ValidationException::withMessages(['token' => ['This invitation has expired or is no longer available. Ask Wosool for a new invitation.']]);
        }
        return $invite;
    }

    public function realMailer(string $name, array $seen = []): bool
    {
        if (in_array($name, $seen, true)) { return false; }
        $mailer = config('mail.mailers.'.$name, []);
        if (in_array($mailer['transport'] ?? '', ['failover', 'roundrobin'], true)) {
            return count($mailer['mailers'] ?? []) > 0 && collect($mailer['mailers'])->every(fn ($child) => $this->realMailer($child, [...$seen, $name]));
        }
        return in_array($mailer['transport'] ?? '', ['smtp', 'sendmail', 'ses', 'ses-v2', 'postmark', 'resend', 'mailgun'], true);
    }
}
