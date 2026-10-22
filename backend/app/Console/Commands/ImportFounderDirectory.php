<?php
namespace App\Console\Commands;

use App\Services\FounderDirectoryImporter;
use Illuminate\Console\Command;

class ImportFounderDirectory extends Command
{
    protected $signature = 'wosool:import-founders';
    protected $description = 'Import sourced public founder/company profiles without creating accounts, sending email, or overwriting existing records';
    public function handle(FounderDirectoryImporter $importer): int
    {
        $this->info(json_encode($importer->run(), JSON_UNESCAPED_UNICODE));
        return self::SUCCESS;
    }
}
