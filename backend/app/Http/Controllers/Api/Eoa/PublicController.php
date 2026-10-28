<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\EoaBoardMember;
use App\Models\EoaMentorProfile;
use App\Services\Eoa\ProgramService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PublicController extends Controller
{
    public function directory()
    {
        return response()->json(['data' => DB::table('ecosystem_organizations')
            ->where('verification_status', 'verified')->orderBy('sort_order')
            ->get(['id', 'name_en', 'name_ar', 'website', 'type', 'sector', 'location', 'support_en', 'support_ar', 'source_url', 'verified_at', 'relationship_status'])]);
    }

    public function show()
    {
        $program = ProgramService::program();
        $settings = ProgramService::settings($program);
        $partners = DB::table('ecosystem_organizations')->where('relationship_status', 'confirmed')->where('verification_status', 'verified')->whereNotNull('relationship_evidence')->whereNotNull('logo_path')->orderBy('sort_order')->get(['id', 'name_en', 'name_ar', 'website', 'logo_path']);
        $editorial = $settings['editorial_published'] ?? null;
        if (is_array($editorial)) {
            $editorial = array_intersect_key($editorial, array_flip(['version', 'operator', 'faqs', 'updated_at']));
            $editorial['operator'] = is_array($editorial['operator'] ?? null) && ($editorial['operator']['visible'] ?? false)
                ? array_intersect_key($editorial['operator'], array_flip(['name_ar', 'name_en', 'description_ar', 'description_en', 'website', 'visible'])) : null;
            $editorial['faqs'] = array_values(array_map(fn ($faq) => array_intersect_key((array) $faq, array_flip(['question_ar', 'question_en', 'answer_ar', 'answer_en', 'visible'])), array_filter((array) ($editorial['faqs'] ?? []), fn ($faq) => is_array($faq) && ($faq['visible'] ?? false))));
        } else {
            $editorial = null;
        }

        return response()->json(['data' => [
            'delivery_model' => ProgramService::deliveryModel(),
            'data_collection_open' => ProgramService::collectionReady(),
            'privacy_notice_ar' => $settings['privacy_status'] === 'approved' ? $settings['privacy_notice_ar'] : null,
            'privacy_notice_en' => $settings['privacy_status'] === 'approved' ? $settings['privacy_notice_en'] : null,
            'privacy_notice_version' => $settings['privacy_status'] === 'approved' ? $settings['privacy_notice_version'] : null,
            'program_id' => $program->id, 'facts' => ProgramService::facts(),
            'editorial' => $editorial,
            'partner_roles' => (object) array_intersect_key(array_filter((array) ($settings['partner_roles'] ?? []), fn ($role) => in_array($role, ['operator', 'enabler', 'supporter'], true)), array_fill_keys($partners->pluck('id')->all(), true)),
            'applications_open' => ProgramService::collectionReady() && $program->is_open && $settings['approval_status'] === 'approved' && ! $program->application_deadline?->isPast(),
            'local_status' => $settings['approval_status'],
            'starts_at' => $settings['approval_status'] === 'approved' ? $program->starts_at?->toIso8601String() : null,
            'local_fees' => $settings['local_fee_status'] === 'approved'
                && abs((float) $settings['local_fee_usd'] - (ProgramService::ANNUAL_JOURNEY_USD - ProgramService::facts()['annual_global_fee_usd'])) < 0.01
                && abs((float) $settings['sponsor_contribution_usd'] - ProgramService::SPONSOR_SHARE_USD) < 0.01
                && abs((float) $settings['participant_contribution_usd'] - ProgramService::SPONSOR_SHARE_USD) < 0.01
                ? array_intersect_key($settings, array_flip(['local_fee_usd', 'sponsor_contribution_usd', 'participant_contribution_usd'])) : null,
            'contact_email' => \App\Services\Mailer::team(), 'public_message_en' => $settings['public_message_en'] ?? null, 'public_message_ar' => $settings['public_message_ar'] ?? null,
            'participation_terms_en' => $settings['approval_status'] === 'approved' ? $settings['participation_terms_en'] : null, 'participation_terms_ar' => $settings['approval_status'] === 'approved' ? $settings['participation_terms_ar'] : null,
            'tracks' => DB::table('eoa_tracks')->where('program_id', $program->id)->where('is_active', true)->orderBy('id')->get(['id', 'name_ar', 'name_en', 'description_ar', 'description_en']),
            // A rolling frontend/API release remains readable before the additive migration runs.
            'board_members' => Schema::hasTable('eoa_board_members') ? EoaBoardMember::where('program_id', $program->id)
                ->where('publication_status', 'published')->where('is_active', true)
                ->orderBy('display_order')->orderBy('id')->get(EoaBoardMember::PUBLIC_FIELDS) : [],
            'mentors' => Schema::hasTable('eoa_mentor_profiles') ? EoaMentorProfile::where('program_id', $program->id)
                ->where('publication_status', 'published')->where('is_active', true)
                ->where('appointment_status', 'confirmed')->where('public_consent', true)
                ->whereNotNull('appointment_reference')->whereRaw("TRIM(appointment_reference) <> ''")
                ->whereNotNull('consent_reference')->whereRaw("TRIM(consent_reference) <> ''")
                ->orderBy('display_order')->orderBy('id')->get(EoaMentorProfile::PUBLIC_FIELDS) : [],
            'partners' => $partners,
            'ecosystem' => DB::table('ecosystem_organizations')->where('verification_status', 'verified')->orderBy('sort_order')->get(['id', 'name_en', 'name_ar', 'website', 'type', 'sector', 'location', 'support_en', 'support_ar', 'source_url', 'verified_at', 'relationship_status']),
        ]]);
    }
}
