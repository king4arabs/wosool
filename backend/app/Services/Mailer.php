<?php

namespace App\Services;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Best-effort delivery for confirmations and team alerts. The record is already saved,
 * so a mail outage is logged instead of failing the visitor's submission.
 */
final class Mailer
{
    public static function safely(string $to, Mailable $mail, array $context = []): bool
    {
        try {
            if (! app(FounderInvitationService::class)->realMailer((string) config('mail.default')) || ! filled(config('mail.from.address'))) {
                Log::warning('Email delivery unavailable.', [...$context, 'mail' => $mail::class]);
                return false;
            }
            Mail::to($to)->send($mail);

            return true;
        } catch (\Throwable $error) {
            Log::warning('Email delivery failed.', [...$context, 'mail' => $mail::class, 'exception' => $error::class]);

            return false;
        }
    }

    public static function team(): string
    {
        return (string) config('mail.team_address');
    }
}
