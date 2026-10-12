<?php

namespace App\Console\Commands;

use App\Models\CompanyProfile;
use App\Models\NewsItem;
use Carbon\CarbonImmutable;
use DateTimeImmutable;
use DOMDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use SimpleXMLElement;
use Throwable;

class SyncNews extends Command
{
    protected $signature = 'news:sync {--include-unverified : Also attempt unverified Wamda and TechCrunch feed endpoints}';

    protected $description = 'Import brief startup RSS news summaries from trusted publishers without replacing editorial records.';

    private const MAX_BYTES = 1_048_576;

    private const MAX_ITEMS = 50;

    private const FEEDS = [
        [
            'url' => 'https://www.microsoft.com/en-us/startups/blog/feed/',
            'name' => 'Microsoft for Startups',
            'hosts' => ['www.microsoft.com'],
            'image_hosts' => ['www.microsoft.com'],
        ],
        [
            'url' => 'https://www.wamda.com/feed',
            'name' => 'Wamda',
            'hosts' => ['www.wamda.com', 'wamda.com'],
            'image_hosts' => ['www.wamda.com', 'wamda.com', 'wamda-prod.s3.amazonaws.com'],
        ],
        [
            'url' => 'https://techcrunch.com/category/startups/feed/',
            'name' => 'TechCrunch',
            'hosts' => ['techcrunch.com', 'www.techcrunch.com'],
            'image_hosts' => ['techcrunch.com', 'www.techcrunch.com'],
        ],
        [
            'url' => 'https://techcrunch.com/category/venture/feed/',
            'name' => 'TechCrunch',
            'hosts' => ['techcrunch.com', 'www.techcrunch.com'],
            'image_hosts' => ['techcrunch.com', 'www.techcrunch.com'],
        ],
    ];

    public function handle(): int
    {
        $imported = 0;
        $failed = false;
        $companyNames = CompanyProfile::query()->where('is_public', true)->pluck('name')->all();

        foreach (self::FEEDS as $feed) {
            if ($feed['name'] !== 'Microsoft for Startups' && ! $this->option('include-unverified')) {
                continue;
            }

            try {
                $xml = $this->fetch($feed['url']);
                $items = $this->parse($xml);
            } catch (Throwable) {
                $this->warn("Could not read {$feed['name']} feed; existing news retained.");
                $failed = true;

                continue;
            }

            $count = 0;
            foreach ($items as $item) {
                if (++$count > self::MAX_ITEMS) {
                    break;
                }

                $data = $this->article($item, $feed, $companyNames);
                if ($data === null) {
                    continue;
                }

                // Include soft-deleted rows: an editorial deletion must not be resurrected.
                $news = NewsItem::withTrashed()->firstOrCreate(['source_url' => $data['source_url']], $data);
                $imported += (int) $news->wasRecentlyCreated;
            }
        }

        $this->info("Imported {$imported} news summaries.");

        return $failed ? self::FAILURE : self::SUCCESS;
    }

    private function fetch(string $url): string
    {
        $response = Http::connectTimeout(3)->timeout(10)->withHeaders([
            'Accept' => 'application/rss+xml, application/xml, text/xml',
        ])->withOptions([
            'allow_redirects' => false,
            'stream' => true,
            'read_timeout' => 3,
            'on_headers' => function ($response): void {
                if ((int) $response->getHeaderLine('Content-Length') > self::MAX_BYTES) {
                    throw new RuntimeException('Feed too large.');
                }
            },
        ])->get($url);

        if (! $response->successful()) {
            throw new RuntimeException('Feed unavailable.');
        }

        $stream = $response->toPsrResponse()->getBody();
        $body = '';
        $deadline = microtime(true) + 10;

        try {
            while (! $stream->eof()) {
                $body .= $stream->read(min(8192, self::MAX_BYTES + 1 - strlen($body)));
                if (strlen($body) > self::MAX_BYTES || microtime(true) > $deadline) {
                    throw new RuntimeException('Feed limit exceeded.');
                }
            }
        } finally {
            $stream->close();
        }

        return $body;
    }

