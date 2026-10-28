<?php
namespace App\Console\Commands;

use App\Models\FounderOutreach;
use App\Services\{FounderEmailResearch, FounderInvitationService};
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessFounderOutreach extends Command
{
    protected $signature = 'wosool:founder-outreach';
    protected $description = 'Process admin-requested activation invitations and public business email research.';

    public function handle(FounderEmailResearch $research, FounderInvitationService $invitations): int
    {
        // Research is safe to retry after a crash. Ambiguous mail sends require operator review.
        FounderOutreach::where('status', 'researching')->where('updated_at', '<', now()->subMinutes(15))
            ->update(['status' => 'retry', 'next_attempt_at' => now()]);
        $researchCount = 0;
        $rows = FounderOutreach::with(['founder', 'admin.roles'])
            ->whereIn('status', ['invite_queued', 'research_queued', 'retry'])
            ->where('next_attempt_at', '<=', now())->orderBy('next_attempt_at')->limit(25)->get();
        foreach ($rows as $row) {
            $send = $row->status === 'invite_queued';
            if (! $row->founder || $row->founder->user_id || $row->founder->status !== 'active' || ! $row->admin?->hasRole('admin')) {
                $row->update(['status' => 'cancelled']); continue;
            }
            if (($send && ! $invitations->mailerConfigured()) || (! $send && ! $research->configured())) {
                $row->update(['last_error' => 'Provider configuration required.', 'next_attempt_at' => now()->addHour()]); continue;
            }
            if (! $send && $researchCount++ >= 5) { continue; }
            $processing = $send ? 'sending' : 'researching';
            if (! FounderOutreach::whereKey($row->id)->where('status', $row->status)->update(['status' => $processing, 'updated_at' => now()])) { continue; }
            try {
                if ($send) {
                    if (! $row->verified_at || ! $row->email) { throw new \RuntimeException('Recipient not verified'); }
                    $latest = $row->founder->latestInvitation()->first();
                    if ($latest && ($latest->status === 'revoked' || ($latest->status === 'sent' && $latest->expires_at->isFuture()))) {
                        FounderOutreach::whereKey($row->id)->where('status', $processing)->update(['status' => 'cancelled']); continue;
                    }
                    $invitations->send($row->founder, $row->admin, $row->email, $row->evidence);
                    $values = ['status' => 'sent', 'last_error' => null, 'next_attempt_at' => null];
                } else {
                    $candidate = $research->find($row->founder);
                    $values = $candidate ? $candidate + ['status' => 'review', 'verified_at' => null, 'next_attempt_at' => null, 'last_error' => null]
                        : ['status' => 'retry', 'next_attempt_at' => now()->addDays(min(7, 1 + intdiv($row->attempts, 3))), 'last_error' => null];
                    $values['attempts'] = $row->attempts + 1;
                }
            } catch (\Throwable) {
                // Do not store provider responses or potentially sensitive mail errors.
                $values = ['status' => $send ? 'failed' : 'retry', 'last_error' => $send ? 'Mail attempt failed; review before retrying.' : 'Research provider failed; scheduled to retry.',
                    'next_attempt_at' => $send ? null : now()->addDay(), 'attempts' => $row->attempts + 1];
            }
            // A cancellation or manual recipient correction during research wins over this response.
            DB::transaction(function () use ($row, $processing, $values) {
                $locked = FounderOutreach::whereKey($row->id)->lockForUpdate()->first();
                if ($locked && $locked->status === $processing) { $locked->update($values); }
            });
        }
        return self::SUCCESS;
    }
}
