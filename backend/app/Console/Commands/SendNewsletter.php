<?php
namespace App\Console\Commands;
use App\Services\Newsletter;
use Illuminate\Console\Command;
class SendNewsletter extends Command
{
    protected $signature = 'wosool:newsletter {--digest : Include the latest monthly issue}';
    protected $description = 'Welcome active members and deliver the monthly newsletter with deduplication';
    public function handle(Newsletter $newsletter): int
    {
        $result = $newsletter->dispatch((bool) $this->option('digest'));
        $this->info("Sent: {$result['sent']}; failed: {$result['failed']}");
        return $result['failed'] ? self::FAILURE : self::SUCCESS;
    }
}
