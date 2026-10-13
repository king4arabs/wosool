# Changelog

All notable changes to **Wosool** are documented here.

This project follows **Semantic Versioning** and a Keep a Changelog-inspired format. Date-based entries document significant product and operating-system upgrades between numbered application releases.

---

## Event detail page: bilingual, visitor-safe, Riyadh time — 2026-10-13

- **Navigation:** event and program detail pages (`/events/[slug]`, `/programs/[slug]`) rendered without the site header, footer or `<main>` landmark, leaving visitors on a dead-end page. Both now use `PublicLayout`.
- **Missing description:** the event page read only `short_description`/`full_description`, so events with a plain `description` (all seeded and most admin-created events) showed "no description". It now falls back to `description`.
- **Language:** the event page was Arabic-only. Headings, badges, registration states, buttons, the registration form, toasts and empty states now follow the selected language; English event content keeps correct punctuation inside the Arabic layout (`dir="auto"`).
- **Visitors:** the page called the member-only registration-status endpoint for everyone (a 401 on every visit) and offered Register/Save buttons that could only fail. Visitors now see "Sign in to register" (returning to the same event) and an "Apply to join" link; copying the link works without an account.
- **Dates:** times were formatted in the device timezone with the Hijri calendar in Arabic. They are now shown in Riyadh time, Gregorian, as a start–end range with a "Riyadh time" label.
- **Plain copy:** removed the generic "Relevance 60%" badge and the English-only "Recommended based on your member activity" line, which is derived only from the event type. Event type and format (online, in person) are labelled in both languages.
- **Accessibility:** registration-form labels are tied to their fields; the calendar link is no longer a button nested in a link; resources without a URL are not rendered as `href="#"` links.
- **Tests and QA:** new `event-registration` tests (Riyadh-time formatting and ranges, bilingual registration labels, sign-in return link); the QA crawl now visits a seeded event page.
- **Checks:** `npm run verify` green (frontend 88, backend 212); QA crawl 436 visits as visitor, member and admin in Arabic and English, 0 problems; registration and cancellation checked in the browser at 390px and 1366px in both languages.

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
