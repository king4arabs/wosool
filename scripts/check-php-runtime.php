<?php

declare(strict_types=1);

/** Upstream security floors for CVE-2026-109618 and CVE-2026-109619. */
function wosoolPhpRuntimeIsPatched(string $version): bool
{
    $floors = ['8.3' => '8.3.36', '8.4' => '8.4.27', '8.5' => '8.5.12'];
    if (! preg_match('/^(8\.[345])\.(\d+)(?:$|\+[a-zA-Z0-9.-]+$|-[0-9][a-zA-Z0-9.+~:-]*$)/', $version, $matches)) {
        return false;
    }

    return version_compare($matches[1].'.'.$matches[2], $floors[$matches[1]], '>=');
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    if (! wosoolPhpRuntimeIsPatched(PHP_VERSION)) {
        fwrite(STDERR, 'Unsupported or unpatched PHP '.PHP_VERSION.'. Install PHP 8.3.36+, 8.4.27+, or 8.5.12+ on the corresponding stable branch before installing Wosool dependencies. Verify the web runtime separately; CLI PHP may differ.'.PHP_EOL);
        exit(1);
    }
    fwrite(STDOUT, 'PHP '.PHP_VERSION.' meets the October 2026 upstream security floor.'.PHP_EOL);
}
