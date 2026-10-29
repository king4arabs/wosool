# Roadmap

## Current execution plan — 29 October 2026

Release checkpoint: current source contains 308 editorial founder profiles across 168 company groups and removes visible editorial totals from founder-region and partner-category navigation. Local content integrity, freshness and parity checks pass with 65 news briefs and no founder reviews due. Independent public checks reach `/` and `/eoa`; a later 29 October fetch shows count-free founder-region controls consistent with current source presentation. That surface check does not identify the active Hostinger SHA or prove the complete catalog, backend release or database imports. Next: record the active Hostinger frontend/backend revisions and production environment, deploy or confirm the latest green `main`, then verify system-screen localization, public-API safeguards and production imports separately.

Public-directory protection checkpoint: OpenAPI 1.5.0 and backend source cap founder/company pages at 24, throttle anonymous reads at 30 requests per minute, set no-store/noindex API headers and redact member/account/contact/matching/scorecard fields while preserving authenticated owner/admin workflows. Company-nested founders retain their narrower schema. These safeguards reduce bulk enumeration; public repository and browser-visible facts remain public. Next: verify trusted-proxy handling, 429 behavior, redaction and false-positive rates in staging/production, then configure and monitor managed Hostinger WAF/bot controls. [Implementation and acceptance limits](docs/FOUNDER-DATA-PROTECTION.md).

System-screen checkpoint: global 404, error, loading and toast accessibility copy now follows the selected Arabic/English locale. Error recovery uses Next.js `retry()`, removes an unsupported notification claim and displays a server digest only when supplied. Required CI passed before merge. Next: verify both locales and an actual error/retry path on the deployed frontend.

Arabic date checkpoint: source now standardizes Arabic dates on the Gregorian calendar with Western digits across public, member and admin views; member event and program times are fixed to Riyadh and visibly labelled. EO Accelerator pages keep their established Arabic-Indic digits but now pin dates to Gregorian. Required CI, the focused crawl and review threads passed. Next: verify these date and timezone changes after the active frontend revision is known.

Arabic form checkpoint: source now returns generic and request-specific API validation messages in the requested Arabic or English locale across membership, contact, introduction and program journeys. Required Laravel CI passes on PHP 8.3, 8.4 and 8.5. Next: verify the active backend revision and exercise Arabic/English invalid-form responses in production without changing data.

Member settings checkpoint: the account settings journey, dashboard navigation and profile tag-removal controls now follow the active Arabic or English locale, with written preference labels, localized API errors, improved heading structure and accessible mobile/RTL behavior. Required CI passed before merge. Next: verify the active frontend/backend revision in production and separately implement or hide the 12 stored preferences that currently have no runtime effect; `program_updates` is the only confirmed enforced preference.

Hosting build follow-up: source `b7ad796` passed pnpm installation, webpack compilation and TypeScript on Hostinger, then exhausted thread resources with 63 page workers. Page collection/generation now uses one worker, with build-only Tokio/Rayon pool limits. CI checks the Node 22 / pnpm 11.24.0 command against a simulated 63-worker default. Next: verify one-worker generation and final publish/activation on Hostinger; the account's exact task quota remains unknown.

Hosting install follow-up: frontend-only archives now include their own pnpm build approvals and lockfile, with a cold-store standalone CI check. Next: redeploy the merged revision in the existing Hostinger app and verify install, webpack build and live release.

Homepage and content checkpoint: the randomized 36-card Saudi-first mix, explicit shuffle control, complete public founder pagination and searchable stable grids now draw from **308 editorial profiles across 168 company groups**, with **65 news briefs** in matched source snapshots. The latest append-only reconciliation covers 51 venture ecosystems, retains earlier records, keeps public region/category navigation count-free and does not change accounts, memberships, moderation or revenue eligibility. `content:check` reports zero integrity problems and `content:review` reports zero reviews due. Next: verify the active frontend revision, then apply additive founder/news imports through the existing backup and deployment process. [Homepage checks](docs/research/HOME-FOUNDER-DISCOVERY-2026-10-22.md) · [latest source review](docs/research/FOUNDER-WORLDWIDE-DIVERSITY-2026-10-29.md).

Use [Continuous development](docs/CONTINUOUS-DEVELOPMENT.md) as the current phased plan and acceptance gates. The older release tables below are historical planning context, not evidence of current completion. Founder/company field schemas and application-layer safeguards are implemented and CI-tested. Next: verify live profile metadata and protection headers/limits, production release/imports/cron and Hostinger edge controls, then make newsroom filtering cover the full database. Source publication is not evidence of production deployment or import.

22 October API checkpoint: OpenAPI 1.4.0 adds the 40-property revenue-qualified startup record, compact pagination, bilingual sector facets, website verification and evidence provenance. It rejects pending/inactive/missing-period records and unexpected fields while distinguishing reported revenue/ARR from financial-statement sources without an audit claim. The eight checked-in eligible records are exercised in both locales by required CI. No catalog, review date or moderation flag changed. Deployment and production import remain separate and unverified. Next API slice: assess legacy scorecard-log exposure. [Checks, limited source review and release boundaries](docs/API-STARTUP-CONTRACT-2026-10-22.md).

