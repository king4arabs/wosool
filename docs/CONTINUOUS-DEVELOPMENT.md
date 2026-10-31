# Wosool continuous development

Updated: 31 October 2026. Work in bounded, reviewable cycles: inspect → verify sources → implement → test → publish source → verify release → choose the next incomplete outcome. Completion applies to acceptance criteria, not a promise that software or research needs no further maintenance.

Current production status: hourly production health run 205 passed on 31 October, including the public site/API checks that exposed missing registration, newsletter and exact-founder-filter routes on 30 October. The earlier mismatch no longer reproduces in the read-only/empty-payload monitor. This does not identify the serving Hostinger frontend/backend SHAs, prove controlled-inbox OTP or authenticated member behavior, or establish any production founder/news import. The standalone hosting gate continues to boot the generated artifact through its package-manager `start` command, and production imports remain a separate authenticated operation.

Current reliability correction: global 404, unexpected-error, loading and toast accessibility copy follows the active Arabic/English locale. The error boundary uses Next.js `retry()`, removes the unsupported claim that the team was notified and shows a server digest only when available. The same merge repairs the protected company-contract regression: nested founders omit scorecards while standalone public founders retain the documented redacted null. CI run 296 passed all frontend/browser/hosting/production gates and Laravel on PHP 8.3, 8.4 and 8.5. Production behavior awaits revision-parity verification.

Current founder-integrity correction: profiles have immutable UUID identities and at most one private scorecard. An administrator cannot approve a community application while its linked founder profile is suspended; the API returns HTTP 409 before status mutation, publication, audit logging or approval notification. Required CI run 458 passed all six jobs. The recovered public smoke monitor covers exact founder filtering, but the suspended-approval guard still requires serving-SHA evidence and a controlled authorized verification rather than changing a real member record.

Current member and company journey correction: founder-profile item and photo-link errors now follow the request language, fold indexed API keys into the visible field, expose accessible invalid state and move focus to the first rejected input. Company search now covers sector, stage, location, description and founder names with word-by-word Arabic-aware normalization; filters have distinct accessible names and RTL-safe positioning. Required CI run 469 passed all six jobs. Production deployment of these changes is not established by the merge or branch previews.

Current public-directory safeguards: OpenAPI 1.5.0 and the Laravel API cap founder/company pages at 24, throttle anonymous reads at 30 requests per minute, add private no-store/noindex headers and redact member/account/contact/matching/scorecard fields. Authenticated owner/admin workflows retain authorized data. Public repository and browser-visible facts remain public; trusted-proxy configuration, WAF/bot controls, production 429/redaction testing and false-positive monitoring are unresolved hosting work. [Implementation and release checklist](FOUNDER-DATA-PROTECTION.md).

Current interface correction: Arabic dates now use a shared Gregorian/Western-digit locale across public, member and admin views. Member event and program times use Riyadh time with a visible label. EO Accelerator pages retain Arabic-Indic digits while explicitly selecting Gregorian dates. Required CI, source guards and the focused crawl pass; live behavior awaits revision-parity verification.

Current form correction: backend validation now follows `X-Locale` for public, account and member forms. The Arabic catalog covers every framework rule and the fields used by these journeys; application, contact, introduction and program-specific messages are localized in both languages. Required CI passes on PHP 8.3, 8.4 and 8.5; production behavior awaits backend revision-parity verification.

Current member-settings correction: `/dashboard/settings` and its API errors now follow the active Arabic or English locale, replace raw preference keys with written labels, restore heading structure and add password guidance, autocomplete hints, RTL-safe spacing and current-page semantics. Dashboard navigation and profile tag removal controls also use localized accessible names. GitHub CI run 282 passed on the merged source. Only `program_updates` currently affects delivery; the other 12 stored preferences remain an explicit implement-or-hide decision and must not be described as enforced behavior. Production behavior awaits frontend/backend revision-parity verification.

