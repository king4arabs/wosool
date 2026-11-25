<?php

namespace App\Jobs;

use App\Mail\{BilingualEmail, WosoolMail};
use App\Models\User;
use App\Services\{Mailer, RegistrationOtp};
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\{Cache, DB};
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class SendWowRegistrationMail implements ShouldQueue
{
    use Queueable;

    public int $tries = 4;

    public function __construct(public int $userId, public string $kind) {}

    public function backoff(): array { return [60, 180, 600]; }

    public function handle(): void
    {
        Cache::lock("wow-mail-{$this->userId}-{$this->kind}", 120)->block(5, function () {
            $user = User::find($this->userId);
            $record = DB::table('wow_event_registrations')->where('user_id', $this->userId)->first();
            if (! $user || ! $record) return;

            if ($this->kind === 'otp') {
                if ($user->hasVerifiedEmail()) return;
                $otp = DB::table('registration_email_otps')->where('user_id', $user->id)->first();
                // Do not replace a still-valid challenge if the recipient already requested one.
                if ($otp && $otp->email === $user->email && ! $otp->consumed_at && $otp->attempts < 5 && now()->parse($otp->expires_at)->gt(now())) return;
                try {
                    app(RegistrationOtp::class)->send($user);
                } catch (HttpExceptionInterface $e) {
                    if (in_array($e->getStatusCode(), [409, 429], true)) return;
                    throw new \RuntimeException('WOW verification mail unavailable.');
                }
                return;
            }

            if ($this->kind !== 'ticket' || $record->ticket_email_sent_at) return;
            $mail = new WosoolMail('wow-rsvp', 'أكمل حجز تذكرتك | EO Riyadh WOW', 'Complete your RSVP | EO Riyadh WOW', BilingualEmail::data(
                ar: ['title' => 'أكمل حجز تذكرتك', 'lines' => [
                    'الجمعة 11 ديسمبر 2026، نادي جولف وادي صفار، الدرعية.',
                    'أكمل طلب الحضور في Luma بالبريد نفسه. الحضور بعد موافقة المنظمين.',
                    'لتفعيل عضوية وصول، أكّد بريدك وأكمل طلب العضوية عبر https://wosool.org/onboarding.',
                    ...($record->eoa_interest ? ['تابع اهتمامك بمسرّعة EOA عبر https://wosool.org/eoa/account.'] : []),
                    ...($record->eo_interest ? ['تم تسجيل اهتمامك بعضوية EO.'] : []),
                ]],
                en: ['title' => 'Complete your RSVP', 'lines' => [
                    'Friday, December 11, 2026 | Golf Club Wadi Safar, Diriyah.',
                    'Use the same email on Luma. Admission requires organizer approval.',
                    'To activate Wosool membership, verify your email and complete your application at https://wosool.org/onboarding.',
                    ...($record->eoa_interest ? ['Follow up on EOA interest at https://wosool.org/eoa/account.'] : []),
                    ...($record->eo_interest ? ['Your EO membership interest is recorded.'] : []),
                ]],
                action: BilingualEmail::action('https://luma.com/8fccrqkx', 'أكمل حجز التذكرة', 'Complete RSVP')
            ));
            if (! Mailer::safely($user->email, $mail, ['wow_registration_id' => $record->id])) {
                throw new \RuntimeException('WOW ticket email unavailable.');
            }
            DB::table('wow_event_registrations')->where('id', $record->id)->update(['ticket_email_sent_at' => now()]);
        });
    }
}
