<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\{AdminAction, FounderOutreach, FounderProfile};
use App\Services\{FounderEmailResearch, FounderInvitationService};
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\DB;

class FounderOutreachController extends Controller
{
    public function bulk(Request $request, FounderEmailResearch $research, FounderInvitationService $mail): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:invite,research,cancel'],
            'all_inactive' => ['sometimes', 'boolean'],
            'ids' => ['required_unless:all_inactive,true', 'array', 'max:500'],
            'ids.*' => ['integer', 'distinct'],
        ]);
        if ($data['action'] === 'research') { abort_unless($research->configured(), 503, 'Configure OPENAI_API_KEY before starting email research.'); }
        if ($data['action'] === 'invite') { abort_unless($mail->mailerConfigured(), 503, 'Configure a delivering mail transport first.'); }
        $query = FounderProfile::whereNull('user_id')->where('status', 'active');
        if (! ($data['all_inactive'] ?? false)) { $query->whereIn('id', $data['ids']); }
        $counts = ['queued' => 0, 'skipped' => 0];
        // Snapshot selection now. Registrations after this request are never silently included.
        foreach ($query->pluck('id') as $id) {
            $queued = DB::transaction(function () use ($id, $data, $request) {
                $profile = FounderProfile::lockForUpdate()->find($id);
                if (! $profile || $profile->user_id || $profile->status !== 'active') { return false; }
                $row = FounderOutreach::where('founder_profile_id', $id)->lockForUpdate()->first();
                if ($data['action'] === 'cancel') {
                    if (! $row || in_array($row->status, ['sending', 'sent'], true)) { return false; }
                    $row->update(['status' => 'cancelled', 'next_attempt_at' => null]); return true;
                }
                if ($row && in_array($row->status, ['sending', 'invite_queued', 'researching', 'research_queued', 'retry'], true)) { return false; }
                $latest = $profile->latestInvitation()->first();
                if ($data['action'] === 'invite') {
                    // Never silently resend a valid or explicitly revoked invitation.
                    if ($latest && ($latest->status === 'revoked' || ($latest->status === 'sent' && $latest->expires_at->isFuture()))) { return false; }
                    $email = $row?->verified_at ? $row->email : $latest?->email;
                    $evidence = $row?->verified_at ? $row->evidence : $latest?->recipient_evidence;
                    if (! $email || ! $evidence) { return false; }
                    $values = ['status' => 'invite_queued', 'email' => $email, 'evidence' => $evidence, 'verified_at' => now()];
                } else {
                    if ($latest || $row?->email) { return false; }
                    $values = ['status' => 'research_queued'];
                }
                FounderOutreach::updateOrCreate(['founder_profile_id' => $id], $values + [
                    'requested_by' => $request->user()->id, 'next_attempt_at' => now(), 'last_error' => null,
                ]);
                return true;
            });
            $counts[$queued ? 'queued' : 'skipped']++;
        }
        AdminAction::log($request->user()->id, 'founder_outreach_'.$data['action'], 'founder_directory', 0, json_encode($counts));
        return response()->json(['data' => $counts]);
    }

    public function verify(Request $request, FounderProfile $founder): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email:rfc', 'max:255'],
            'recipient_evidence' => ['required', 'string', 'min:10', 'max:2000'], 'recipient_verified' => ['accepted']]);
        DB::transaction(function () use ($request, $founder, $data) {
            $founder = FounderProfile::lockForUpdate()->findOrFail($founder->id);
            abort_if($founder->user_id || $founder->status !== 'active', 409, 'Profile is not eligible for activation.');
            $row = FounderOutreach::where('founder_profile_id', $founder->id)->lockForUpdate()->first();
            abort_if($row && in_array($row->status, ['sending', 'invite_queued'], true), 409, 'An invitation is already queued or sending.');
            FounderOutreach::updateOrCreate(['founder_profile_id' => $founder->id], [
                'requested_by' => $request->user()->id, 'email' => strtolower($data['email']),
                'evidence' => $data['recipient_evidence'], 'verified_at' => now(), 'status' => 'ready',
                'last_error' => null, 'next_attempt_at' => null,
            ]);
            AdminAction::log($request->user()->id, 'founder_recipient_verified', 'founder_profile', $founder->id);
        });
        return response()->json(['message' => 'Verified recipient saved for activation invitation.']);
    }
}
