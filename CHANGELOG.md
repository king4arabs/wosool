# Changelog

## Diagnose hosted frontend HTTP 500 responses — 2026-10-23

- Production monitoring confirmed a frontend-only runtime incident: `wosool.org/health`, `/` and `/eoa` return HTTP 500 while direct Laravel liveness/readiness and the same-origin API proxy pass. This does not establish the active frontend revision or the runtime exception.
- The standalone Node 22 / pnpm hosting gate now starts the built archive through its real `pnpm run start` command and requires `/health`, `/` and `/eoa` to respond successfully. This closes the gap between a completed build and a bootable Next.js artifact.
- Failed public probes now include validated Hostinger CDN request/cache identifiers when supplied, without logging response bodies. These IDs can be matched to provider runtime logs; malformed header values are discarded to prevent log injection.
- **Checks:** repository content review reports 150 founders, 83 companies and 42 stories, with zero integrity problems and zero reviews due. Live hosting recovery remains blocked on the current deployment's Hostinger runtime log and redeploy controls; no frontend deployment or production import is claimed.

## Next.js security patch and bilingual program pages — 2026-10-23

- **Security:** `npm audit` reported a critical advisory range for `next` 16.0.0–16.4.0 (GHSA-2464-fhr4-w9xw image-optimizer RCE with SVGs, GHSA-673q-mjm6-r5xr `use cache` RCE, GHSA-p3m5-59mp-jv5r Server Actions DoS). Bumped `next` to the 16.4.2 patch release in `frontend/package.json`, the npm lock and both pnpm locks (pnpm 11.24.0, `--frozen-lockfile` checked for the workspace and a standalone frontend copy). `npm audit --omit=dev` now reports 0 vulnerabilities. No other dependency changed. Production needs a Hostinger rebuild to pick this up.
- **Problem (`/programs/[slug]`):** the program page was Arabic-only. In English every heading, button, status and message stayed Arabic, dates used `ar-SA` (Hijri calendar), and badges showed stored codes ("growth", "cohort-based", "workshop"). Visitors got an enabled "قدّم الآن" button that opened the form and then failed, because applying needs a member account. Members who had withdrawn or been rejected were offered the form again though the API refuses a second application, and a passed deadline was not checked. The EO Riyadh Accelerator page offered the generic form, which the API rejects with 409.
- **Fix:** new `program-detail` helper with Arabic and English page copy, words for lifecycle, format, session type and language codes (admin free text is shown as written), and Gregorian Riyadh-time dates with Western digits. The join card follows the API's rules: visitors go to sign in and come back to the program, a member with any application sees its status (same wording as the dashboard), closed/finished/past-deadline programs say so, and the accelerator points to `/eoa/apply` (or to `/dashboard/eoa` for a member who has already applied). Added an "All programs" link, a real heading for "not found", `dir="auto"` on admin-entered text so English descriptions read correctly in the Arabic layout, names for the form fields, and a 20-character check on the required answer to match the API. The sticky join card is sticky only on desktop. Admin-entered program text is still shown in the language it was entered in; programs have no Arabic columns.
- **Tests:** `program-detail` tests (copy parity, code labels in both languages, dates, visitor sign-in link, one-application/closed/deadline/invite rules, accelerator link). The QA crawl now also visits `/programs/founder-circles`.
- **Checks:** `npm run verify` green (frontend 171, backend 263 / 2,208 assertions); QA crawl before the change 378 visits as visitor and admin, 0 problems; full crawl after it as visitor, member and admin 460 visits, 0 problems; browser check at 390px and 1366px in Arabic and English with no horizontal overflow; signed-out "Apply now" → sign in → back on the program → form (no serious axe findings) → application sent and shown as "Under review".
- **Local setup note:** this sandbox has PHP 8.3.6, below the new `check-php-runtime.php` floor, so backend dependencies were installed locally with `--no-scripts --ignore-platform-req=php` for testing only. CI and hosting keep the gate.

## Bound shared-host build concurrency — 2026-10-22

- The next hosting attempt at `b7ad796` passed installation, webpack and TypeScript, but aborted while collecting page data with 63 workers: Tokio could not spawn threads (`EAGAIN` / `SIGABRT`).
- Cap Next.js page workers at one and run both build entry points through a Node launcher with one Tokio worker and one Rayon worker per native pool, set before Next/SWC initializes. Retain webpack, route-cache cleanup and normal runtime startup.
- Extend standalone pnpm CI to exercise a simulated 63-worker default and require one-worker page collection/generation. Node 22, pnpm, dependencies, lockfiles and production data are unchanged. Hostinger publish/activation still requires verification.

## Default hosting build uses webpack — 2026-10-22

- The reported Hostinger build at `82a6496` installed dependencies successfully but ran the default `next build`, then timed out during Turbopack compilation. The existing `build:webpack` alias was not being used by hosting.
- Set the default frontend build to `next build --webpack`, so the host's existing `pnpm run build` command selects webpack. Keep the route-cache cleanup and explicit webpack alias.
- Match the hosting install CI job to Node 22 / pnpm 11.24.0 and test the exact default build command in an isolated frontend archive. Dependency versions, lockfiles and application data are unchanged. Live hosting rebuild verification is a separate release step.

## Standalone frontend pnpm install — 2026-10-22

- Reproduced `ERR_PNPM_IGNORED_BUILDS` when installing a frontend-only copy: the repository-root approval file is absent from that build input.
- Ran `pnpm approve-builds esbuild unrs-resolver` locally and committed the resulting `frontend/pnpm-workspace.yaml`, plus a standalone pnpm lockfile imported from the frontend npm lock. Both deployment layouts use `allowBuilds`; Node 22 and pnpm are unchanged.
- Added a CI gate that installs an isolated frontend archive with a fresh store and checks the native TypeScript loader and lint resolver. Hosting redeployment and live verification remain separate operations.

## Homepage founder discovery and pnpm install approvals — 2026-10-22

- The homepage's editorial founder spotlight is now a permanent, labeled collection rather than an outage fallback. It draws a fresh Saudi-first 36-card mix on each mount and offers a shuffle button. Search, regional/sector filters and the complete paginated grid remain available; directory ordering stays stable. Current live public profiles use the community-only API filter, appear separately, and matching slugs are excluded from the spotlight. Language changes clear translated sector selections and reset grid pagination while retaining the visit mix.
- Homepage founder requests now retrieve every page (100 per page, bounded to 20 pages), deduplicate slugs and reject partial pagination failures. Authoritative client errors clear previously loaded live founders. Founder scorecards now display available sourced company traction alongside biographies, role, company, sector, location, website and evidence.
- Added six bilingual sourced profiles: Hassan Albalawi (WakeCap), Jad Antoun (Huspy), Mohamed Al Fayed (grubtech), Brian Chesky, Nathan Blecharczyk and Joe Gebbia (Airbnb). Five portraits come from official company or investor pages. All three founder catalogs enter integrity checks and additive imports: 150 founders / 83 company groups. No revenue qualification or membership is inferred.
- Added `pnpm-workspace.yaml` with only `esbuild` and `unrs-resolver` approved to run install scripts, plus the imported pnpm lockfile. Frozen installs pass with Node 22; existing npm locks support the established CI pipeline. Added pnpm install/native-tool and bilingual/mobile homepage browser gates. [Sources and release boundaries](docs/research/HOME-FOUNDER-DISCOVERY-2026-10-22.md).

## Programs page in Arabic — 2026-10-22

