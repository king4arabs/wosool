# Search and sharing operations

See [the extended search visibility guide](SEO.md) for dynamic page indexing, crawler status handling, sitemap visibility filters and the CI regression checks.

## Release checks

Preserve DEPLOYMENT.md and AGENTS.md. This change does not alter package versions, runtime tracing, hoisted linking or build concurrency. Keep private/admin/auth routes excluded from indexing. Sitemap records come from the live anonymous API; unavailable services must not resurrect withdrawn profiles from snapshots.

After the actual Hostinger deployment, check `/`, `/founders`, a public company profile, `/news`, `/robots.txt`, `/sitemap.xml` and `/opengraph-image`. The image must return HTTP 200, `image/png`, and 1200×630 pixels. Check initial HTML for canonical URL, description, `og:title`, `og:url`, `og:image` and Twitter card. Inspect the Organization/WebSite graph and existing news/wiki structured data with Google's Rich Results Test; some valid schema types do not have a rich result feature. Check private pages still carry noindex.

## Ownership and submission

Set only real owner-issued public tokens in the Hostinger build environment, then rebuild:

- `GOOGLE_SITE_VERIFICATION`: Google Search Console token for the URL-prefix property. A DNS domain-property verification is a separate account/DNS action.
- `BING_SITE_VERIFICATION`: Bing Webmaster Tools `msvalidate.01` content.
- `META_DOMAIN_VERIFICATION`: Meta Business domain verification content.

Empty tokens generate no claim of verified ownership. These are public verification tags, not analytics or advertising tracking. No Search Console/Bing/Meta account was configured by this code change.

In the authorized provider accounts, complete ownership verification, submit `https://wosool.org/sitemap.xml` to Google and Bing, inspect key URLs and review crawl/indexing reports. Use Meta Sharing Debugger to scrape the homepage and an article after deployment; check LinkedIn Post Inspector and X previews as relevant. No automated indexing requests, analytics tags or ad pixels are added.

## Language and content

The existing site shares URLs between Arabic/English via client locale. Do not add fabricated hreflang URLs for translations without independently crawlable localized routes and matching server HTML. Keep original, useful public content and accurate source links; keep internal AI/editorial process notes out of visitor copy. Preserve page-specific metadata and crawlable internal links. Track indexing, impressions, clicks, Core Web Vitals and successful conversions after verification; there is no guaranteed ranking or rich-result placement.

References:

- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/site-names
- https://ogp.me/

## Validation — 25 October 2026

183 frontend tests and lint pass. Final production webpack build and TypeScript pass. Local production HTTP checks passed for canonical URLs, PNG social references and Organization/WebSite JSON-LD on `/`, `/founders`, `/news` and `/login`; `/login` retains its noindex response header. The generated image returned image/png, 1200×630, 46,740 bytes. Account verification, live hosting release, provider preview cache refresh and sitemap submission remain operational actions; they were not performed here.