Hosting build correction: the latest user-supplied log at `b7ad796` confirms installation, webpack compilation and TypeScript success, followed by a Tokio thread-spawn failure when Next.js launched 63 page workers. The build now uses one Next.js page worker and build-only Tokio/Rayon pool limits. Standalone CI matches Node 22 / pnpm 11.24.0, simulates the 63-worker default and checks one-worker generation. Hostinger publish/activation remains an independent acceptance gate; the account's exact resource quota is not known.

Homepage discovery exposes a permanent editorial spotlight with a random 36-card Saudi-first mix and shuffle control, while public API profiles load all pages and remain a separately labeled collection. The four checked-in founder catalogs now contain **320 founders / 175 company groups**, and the news catalog contains **97 stories**, after the 31 October append-only RIME and Serval review. `content:check` reports zero integrity problems and `content:review` reports zero founder reviews due; no review date was advanced by the verification commands. All four founder catalogs participate in parity, freshness and additive-import checks. Public region filters and partner-category navigation retain working qualitative labels without exposing editorial totals. Node 22 frozen pnpm installs use the explicit two-package `allowBuilds` policy at both the repository root and the standalone `frontend/` deployment root. CI also checks a frontend-only archive with a fresh store, since root approvals are absent from that layout. [Homepage implementation and checks](research/HOME-FOUNDER-DISCOVERY-2026-10-22.md) · [latest source evidence](research/CONTENT-REFRESH-2026-10-31.md).

Current contract slice: OpenAPI 1.5.0 retains the typed revenue-qualified startup collection and adds the protected anonymous founder/company contract: a 24-record page cap, explicit rate-limit responses and redacted founder fields. Reported revenue/ARR remains distinct from financial-statement sources without implying an audit or program approval. The eight checked-in eligible startup records remain separate from the broader 320-founder / 175-company editorial snapshots; broader founder evidence is not revenue evidence. Shared contracts exercise both locales in required Laravel CI. [Startup checks and evidence limits](API-STARTUP-CONTRACT-2026-10-22.md) · [founder-data safeguards](FOUNDER-DATA-PROTECTION.md).

Current contract slice: OpenAPI 1.3.0 adds standalone public company list/detail schemas, including public founder relationships. `founders_count` now uses the same active/public boundary as the returned array, preventing hidden profiles from affecting an anonymous count. All 22 live company responses pass the local schema. Required Laravel CI must exercise all 79 imported companies in both locales before merge. [Checks and release limits](API-COMPANY-CONTRACT-2026-10-21.md).

Current contract slice: OpenAPI 1.2.0 adds the 35-field anonymous founder response, company relationships, nullable accounts and scorecards, with real Laravel response tests. Backend runtime behavior and all data remain unchanged. Live checks on 19 October still found 29 public founders and a 404 OpenAPI download. Hosting access is unavailable; do not advance the deployment/import acceptance gate. [Checks, limitations and limited source review](API-FOUNDER-CONTRACT-2026-10-19.md).

Follow-up contract 1.2.1 accepts existing integer and four-digit string company founding years. The full 29-record live collection exposed a database representation difference absent from the first response and SQLite fixtures. Future contract acceptance must check all available public rows, not only one-record samples. Runtime serialization remains unchanged.

Current bounded correction: Swarm Robotics and Huspy remain in the startup research queue with `revenue_status=pending`, because their cited evidence does not establish a specific revenue result and period together. The revenue-gated catalog has eight eligible records out of 14; the separate 144-founder catalogs remain unchanged. API source/period presence checks run before facets and pagination. See [18 October evidence and production correction requirements](research/REVENUE-ELIGIBILITY-2026-10-18.md). The live `/api/openapi.json` download still returned 404 in this review; source/CI completion must not be reported as hosting delivery.

## Phases and acceptance criteria

