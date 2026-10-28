<?php
namespace App\Services;
use App\Mail\NewsletterMail;
use App\Models\{Application, FounderProfile, NewsletterSubscriber, NewsItem, User, UserSetting};
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\{DB, Mail};
use Illuminate\Support\Str;

final class Newsletter
{
    public function activeMember(User $user): bool
    {
        if (! $user->hasVerifiedEmail()) return false;
        if ($user->isPlatformAdmin()) return true;
        if ($user->community_registration_started_at && MembershipRegistration::state($user) !== 'active') return false;
        $profile = $user->founderProfile;
        if ($profile && ($profile->status !== 'active' || ($profile->directory_key && ! $profile->communityActive()))) return false;
        return $user->hasRole('member') || $user->roleToken() === 'founder' || $profile?->communityActive()
            || Application::where('user_id', $user->id)->where('status', 'approved')->exists();
    }

    public function wantsDigest(User $user): bool
    {
        return (UserSetting::where('user_id', $user->id)->value('notifications')['weekly_digest'] ?? true) === true;
    }

    public function unsubscribeToken(NewsletterSubscriber $subscriber): string
    {
        return hash_hmac('sha256', 'newsletter|'.$subscriber->id.'|'.$subscriber->email, config('app.key'));
    }

    public function unsubscribeUrl(NewsletterSubscriber $subscriber): string
    {
        return rtrim(config('app.frontend_url'), '/').'/newsletter?unsubscribe='.$subscriber->id.'#token='.$this->unsubscribeToken($subscriber);
    }

    public function requestSubscription(string $email, string $locale): void
    {
        $this->requireMailer();
        DB::transaction(function () use ($email, $locale) {
            NewsletterSubscriber::firstOrCreate(['email' => $email], ['locale' => $locale]);
            $subscriber = NewsletterSubscriber::where('email', $email)->lockForUpdate()->firstOrFail();
            // Public responses never disclose membership or subscription status.
            if ($subscriber->status === 'active' || $subscriber->confirmation_sent_at?->gt(now()->subHour())) return;
            $token = Str::random(64);
            $subscriber->fill(['locale' => $locale, 'confirmation_hash' => hash('sha256', $token), 'confirmation_expires_at' => now()->addHours(48), 'confirmation_sent_at' => now()])->save();
            $url = rtrim(config('app.frontend_url'), '/').'/newsletter?confirm='.$subscriber->id.'#token='.$token;
            try { Mail::to($email)->send(new NewsletterMail('confirm', $locale, $url, '')); }
            catch (\Throwable) { abort(503, 'تعذر إرسال رسالة التأكيد. حاول لاحقًا. Confirmation email is temporarily unavailable.'); }
        });
    }

    public function confirm(int $id, string $token): void
    {
        $subscriber = DB::transaction(function () use ($id, $token) {
            $s = NewsletterSubscriber::whereKey($id)->lockForUpdate()->first();
            abort_unless($s && $s->confirmation_hash && $s->confirmation_expires_at?->isFuture() && hash_equals($s->confirmation_hash, hash('sha256', $token)), 422, 'الرابط غير صالح أو انتهت صلاحيته. Invalid or expired link.');
            $s->fill(['status' => 'active', 'explicit_opt_in' => true, 'confirmed_at' => now(), 'unsubscribed_at' => null, 'confirmation_hash' => null, 'confirmation_expires_at' => null])->save();
            $user = User::whereRaw('LOWER(email) = ?', [$s->email])->first();
            if ($user) {
                $settings = UserSetting::firstOrCreate(['user_id' => $user->id], UserSetting::defaults());
                $settings->update(['notifications' => [...$settings->notifications, 'weekly_digest' => true]]);
            }
            return $s;
        });
        $this->deliver($subscriber, 'welcome', 'welcome');
    }

    public function unsubscribe(int $id, string $token): void
    {
        DB::transaction(function () use ($id, $token) {
            $s = NewsletterSubscriber::whereKey($id)->lockForUpdate()->first();
            abort_unless($s && hash_equals($this->unsubscribeToken($s), $token), 422, 'الرابط غير صالح. Invalid link.');
            $s->update(['status' => 'unsubscribed', 'unsubscribed_at' => now(), 'confirmation_hash' => null, 'confirmation_expires_at' => null]);
            $user = User::whereRaw('LOWER(email) = ?', [$s->email])->first();
            if ($user) {
                $settings = UserSetting::firstOrCreate(['user_id' => $user->id], UserSetting::defaults());
                $settings->update(['notifications' => [...$settings->notifications, 'weekly_digest' => false]]);
            }
        });
    }

