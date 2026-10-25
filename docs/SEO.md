# Search visibility and release checks

Updated: 25 October 2026. This is the implementation and operating guide, not proof of indexing, rankings or a live deployment.

## What the frontend now provides

- Per-page titles, descriptions, canonical URLs and Open Graph/Twitter metadata. Opportunity catalog entries and EO Accelerator sections have distinct snippets. News snippets match the default Arabic content when a translation exists.
- The existing 1200×630 PNG social preview at `/opengraph-image`, preserved from the concurrently merged sharing update. See [sharing operations](SEO-OPERATIONS.md) for Google/Bing/Meta ownership and preview setup.
- Website/organization structured data and breadcrumbs for news, wiki, opportunities, public events and programs. JSON-LD escapes script delimiters; no invented ratings, eligibility, pricing or affiliation claims.
- Public event/program headings and descriptions in the initial HTML. Interactive registration and application features remain in client components. The server reads the anonymous API with no cookies, no redirects, a five-second timeout and an explicit field allowlist. Missing or withdrawn records use `notFound()`; API failures and member-only/draft programs use `noindex` without treating a temporary failure as a permanent deletion.
- Missing detail pages use Next.js’s not-found boundary and explicit noindex metadata. With the existing root loading boundary, Next.js can already have streamed HTTP 200; its injected noindex still prevents indexing. The regression check accepts the documented 200/404 response paths and requires the not-found boundary and noindex. Browser streaming and the existing Next.js configuration are preserved.
- Dynamic sitemap coverage for public founder/company profiles, published news, upcoming public events, public programs and published ecosystem records, plus local public pages/opportunities/wiki. API pagination is bounded to 20 pages and eight seconds per collection, runs concurrently, deduplicates URLs and excludes hidden/draft/future-published records. Outages contribute no stale profile snapshot URLs. `lastmod` comes only from valid, non-future source `updated_at` values or the wiki's editorial date; never from the sitemap request time. The current event list API supplies upcoming events; archived event sitemap coverage remains future work.
- Explicit `noindex` on authentication and activation pages. These URLs remain crawlable so engines can process the directive. Private dashboards/admin and API paths retain crawl exclusions and existing access controls.

## Google, Bing and other engines

1. Verify `https://wosool.org` in Google Search Console and Bing Webmaster Tools using an authorized owner account. DNS verification is suitable for a domain property. For URL-prefix HTML verification, the frontend supports `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` and `YANDEX_SITE_VERIFICATION`; set only values actually issued by the provider, then rebuild. These are public ownership tokens, not API secrets. No verification or sitemap submission is implied by this code change.
2. Submit `https://wosool.org/sitemap.xml` in the verified tools. Check page indexing, crawl errors, rich-result validation and crawl statistics. Sitemaps assist discovery; they do not guarantee indexing or ranking.
3. Monitor Search Console performance by page, query, country and device. Prioritize relevant Saudi/GCC founder, startup, opportunity and accelerator queries; publish useful original material with accurate attribution and current source links.
4. Check field Core Web Vitals (LCP, INP and CLS) when sufficient traffic exists, especially mobile. Measure before claiming performance gains. Avoid fabricated reviews, keyword stuffing, hidden text or bulk low-value pages.
5. Consider IndexNow for changed canonical public URLs after adding a real key and a controlled publication hook. No IndexNow key, submission or automated Google indexing is configured in this release.

The language switch currently changes content on the same URL using browser state. Do not emit fictitious `/en` or `/ar` hreflang destinations. A future locale-routing change should provide distinct server-rendered language URLs, self canonicals, reciprocal hreflang and matching sitemap entries together. The remaining founder/company profile bodies and API-only legacy opportunity details should also be progressively server-rendered with the same privacy constraints.

## Validation and release

From `frontend/`:

```bash
npm run lint
npm run type-check
npm test
npm run test:hosting
# Requires the documented production site/API origins and demo=false.
npm run build
node scripts/check-seo.mjs
npm run smoke:hosting
```

The SEO smoke starts the production server and checks eight distinct page titles, descriptions, canonicals/social URLs, JSON-LD parsing, five noindex routes, robots, sitemap uniqueness/private exclusions, and PNG delivery. Test-only `seo-fixture-*` API responses verify visible event/program headings without JavaScript, crawler not-found/noindex responses, outage noindex and no serialization of private fields. The preload is used only by this local test process and is never loaded by the production start command. CI runs this check against its existing local-origin build.

For a live release, run from `frontend/`:

```bash
SEO_BASE_URL=https://wosool.org SEO_CANONICAL_ORIGIN=https://wosool.org node scripts/check-seo.mjs
```

Live mode does not inject test fixtures or create content. Run `node scripts/production-smoke.mjs` from the repository root as well. Confirm active source SHA and served JavaScript/CSS through the existing Hostinger release process. Preserve all runtime tracing, hoisted dependencies, one-worker webpack and separate Laravel API settings in `AGENTS.md` and `DEPLOYMENT.md`.

References:
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- https://www.bing.com/webmasters/help/URL-Submission-62f2860b
