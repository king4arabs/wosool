<?php

namespace App\Mail;

use Illuminate\Notifications\Messages\MailMessage;

/**
 * Builds the data for resources/views/mail/bilingual.blade.php so every Wosool email
 * shares one layout: Arabic block (RTL) first, English block (LTR) second, one action,
 * optional activation code and optional detail rows.
 *
 * $ar / $en: ['title' => string, 'greeting' => ?string, 'lines' => string[], 'after' => string[]]
 */
final class BilingualEmail
{
    public const VIEW = 'mail.bilingual';

    public static function data(
        array $ar,
        array $en,
        ?array $action = null,
        ?string $code = null,
        array $details = [],
    ): array {
        $normalize = fn (array $copy): array => [
            'title' => (string) $copy['title'],
            'greeting' => $copy['greeting'] ?? null,
            'lines' => array_values(array_filter($copy['lines'] ?? [], 'filled')),
            'after' => array_values(array_filter($copy['after'] ?? [], 'filled')),
        ];

        return [
            'content' => ['ar' => $normalize($ar), 'en' => $normalize($en)],
            'action' => $action,
            'code' => $code,
            'details' => array_values(array_filter($details, fn ($row) => filled($row['value'] ?? null))),
        ];
    }

    /** Bilingual subject: Arabic first, then English. */
    public static function subject(string $ar, string $en): string
    {
        return "{$ar} | {$en}";
    }

    /** MailMessage for notifications, rendered with the shared bilingual view. */
    public static function message(string $subjectAr, string $subjectEn, array $data): MailMessage
    {
        $message = (new MailMessage)
            ->subject(self::subject($subjectAr, $subjectEn))
            ->markdown(self::VIEW, $data);

        // Mirror the English copy into the standard fields so tests, logs and non-mail
        // channels can inspect the message; the bilingual view is what recipients see.
        $message->introLines = $data['content']['en']['lines'];
        $message->outroLines = $data['content']['en']['after'];
        if (! empty($data['action'])) {
            $message->actionText = $data['action']['en'];
            $message->actionUrl = $data['action']['url'];
        }

        return $message;
    }

    public static function action(string $url, string $ar, string $en): array
    {
        return ['url' => $url, 'ar' => $ar, 'en' => $en];
    }
}