21 October API checkpoint: OpenAPI 1.3.0 adds standalone company list/detail schemas and real-response tests. Public company counts now exclude private, inactive and deleted founder relationships, matching the returned founder array. All 22 live companies passed the local contract; the checked-in 79-company import is exercised in both locales by required CI. The live OpenAPI route still returns 404 and the startup API reports zero records, so hosting deployment and production import remain incomplete. [Checks and release boundaries](docs/API-COMPANY-CONTRACT-2026-10-21.md).

19 October API checkpoint: anonymous founder list/detail schemas cover all 35 fields, nested companies, nullable account/scorecard relationships, pagination and JSON 404s. Real-response tests cover all 144 imported profiles in Arabic and English without creating accounts. Legacy scorecard logs are not a typed or privacy-certified payload. Live founder total was 29 and the OpenAPI download returned 404; no hosting revision or import was claimed. [Contract scope and source checks](docs/API-FOUNDER-CONTRACT-2026-10-19.md).

The same-day 1.2.1 follow-up handles the live database's string-valued founding years, discovered by extending the initial sample to every visible founder. Future contract slices must include full available live collections and database-driver representation differences, not only SQLite fixtures.

18 October evidence checkpoint: Swarm and Huspy are retained as pending in the revenue-qualified startup catalog; eight of 14 records remain eligible. Missing/null/empty revenue source URLs and periods are excluded before API pagination and sector facets. No broader founder profile or moderation flag changed. The live OpenAPI download still returns 404; its hosting cause and deployed revision are unverified. Next: deploy the reviewed eligibility changes, apply skipped existing-record corrections through the authorized admin process, and verify live counts; complete founder/company API schemas after these release checks. [Sources and acceptance boundaries](docs/research/REVENUE-ELIGIBILITY-2026-10-18.md).

16 October checkpoint: founder/company-specific metadata and missing-profile noindex were observed on Wosool.org; the hosting source SHA and prior imports remain unverified. The next bounded fix protects public collection snapshot fallback from denial/withdrawal responses, with state tests and a required isolated-browser CI gate. After release verification, continue field-level OpenAPI work, whole-database news filtering and remaining homepage/detail fallback review.

17 October checkpoint: fixed the content commands' omission of the already-merged 100-profile expansion. All 144 founders / 79 company groups / 42 stories now enter integrity checks and freshness reporting, without advancing review dates or implying production import. Added regression/CI coverage and a guard against future unregistered founder catalogs. Live `/founders` initial HTML now includes the loading placeholder and omits saved founder links; readiness responds `ready`, but the deployed SHA and full browser withdrawal behavior remain unverified. Next: deployment/import verification, then field-level OpenAPI contracts; preserve concurrent Arabic/API/news work in PR #70.

## Roadmap Framing

17 October API checkpoint: news list/detail now have field-level OpenAPI schemas and real-response Laravel contract tests. The schema/document change requires frontend deployment; it adds no backend runtime behavior or database import. Next contract slice: founder/company/scorecard serialization, then the revenue-evidenced startup directory. Hosting revision/import validation remains external; the public founder API still reports 29 visible records. Track the inherited, currently unpatched dev-only `braces` advisory in the lint dependency chain separately from the clean production dependency audit.

Wosool should mature through **sequenced execution**, not uncontrolled feature expansion. The roadmap is organized to first strengthen delivery foundations, then unlock real product workflows, then scale regionally with production discipline.

| Phase | Focus | Status |
|---|---|---|
| `0.3.x` | CI/CD, tests, docs, governance, release discipline | Complete |
| `0.4.x` | Authentication, RBAC, public-page API integration | Complete |
| `0.5.x` | Member profile/company CRUD, event RSVP, program applications | Complete |
| `0.6.x` | Arabic/English localization, RTL, Saudi readiness rollout | Next |
| `0.7.x` | Analytics, monitoring, support tooling, growth instrumentation | Planned |
| `0.8.x` | AI-enabled workflows, matching, scorecards | Future |

---

## Immediate Priorities

### Release `0.3.0`

| Priority | Outcome |
|---|---|
| Establish CI/CD | Reliable validation on push and pull request |
| Add backend API tests | Protect current public contract |
| Upgrade repository OS | Improve execution quality and auditability |
| Align testing and security docs | Reduce delivery ambiguity |

### Release `0.4.0`

| Priority | Outcome |
|---|---|
| Implement authentication | Real member access and protected flows |
| Activate role boundaries | Safer admin and dashboard separation |
| Replace mock data on priority public pages | Operational realism and easier iteration |
| Start monitoring and analytics | Better product and operational visibility |

### Release `0.5.0`

| Priority | Outcome |
|---|---|
| Founder/company CRUD | Members can create and manage their profile and companies through `/api/v1/member/*` |
| Event RSVP workflow | Members can RSVP and cancel; capacity triggers waitlisting |
| Program application workflow | Members can apply to open programs with deadline and duplicate guards |
| Test coverage growth | 25 new backend feature tests, 43 total passing |

---

## Regional Scaling Track

Saudi Arabia remains the reference market. GCC expansion should happen only after the platform supports bilingual content strategy, RTL layout readiness, operational compliance review, and appropriate payments, support, and data policies.
