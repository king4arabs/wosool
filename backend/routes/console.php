<?php

use App\Console\Commands\ExpireStalledIntroductions;
use App\Console\Commands\SyncNews;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(ExpireStalledIntroductions::class)->hourly();
Schedule::command(SyncNews::class)->daily()->withoutOverlapping();

// Hourly retries and new-member welcomes; each monthly issue is sent only once.
Schedule::command('wosool:newsletter --digest')->hourly()->withoutOverlapping();

Schedule::command('wosool:founder-outreach')->everyFiveMinutes()->withoutOverlapping(15);
