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
            Mail::to($to)->send($mail);

            return true;
        } catch (\Throwable $error) {
            Log::warning('Email delivery failed.', [...$context, 'mail' => $mail::class, 'error' => $error->getMessage()]);

            return false;
        }
    }

    public static function team(): string
    {
        return (string) config('mail.team_address');
    }
}
