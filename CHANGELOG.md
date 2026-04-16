# Changelog

All notable changes to **Wosool** are documented here.

This project follows **Semantic Versioning** and a Keep a Changelog-inspired format.

---

## [0.4.0] — 2026-04-16

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
