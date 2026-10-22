<?php

namespace Tests\Unit;

use App\Http\Middleware\ApiSecurityHeaders;
use Illuminate\Http\Request;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

class ApiSecurityHeadersTest extends TestCase
{
    public function test_private_routes_cannot_be_cached_on_either_mount(): void
    {
        foreach (['api/v1/auth/me', 'v1/auth/login', 'api/v1/member/dashboard', 'v1/admin/founders'] as $path) {
            foreach ([200, 401, 403, 422] as $status) {
                $response = (new ApiSecurityHeaders)->handle(Request::create('/'.$path),
                    fn () => new Response('{}', $status, ['Cache-Control' => 'public, max-age=600']));
                $this->assertTrue($response->headers->hasCacheControlDirective('no-store'));
                $this->assertTrue($response->headers->hasCacheControlDirective('private'));
                $this->assertSame('noindex, nofollow', $response->headers->get('X-Robots-Tag'));
                $this->assertSame('nosniff', $response->headers->get('X-Content-Type-Options'));
                $this->assertSame($status, $response->getStatusCode());
            }
        }
    }

    public function test_public_responses_keep_their_cache_policy(): void
    {
        $response = (new ApiSecurityHeaders)->handle(Request::create('/api/v1/founders'),
            fn () => new Response('{}', 200, ['Cache-Control' => 'public, max-age=60']));
        $this->assertFalse($response->headers->hasCacheControlDirective('no-store'));
        $this->assertTrue($response->headers->hasCacheControlDirective('public'));
        $this->assertFalse($response->headers->has('X-Robots-Tag'));
        $this->assertSame('nosniff', $response->headers->get('X-Content-Type-Options'));
    }
}
