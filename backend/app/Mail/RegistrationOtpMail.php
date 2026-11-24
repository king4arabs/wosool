<?php

namespace App\Mail;

/**
 * Six-digit email verification code, rendered with the shared bilingual layout.
 * Sent when an account is created and again when a member changes the email address
 * in settings ($emailChange), with wording for each case. App\Services\RegistrationOtp
 * uses EXPIRES_MINUTES for the stored code, so the email and the check cannot drift apart.
 */
class RegistrationOtpMail extends WosoolMail
{
    public const EXPIRES_MINUTES = 10;

    public function __construct(public string $code, public bool $emailChange = false)
    {
        $minutes = self::EXPIRES_MINUTES;
        $expiry = [
            'ar' => "الرمز صالح لمدة {$minutes} دقائق ويُستخدم مرة واحدة. لا تشاركه مع أي شخص.",
            'en' => "The code expires in {$minutes} minutes and works once. Never share it with anyone.",
        ];

        parent::__construct(
            $emailChange ? 'email-change-otp' : 'registration-otp',
            $emailChange ? 'أكّد بريدك الجديد في وصول' : 'رمز التحقق من بريدك',
            $emailChange ? 'Confirm your new Wosool email' : 'Wosool verification code',
            BilingualEmail::data(
                ar: $emailChange
                    ? ['title' => 'أكّد بريدك الجديد', 'lines' => ['غيّرت البريد الإلكتروني لحسابك في وصول. أدخل الرمز التالي لتأكيد العنوان الجديد.'],
                        'after' => [$expiry['ar'], 'إذا لم تطلب استخدام هذا البريد لحساب في وصول، تجاهل هذه الرسالة.']]
                    : ['title' => 'أكّد بريدك الإلكتروني', 'lines' => ['أدخل الرمز التالي لإكمال التسجيل في وصول.'],
                        'after' => [$expiry['ar'], 'إذا لم تطلب التسجيل، تجاهل هذه الرسالة.']],
                en: $emailChange
                    ? ['title' => 'Confirm your new email', 'lines' => ['You changed the email address on your Wosool account. Enter this code to confirm the new address.'],
                        'after' => [$expiry['en'], 'If you did not ask to use this address for a Wosool account, you can ignore this email.']]
                    : ['title' => 'Confirm your email', 'lines' => ['Enter this code to continue your Wosool registration.'],
                        'after' => [$expiry['en'], 'If you did not register, you can ignore this email.']],
                code: $code,
                codeLabel: ['ar' => 'رمز التحقق', 'en' => 'Verification code'],
            ),
        );
    }
}
