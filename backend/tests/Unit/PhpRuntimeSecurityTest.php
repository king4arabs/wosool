<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

require_once __DIR__.'/../../../scripts/check-php-runtime.php';

class PhpRuntimeSecurityTest extends TestCase
{
    public function test_rejects_unpatched_and_untested_branches(): void
    {
        foreach (['8.2.35', '8.3.35', '8.4.26', '8.5.11', '8.5.12RC1', '8.6.0RC3'] as $version) {
            $this->assertFalse(wosoolPhpRuntimeIsPatched($version), $version);
        }
    }

    public function test_accepts_patched_supported_branches(): void
    {
        foreach (['8.3.36', '8.3.37', '8.4.27', '8.5.12', '8.5.12+vendor'] as $version) {
            $this->assertTrue(wosoolPhpRuntimeIsPatched($version), $version);
        }
    }
}