| Phase | Delivered in this cycle | Completion gate / next action |
| --- | --- | --- |
| 1. Baseline and reliability | Latest main inspected; bilingual system screens and the protected company-contract repair merged after required CI | Verify active production revisions, system-screen recovery and readiness; decide whether to implement or hide the 12 stored-but-unused preferences |
| 2. Discovery and SEO | `/api`, four bilingual `/wiki` guides, article metadata/JSON-LD, live founder/news sitemap entries, activation-page noindex; founder/company-specific metadata with public-visibility guards | Live canonical/metadata/robots checks; local profile transition checks pass but do not establish deployed behavior |
| 3. Public API | OpenAPI document 1.5.0 describes nine GET routes; public founder/company reads have 24-record caps, throttling, redaction and real Laravel contract validation | Verify trusted proxies, headers, redaction and 429 behavior live; enable and monitor edge WAF/bot controls |
| 4. Founder and news quality | 320 founders / 175 company groups / 97 stories in matched source snapshots; integrity and 30-day review cover all four founder catalogs | Import reviewed additions on the deployed API; apply existing-record corrections through admin; verify the count-free public presentation and resulting live records |
| 5. Operations | Daily news sync already scheduled in Laravel; daily development/source-review task; repeatable checks and release instructions | Verify host cron, shared lock/cache, worker supervision, failed-job monitoring and backup restore; source configuration alone does not prove execution |
| 6. Maintenance | Repeat highest-value incomplete phase, then ongoing evidence review | No unresolved critical regression; bounded sourced additions with measurable checks and clear blockers |

## Commands and release gates

```bash
# Repository snapshots: no network access, no production writes.
npm run content:test
npm run content:check
npm run content:review > /tmp/wosool-content-review.json

# Application verification after dependency installation.
npm run verify

# On the configured backend, after deployment and normal backup/staging checks:
php artisan migrate --force
php artisan wosool:import-news --dry-run
php artisan wosool:import-founders
php artisan wosool:import-news
php artisan wosool:check-readiness --production
```

The founder importer creates missing records and fills only empty company fields. It intentionally does not overwrite existing founder biographies, roles or traction. An import therefore does **not** apply every correction made in the research snapshot to an existing live database. Use the authenticated admin editor for those changes and verify the saved result. No invitations or external messages are part of these imports.

For the 14 October knowledge/API release, apply Ahmed Alhakbani's role correction to **Co-founder & CEO / شريك مؤسس ورئيس تنفيذي** and replace the older SiFi traction claim with the attributed September 2026 company report of **7,000+ businesses**, if still present in production. Preserve any newer owner/editor correction. This metric is customer count, not revenue. Source details: [current research](research/KNOWLEDGE-CONTENT-2026-10-14.md).

### Automated discovery and review

`php artisan news:sync` attempts the existing Microsoft for Startups RSS feed daily through Laravel's scheduler. The host must actually invoke `php artisan schedule:run` every minute. The command retains its request timeout, byte/item caps, HTTPS/host allowlists, disabled redirects, XML entity rejection, failure exit status, URL deduplication and soft-deletion protection. New items now have `status=draft` and `is_public=false`; review them in `/admin/news`. Existing records and prior published RSS imports are preserved, not bulk-unpublished. `--include-unverified` remains an explicit optional probe for the pre-existing Wamda/TechCrunch feed endpoints, not the scheduled default.

Before publishing: check original source and dates, rewrite a concise original bilingual brief, confirm company associations and image rights, then explicitly publish and make public. A publisher image URL and attribution alone do not establish reuse rights. Collection does not count as fact verification. Never bypass source access restrictions or copy full articles.

The daily ChatGPT task was updated to cover development and source review, beginning 15 October at approximately 08:00 Asia/Riyadh. It prioritizes CODE/MCIT, Multiverse, Tech Founders, Monsha'at, Misk, The Garage, LEAP, Money20/20, GITEX and relevant company/investor sources. It remains a separate research/development task, not evidence that host cron or production imports ran.

`content:check` rejects snapshot drift, duplicate slugs/news URLs, invalid dates/HTTPS sources and incomplete bilingual records. `content:review` emits an actionable 30-day founder review queue with source links. Neither command fetches websites or changes review dates. There is no automatic claim that facts remain correct merely because links respond.

