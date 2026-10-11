# Changelog

All notable changes to **Wosool** are documented here.

This project follows **Semantic Versioning** and a Keep a Changelog-inspired format. Date-based entries document significant product and operating-system upgrades between numbered application releases.

---

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