    public function syncMembers(): void
    {
        User::with(['founderProfile', 'roles'])->whereNotNull('email_verified_at')->chunkById(200, function ($users) {
            foreach ($users as $user) {
                if (! $this->activeMember($user) || ! $this->wantsDigest($user)) continue;
                $s = NewsletterSubscriber::firstOrCreate(['email' => Str::lower(trim($user->email))], ['status' => 'active', 'confirmed_at' => now(), 'user_id' => $user->id]);
                // Never undo an unsubscribe or turn a pending public address into marketing consent.
                if ($s->status === 'active' && ! $s->user_id) $s->update(['user_id' => $user->id]);
            }
        });
    }

    public function eligible(NewsletterSubscriber $subscriber): bool
    {
        if ($subscriber->status !== 'active') return false;
        $user = User::whereRaw('LOWER(email) = ?', [$subscriber->email])->first();
        if ($user && ! $this->wantsDigest($user)) return false;
        if ($subscriber->explicit_opt_in) return true;
        return $user && $this->activeMember($user);
    }

    public function dispatch(bool $digest): array
    {
        $this->requireMailer();
        $this->syncMembers();
        $anchor = now('Asia/Riyadh')->startOfWeek(Carbon::SUNDAY)->setTime(9, 0);
        if ($anchor->isFuture()) $anchor->subWeek();
        $news = $digest ? NewsItem::where('status', 'published')->where('is_public', true)
            ->where('published_at', '>', $anchor->copy()->subWeek()->utc())->where('published_at', '<=', $anchor->copy()->utc())
            ->latest('published_at')->limit(5)->get() : collect();
        $counts = ['sent' => 0, 'failed' => 0];
        NewsletterSubscriber::where('status', 'active')->chunkById(200, function ($subscribers) use ($news, $anchor, &$counts) {
            foreach ($subscribers as $s) {
                if (! $this->eligible($s)) continue;
                $result = $this->deliver($s, 'welcome', 'welcome');
                if ($result) $counts[$result]++;
                if ($news->isEmpty()) continue;
                $stories = $news->map(function ($item) use ($s) {
                    $translated = $s->locale === 'ar' ? ($item->translations['ar'] ?? []) : [];
                    return ['title' => strip_tags($translated['title'] ?? $item->title), 'excerpt' => Str::limit(strip_tags($translated['excerpt'] ?? $item->excerpt ?? ''), 240),
                        'date' => $item->published_at->format('Y-m-d'), 'url' => rtrim(config('app.frontend_url'), '/').'/news/'.rawurlencode($item->slug)];
                })->all();
                $result = $this->deliver($s, 'weekly:'.$anchor->format('Y-m-d'), 'digest', $stories);
                if ($result) $counts[$result]++;
            }
        });
        return $counts;
    }

    private function deliver(NewsletterSubscriber $subscriber, string $campaign, string $kind, array $stories = []): ?string
    {
        $fresh = $subscriber->fresh();
        if (! $fresh || ! $this->eligible($fresh)) return null;
        DB::table('newsletter_deliveries')->insertOrIgnore(['subscriber_id' => $subscriber->id, 'campaign' => $campaign, 'status' => 'pending', 'attempts' => 0, 'created_at' => now(), 'updated_at' => now()]);
        $row = DB::table('newsletter_deliveries')->where('subscriber_id', $subscriber->id)->where('campaign', $campaign);
        // A sending row is deliberately not reclaimed: a crash after SMTP acceptance is ambiguous.
        if (! (clone $row)->whereIn('status', ['pending', 'failed'])->where('attempts', '<', 3)->update(['status' => 'sending', 'attempts' => DB::raw('attempts + 1'), 'updated_at' => now()])) return null;
        try {
            $this->requireMailer();
            Mail::to($subscriber->email)->send(new NewsletterMail($kind, $subscriber->locale, rtrim(config('app.frontend_url'), '/').'/news', $this->unsubscribeUrl($subscriber), $stories));
            $row->update(['status' => 'sent', 'sent_at' => now(), 'updated_at' => now()]);
            return 'sent';
        } catch (\Throwable) {
            $row->update(['status' => 'failed', 'updated_at' => now()]);
            return 'failed';
        }
    }

    private function requireMailer(): void
    {
        abort_unless(app(FounderInvitationService::class)->realMailer((string) config('mail.default')) && filled(config('mail.from.address')), 503, 'A delivery mailer is required. خدمة البريد غير متاحة حاليًا.');
    }
}
