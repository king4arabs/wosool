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
        foreach ([
            'api/v1/auth/me',
            'v1/auth/login',
            'api/v1/member/dashboard',
            'v1/admin/founders',
            'api/v1/chat/rooms',
            'v1/help-requests',
            'v1/%61uth/me',
            'api/v1/%6dember/dashboard',
        ] as $path) {
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

    public function test_founder_and_company_api_json_is_not_cached_or_indexed(): void
    {
        foreach (['/api/v1/founders', '/v1/founders/example', '/api/v1/companies', '/v1/companies/example'] as $path) {
            $response = (new ApiSecurityHeaders)->handle(Request::create($path),
                fn () => new Response('{}', 200, ['Cache-Control' => 'public, max-age=600']));
            $this->assertTrue($response->headers->hasCacheControlDirective('no-store'));
            $this->assertTrue($response->headers->hasCacheControlDirective('private'));
            $this->assertSame('noindex, nofollow, noarchive', $response->headers->get('X-Robots-Tag'));
        }
        $news = (new ApiSecurityHeaders)->handle(Request::create('/api/v1/news'),
            fn () => new Response('{}', 200, ['Cache-Control' => 'public, max-age=60']));
        $this->assertTrue($news->headers->hasCacheControlDirective('public'));
        $this->assertFalse($news->headers->has('X-Robots-Tag'));
    }

    public function test_existing_stricter_referrer_policy_is_preserved(): void
    {
        $response = (new ApiSecurityHeaders)->handle(Request::create('/api/v1/auth/me'),
            fn () => new Response('{}', 200, ['Referrer-Policy' => 'no-referrer']));

        $this->assertSame('no-referrer', $response->headers->get('Referrer-Policy'));
    }
}
