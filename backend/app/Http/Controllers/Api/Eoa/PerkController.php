<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Services\Eoa\Access;
use App\Services\Eoa\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PerkController extends Controller
{
    public function index(Request $request)
    {
        $program = ProgramService::program();
        $participant = $program->participants()->where('user_id', $request->user()->id)->first();
        abort_unless($request->user()->hasVerifiedEmail() && $participant
            && in_array($participant->status, ['enrolled', 'alumni'], true)
            && ($participant->eoa_finance['global_confirmed'] ?? false), 403);

        return response()->json(['data' => DB::table('eoa_perks as perks')
            ->join('ecosystem_organizations as org', 'org.id', '=', 'perks.organization_id')
            ->where('perks.program_id', $program->id)->where('perks.is_approved', true)
            ->where('org.relationship_status', 'confirmed')->where('org.verification_status', 'verified')
            ->whereNotNull('org.relationship_evidence')->whereNotNull('org.logo_path')
            ->orderBy('perks.sort_order')->orderBy('perks.id')
            ->get(['perks.id', 'perks.title_en', 'perks.title_ar', 'perks.details_en', 'perks.details_ar',
                'org.name_en', 'org.name_ar', 'org.logo_path'])]);
    }

    public function manage(Request $request)
    {
        abort_unless(Access::lead($request->user()), 403);

        return response()->json(['data' => DB::table('eoa_perks')
            ->where('program_id', ProgramService::program()->id)->orderBy('sort_order')->orderBy('id')->get()]);
    }

    public function save(Request $request, ?int $perk = null)
    {
        abort_unless(Access::lead($request->user()), 403);
        $program = ProgramService::program();
        $data = $request->validate([
            'organization_id' => ['required', 'integer', Rule::exists('ecosystem_organizations', 'id')],
            'title_en' => 'required|string|max:255', 'title_ar' => 'required|string|max:255',
            'details_en' => 'required|string|max:2000', 'details_ar' => 'required|string|max:2000',
            'is_approved' => 'required|boolean', 'approval_reference' => 'required_if:is_approved,true|nullable|string|max:500',
            'sort_order' => 'required|integer|min:0|max:100000',
        ]);
        if ($data['is_approved']) {
            abort_unless(filled($data['approval_reference'] ?? null), 422, 'Approval evidence is required.');
            abort_unless(DB::table('ecosystem_organizations')->where('id', $data['organization_id'])
                ->where('relationship_status', 'confirmed')->where('verification_status', 'verified')
                ->whereNotNull('relationship_evidence')->whereNotNull('logo_path')->exists(), 422, 'A confirmed organization with an approved logo is required.');
        } else {
            $data['approval_reference'] = null;
        }

        return DB::transaction(function () use ($request, $program, $perk, $data) {
            if ($perk) {
                abort_unless(DB::table('eoa_perks')->where('id', $perk)->where('program_id', $program->id)->exists(), 404);
                DB::table('eoa_perks')->where('id', $perk)->update($data + ['updated_at' => now()]);
            } else {
                $perk = DB::table('eoa_perks')->insertGetId($data + ['program_id' => $program->id, 'created_at' => now(), 'updated_at' => now()]);
            }
            AdminAction::log($request->user()->id, 'eoa.perk.save', 'eoa_perk', $perk);

            return response()->json(['id' => $perk]);
        });
    }
}
