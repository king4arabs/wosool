<?php

namespace App\Services\Eoa;

use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class Readiness
{
    public static function records(Program $p): array
    {
        return array_replace(['version' => 0, 'board' => [], 'coaches' => [], 'chapter_approval' => '', 'regional_approval' => '', 'manager' => '', 'trainer_confirmation' => '', 'mail_delivery_verified' => '', 'bookkeeping' => '', 'annual_plan' => '', 'delivery_ready' => false], $p->settings['eoa_operations'] ?? []);
    }

    public static function paidParticipants(Program $p): int
    {
        return $p->participants()->where('status', 'enrolled')->get()->filter(fn ($r) => ($r->eoa_finance['global_confirmed'] ?? false) && in_array($r->eoa_finance['fee_status'] ?? '', ['paid', 'sponsored']))->count();
    }

    public static function coachReady(Program $p, int $id): bool
    {
        $row = collect(self::records($p)['coaches'])->firstWhere('user_id', $id);
        if (! $row || empty($row['eo_membership_reference']) || empty($row['training_reference']) || empty($row['trained_at']) || empty($row['term_start']) || empty($row['term_end'])) return false;
        $user = User::find($id);
        return $user && $user->hasVerifiedEmail() && $user->hasRole('eoa_coach') && Carbon::parse($row['term_start'])->startOfDay()->lte(now()) && Carbon::parse($row['term_end'])->endOfDay()->gte(now()) && Carbon::parse($row['trained_at'])->lte(now());
    }

    public static function summary(Program $p): array
    {
        $r = self::records($p);
        $paid = self::paidParticipants($p);
        $groups = DB::table('eoa_groups')->where('program_id', $p->id)->get();
        $covered = $groups->filter(fn ($g) => $g->coach_id && self::coachReady($p, $g->coach_id))->count();
        $checks = [];
        foreach (['chapter_approval', 'regional_approval', 'manager', 'trainer_confirmation', 'mail_delivery_verified', 'bookkeeping', 'annual_plan'] as $key) $checks[$key] = ! empty($r[$key]);
        $checks['delivery_ready'] = (bool) $r['delivery_ready'];
        $settings = ProgramService::settings($p);
        $checks['program_approved'] = $settings['approval_status'] === 'approved';
        $checks['fees_approved'] = $settings['local_fee_status'] === 'approved';
        $checks['privacy_approved'] = ProgramService::collectionReady();
        $checks['board'] = count(array_filter($r['board'], fn ($b) => ! empty($b['reference']) && ! empty($b['name_en']) && ! empty($b['name_ar']))) >= 3;
        $checks['coaching'] = $covered >= (int) ceil(max(15, $paid) / 6);
        $checks['paid_participants'] = $paid >= 15;
        $enrolled = $p->participants()->where('status', 'enrolled')->get();
        $checks['assigned_participants'] = $enrolled->every(fn ($r) => $r->cohort_id && $r->eoa_group_id);
        $checks['group_sizes'] = $groups->every(fn ($g) => ($n = $enrolled->where('eoa_group_id', $g->id)->count()) === 0 || ($n >= 4 && $n <= 6));
        return ['paid_participants' => $paid, 'target' => 15, 'growth_target' => 25, 'delivery_stage' => $paid >= 15 ? 'in_person' : ($paid >= 10 ? 'virtual_trainer' : 'global_virtual'), 'coached_groups' => $covered, 'checks' => $checks, 'ready_for_official_launch' => ! in_array(false, $checks, true), 'group_sizes' => $groups->map(fn ($g) => ['id' => $g->id, 'name' => $g->name, 'size' => $p->participants()->where('eoa_group_id', $g->id)->where('status', 'enrolled')->count(), 'coach_ready' => $g->coach_id && self::coachReady($p, $g->coach_id)])->values()->all()];
    }

    public static function publicBoard(Program $p): array
    {
        return array_values(array_map(fn ($b) => array_intersect_key($b, array_flip(['role', 'name_ar', 'name_en'])), array_filter(self::records($p)['board'], fn ($b) => ! empty($b['reference']) && ! empty($b['name_en']) && ! empty($b['name_ar']))));
    }

    // Never include this result in public, staff, coach or participant serializers.
    public static function finance(Program $p): array
    {
        $f = array_replace(['version' => 0, 'hub_created_on' => null, 'global_dues_new' => 0, 'global_dues_renewed' => 0, 'sponsorship_received' => 0, 'local_dues_received' => 0, 'grant_received' => 0, 'payback_received' => 0, 'expenses_budget' => 0, 'expenses_actual' => 0, 'reference' => ''], $p->settings['eoa_private_finance'] ?? []);
        $paid = self::paidParticipants($p);
        $window = ! empty($f['hub_created_on']) && Carbon::parse($f['hub_created_on'])->lte(now()) && Carbon::parse($f['hub_created_on'])->addYears(2)->gte(now());
        $f['paid_participants'] = $paid;
        $f['potential_grant'] = $window ? ($paid >= 15 ? 15000 : ($paid >= 10 ? 3000 : 0)) : 0;
        $f['expected_payback_new'] = round($f['global_dues_new'] * .30, 2);
        $f['expected_payback_renewed'] = round($f['global_dues_renewed'] * .30, 2);
        $f['budget_variance'] = round($f['expenses_budget'] - $f['expenses_actual'], 2);
        return $f;
    }
}