    private function parse(string $body): SimpleXMLElement
    {
        if (! mb_check_encoding($body, 'UTF-8') || str_contains($body, "\0")
            || preg_match('/<!\s*(DOCTYPE|ENTITY)\b/i', $body)
            || (preg_match('/<\?xml\b[^?]*\bencoding\s*=\s*["\']([^"\']+)["\']/i', $body, $encoding)
                && ! in_array(strtolower($encoding[1]), ['utf-8', 'utf8'], true))) {
            throw new RuntimeException('Unsafe feed XML.');
        }

        $previous = libxml_use_internal_errors(true);
        try {
            $xml = simplexml_load_string($body, SimpleXMLElement::class, LIBXML_NONET | LIBXML_NOCDATA);
            if ($xml === false || $xml->getName() !== 'rss' || ! isset($xml->channel)) {
                throw new RuntimeException('Invalid RSS.');
            }

            return $xml->channel->item;
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
    }

    private function article(SimpleXMLElement $item, array $feed, array $companyNames): ?array
    {
        $url = $this->sourceUrl(trim((string) $item->link), $feed['hosts']);
        $title = $this->plainText((string) $item->title, 255);
        $excerpt = $this->plainText((string) $item->description, 320);
        $publishedAt = $this->publicationDate(trim((string) $item->pubDate));

        if ($url === null || $title === '' || $excerpt === '' || $publishedAt === null || $publishedAt->isFuture()) {
            return null;
        }

        $searchText = $title.' '.$excerpt;
        $companies = array_values(array_filter($companyNames, fn ($name) => is_string($name)
            && mb_strlen($name) >= 2
            && preg_match('/(?<![\pL\pN])'.preg_quote($name, '/').'(?![\pL\pN])/iu', $searchText)));
        $imageUrl = $this->imageUrl($item, $feed['image_hosts']);

        return [
            'source_url' => $url,
            'source_name' => $feed['name'],
            'slug' => 'rss-'.hash('sha256', $url),
            'title' => $title,
            'excerpt' => $excerpt,
            'content' => null,
            'category' => 'ecosystem',
            'author_name' => $feed['name'],
            'companies' => array_values(array_unique($companies)),
            'tags' => [],
            'image_url' => $imageUrl,
            'image_credit' => $imageUrl !== null ? $feed['name'] : null,
            'is_featured' => false,
            'is_public' => true,
            'status' => 'published',
            'published_at' => $publishedAt,
        ];
    }

    private function sourceUrl(string $url, array $hosts): ?string
    {
        if (strlen($url) > 255 || ! filter_var($url, FILTER_VALIDATE_URL)
            || preg_match('/[\x00-\x20\x7f\\\\]/', $url)) {
            return null;
        }

        $parts = parse_url($url);
        if ($parts === false || strtolower($parts['scheme'] ?? '') !== 'https'
            || ! in_array(strtolower($parts['host'] ?? ''), $hosts, true)
            || isset($parts['user']) || isset($parts['pass'])
            || (isset($parts['port']) && $parts['port'] !== 443)) {
            return null;
        }

        return 'https://'.strtolower($parts['host']).($parts['path'] ?? '/')
            .(isset($parts['query']) ? '?'.$parts['query'] : '');
    }

    private function plainText(string $value, int $limit): string
    {
        $text = strip_tags(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');

        return Str::limit($text, $limit, '');
    }

    private function imageUrl(SimpleXMLElement $item, array $hosts): ?string
    {
        $media = $item->children('http://search.yahoo.com/mrss/');
        $candidates = [];
        foreach (['content', 'thumbnail'] as $element) {
            foreach ($media->{$element} as $image) {
                $attributes = $image->attributes();
                $type = strtolower((string) $attributes['type']);
                $medium = strtolower((string) $attributes['medium']);
                if (($type === '' || str_starts_with($type, 'image/')) && ($medium === '' || $medium === 'image')) {
                    $candidates[] = (string) $attributes['url'];
                }
            }
        }
        foreach ($item->enclosure as $enclosure) {
            if (str_starts_with(strtolower((string) $enclosure['type']), 'image/')) {
                $candidates[] = (string) $enclosure['url'];
            }
        }

        $image = $this->firstImageSrc((string) $item->description);
        if ($image === null) {
            $content = $item->children('http://purl.org/rss/1.0/modules/content/');
            $image = $this->firstImageSrc((string) $content->encoded);
        }
        if ($image !== null) {
            $candidates[] = $image;
        }

        foreach ($candidates as $candidate) {
            $url = $this->sourceUrl(trim($candidate), $hosts);
            if ($url !== null) {
                return $url;
            }
        }

        return null;
    }

    private function firstImageSrc(string $markup): ?string
    {
        $previous = libxml_use_internal_errors(true);
        try {
            $html = new DOMDocument;
            $markup = html_entity_decode($markup, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if ($markup !== '' && $html->loadHTML($markup, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) {
                return $html->getElementsByTagName('img')->item(0)?->getAttribute('src');
            }

            return null;
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
    }

    private function publicationDate(string $value): ?CarbonImmutable
    {
        foreach ([DATE_RSS, 'D, d M Y H:i:s T', 'd M Y H:i:s O', DATE_ATOM, 'Y-m-d\TH:i:s\Z'] as $format) {
            $date = DateTimeImmutable::createFromFormat('!'.$format, $value);
            $errors = DateTimeImmutable::getLastErrors();
            if ($date !== false && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))) {
                return CarbonImmutable::instance($date)->utc();
            }
        }

        return null;
    }
}
