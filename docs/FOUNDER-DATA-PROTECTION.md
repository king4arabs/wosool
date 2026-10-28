# Wosool founder-data anti-scraping safeguards — 28 October 2026

## Implementation
Public founder and company APIs are throttled at 30 requests per minute and cap pagination at 24 records per response. They return `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow, noarchive`, while public HTML profile pages retain their regular SEO controls. Anonymous founder responses redact linked account data, legal identities, direct social links, member needs/offers/skills, claiming dates and private scorecards/history. The separate authenticated owner and admin workflows are preserved.

These safeguards discourage automated harvesting but do **not** make public information impossible to scrape. In particular, the public editorial founder JSON already checked into this public GitHub repository, and profile facts visibly rendered in the browser, should be treated as public. A robots exclusion alone is not a privacy mechanism. Do not put private founder contact details or investor notes into seed data, client bundles or this public repository.

## Production release checklist
1. Release backend API and frontend/API schema together, using the repository's accepted Hostinger runtime baseline in `AGENTS.md` and `DEPLOYMENT.md`.
2. Verify `GET /api/v1/founders?per_page=100` and companies equivalent return at most 24 records, preserve correct pagination links, and respond with 429 when the throttle is exceeded. Test canonical and mounted paths.
3. Verify anonymous list/detail and company-nested founders show no legal name beyond display alias, no user IDs/emails, personal needs/offers/skills, direct social URLs, `claimed_at`, scorecards or historical notes; verify the member endpoint still returns authorized owner data.
4. Verify cache and robots headers on API JSON while HTML founder pages remain indexable. Verify both Arabic and English public cards, loading more results, search/filter behavior and account/membership flows.
5. After a staged deploy, check `/`, `/founders`, `/founders/companies`, `/eoa`, `/health` and public API health. Record commit SHA, Hostinger version, logs and rollback evidence.

## Edge controls still required — not included in this code
Enable managed WAF and bot controls at the hosting edge: risk-scored challenges, separate per-IP and per-session request limits, monitoring of sequential pagination/profile enumeration, and alerts for surges in 429s. Do not trust arbitrary `X-Forwarded-For` headers; configure trusted proxies correctly. Allow legitimate users behind shared NAT, search engines accessing HTML, accessibility tools and explicitly authorized partner integrations. Implement privacy-conscious log retention and an incident escalation owner.

Success criteria: zero sensitive founder fields in public API QA, reliable 429 behavior, reasonable false-positive rate, and a monitored decrease in bulk enumeration. Deployment, WAF setup, owners and acceptance evidence are **TBD**, not assumed completed.
