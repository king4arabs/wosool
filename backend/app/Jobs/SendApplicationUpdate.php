<?php

namespace App\Jobs;

use App\Mail\ApplicationUpdateMail;

use App\Models\ApplicationEvent;
use App\Models\ProgramApplication;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class SendApplicationUpdate implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public $tries = 4;

    public $uniqueFor = 3600;

    public function __construct(public int $eventId)
    {
        $this->afterCommit();
    }

    public function uniqueId(): string
    {
        return 'application-event-'.$this->eventId;
    }

    public function backoff(): array
    {
        return [30, 120, 600];
    }

    public function handle(): void
    {
        Cache::lock($this->uniqueId().'-delivery', 120)->block(5, function () {
            $event = ApplicationEvent::find($this->eventId);
            if (! $event || $event->is_internal || $event->notification_sent_at || ! config('gateway.email_updates')) {
                return;
            }
            $application = ProgramApplication::find($event->application_id);
            $user = $application ? User::find($application->user_id) : null;
            if (! $user || ! $user->hasVerifiedEmail()) {
                return;
            }
            if (($user->userSetting?->notifications['program_updates'] ?? true) === false) {
                return;
            }
            $url = rtrim(config('app.frontend_url'), '/').'/accelerator/apply';
            Mail::to($user->email)->send(new ApplicationUpdateMail($url));
            $event->update(['notification_sent_at' => now()]);
        });
    }
}
