<?php

namespace App\Services\Eoa;

use App\Models\Program;
use App\Models\User;
use App\Notifications\EoaNotice;
use Illuminate\Support\Facades\DB;

class ProgramService
{
    public const SLUG = 'eo-riyadh-accelerator';

    public static function program(): Program
    {
        return Program::where('slug', self::SLUG)->firstOrFail();
    }

    public static function settings(Program $program): array
    {
        return array_replace([
            'approval_status' => 'draft', 'approval_reference' => null,
            'local_fee_usd' => null, 'sponsor_contribution_usd' => null,
            'participant_contribution_usd' => null, 'local_fee_status' => 'draft',
            'participation_terms_en' => null, 'participation_terms_ar' => null,
            'contact_email' => null, 'privacy_status' => 'draft', 'privacy_approval_reference' => null,
            'privacy_notice_ar' => null, 'privacy_notice_en' => null, 'privacy_notice_version' => null,
        ], $program->settings['eoa'] ?? []);
    }

    public static function collectionReady(): bool
    {
        $s = self::settings(self::program());

        return $s['privacy_status'] === 'approved' && ! empty($s['privacy_approval_reference']) && ! empty($s['privacy_notice_ar']) && ! empty($s['privacy_notice_en']) && ! empty($s['privacy_notice_version']);
    }

    public static function mailConfigured(): bool
    {
        return ! in_array(config('mail.default'), ['log', 'array', null], true);
    }

    public static function notify(User $user, string $event, string $message): void
    {
        DB::table('eoa_notifications')->insert([
            'user_id' => $user->id, 'event' => $event, 'message' => $message,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        if (self::mailConfigured()) {
            $user->notify((new EoaNotice($message))->afterCommit());
        }
    }

    public static function facts(): array
    {
        return [
            'revenue_min_usd' => 250000, 'revenue_max_usd' => 999999,
            'annual_global_fee_usd' => 1750, 'duration_years' => 2,
            'learning_days_per_year' => 4, 'accountability' => 'monthly',
            'verified_at' => '2026-10-08',
            'sources' => ['https://eonetwork.org/accelerator', 'https://eonetwork.org/accelerator/faqs/'],
        ];
    }
}