Both commands now include the original 44-founder catalog and the 100-profile expansion. Reports identify catalog paths and review-row provenance; company totals are deduplicated across catalogs. Unregistered `founder-directory*.json` / `founder-spotlight*.json` files fail coverage checks instead of being silently skipped or auto-published. Register each reviewed pair in `scripts/lib/content-review.mjs` alongside the importer and frontend integration. `content:test` runs in required CI and `npm run verify`; it tests both catalog coverage and the existing news guards. See [17 October evidence and limits](research/CONTENT-COVERAGE-2026-10-17.md).

### Public search and availability

- `/api` is a frontend documentation page; `/api/v1/*`, health and readiness retain the existing Laravel proxy. `/api/openapi.json` is a static Next route. No credential or private-field export is introduced.
- `/wiki` and four articles are statically generated and linked from the footer. Unknown article slugs are not published.
- The sitemap reads currently public news and founders with bounded pagination: 50 records/page, at most 20 pages/collection, three-second request timeouts. API outages omit those collections instead of advertising possibly withdrawn snapshots. Expand to sitemap indexes before exceeding 1,000 records in either collection.
- Article metadata and body share one server-side request. An authoritative 401/403/404/410 never restores a bundled story. Network failures may use a reviewed snapshot with `noindex` and no current NewsArticle structured data. Next.js streaming can return HTTP 200 for a late not-found browser response; blocking crawler metadata and noindex protect missing-story indexing.
- Founder/company metadata reads only the anonymous public detail endpoint, with no persistent cache, redirects or forwarded credentials and a five-second timeout. Only matching active public records with a name are indexable. Unavailable records retain the existing client view but emit generic `noindex` metadata, not a server 404; neither private fields nor snapshot metadata are restored. Arabic metadata matches the site's default locale; switching the client language does not create a separate localized URL. [15 October checks](research/PROFILE-SEO-2026-10-15.md).
- Founder/news lists and profile news use snapshots only after an initial network/server failure. Initial loading, successful empty responses and client errors never authorize fallback. After any successful/client-error response in a mounted collection, later outages cannot restore snapshots. Client errors clear earlier loaded pages and reset retries; later-page network/server failures retain live records and retry that page. Changing path/language creates a separate collection state. This is not a persistent cross-session withdrawal ledger; homepage and detail fallback review remains separate. [State/browser checks](research/COLLECTION-WITHDRAWAL-2026-10-16.md).
- News filters still cover loaded pages; use the existing load-more control to request additional API pages. Full-database filtering remains a separate next action.
- News, anonymous founder and standalone company list/detail fields and pagination are validated against the exported OpenAPI schemas in Laravel tests. JSON 404s are typed; only news promises validated-query 422s. Company founder counts and relationship arrays use the same active/public scope. Legacy scorecard-log internals and startup-directory shapes remain incomplete. Intermediary 429 bodies are outside the JSON guarantees. This is not a third-party write API, API-key platform, SDK or service-level guarantee. [Company contract scope](API-COMPANY-CONTRACT-2026-10-21.md).

## Next actions

1. Record the serving frontend/backend SHAs and release roots, then repeat issue #166's recovered probes plus controlled-inbox OTP/newsletter and authenticated founder-card checks. Do not infer deployment parity from health alone; preserve current production data before any optional additive import.
2. Verify actual scheduled draft ingestion and failure reporting on the host; document the deployed revision and backup restore evidence.
3. Verify OpenAPI 1.5.0, founder identity fields, suspended-approval HTTP 409 behavior, 24-record caps, cache/robots headers, anonymous redaction and 429 behavior on the deployed API; configure trusted proxies plus monitored Hostinger WAF/bot controls without blocking legitimate shared-network traffic.
4. Move newsroom search/filtering to server-side pagination so filters cover the full growing database; review snapshot withdrawal behavior across the remaining founder/company surfaces.
5. Implement or hide the 12 member preferences that are stored but not currently enforced; preserve `program_updates`, the only preference with confirmed runtime behavior.
6. Add source-review history and admin review queues for changed existing founder/company facts, with revision checks and protected owner edits.
7. Add publisher-specific feed sources only after verifying endpoint availability, permitted use and failure behavior; review growth by distinct verified founders and companies, not raw scrape volume.