- **Company API reference:** after #80 and #70 merged, `main` CI failed because the `listCompanies` and `getCompany` operations had no Arabic copy on `/api`. This branch added it; `main` has since fixed it separately (c5fa704), and the merge keeps that wording.
- **Problem:** on `/programs` in Arabic, the filter chips showed stored codes ("circles", "onboarding", "growth"), stage tags showed "seed", "pre-seed", "series-a", and durations read "weeks 2" because the English text flipped in right-to-left layout. The EO Riyadh Accelerator card showed its English name and tagline. The Arabic overlay for programs was keyed by old demo ids (`p1`…) that never match API records, so it never applied. In English, chips and tags were lower-case codes, and the category icons never matched (the icon table used "Onboarding", the API sends "onboarding"), so every card had the generic icon.
- **Fix:** new `program-labels` helper: category and stage codes become words in both languages (stages use the application form's wording), durations like "6 weeks" / "12 months" become "6 أسابيع" / "12 شهرًا" with correct Arabic number agreement, and anything an admin typed in another form is shown as written. The accelerator installed by `eoa:install` gets its Arabic name, "مسرّعة EO الرياض", and a one-line description based on the `/eoa` page, only while its name and description are still the installer's English defaults; an administrator's edit is always shown. No Arabic is made up for admin-created program names, descriptions or benefits; those stay as entered until programs have Arabic fields. Filtering now uses the stored code, chips have `aria-pressed`, and the card icons match their category.
- **Tests:** new `program-labels` tests (category and stage labels in both languages, Arabic text from the admin kept, duration agreement for 1, 2, 3–10 and 11+, free text unchanged, accelerator Arabic name, edited accelerator title and description shown as saved, admin text untouched, filter code kept).
- **Checks:** `npm run verify` green (frontend 155, backend 254 / 1,996 assertions); QA crawl before the change 378 visits as visitor and admin plus 78 as member, 0 problems; `/programs` after the change 4 visits, 0 problems; browser check at 390px and 1366px in Arabic and English, and the "النمو" chip narrows the list to the two growth programs. No migration or data change.
- **Not done (owner's call):** `/programs/[slug]` is Arabic-only (headings, labels and messages have no English), and programs have no Arabic columns, so admin-entered program text can only be in one language.

## Revenue-qualified startup API contract — 2026-10-22

- OpenAPI document 1.4.0 adds typed startup-directory responses: 40 record properties, compact pagination, bilingual sector facets, active-website verification, social/asset provenance, ecosystem relationships and revenue evidence with its exact period. Reported revenue/ARR remains distinct from financial-statement sources; neither classification promises an audit, program approval, partnership or Wosool membership.
- Added four frontend and four Laravel contract tests covering all eight eligible imports in both locales, filters, empty/out-of-range pages, 422 errors and deliberate eligibility/private-field drift. Existing controller behavior and all records, moderation flags, accounts and review dates are unchanged.
- Re-opened the available company, investor and program sources. No candidate qualified: Misk omits Swarm's reporting year; The Garage supplies only generic sales eligibility; Impact46 and Lamarka evidence concerns investment; CODE/GITEX failed and Monsha'at/Multiverse/Falak timed out without bypass attempts. [Checks, evidence boundaries and release steps](docs/API-STARTUP-CONTRACT-2026-10-22.md).

## Member dashboard shows your own events and applications — 2026-10-21

- **Problem:** the "Coming up" panel on `/dashboard` (Arabic heading "في جدولك القادم", "on your upcoming schedule") listed the next three public events for every member, whether or not they had registered, and never said whether a place was confirmed, awaiting approval or waitlisted. The programs panel only suggested programs, so a member could not see the status of an application from the home page, and was shown programs they had already applied to. The API already returned `upcoming_rsvps` and `program_applications`, but nothing used them, and `upcoming_rsvps` also included places the member had cancelled or been refused, and events that had already finished.
- **Fix:** `upcoming_rsvps` now lists only places the member still holds (not cancelled, refused or no-show) at events that have not ended, each with its `rsvp_status`. The dashboard shows those events first with a status label (Place confirmed, Awaiting approval, On the waitlist), then "Upcoming community events" without repeating ones the member already joined. The programs panel shows "Your applications" with their status (Submitted, Under review, More information needed, Accepted, Not accepted, Draft, not sent…) and suggests only programs the member has not applied to; an EO Riyadh Accelerator application links to `/dashboard/eoa`. The raw category code ("circles", "fundraising") above suggested programs is gone. Arabic and English throughout.
- **Accessibility (member pages):** running the QA crawl as a member (earlier runs covered visitors and admins) found serious axe findings on member pages, fixed here. The dashboard language button's name now includes its visible "AR"/"EN" text (every member page at desktop width). The community sector filter has a label; the post composer fields have names. Scorecard metric values and their notes (emerald/amber 3.2–3.7:1) and the "Strategic Control Panel" label (2.9:1) now meet 4.5:1, and both update boxes have names. The introductions credit badge on `/dashboard/matches` (3.8:1) is now readable.
- **Admin event registrations:** at 1366px the Approve / Reject / Waitlist buttons on `/admin/events/{id}` were squeezed to one letter per line once an event had a registration. The buttons now keep their width and the table scrolls sideways.
- **Tests:** three new `MemberDashboardTest` cases (only held places, in status order and with their status; an event in progress stays until it ends; applications are the member's own) — the first two fail on the previous controller. New `dashboard-home` tests (own events first, no duplicate suggestions, community events never shown as the member's, status labels in both languages, unknown states never shown as raw codes in Arabic, applied programs not re-suggested, accelerator link).
- **Checks:** `npm run verify` green (frontend 147, backend 248 / 1,931 assertions); QA crawl before the change 378 visits as visitor and admin, 0 problems; full crawl after the change as visitor, member and admin 456 visits, 2 problems (the admin buttons above), then `/dashboard` and `/admin/events` routes after the fixes 64 visits, 0 problems; browser check of the new panels at 390px and 1366px in Arabic and English, no horizontal overflow. No migration or data change.

## Accessibility pass and axe-core gate — 2026-10-20

- **Problem:** an axe-core audit (WCAG 2.1 A/AA) of every route, Arabic and English, 390px and 1366px, failed on all 378 crawl visits. Every page had a notifications container with an `aria-label` but no role. Small grey labels (`--text-subtle`, #85889b) on founder and company cards, the contact form and admin lists measured 3.2–3.5:1 against the required 4.5:1. Gold section labels and sponsor links (#C9A84C) measured 2.1–2.3:1 on white. Edit, delete and website icons in the admin tables (companies, events, news, programs, sponsors) had no accessible name. Calendar day buttons, the EOA password-recovery logo link and several labelled `<div>`s exposed names that screen readers ignore or that differed from the visible text. The `/api` code sample could not be scrolled with the keyboard, and EOA footer links were told apart from the text by colour alone.
- **Fix:** `--text-subtle` is now #6b6e82 (4.5:1 on `--surface-soft`, 5:1 on white). Gold text on light backgrounds uses #86691a (4.7–5.2:1); the gold on dark sections is unchanged. Icon buttons and links have names in the page's language; labelled groups, carousels and the toast area have roles; calendar days read their full date and activities from screen-reader text; the code sample is focusable; EOA footer links are underlined; admin metadata text moved from gray-400 to gray-500; admin sidebar headings from 45% to 70% white. No copy, data or layout changes.
- **Guard:** `npm run qa:crawl` now runs axe-core on every visit and fails on serious or critical WCAG 2.1 A/AA findings (`QA_AXE=0` skips it). New `npm run test:a11y:browser` runs the same check on all public pages against the built site with the API blocked, and is a required step in the frontend CI job. `axe-core` is now a direct dev dependency (it was already installed through the ESLint config).
- **Also:** merged `main` (#78, #79) into this branch; the only conflict was `CHANGELOG.md`, both sides kept.

## Standalone company field contract — 2026-10-21

- OpenAPI document 1.3.0 adds typed standalone company list/detail routes: 24 detail fields, 25 list fields, 33-field active-public founder relationships, pagination and JSON 404s. Existing filters and backend response fields remain unchanged.
- Fixed `founders_count` to apply the same active/public visibility rules as the returned `founders` array. Private, inactive and deleted founder relationships no longer affect the anonymous count. Added four frontend and six Laravel tests covering the 79-company import, both locales, visibility/deletion, filters, pagination, database year formats and deliberate nested contact leaks.
- All 22 live company responses passed the corrected contract locally. No content, moderation, account, source-review date or production database record changed. The Garage program page, Impact46's Jahez investment announcement and Monsha'at program reporting did not qualify a new revenue record. [Checks and release boundaries](docs/API-COMPANY-CONTRACT-2026-10-21.md).

## Anonymous founder field contract — 2026-10-19

- Follow-up document 1.2.1 corrects company `founded_year` compatibility: the uncast database value can serialize as a four-digit string in production or an integer in SQLite. The full live 29-founder check caught 13 string-year responses missed by the initial one-record sample. Added regression coverage accepting both observed representations without coercion, while rejecting arbitrary strings and invalid types. No backend runtime or data changes.
- OpenAPI document 1.2.0 adds schemas for the 35-field anonymous founder response, nested public company relationships, nullable account/scorecard data, pagination and JSON 404 errors. Existing routes and operation IDs remain unchanged. Removed the unsupported founder-query 422 promise; controller behavior is unchanged.
- Added four frontend tests and seven Laravel contract tests covering both imported catalogs in both locales, claimed versus unclaimed profiles, visibility/deletion, pagination limits, computed scorecard fields and deliberate field/contact leaks. Legacy scorecard log internals remain explicitly untyped, not privacy-certified.
- No content, review dates, moderation, accounts, invitations, runtime backend code or production imports changed. The Garage eligibility page and Amplifai funding announcement did not qualify additional revenue records. [Source checks, test scope and hosting blocker](docs/API-FOUNDER-CONTRACT-2026-10-19.md).

## Admin inbox for contact messages — 2026-10-19

- **Problem:** messages from `/contact` were saved and emailed to the team, but nothing in the admin showed them. The team alert's "Open in admin" button went to the overview page, and if the alert email was missed or failed to send, the message could only be found in the database. The `responded_at`/`responded_by` columns existed but nothing used them. The team alert also named categories differently from the form ("General enquiry", "Office hours" instead of "General question", "Time with the team"), and the FAQ sent people to an "Office hours" choice that the form doesn't offer.
- **Fix:** new **Contact messages** page at `/admin/messages` (Arabic and English): waiting/answered/all counts and filters, a category filter, the full message, a "Reply by email" link with `Re: <subject>`, and "Mark answered"/"Reopen", which record who answered and when. New admin-only endpoints `GET /api/v1/admin/contact-messages` and `PATCH /api/v1/admin/contact-messages/{id}`; the sender's IP address is never returned, and the audit log stores only the status change, not the message. Category labels now live in one place (`ContactMessage::CATEGORIES`), shared by validation, the team alert and the inbox. The team alert button opens the inbox. The FAQ uses the form's wording, and "Partnership" on the contact form no longer shares the "Founder support" icon.
- **Tests:** `AdminContactInboxTest` (admin-only access, IP hidden, filters, form labels and inbox link in the team alert, answer/reopen keeps the first answer time, audit log without the message body); `contact-inbox` tests (filter params, reply link encoding and header-injection guard, form/inbox/API category labels stay identical).
- **Also:** merged `main` into this branch; the conflicting startup-directory changes were combined, keeping both the Arabic reporting periods and the stricter revenue gates, with an Arabic period for Huspy's updated record.
- **Checks:** `npm run verify` green (frontend 135, backend 238 / 1,834 assertions); full QA crawl before the change 372 visits, 0 problems; admin + `/contact` + `/faq` crawl after it 42 visits, 0 problems; browser check of `/admin/messages` at 390px and 1366px in Arabic and English, including marking a message answered. No migration is needed.

## Founder region filter keeps its selection — 2026-10-18

- **Problem:** on `/founders`, choosing a region chip (Saudi Arabia, GCC, MENA…) and then typing in the search box or changing a dropdown silently put the region back to "All", because the founder list is rebuilt on every filter change and the region lived inside it. "Clear filters" on the home page did not reset the region either, the sector list offered sectors that do not exist in the chosen region (so a click could empty the list with no visible reason), and Arabic counts read "144 ملفات مؤسسين" / "من 5 ملفًا".
- **Fix:** `/founders` now keeps the region with its other filters, and "Clear filters" resets it. The sector list follows the selected region and a sector that is not in the new region is cleared. A region chip stays visible while selected even if the search leaves it empty. Arabic counts agree with the number (ملف واحد، ملفان، 3 ملفات، 144 ملفًا); English uses "1 profile". The empty message now mentions the region.
- **Tests:** new `founder-filters` tests (region mapping, combined filters, sector options per region, chip counts, Arabic number agreement, every spotlight region has sectors in both languages).
- **Checks:** `npm run verify` green (frontend 132, backend 232 / 1,743 assertions); QA crawl 372 visits as visitor and admin in Arabic and English at 390px and 1366px, 0 problems; browser check at 390px in Arabic and English: the GCC chip survives a search and is reset by "Clear filters".

## Revenue eligibility correction — 2026-10-18

- Retained Swarm Robotics and Huspy as pending research records after re-reading their primary evidence. Misk's annual revenue testimonial omits the year; Huspy's cited announcement does not give a specific revenue/ARR result and reporting period. Funding and GMV are not substitutes. Eight of 14 startup records remain eligible in a fresh import; the broader founder catalogs are unchanged.
- The startup API now excludes absent, null or empty revenue source URLs and periods before computing facets, counts and pagination. Human source review remains necessary for the meaning of a nonempty period. Added regression coverage for these gates and for pending records staying out of search/source filters without deleting records or changing moderation.
- Only the reviewed revenue evidence and Misk/Falak registry dates advance. Whole-profile, website, founder and image verification dates remain unchanged. Production corrections require the existing deployment/import workflow and review of newer editorial records. [Sources and release boundaries](docs/research/REVENUE-ELIGIBILITY-2026-10-18.md).

## Public news field contract — 2026-10-17

- OpenAPI document 1.1.0 adds named schemas for all 22 public news fields, translation variants, nullable editorial values, list/detail envelopes, Laravel pagination and JSON 404/422 errors. Existing paths, operation IDs, query parameters and backend behavior remain unchanged. Founder/startup record schemas remain explicitly incomplete; intermediary 429 bodies are not asserted.
- Added five frontend contract tests and seven Laravel feature tests validating real responses against the exported schemas with Ajv 2020-12 and format validation. Tests cover imported bilingual content, manual stories, empty pages, visibility/deletion/future-date rules, invalid filters, legacy associative fields and deliberate schema/privacy regressions.
- Required backend CI installs the shared test validator. No records, review dates, imports or production configuration change. [Checks, dependency finding and deployment boundary](docs/API-NEWS-CONTRACT-2026-10-17.md).

## Full founder content-review coverage — 2026-10-17

- Fixed `content:check` and `content:review` omitting the 100-profile expansion. Both now inspect the original and expansion pairs, report 144 founders / 79 company groups / 42 stories, and include catalog provenance in the review queue.
- Added cross-catalog duplicate detection, unregistered founder-file guards, strict calendar review dates, primary-evidence inclusion and bilingual company/role validation. Invalid data yields actionable failures instead of silently passing or crashing; stale valid records remain a review queue rather than a publication decision.
- Added `content:test` to `npm run verify` and required CI, with regression coverage for omissions, malformed records, parity drift and exact 30-day deadlines. No runtime page, importer, source record, review date or moderation changes. [Verification and source-review scope](docs/research/CONTENT-COVERAGE-2026-10-17.md).

## Newsroom heading in the first page load — 2026-10-17

- **Problem:** `/news` reads its filters from the URL, and the whole page sat inside that Suspense boundary, so the server HTML contained only an empty block: no heading, introduction or filters until JavaScript ran. Search engines and slow phones saw a blank newsroom (the live site's `/news` has no `<h1>` in its HTML).
- **Fix:** the prerendered fallback is now the unfiltered newsroom itself, so the heading, introduction, region chips, search and sort are in the first HTML; URL filters (`?region=`, `?q=`, `?sort=`) still apply after hydration. While the first response loads, counts show "—" instead of "0". Stories still come from the API, with bundled snapshots only after an outage, as before.
- **QA crawl:** now also fails when a static public page has no `<h1>` in its server HTML. Account/application forms (login, register, password reset, email verification, apply) and record pages are excluded because they read the URL or load the record in the browser. Against the previous build the check flagged only `/news`.
- **Checks:** `npm run verify` green (frontend 120, backend 225 / 1,696 assertions); QA crawl 372 visits, 0 problems; `/news?region=saudi&sort=oldest` checked in the browser in Arabic and English at 390px and 1366px (filters applied, no hydration errors).

## API reference in Arabic — 2026-10-16

- **Problem:** on `/api` in Arabic, every endpoint card showed its description in English ("Service liveness", "Discover public founders", "Parameters: …"), and the kicker read "WOSOOL / DEVELOPERS". The list endpoints' notes on what is included and the `per_page` limits were not shown on the page in either language, only in the downloadable specification.
- **Fix:** endpoint cards now take their wording from a small Arabic copy table keyed by OpenAPI `operationId`; English cards keep the specification's wording. Each list endpoint also shows its note (public records only, `per_page` limits, revenue-evidence requirement), and the "Parameters" label and kicker are translated. Parameter names stay as code, left-to-right. The OpenAPI contract at `/api/openapi.json` is unchanged.
- **Tests:** new `api-reference` tests: every endpoint has Arabic copy (with a note wherever the contract has one), Arabic and English rows select the right wording, and parameter names match the contract.
- **Checks:** `npm run verify` green (frontend 114, backend 225); QA crawl 372 visits as visitor and admin in Arabic and English at 390px and 1366px, 0 problems; `/api` checked in the browser in Arabic and English at 390px and 1366px.

## Startup directory: Arabic reporting periods and program names — 2026-10-15

- **Problem:** on `/startups` in Arabic, each card's "Published revenue evidence" box showed the reporting period in English (for example "الفترة: Year ended 31 December 2024", "Annual revenue; year not specified by Misk"), and the program or investor that links a company to the ecosystem was shown by its English name (Misk, Impact46, LEAP, GITEX) even though the filter above already uses the Arabic names.
- **Fix:** every revenue record now has an Arabic reporting period (`period_ar`) and every ecosystem source an Arabic name (`label_ar`), translated from the existing sourced wording; no figures, sources or dates changed. Arabic cards use them, English cards are unchanged, and records imported before this change fall back to English. `directory:import` now rejects records without the Arabic fields. The public API keeps `period` and `label` as they were and adds the two fields.
- **Deploy:** run `php artisan directory:import` after deploying so existing directory records pick up the Arabic fields (records with a newer review date are left alone, as before).
- **Tests:** new `startup-directory` frontend tests (Arabic/English selection, fallback for older records, every data row bilingual) and a backend test that every public record returns Arabic period and program names.
- **Checks:** `npm run verify` green (frontend 106, backend 225); QA crawl 448 visits as visitor, member and admin in Arabic and English at 390px and 1366px, 0 problems; `/startups` checked in the browser in Arabic at 390px and 1366px and English at 390px.

## Public collection withdrawal safeguards — 2026-10-16

- Founder/news lists and profile news now restore bundled records only after an initial network/server failure, never during loading, after a successful empty response, or after a client error (including 401/403/404/410/422/429).
- A client error on a later page clears prior records, counts and pagination; retry starts at page one. A later outage cannot undo an authoritative response within the mounted collection. Transient later-page failures retain loaded records and retry the failed page without mixing snapshots. Changing collection/language hides the previous resource immediately.
- Added six state-transition regression tests and an isolated production-browser CI gate covering Arabic/English, mobile/desktop and all three snapshot consumers. Local lint, types, 115 unit tests, content checks and production build passed; local Chromium installation failed, so browser acceptance is delegated to the required CI gate, not claimed locally.
- Source spot-checks retained Swarm's unspecified reporting year and Mohtwize's unresolved revenue/current-role evidence. No data, review dates, moderation or account records changed. [Evidence and release boundaries](docs/research/COLLECTION-WITHDRAWAL-2026-10-16.md).

## Public profile metadata — 2026-10-15

- Added founder/company-specific server metadata, using the site's default Arabic API locale, bilingual profile labels, and explicit canonical/Open Graph URLs. Public names and biography/description are the only record content exposed; no membership or verification claims are inferred.
- Metadata reads are anonymous, uncached, redirect-disabled and bounded by a five-second timeout. Non-public/inactive, mismatched, missing, malformed and unreachable records receive `noindex` (including Googlebot), never stale snapshot metadata. Existing client profile behavior and editorial data are unchanged.
- Validation: 109 frontend tests, lint, type-check, production build, entrepreneur validation, and 10 production-rendered crawler checks passed. `content:check`/`content:review`: 44 founders, 33 companies, 42 stories; zero integrity problems and zero reviews due. Backend tests require CI because this environment has no PHP/Composer.
- Spot-checked Unifonic and SiFi primary sources; no new revenue qualification, records or review-date changes. [Evidence and release boundaries](docs/research/PROFILE-SEO-2026-10-15.md). No production database import is required by this change.

## Knowledge, public API and verified content loop — 2026-10-14

- Added bilingual `/wiki` with four practical guides and `/api` with a downloadable OpenAPI 3.1 contract for seven public read endpoints. Existing Laravel proxy and session authorization are preserved.
- Added server-loaded news article metadata/JSON-LD and live public news/founder sitemap URLs. Explicit missing/private responses cannot restore story snapshots; outage snapshots are noindex. News lists respect successful empty responses. Founder activation pages now carry private/noindex headers.
- New RSS imports are private drafts, with existing deduplication, timeout, URL/XML safeguards and editor/deletion protection retained.
- Added Rami Panayoti (SiFi), corrected Ahmed Alhakbani's co-founder role and refreshed attributed SiFi traction; added two original bilingual news briefs from SiFi and Penny. Snapshots now contain 44 founders, 33 companies and 42 stories. Existing database corrections require the admin editor because imports preserve prior content.
- Added `content:check` (also in CI) and `content:review` with a 30-day founder review queue. Defined delivery phases and next actions in [Continuous development](docs/CONTINUOUS-DEVELOPMENT.md).
- Local validation: 103 frontend tests, 224 backend tests / 1,676 assertions, production build, and repeatable isolated database imports. Live deployment and production imports are separate verification gates.

## Squashed filters, consistent borders — 2026-10-14

- **News filters (mobile):** on `/news` at phone width the region chips (All, Saudi Arabia, GCC, MENA, Global) shrank to fit the row instead of scrolling, so each label was stacked one letter per line. The chips now keep their width and the row scrolls sideways.
- **Membership requests (admin):** the "بحث" search button on `/admin/members` was squeezed to one letter per line beside the search field and status filter. It now keeps its width; the search field and status filter also have accessible names.
- **Borders:** with Tailwind v4 a bare `border`, `border-t` or `divide-y` is drawn in the text colour, so on founder and company profiles the "Founders", "At a glance" and "Sources" cards, the share button and list dividers had near-black outlines next to the soft grey ones. All borders without a colour now use the design-system default (`--border-soft`; buttons and form fields use `--border`, like `Input` and the outline `Button`). Any explicit `border-*` colour still wins.
- **QA crawl:** now also fails when a button or link is so narrow that a single word breaks across lines, the check that found both bugs above.
- **Checks:** `npm run verify` green; QA crawl 440 visits as visitor, member and admin in Arabic and English at 390px and 1366px, 0 problems; every founder, company and news detail page (468 visits) 0 problems; new `border-defaults` test.

## Saudi founder research and EOA copy — 2026-10-14

- Added 14 sourced bilingual founders at 11 companies connected to CODE/Tech Founders/Multiverse, Misk, Monsha’at, LEAP, Money20/20 and the Saudi startup ecosystem. The directory now contains 43 founders at 33 companies.
- Added 15 local sourced portrait/logo assets, six dated news briefs, and revenue evidence for existing Swarm Robotics and Jahez profiles. Funding and operating volume are identified separately from income.
- Updated the exact Arabic LAMARKA note on `/eoa` as requested.
- Run both additive research imports after deployment; see [source notes and deployment steps](docs/FOUNDER-RESEARCH-2026-10-14.md).

## EO Riyadh board titles — 2026-10-14

- Updated Mohamed Balsharaf, Gilbert Rustom, Faisal Alqarni and Abdulaziz Alothaim’s board titles in Arabic and English, as confirmed by the program chair.
- Updated the frontend roster and installer data. Run `php artisan migrate --force` to apply the titles to existing 2026/27 EO Riyadh board records; other profile fields and board terms are preserved.

## Wosool board and EO community directory — 2026-10-14

- Corrected ماجد الرشيد’s Wosool Board company to JOZO, with its official website and fractional real-estate description.
- Added 10 sourced EO community profiles, increasing the directory to 36 people across 33 chapters. Each new profile has an original EO portrait, bilingual biography, company, role, expertise, chapter and EO source. LinkedIn is shown only when the identity is verified.
- Made the EO community directory available on `/eoa` as well as `/eoa/mentors`, retaining the searchable carousel and grid. Confirmed program appointments retain their separate API-managed section.
- Protected board profile edits and portrait uploads with revision checks. Stale writes return HTTP 409 without modifying the record or storing an orphaned photo. The admin save/upload/publish flow carries the latest revision, and reloading refreshes the selected form.
- Corrected fresh EOA installation duration to six months while preserving existing program settings.
- Release requires `php artisan migrate --force` before deploying the updated API and admin UI. See `docs/BOARD-MENTORS-2026-10-14.md`.

All notable changes to **Wosool** are documented here.

This project follows **Semantic Versioning** and a Keep a Changelog-inspired format. Date-based entries document significant product and operating-system upgrades between numbered application releases.

---

## Events calendar: fewer explanatory notes — 2026-10-13

- At the owner's request, removed explanatory notes from the founder calendar on `/events`: the Ramadan/Eid tentative-dates note, the international-occasions note, the "outside the program window" note, the "choose a day / coloured dots" hint, the "overlaps an expected holiday" card notice, and the "times, speakers, venues… will be announced" sentence. The Ramadan break card now just says "No accelerator activities". Loading and error messages remain.

## Partner logos always shown — 2026-10-13

- **Problem:** the "نفخر بشركائنا / Proud of our Partners" strips on the home page and `/eoa` showed the owner's partner logos only while the partners API was down. Now that the API answers, it returns no published partners, so the home strip showed an empty message and the EOA strip showed only the EO mark.
- **Fix:** both strips use published partners with logos when there are any, and otherwise show the owner's display list (home: EO Riyadh, The Garage, Misk, CODE, Cipher Ventures, RDIA; EOA adds LAMARKA and HUMAIN). Admin-published partners still take priority as soon as one exists.
- **Tests:** new `partner-logos` tests for the fallback and for every fallback entry having artwork and an https website; logos checked in the browser on both pages in Arabic and English at 390px and 1366px.

## Home page intro line — 2026-10-13

- Replaced the home-page hero description with the owner's wording: "مجتمع وصول، من مؤسسين إلى مؤسسين، لمشاركة التجارب والخبرات وتقوية العلاقات وتعزيز فرص النمو." The English version now carries the same message.

## Event detail page: bilingual, visitor-safe, Riyadh time — 2026-10-13

- **Navigation:** event and program detail pages (`/events/[slug]`, `/programs/[slug]`) rendered without the site header, footer or `<main>` landmark, leaving visitors on a dead-end page. Both now use `PublicLayout`.
- **Missing description:** the event page read only `short_description`/`full_description`, so events with a plain `description` (all seeded and most admin-created events) showed "no description". It now falls back to `description`.
- **Language:** the event page was Arabic-only. Headings, badges, registration states, buttons, the registration form, toasts and empty states now follow the selected language; English event content keeps correct punctuation inside the Arabic layout (`dir="auto"`).
- **Visitors:** the page called the member-only registration-status endpoint for everyone (a 401 on every visit) and offered Register/Save buttons that could only fail. Visitors now see "Sign in to register" (returning to the same event) and an "Apply to join" link; copying the link works without an account. Signed-in accounts without Wosool membership (EO Accelerator-only, or refused by the member check) get the apply link instead of RSVP/Save controls.
- **Saved state:** the event detail API now reports `is_saved` for the signed-in member (it was always `false`), so a saved event shows "Remove from saved" after reload.
- **Registration states:** rejected, checked-in and no-show registrations have their own labels instead of a disabled "Register"; RSVP confirmations are localized from the resulting state (registered, waitlisted, pending review) rather than the API's English message.
- **Dates:** times were formatted in the device timezone with the Hijri calendar in Arabic. They are now shown in Riyadh time, Gregorian, as a start–end range with a "Riyadh time" label; multi-day events show the full end date.
- **Plain copy:** removed the generic "Relevance 60%" badge and the English-only "Recommended based on your member activity" line, which is derived only from the event type. Every admin event type and format (online, in person) is labelled in both languages.
- **Accessibility:** registration-form labels are tied to their fields; the calendar link is no longer a button nested in a link; resources without a URL are not rendered as `href="#"` links.
- **Tests and QA:** new `event-registration` tests (Riyadh-time formatting, same-day and multi-day ranges, labels for every API registration state and admin event type, localized confirmations, accelerator-only accounts, sign-in return link) and a backend test for per-member `is_saved`; the QA crawl now visits a seeded event page.
- **Checks:** `npm run verify` green (frontend 92, backend 213); QA crawl 436 visits as visitor, member and admin in Arabic and English, 0 problems; registration and cancellation checked in the browser at 390px and 1366px in both languages.
## Questions & answers — 2026-10-13

- **FAQ:** new bilingual `/faq` with 28 answers in 7 topics (membership, account, profile & privacy, introductions & asking for help, events & programs, news & founder profiles, partners & sponsors). Every answer describes current product behaviour and links to the page that does it. Search folds Arabic diacritics and letter variants and works across both languages; topic filters with live counts; shareable deep links (`/faq#reset-password`) with copy-link; expand/collapse all; an empty state that turns the search into a pre-filled contact message; FAQPage structured data. Linked from the footer and sitemap.
- **Shared FAQ component:** the membership questions on `/apply` and the EO Riyadh Accelerator FAQ (still admin-editable) now use the same accessible accordion, with search on the accelerator list.
- **Ask the community (fix):** questions shared with the community were only ever visible to the person who asked. Members now get a *Questions from founders* feed (shared and matched questions, urgent first, search and topic filter, no email addresses exposed) and an *I can help* action that joins the question's private conversation with an optional first message and emails the founder who asked. Helper suggestions now rank members whose profiles mention the topic.
- **Ask the community (UI):** bilingual page in the member menu with *Questions from founders* / *My questions* tabs, a guided ask form (clear visibility choices, urgency, inline validation), readable status labels, change-who-sees-it, mark resolved and reopen.
- **Tests:** backend 219 passing (7 new), frontend 85 passing (3 new). Long question lists page with “Show more”.

## Admin language parity and detail-page headings — 2026-10-12

- **Headings:** Event management (`/admin/events/[id]`) and Program management (`/admin/programs/[id]`) still rendered a second `<h1>` under the admin layout's; they now start at `<h2>`. A new frontend test fails if any admin page renders an `<h1>`.
- **Language:** Chat moderation, Event management and Program management were Arabic-only. Tabs, table headers, actions, room/cohort statuses, session types, form fields, empty states and toasts now follow the selected language; the Arabic cohort statuses agree with "دفعة". Unlabelled selects and inputs have accessible names, and registration/session dates display in Riyadh time.
- **QA crawl:** the default sample routes now include `/admin/events/1` and `/admin/programs/1`, so the admin detail pages are crawled.
- **Checks:** `npm run verify` green; QA crawl 356 visits, 0 problems (visitor + admin, ar/en); frontend 82 passing, backend 212 passing.

## Emails, forms, heroes and plain-language copy — 2026-10-12

- **Email:** every transactional email now uses one bilingual layout — Arabic (right-to-left) first, English second — with a branded theme, a single action button, a copy-paste fallback link and a bilingual footer. Converted: password reset, email verification (accelerator, founder, EOA), EOA status notices, founder activation (with code), membership approval, introduction accepted and application update. Removed Laravel's default English-only greeting, sign-off and button note.
- **New emails:** confirmation to anyone who sends a contact, sponsorship or membership-application form, plus a team alert to `MAIL_TEAM_ADDRESS` with Reply-To set to the sender. A mail outage is logged and never fails a saved submission.
- **Forms:** the sponsorship form was not connected to anything; it now submits through the contact API with validation, server-error mapping and a success state. The contact page was Arabic-only; it is now bilingual, accepts `?category=` and `?subject=` pre-fill, and keeps focus while typing.
- **Pages:** the Terms page is now bilingual (English marked as a translation of the Arabic text) with correct right-to-left layout. Removed invented sponsor statistics (250+ founders, SAR 500M+, 85% decision makers) and replaced them with verifiable facts.
- **Heroes:** one shared, start-aligned `PageHero` (eyebrow, headline, one sentence, at most two actions) for contact, events, programs, partners, sponsors and terms; the home hero drops its duplicate side panel and decorative clutter.
- **Copy:** rewrote generic, AI-sounding headlines and descriptions in both languages across home, events, programs, partners, founders and sponsors; home news cards show the localized title and topic.
- **More heroes:** About, Founders, Companies and News now use the same `PageHero`.
- **QA loop:** `npm run qa` (verify + browser crawl) and `npm run qa:crawl` visit every page in Arabic and English, desktop and mobile, as visitor, member and admin, and fail on page errors, API 5xx, horizontal overflow, error boundaries and missing or duplicate `<h1>`. First run: 416 visits, 12 issues (duplicate `<h1>` on 6 admin pages) — fixed, re-run clean.
- **Deployment:** `DEPLOYMENT.md` lists the post-deploy content imports in order.
- **Tests:** backend 212 passing (4 new email tests), frontend 81 passing.

## Sourced newsroom and founder scorecards — 2026-10-12

- **News:** 14 new independent briefs from reliable sources (Wamda, Arab News, Fintech Futures, Argaam/MAGNiTT, Saudi Press Agency, Mubasher, BRIDGE, Arab Founders) — Saudi first, then GCC and MENA — covering Q3 and September 2026 funding, Barq, Tabby, Lendo, Rize, Paymob, Fasset, Moove, Foodics–Norma, StartupBlink and MAGNiTT data. Each has key facts, an Arabic translation and a direct source link. The local demo seeder no longer creates invented news.
- **/news experience:** region tabs with counts (Saudi, GCC, MENA, Global), topic chips, search across companies/investors/sources, newest/oldest sort, a lead story with key figures, “Show more” pagination and shareable filter URLs. Articles add an “At a glance” panel, region/topic labels, share/copy link, companies in the story and related stories by company then region. Stories without a verified image show a branded source tile.
- **Founder scorecards:** 14 new researched founders of operating, revenue-generating companies — 9 Saudi (Tabby, Barq, Lendo, Rize, Lean Technologies, Lucidya, Mozn, Ninja, Floward), Careem, Paymob, Stripe, Canva and Nubank — 29 in total, ordered Saudi → GCC → MENA → global. Cards and profiles show a sourced “Operations & traction” signal and founding year.
- **Backend:** `wosool:import-news` (idempotent, editor-safe); news `region`, `key_facts`, `translations` with a `region` API filter; admin news editing of source, region, companies and key facts; founder import stores traction in `metrics_summary` and backfills existing companies; company API exposes `traction`.
- **Tests:** backend 206 passing, frontend 80 passing.

## End-to-end member journey repair — 2026-10-12

Verified with a full browser run on a fresh install: apply → admin approval → invitation email → registration → profile and company onboarding → introduction request → recipient acceptance → private conversation.

- **Fresh-install schema:** added `2026_10_12_000001_ensure_introductions_ledger_table`; the legacy core migration skipped on new databases, so introductions, matches and the admin intro console returned 500 errors.
- **Introductions:** the member ledger is now mounted on *Matches & Introductions* and loads its own data; recipients can accept/decline, requesters can withdraw, accepted routes link to messages. Fixed authorization that required a non-existent `role_token` column, added a duplicate-pending guard, named intro rooms after both founders, and show founder names instead of taglines.
- **Admin:** added a *Verify founder* control (also vets the founder for introductions); fixed 500s on admin companies and intros.
- **Member features:** fixed 500s in help requests (helper suggestions, admin checks), chat moderation and registration exports caused by `role_token`; member company and match lists return empty results before a profile exists.
- **Profile photos:** members can upload, replace and remove a portrait (JPEG/PNG/WebP, ≤2 MB, ≥160 px) at `POST/DELETE /api/v1/member/founder-profile/avatar`; served via `/storage/founders/avatars/*`.
- **Email:** approval invitations, introduction confirmations and application updates now use branded bilingual mailables; introduction emails go to each founder separately so addresses are not shared. Password-reset mail states the expiry before the button.
- **Programs and events:** applications are rejected for programs in a closed lifecycle state on both the website and the API; demo seed data publishes its events.
- **Reliability:** session login uses the `web` guard explicitly; public program pages no longer call member-only endpoints for visitors.
- **Tests:** 11 new backend tests (introductions, avatars, admin content lifecycles); backend 185 passing, frontend 70 passing.

## Founder growth calendar — 2026-10-12

- Added a bilingual month calendar and agenda to `/events`, with date selection, topic search, activity filters, mobile layouts and Riyadh timezone handling.
- Planned 26 distinct Wednesday learning sessions, 26 Saturday visit programs, 26 Sunday EOA peer discussions and 13 alternate-Friday online workshops from 12 October 2026, preserving all topics across the Ramadan pause through 9 May 2027.
- Added accelerator off days throughout expected Ramadan (8 February–9 March 2027), international holidays/observances, EOA Cohort Demo Day & Investment Opportunity on 15 May 2027 and EO Saudi Summit in Diriyah on 20 May 2027 (details TBA).
- Marked session time, host, venue/format, joining link and registration TBD; kept proposals separate from published, registerable API events.
- Added sourced national occasions and tentative 2027 Ramadan/Eid dates, holiday-overlap notices and explicit messaging outside the program window.
- Preserved upcoming/archive event listings and existing event details. See [calendar operations and verification](docs/FOUNDER-CALENDAR-2026-10-12.md).

## Transparent logo fitting — 2026-10-11

- Unified partner strips, partner-directory cards and founder/company scorecards around proportional transparent logo rendering with readable fallbacks.
- Replaced the opaque EO hero artwork and five company logo references with verified transparent originals; preserved authentic colors and appropriate light/dark contrast. Localized the existing Swarm logo for reliable delivery.
- Improved EO, Kitopi and Salla visual sizing, removed blend-mode and unnecessary RDIA backing, and corrected Wosool header/footer image dimensions.

## Single-row founder browsing — 2026-10-11

- Changed founder scorecards on the homepage and directory to one row with rightward movement every three seconds, manual arrows/swipe, pause/resume and reduced-motion support.
- Added an expandable grid below the carousel with numbered pages, 6/12/24 profile page sizes and shared search/filter behavior.
- Pause motion during hover, focus/manual interaction, hidden-page/out-of-view browsing and expanded-grid use; preserve Arabic/English card direction and keyboard access.

## Founder cards, mentor profiles and responsive account journeys — 2026-10-11

- Moved founder scorecards below the homepage partner strip with portrait-led cards, two manual rows, search, sector filters and responsive pagination.
- Added eight researched public founder spotlights for initial rendering and API-outage resilience on the homepage and founder directory, without inventing member status.
- Added bilingual EOA mentor profiles, public cards, expertise filters, secure uploads, leadership publishing, appointment/consent controls, audit records and stale-write protection.
- Improved EOA program and learning copy, mentor navigation and Arabic/English empty states.
- Rebuilt community application/registration layouts for both languages, fixed invitation email entry, storage failures, duplicate submission and validation-step navigation.
- Corrected EOA sign-in mode and return destinations, localized the skip link, and enlarged password and profile touch targets.
- Added explicit video MIME headers and a restricted public mentor portrait proxy.
- Unified the homepage and EOA partner strips with transparent original logos, proportional sizing, swipe/keyboard navigation, pause controls and reduced-motion support; corrected the KAUST university artwork.
- Clear generated Next.js route responses before production builds so in-place updates serve the newly built pages.

## EO Riyadh board, editorial management and skyline — 2026-10-11

- Added the supplied 2026/27 board: eleven original portrait crops, explicit terms, source-backed professional links and a controlled accessible carousel.
- Added scoped board CRUD, secure public raster uploads, bilingual fields, display order, publication controls, audit records and an insert-only seed import.
- Added bilingual editorial drafts, publication snapshots, FAQs, operator content, optimistic conflict detection and partner metadata editing.
- Added a licensed muted Riyadh skyline video, persistent poster/reduced-motion fallback and the supplied EO Riyadh logo.
- Extended the journey through completion and separate EO membership review; aligned duration with EO's published two-year program.
- Added program-focused footer navigation and corrected stale uppercase route documentation.
- Hosting verification remains separate from source validation; see the dated release guide for actual status.

## Product system, EOA experience, and approved Wosool identity — 2026-10-11

### Added

- Added a unified semantic product design system shared across public Wosool pages, member workspaces, administration, and EO Riyadh Accelerator.
- Added trusted founder, startup, scaleup, and venture scorecards combining company identity, founder story, role, short descriptions, sector, stage, location, official links, verification, review freshness, evidence, and opportunity signals where available.
- Added equal-height responsive cards, controlled two-row browsing, pagination, search, and RTL/LTR-aware navigation without forced autoplay.
- Added a structured authenticated founder-introduction workspace using the established reviewed introduction API and request-tracking flow.
- Added an API-backed administration command center with grouped navigation for community, operations, growth/content, EOA, privacy, and system settings.
- Added stronger EO Riyadh Accelerator storytelling and expandable Cash, Strategy, People, and Execution learning pillars under the canonical `/eoa` experience.
- Added the approved Wosool connected-node identity assets:
  - `frontend/public/wosool-logo-eo.svg` — primary horizontal website logo.
  - `frontend/public/wosool-logo-white.svg` — white footer/dark-background version.
  - `frontend/public/wosool-w-favicon.svg` — compact favicon/application icon.

### Changed

- Made Cairo Variable the primary product typeface for Arabic and English and expanded semantic tokens for surfaces, actions, status states, borders, elevation, responsive spacing, focus, and reduced motion.
- Replaced the earlier geometric ribbon W with the exact connected-node W structure approved from the supplied Wosool reference.
- Enlarged and integrated the master Wosool wordmark in the website header, applied the white lockup to the footer, and connected the compact mark to metadata/favicon configuration.
- Normalized shared public navigation and calls to action to the canonical lowercase `/eoa` route while retaining the established physical route tree for compatibility.
- Reorganized administration around real operational domains and live API data instead of invented dashboard metrics.
- Updated README guidance for the current product architecture, brand assets, directories, introductions, EOA journey, trust controls, CI boundary, and production dependencies.

### Fixed

- Replaced malformed UTF-8 source introduced during the scorecard/directory upgrade and restored valid bilingual TypeScript/TSX.
- Corrected active-route handling so lowercase `/eoa` navigation is recognized consistently.
- Preserved private contact, application, financial, and peer-group information behind established authorization boundaries.

### Validation and release boundary

- Pull request #29 was merged to `main` as `22c7d0cdcd9ce543fd6befe7049b05d66cd0a402` after successful frontend and backend CI.
- Follow-up approved-brand commits were pushed directly to `main`, ending with `4044e1fa8d2a26a87518fbf0d551452a6961e1ec`.
- GitHub Actions run #52 passed frontend lint, TypeScript, automated tests, entrepreneur-data validation, production dependency audit, and Next.js build, plus backend syntax, security audit, Laravel tests, dependency audit, and build.
- No database migration or new mandatory environment variable was introduced by this product/brand upgrade.
- CI success does not prove that production hosting deployed the commit; live deployment and browser smoke testing remain separate release gates.

## Wosool reliability and EOA tracks — 2026-10-09

- Standardize Cairo typography, bilingual alignment, mobile navigation, form sizing and loading/error states.
- Repair public founder/company profiles, paginated listings, directory introductions, program filters, society actions and admin event/program/match workflows.
- Preserve chat drafts on failure, load newest history first, deduplicate realtime/polled messages, restrict writes and keep successful sends independent of the broadcast broker.
- Refresh the EOA hero, partner rail and program explanation; add a homepage infographic and `/dashboard/eoa`.
- Add bilingual admission tracks, applicant preferences, leadership-confirmed track acceptance and audited platform-admin assignment of EOA roles.
- Add backend regression tests and record local browser/API verification in the October 9 release notes.

## EO Accelerator gateway — 2026-10-08

- Add bilingual discovery, verified applicant accounts, server-saved multi-step applications, review/audit lifecycle, onboarding and cohort resources.
- Add reviewer/admin operations for cohorts, sessions, attendance, mentor assignments and milestones.
- Add 18 source-backed ecosystem entries with preview/import/provenance/editorial review and historical opportunity handling.
- Prepare requested partner order and three unmodified official assets behind identity/designation/asset approval.
- Remove fictional public fallback records and fixed membership/program counts from affected routes.
- Add private response headers, readiness checks, privacy request handling and release/recovery documentation.
- Deployment requires existing host access and the documented staging, email, policy and browser gates.

## [Unreleased] — EO Riyadh Accelerator

- Add the Arabic/English canonical `/eoa` gateway, Cairo layouts, official program facts, eligibility self-check and approval-controlled partner logos.
- Add verified accounts, encrypted versioned applications, private evidence, assigned committee review, interviews, decisions, onboarding, official/financial confirmation and participant services.
- Add cohort/session/material/group operations, coach coordination, notifications, inquiries, bilingual local terms and audit records with scoped roles.
- Import seven sourced ecosystem organizations without overwriting local decisions; correct the USD/SAR distinction and RDIA/CODE identities. Keep partnerships and unapproved local decisions in draft.
- Disable production fictional list fallbacks, protect legacy EOA access paths, repair the dependency lock and resolve the existing EventResource class-name collision.
- Document deployment, mail/queue dependencies, privacy approvals, backup/rollback and remaining browser/hosting verification. No production deployment is implied.

## [0.6.0] — 2026-10-08

### Added
- Real Arabic/English password recovery with expiring, single-use Laravel reset tokens and rate limits.
- Public sitemap, crawler rules, per-page metadata, private-route no-index headers, and new frontend regression tests.
- Repository-root CI for both applications and documented local/production setup.

### Changed
- Update compatible Laravel/PHP dependencies and backend asset dependencies to address fresh security advisories.
- Refined homepage hierarchy and mobile navigation; replaced the sample testimonial with useful navigation and sourced homepage content from the public API.
- Events now use API data, upcoming/past filters, explicit empty/error states, and Riyadh time.
- Updated Next.js to 16.4.0 and compatible runtime dependencies; retained the established lint rules.
- Rewrote README, deployment, testing, and security documentation to reflect the actual architecture.

### Fixed
- Shared session requests now send Sanctum CSRF headers; login redirects reject external/script URLs.
- Ended events reject RSVPs; public list, detail, and calendar routes enforce visibility/publishing rules and omit private event fields.
- Company models accept validated admin fields and preserve soft-deletion records.
- SQLite-compatible scorecard migration and member/API test fixtures restored backend validation.
- Local setup preserves existing application keys; production rejects demonstration seeding.

### Deployment notes
- Deploy backend migrations and configure mail delivery before the new recovery UI.
- Source publication and live deployment must be verified separately; CI does not deploy production.

## [0.5.0] — 2026-04-24

### Added
- `program_applications` table and `ProgramApplication` model for tracking member applications to specific programs (separate from the public founder-application-to-Wosool flow).
- Member-scoped controllers under `App\Http\Controllers\Api\Member`: `FounderProfileController`, `CompanyController`, `EventRsvpController`, `ProgramApplicationController`.
- Form Requests for new write paths: `UpdateFounderProfileRequest`, `StoreCompanyProfileRequest`, `UpdateCompanyProfileRequest`, `StoreProgramApplicationRequest`.
- New authenticated `/api/v1/member/*` endpoints:
  - `GET`/`PUT` `/member/founder-profile` — show / upsert the authenticated user's founder profile.
  - `GET`/`POST`/`PUT`/`DELETE` `/member/companies[/{company}]` — CRUD for companies linked to the founder profile.
  - `GET` `/member/events/rsvps`, `POST`/`DELETE` `/member/events/{slug}/rsvp` — event RSVP workflow with capacity-aware waitlisting.
  - `GET` `/member/program-applications`, `POST` `/member/programs/{slug}/apply` — program application workflow with deadline and duplicate-application checks.
- 25 new feature tests covering founder profile CRUD, company CRUD with ownership enforcement, event RSVP (including waitlisting), and program applications.
- Frontend `dashboard/profile` page rewritten as a functional client component that loads and persists founder profile data via the new member API, including dynamic needs/offers chips and 422 error mapping.
- Frontend `dashboard/events` page rewritten to fetch live events, display RSVP state, and call the RSVP/cancel endpoints with toast feedback.

### Changed
- `User` model gained `eventRsvps`, `programApplications`, and `applications` relations.
- `Program` model gained `applications` (HasMany `ProgramApplication`).
- Frontend `lib/api.ts` now sends `credentials: "include"` on every request so member endpoints work over the Sanctum session cookie.

### Fixed
- `AuthController` now guards `$request->session()` calls with `hasSession()`, eliminating "Session store not set on request" failures when the test client bypasses the session middleware stack.
- `PublicApiTest` now seeds via `DatabaseSeeder` so role/permission rows exist before `WosoolSeeder` calls `assignRole('admin')`. Backend test suite now reports **43/43 passing** (previously 12/18).

---

### Added
- Laravel Sanctum SPA authentication with stateful session management.
- AuthController with login, logout, register, and me (current user) endpoints.
- Spatie Laravel Permission integration with `admin` and `member` roles.
- 24 granular permissions covering profiles, companies, community, events, programs, and admin operations.
- RoleAndPermissionSeeder for bootstrapping roles and permissions.
- Permission tables migration for Spatie's role/permission system.
- Sanctum and permission configuration files published and customized for Wosool.
- Frontend AuthProvider context with login, register, logout, and session refresh.
- Next.js middleware protecting `/dashboard` and `/admin` routes with session cookie check.
- Register page (`/register`) with full form validation and API integration.
- Auth-aware navigation header — shows Dashboard link and user name when authenticated.
- Dashboard layout now shows authenticated user's name, email, and initials.
- Logout button in dashboard sidebar.
- 8 new backend auth tests covering register, login, logout, profile, and error cases.

### Changed
- Login page now wired to real Sanctum authentication API with error handling and loading states.
- Founders page (`/founders`) now fetches live data from `/api/v1/founders` with seed data fallback.
- Events page (`/events`) now fetches live data from `/api/v1/events` with seed data fallback.
- Programs page (`/programs`) now fetches live data from `/api/v1/programs` with seed data fallback.
- User model upgraded with Spatie HasRoles trait and founderProfile relationship.
- WosoolSeeder now assigns `admin` role to admin user and `member` role to founder users.
- DatabaseSeeder runs RoleAndPermissionSeeder before WosoolSeeder.
- API routes reorganized with auth endpoints and member-scoped protected routes.
- bootstrap/app.php configured with `statefulApi()` middleware for Sanctum SPA support.
- Frontend Providers wrapper now includes AuthProvider for app-wide session state.
- Frontend route count increased from 41 to 42 with addition of `/register`.

### Fixed
- Dashboard layout no longer shows hardcoded user name — uses real authenticated user data.
- Header navigation no longer shows Login to authenticated users.

---

## [0.3.1] — 2026-04-09

### Added
- Fully functional Apply form with multi-step state management, client-side validation, API submission, loading states, and success confirmation page.
- Fully functional Contact form with state management, client-side validation, API submission, loading states, and success confirmation.
- Terms of Service page (`/terms`) with comprehensive legal content for Saudi Arabia jurisdiction.
- Privacy Policy page (`/privacy`) with GDPR-aligned data protection content.
- Forgot Password page (`/forgot-password`) with email input, validation, and confirmation flow.

### Changed
- Apply form now includes phone field, "What do you need" field, and character counter for motivation (matching backend API contract).
- Apply form stage options expanded to match backend: Pre-seed, Seed, Series A, Series B+, Scale-up, Exited.
- Apply form sector options expanded with EdTech, PropTech, CleanTech.
- Contact form field "name" consolidated from first/last to full name (matching backend API contract).
- Step indicators in Apply form no longer allow arbitrary step jumps — validation must pass before continuing.

### Fixed
- Broken link: `/terms` now resolves to Terms of Service page.
- Broken link: `/privacy` now resolves to Privacy Policy page.
- Broken link: `/forgot-password` now resolves to password reset flow.
- Root package.json version synchronized from 0.2.0 to 0.3.1.
- Apply form fields now aligned with backend StoreApplicationRequest validation rules.
- Contact form fields now aligned with backend StoreContactRequest validation rules.

---

## [0.3.0] — 2026-04-08

### Added
- Repository-level GitHub Actions CI workflow for frontend and backend validation.
- Backend API feature tests covering health, public read, and public submission endpoints.
- Human-readable API contract documentation in `docs/API.md`.
- Client integration guidance in `docs/SDK.md`.
- ADR index in `docs/ADR/README.md`.
- Repository-wide editor standardization through `.editorconfig`.

### Changed
- Upgraded core repository operating-system documents to reflect the pre-launch hardening phase.
- Refined roadmap, testing, security, deployment, operations, and business framing for Saudi-first execution.
- Updated SKILLS files to serve as a stronger cross-functional execution system.

### Fixed
- Removed avoidable frontend lint warnings caused by unused imports.

---

## [0.2.1] — 2026-04-08

### Added
- 11 admin portal pages: members, companies, scorecards, matches, events, programs, partners, sponsors, news, analytics, settings.
- 7 member dashboard pages: company, community, matches, events, programs, messages, settings.
- 2 new events in seed data.

### Changed
- Updated seed data dates from 2025 to 2026.
- Updated documentation to reflect 35 routes, 21 models, 17 API endpoints, and 27+ components.
- Fixed contact domain references from `wosool.com` to `wosool.org`.

---

## [0.2.0] — 2026-04-08

### Added
- Repository operating system with standardized project documentation.
- Initial SKILLS framework for cross-functional execution.

---

## [0.1.0] — 2026-01-01

### Added
- Initial monorepo structure with frontend, backend, schema, design system, and demo content.

## Sourced founder and startup cards — 2026-10-09

- Unified logo-first cards with portraits, roles, separate briefs and safe social/website links.
- Two-row manual sliders, selectable rows and page navigation across community and researched directories.
- Added eight sourced Saudi-first startup/scaleup profiles, an idempotent database import and review dates.
- Preserved public relationship privacy and removed invented numeric scores from public cards.
- Expanded research to 13 businesses, with 10 eligible for publication; added Misk, Impact46, LEAP and GITEX profiles and a ten-source research queue.
- Added technology/traditional classification, business focus, server-side search/filtering, website review dates and linked revenue evidence with publication gates.
- Preserved pending evidence without publishing it; scheduled reviews now cover all requested sources.
