<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Services\Eoa\Access;
use App\Services\Eoa\ProgramService;
use App\Services\Eoa\Readiness;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReadinessController extends Controller
{
    public function show(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);
        $p = ProgramService::program();
        return response()->json(['data' => Readiness::records($p), 'summary' => Readiness::summary($p)]);
    }

    public function save(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);
        $data = $request->validate([
            'version' => 'required|integer|min:0', 'delivery_ready' => 'required|boolean',
            'board' => 'present|array|max:3', 'board.*' => 'array:role,name_en,name_ar,reference',
            'board.*.role' => 'required|distinct|in:chair,learning,membership', 'board.*.name_en' => 'nullable|string|max:200', 'board.*.name_ar' => 'nullable|string|max:200', 'board.*.reference' => 'nullable|string|max:500',
            'coaches' => 'present|array|max:100', 'coaches.*' => 'array:user_id,eo_membership_reference,training_reference,trained_at,term_start,term_end',
            'coaches.*.user_id' => 'required|integer|distinct|exists:users,id', 'coaches.*.eo_membership_reference' => 'nullable|string|max:500', 'coaches.*.training_reference' => 'nullable|string|max:500', 'coaches.*.trained_at' => 'nullable|date|before_or_equal:today', 'coaches.*.term_start' => 'nullable|date', 'coaches.*.term_end' => 'nullable|date|after_or_equal:coaches.*.term_start',
            'chapter_approval' => 'nullable|string|max:500', 'regional_approval' => 'nullable|string|max:500', 'manager' => 'nullable|string|max:200', 'trainer_confirmation' => 'nullable|string|max:500', 'mail_delivery_verified' => 'nullable|string|max:500', 'bookkeeping' => 'nullable|string|max:500', 'annual_plan' => 'nullable|string|max:1000',
        ]);
        foreach ($data['coaches'] as $coach) abort_unless(\App\Models\User::findOrFail($coach['user_id'])->hasRole('eoa_coach'), 422, 'Choose a current coach account.');
        foreach ($data['board'] as $board) if (! empty($board['reference'])) abort_unless(! empty($board['name_en']) && ! empty($board['name_ar']), 422, 'Confirmed board appointments need both names.');
        return $this->persist($request, 'eoa_operations', $data);
    }

    public function finance(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);
        return response()->json(['data' => Readiness::finance(ProgramService::program())]);
    }

    public function saveFinance(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);
        $rules = ['version' => 'required|integer|min:0', 'hub_created_on' => 'nullable|date|before_or_equal:today', 'reference' => 'required|string|max:1000'];
        foreach (['global_dues_new', 'global_dues_renewed', 'sponsorship_received', 'local_dues_received', 'grant_received', 'payback_received', 'expenses_budget', 'expenses_actual'] as $key) $rules[$key] = 'required|numeric|min:0|max:100000000';
        return $this->persist($request, 'eoa_private_finance', $request->validate($rules));
    }

    private function persist(Request $request, string $key, array $data)
    {
        return DB::transaction(function () use ($request, $key, $data) {
            $p = \App\Models\Program::where('slug', ProgramService::SLUG)->lockForUpdate()->firstOrFail();
            $settings = $p->settings ?? [];
            abort_unless((int) ($settings[$key]['version'] ?? 0) === $data['version'], 409, 'The record changed. Reload before saving.');
            $data['version']++;
            $settings[$key] = $data;
            $p->update(['settings' => $settings]);
            // Log action identity, not finance amounts or private evidence.
            AdminAction::log($request->user()->id, 'eoa.'.$key.'.updated', 'program', $p->id);
            return response()->json(['message' => 'Saved.', 'version' => $data['version']]);
        });
    }
}
