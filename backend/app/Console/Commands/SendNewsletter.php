<?php
namespace App\Console\Commands;
use App\Services\Newsletter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
class SendNewsletter extends Command
{
    protected $signature = 'wosool:newsletter {--digest : Include the latest monthly issue} {--check : Report readiness and delivery counts without sending or changing subscriptions}';
    protected $description = 'Welcome active members and deliver the monthly newsletter with deduplication';
    public function handle(Newsletter $newsletter): int
    {
        if ($this->option('check')) {
            $status = $newsletter->status();
            $this->line(json_encode($status, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $this->comment('Configuration checks do not verify SMTP credentials, inbox delivery, DNS authentication or cron installation.');
            return $status['transport_configured'] ? self::SUCCESS : self::FAILURE;
        }
        $run = ['started_at' => now()->toIso8601String(), 'finished_at' => null, 'status' => 'running'];
        Cache::forever('newsletter:last_run', $run);
        try {
            $result = $newsletter->dispatch((bool) $this->option('digest'));
            Cache::forever('newsletter:last_run', [...$run, 'finished_at' => now()->toIso8601String(), 'status' => $result['failed'] ? 'failed' : 'completed', ...$result]);
            $this->info("Sent: {$result['sent']}; failed: {$result['failed']}");
            return $result['failed'] ? self::FAILURE : self::SUCCESS;
        } catch (\Throwable $error) {
            Cache::forever('newsletter:last_run', [...$run, 'finished_at' => now()->toIso8601String(), 'status' => 'failed']);
            // Provider exceptions can contain addresses or credentials; do not expose them in the dashboard.
            $this->error('Newsletter dispatch failed. Check mail configuration and provider logs.');
            return self::FAILURE;
        }
    }
}
