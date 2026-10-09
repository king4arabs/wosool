<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Services\Eoa\ProgramService;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    public function show()
    {
        $program = ProgramService::program();
        $settings = ProgramService::settings($program);

        return response()->json(['data' => [
            'data_collection_open' => ProgramService::collectionReady(),
            'privacy_notice_ar' => $settings['privacy_status'] === 'approved' ? $settings['privacy_notice_ar'] : null,
            'privacy_notice_en' => $settings['privacy_status'] === 'approved' ? $settings['privacy_notice_en'] : null,
            'privacy_notice_version' => $settings['privacy_status'] === 'approved' ? $settings['privacy_notice_version'] : null,
            'program_id' => $program->id, 'facts' => ProgramService::facts(),
            'applications_open' => ProgramService::collectionReady() && $program->is_open && $settings['approval_status'] === 'approved' && ! $program->application_deadline?->isPast(),
            'local_status' => $settings['approval_status'],
            'starts_at' => $settings['approval_status'] === 'approved' ? $program->starts_at?->toIso8601String() : null,
            'local_fees' => $settings['local_fee_status'] === 'approved' ? array_intersect_key($settings, array_flip(['local_fee_usd', 'sponsor_contribution_usd', 'participant_contribution_usd'])) : null,
            'contact_email' => $settings['contact_email'], 'public_message_en' => $settings['public_message_en'] ?? null, 'public_message_ar' => $settings['public_message_ar'] ?? null,
            'participation_terms_en' => $settings['approval_status'] === 'approved' ? $settings['participation_terms_en'] : null, 'participation_terms_ar' => $settings['approval_status'] === 'approved' ? $settings['participation_terms_ar'] : null,
            'tracks' => DB::table('eoa_tracks')->where('program_id', $program->id)->where('is_active', true)->orderBy('id')->get(['id', 'name_ar', 'name_en', 'description_ar', 'description_en']),
            'partners' => DB::table('ecosystem_organizations')->where('relationship_status', 'confirmed')->where('verification_status', 'verified')->whereNotNull('relationship_evidence')->whereNotNull('logo_path')->orderBy('sort_order')->get(['id', 'name_en', 'name_ar', 'website', 'logo_path']),
            'ecosystem' => DB::table('ecosystem_organizations')->where('verification_status', 'verified')->orderBy('sort_order')->get(['id', 'name_en', 'name_ar', 'website', 'type', 'sector', 'location', 'support_en', 'support_ar', 'source_url', 'verified_at', 'relationship_status']),
        ]]);
    }
}
