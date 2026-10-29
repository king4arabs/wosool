<?php

namespace App\Services;

use App\Mail\RegistrationOtpMail;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\{DB, Mail};
use Illuminate\Validation\ValidationException;

final class RegistrationOtp
{
    public function send(User $user): void
    {
        abort_unless(app(FounderInvitationService::class)->realMailer((string) config('mail.default')) && filled(config('mail.from.address')), 503, __('messages.registration.mail_unavailable'));
        DB::transaction(function () use ($user) {
            $user = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_if($user->hasVerifiedEmail(), 409, __('messages.registration.already_verified'));
            $previous = DB::table('registration_email_otps')->where('user_id', $user->id)->first();
            abort_if($previous && now()->parse($previous->sent_at)->gt(now()->subMinute()), 429, __('messages.registration.resend_wait'));
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            DB::table('registration_email_otps')->updateOrInsert(['user_id' => $user->id], [
                'email' => $user->email, 'code_hash' => $this->hash($user, $code), 'attempts' => 0,
                'sent_at' => now(), 'expires_at' => now()->addMinutes(10), 'consumed_at' => null,
            ]);
            try { Mail::to($user->email)->send(new RegistrationOtpMail($code)); }
            catch (\Throwable) { abort(503, __('messages.registration.send_failed')); }
        });
    }

    public function verify(User $user, string $code): void
    {
        $verified = DB::transaction(function () use ($user, $code) {
            $user = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_if($user->hasVerifiedEmail(), 409, __('messages.registration.already_verified'));
            $otp = DB::table('registration_email_otps')->where('user_id', $user->id)->lockForUpdate()->first();
            if (! $otp || $otp->consumed_at || $otp->attempts >= 5 || now()->parse($otp->expires_at)->lte(now()) || $otp->email !== $user->email) return false;
            if (! hash_equals($otp->code_hash, $this->hash($user, $code))) {
                DB::table('registration_email_otps')->where('id', $otp->id)->increment('attempts');
                return false; // Commit the attempt before returning validation failure.
            }
            $user->markEmailAsVerified();
            DB::table('registration_email_otps')->where('id', $otp->id)->update(['consumed_at' => now(), 'code_hash' => null]);
            DB::afterCommit(fn () => event(new Verified($user)));
            return true;
        });
        if (! $verified) throw ValidationException::withMessages(['code' => [__('messages.registration.invalid_code')]]);
    }

    private function hash(User $user, string $code): string
    {
        return hash_hmac('sha256', $user->id.'|'.$user->email.'|'.$code, config('app.key'));
    }
}
