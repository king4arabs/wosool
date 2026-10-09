# Changelog

## EO Accelerator gateway — 2026-10-08

- Add bilingual discovery, verified applicant accounts, server-saved multi-step applications, review/audit lifecycle, onboarding and cohort resources.
- Add reviewer/admin operations for cohorts, sessions, attendance, mentor assignments and milestones.
- Add 18 source-backed ecosystem entries with preview/import/provenance/editorial review and historical opportunity handling.
- Prepare requested partner order and three unmodified official assets behind identity/designation/asset approval.
- Remove fictional public fallback records and fixed membership/program counts from affected routes.
- Add private response headers, readiness checks, privacy request handling and release/recovery documentation.
- Deployment requires existing host access and the documented staging, email, policy and browser gates.


All notable changes to **Wosool** are documented here.

This project follows **Semantic Versioning** and a Keep a Changelog-inspired format.

---

## [Unreleased] — EO Riyadh Accelerator

- Add the Arabic/English `/EOA` gateway, Cairo layouts, official program facts, eligibility self-check and approval-controlled partner logos.
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
- Terms of Service page (/terms) with comprehensive legal content for Saudi Arabia jurisdiction.
- Privacy Policy page (/privacy) with GDPR-aligned data protection content.
- Forgot Password page (/forgot-password) with email input, validation, and confirmation flow.

### Changed
- Apply form now includes phone field, "What do you need" field, and character counter for motivation (matching backend API contract).
- Apply form stage options expanded to match backend: Pre-seed, Seed, Series A, Series B+, Scale-up, Exited.
- Apply form sector options expanded with EdTech, PropTech, CleanTech.
- Contact form field "name" consolidated from first/last to full name (matching backend API contract).
- Step indicators in Apply form no longer allow arbitrary step jumps — validation must pass before continuing.

### Fixed
- Broken link: /terms now resolves to Terms of Service page.
- Broken link: /privacy now resolves to Privacy Policy page.
- Broken link: /forgot-password now resolves to password reset flow.
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
