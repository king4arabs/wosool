# Wosool continuous development

Updated: 17 October 2026. Work in bounded, reviewable cycles: inspect → verify sources → implement → test → publish source → verify release → choose the next incomplete outcome. Completion applies to acceptance criteria, not a promise that software or research needs no further maintenance.

## Phases and acceptance criteria

| Phase | Delivered in this cycle | Completion gate / next action |
| --- | --- | --- |
| 1. Baseline and reliability | Latest main inspected; preserved concurrent board, founder and news work; new RSS records become private drafts | Required frontend/backend checks pass; production revision and readiness verified |
| 2. Discovery and SEO | `/api`, four bilingual `/wiki` guides, article metadata/JSON-LD, live founder/news sitemap entries, activation-page noindex; founder/company-specific metadata with public-visibility guards | Live canonical/metadata/robots checks; local profile transition checks pass but do not establish deployed behavior |
| 3. Public API | OpenAPI document 1.1.0 describes seven GET routes; news list/detail now have 22-field resource schemas and real Laravel response validation | Complete founder/company/scorecard and startup-directory schemas; this is still not a complete public API contract |
| 4. Founder and news quality | 144 founders / 79 company groups / 42 stories in matched source snapshots; integrity and 30-day review cover both founder catalogs | Import reviewed additions on the deployed API; apply existing-record corrections through admin; verify resulting live counts |
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
- News list/detail fields, pagination and JSON 404/422 errors are validated against the exported OpenAPI schemas in Laravel tests. Founder and startup-directory record schemas remain extensible and incomplete. Intermediary 429 bodies are outside the JSON guarantees. This is not a third-party write API, API-key platform, SDK or service-level guarantee. [Contract checks and prerequisites](API-NEWS-CONTRACT-2026-10-17.md).

## Next actions

1. Deploy both services from the verified revision; run the reviewed additive imports; apply existing-record corrections through admin; verify the new routes, sitemap, metadata and imported counts live.
2. Verify actual scheduled draft ingestion and failure reporting on the host; document the deployed revision and backup restore evidence.
3. Extend field-level OpenAPI schemas and backend contract tests from news to founders/company relationships/scorecards, then startup-directory revenue evidence; verify metadata and the downloaded contract on the deployed frontend.
4. Move newsroom search/filtering to server-side pagination so filters cover the full growing database; review snapshot withdrawal behavior across the remaining founder/company surfaces.
5. Add source-review history and admin review queues for changed existing founder/company facts, with revision checks and protected owner edits.
6. Add publisher-specific feed sources only after verifying endpoint availability, permitted use and failure behavior; review growth by distinct verified founders and companies, not raw scrape volume.
