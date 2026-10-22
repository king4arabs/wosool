<?php

// Local bootstrap only: never rotate an existing application key.
declare(strict_types=1);

$root = dirname(__DIR__).'/backend';
chdir($root);
if (! file_exists('.env')) {
    copy('.env.example', '.env');
}
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

if ($app->environment('production')) {
    fwrite(STDERR, "Local setup cannot run in production. Follow DEPLOYMENT.md.\n");
    exit(1);
}

if (! config('app.key')) {
    Illuminate\Support\Facades\Artisan::call('key:generate', ['--force' => true]);
    echo "Generated a local application key.\n";
} else {
    echo "Preserved the existing application key.\n";
}

if (config('database.default') === 'sqlite') {
    $database = config('database.connections.sqlite.database');
    if ($database && $database !== ':memory:' && ! file_exists($database)) {
        if (! touch($database)) {
            fwrite(STDERR, "Unable to create the configured SQLite database. Check DB_DATABASE.\n");
            exit(1);
        }
    }
}
