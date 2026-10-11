# Wosool | وصول

**Founders to Founders — a Saudi-first community connecting founders across the GCC.**

[![CI](https://github.com/king4arabs/wosool/actions/workflows/ci.yml/badge.svg)](https://github.com/king4arabs/wosool/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js: 22.12+ or 24.x](https://img.shields.io/badge/Node.js-22.12%2B%20or%2024.x-339933?logo=nodedotjs&logoColor=white)](package.json)
[![PHP: 8.3+](https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php&logoColor=white)](backend/composer.json)

[Community website](https://wosool.org) · [EO Riyadh Accelerator](https://wosool.org/EOA) · [Quick start](#quick-start) · [Documentation](#documentation) · [Report a bug](https://github.com/king4arabs/wosool/issues)

Wosool brings founder profiles, companies, events, learning, introductions and collaboration into one Arabic/English platform. This monorepo contains the Next.js frontend, Laravel API and operating documentation.

It also provides the digital gateway for **EO Riyadh Accelerator**: *Saudi Founders. Global Connections. Extraordinary Growth.*

> **Two separate journeys:** Wosool community membership does not grant Accelerator admission. Applications, local acceptance, official Accelerator enrollment and EO membership are distinct. Repository CI validates code; a push or merge **does not deploy** the platform.

## Contents

- [Platform capabilities](#platform-capabilities)
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Development commands](#development-commands)
- [Configuration](#configuration)
- [Roles and workflows](#roles-and-workflows)
- [Verified content and partners](#verified-content-and-partners)
- [Brand design system](#brand-design-system)
- [Verification and release](#verification-and-release)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Platform capabilities

- **Founder community:** profiles, company management, directories, introductions, chat, events, learning and collaboration.
- **Accelerator applications:** eligibility discovery, verified accounts, private server-saved drafts, supporting documents, review and admission tracks.
- **Participant services:** onboarding, cohort calendars, resources, accountability groups, coaching, goals, attendance and feedback.
- **Administration:** scoped reviewer/staff access, audited role management, program operations, privacy requests and publication approvals.
- **Bilingual experience:** Arabic/English, RTL/LTR layouts, locally bundled Roboto/Cairo and responsive controls.
- **Sourced directories:** Saudi-first startup/founder profiles and an ecosystem directory with provenance and editorial review.

| Experience | Canonical route | Purpose |
| --- | --- | --- |
| Wosool community | `/` | Founder community and its own membership journey |
| EO Riyadh Accelerator | `/EOA` | Discovery, eligibility, accounts, applications, review and coaching |
| Accelerator workspace | `/dashboard/eoa` | Applicant decisions/tracks and participant services, independent of community membership |
| Ecosystem directory | `/opportunities` | Sourced entities and opportunities, not confirmed partnerships |

Lowercase `/eoa` and older `/accelerator` pages redirect to uppercase `/EOA`. EO Riyadh provides chapter leadership and governance; EO Accelerator provides the program framework; Wosool provides the local digital gateway. Operating partners deliver only their approved scope. Program leadership: Mohammed Alsolami, EO Riyadh Membership & Accelerator Chair.

## Architecture

| Component | Implementation |
| --- | --- |
| Frontend | Next.js 16.4, React 19, TypeScript, Tailwind 4, locally served Roboto/Cairo, Arabic/English RTL/LTR |
| Backend | Laravel 13, PHP 8.3+, Sanctum cookie sessions, Spatie roles |
| Database | SQLite local/tests; preserve and verify the actual production engine |
| EOA routes | `frontend/src/app/EOA`, `frontend/src/components/eoa`, `backend/routes/eoa.php` |
| EOA domain | `backend/app/Services/Eoa`, `backend/app/Http/Controllers/Api/Eoa` |
| Ecosystem directory | `/opportunities`, `ecosystem_records`, source ledger in `docs/research` |
| Deployment | Separate Node and PHP applications; GitHub CI validates, **does not deploy** |

Browser API requests use the same-origin `/api/v1` proxy. Sessions use CSRF protection. Financial applications are encrypted, versioned server-side drafts; supporting documents are private and authorized on download. Do not expose the backend storage directory or rotate away the encryption key without a recovery plan.

```text
.
├── frontend/       # Next.js app, shared UI, API clients and frontend tests
├── backend/        # Laravel API, domain services, migrations and backend tests
├── docs/           # Product guides, API reference, research and release notes
├── scripts/        # Local setup, development and operational commands
└── package.json    # Monorepo setup, verification and build entry points
```

The October 9 integration repair resolves the conflicting merge of two Accelerator implementations. The older gateway's application/review/operations writes return **410** with the canonical path; its owned, private records remain readable. It cannot grant enrollment or overwrite EOA approvals. Existing legacy records require staff-reviewed transfer; no silent data conversion or deletion occurs. Ecosystem imports, editorial administration and privacy-request operations remain supported. See [integration release notes](docs/EOA-INTEGRATION-2026-10-09.md).

## Quick start

### Prerequisites

- Node.js **22.12+ on 22.x, or 24.x**, with npm.
- PHP **8.3+** and Composer **2**, compatible with the committed Composer lockfile.
- Required PHP extensions; CI explicitly enables `mbstring`, `dom`, `curl`, `pdo_sqlite` and `sqlite3`.
- Git and a Bash-compatible shell for the combined development launcher.

### Install and run locally

```bash
git clone https://github.com/king4arabs/wosool.git
cd wosool
npm run setup
# Optional: create frontend/.env.local from the documented local defaults.
test -f frontend/.env.local || cp frontend/.env.example frontend/.env.local
npm run dev
```

For a fresh checkout, the optional copy makes frontend configuration explicit; **do not overwrite an existing `.env.local`**. Backend configuration is prepared automatically.

`npm run setup` installs locked frontend/backend dependencies, prepares a missing backend environment/key, migrates and runs `eoa:install`. Local preparation preserves existing configuration and refuses production setup. It creates no applicant or administrator accounts. SQLite is the local default; its database file is created if absent. Set an absolute `DB_DATABASE` path if needed.

| Service | Local address |
| --- | --- |
| Frontend | http://localhost:3000 |
| API liveness | http://localhost:8000/api/health |
| API readiness | http://localhost:8000/api/ready |

Run a queue worker in a **second terminal** from the repository root:

```bash
php backend/artisan queue:work --tries=5 --timeout=60
```

> Local mail uses `MAIL_MAILER=log` and **does not deliver email**. Use a controlled mail sink for verification/recovery tests, not real applicant addresses. EOA collection and intake stay closed until the required administrative approvals are configured.

### Optional data imports

`eoa:install` inserts missing roles, a closed/draft program and sourced EOA organization records, without replacing existing settings or confirmations. Optional wider ecosystem import:

```bash
php backend/artisan wosool:import-ecosystem
php backend/artisan wosool:import-ecosystem --apply
```

The first command previews the changes. Production imports require verified staging and backups. The compatibility `wosool:prepare-gateway --apply` command now uses the same closed EOA installer and preserves legacy partner records. Never use the full fictional demo seeder in production.

For startup/founder profiles, follow the [directory guide](docs/STARTUP-DIRECTORY.md). After migrations, preview with `php backend/artisan directory:import --dry-run`, then import with `php backend/artisan directory:import`.

## Development commands

Run these commands from the repository root after setup:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend together; stop both with Ctrl+C |
| `npm run dev:frontend` / `npm run dev:backend` | Start either application independently |
| `npm run lint` | Run frontend ESLint |
| `npm run type-check` | Check frontend TypeScript |
| `npm run test` | Run frontend and backend regression suites |
| `npm run test:frontend` / `npm run test:backend` | Run one application's tests |
| `npm run validate:entrepreneurs` | Validate the entrepreneur dataset |
| `npm run build` | Build both applications |
| `npm run verify` | Run lint, types, tests, dataset validation and both builds |
| `npm run eoa:install` | Repeat the non-destructive EOA installer |

Reverb is optional and is not started by default. Configure it before using `RUN_REVERB=1 npm run dev`.

<details>
<summary>Common local setup issues</summary>

- **SQLite file cannot be created:** check `DB_DATABASE` and write permissions on its parent directory.
- **API requests fail:** ensure the backend is running and `NEXT_PUBLIC_API_URL` is its origin without `/api`; restart the frontend after local environment changes.
- **Verification or reset email does not arrive:** the default log mailer is not a sending transport; configure a controlled mail sink and run the queue worker.
- **EOA registration or submission is unavailable:** check the approved privacy notice and intake settings in [EOA operations](docs/EOA.md); do not bypass the gates.
- **Ports are occupied:** stop the conflicting local processes or run the applications separately with the appropriate port configuration.

</details>

## Configuration

Use [`frontend/.env.example`](frontend/.env.example) and [`backend/.env.example`](backend/.env.example) as references. Frontend overrides belong in `frontend/.env.local`; backend values belong in `backend/.env`. `NEXT_PUBLIC_*` values are public client configuration, **never secrets**.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Frontend canonical origin; production https://wosool.org |
| `NEXT_PUBLIC_API_URL` | Actual backend origin, without `/api`; rebuild frontend after changes |
| `APP_ENV`, `APP_DEBUG` | Production and false on the live release |
| `APP_KEY` | Stable protected encryption key; retain with recovery materials |
| `APP_URL`, `FRONTEND_URL` | Backend/frontend origins, including verification and recovery links |
| `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` | Correct origins/cookie scope for the deployed topology |
| `SESSION_SECURE_COOKIE`, `SESSION_ENCRYPT` | True in production |
| `DB_*`, `CACHE_STORE`, `QUEUE_CONNECTION` | Durable database and supervised queue/shared cache |
| `MAIL_*` | Real sending transport, verified sender and delivery testing |
| `NEXT_PUBLIC_ENABLE_DEMO_CONTENT` | Development fixtures only; ignored in production |
| `REVERB_*` | Optional existing community realtime integration |

Never commit secrets, private documents, tokens or backups. Rebuild Laravel's configuration cache after environment changes. Legacy `GATEWAY_PRIVACY_READY`/`GATEWAY_EMAIL_UPDATES` flags do **not** authorize EOA collection or intake: those approvals belong to the EOA administrative settings.

## Roles and workflows

- `eoa_applicant`: own verified account, draft, evidence, decisions and notifications.
- Participants: enrollment-derived access to their own checklist, calendar, registrations, resources, group/coach, goals, attendance, feedback and announcements.
- `eoa_reviewer`: assigned applications only; no final decisions or financial approvals.
- `eoa_coach`: assigned participants' development/attendance, not application finances.
- `eoa_staff`: review coordination and program operations.
- `eoa_lead`/existing admin: local approvals, final admission decisions, partner confirmations and official/financial enrollment checks.
- Existing community membership is separate; old reviewer assignments do not grant EOA permissions.

Provision verified privileged accounts through the audited procedure in [EOA operations](docs/EOA.md). No privileged account is seeded. Applicants may submit data-rights requests in `/EOA/account`; existing administrators handle them in `/admin/privacy-requests`. A request does not automatically erase records or waive retention obligations.

## Verified content and partners

[EOA research](docs/EOA-RESEARCH.md) records official revenue of **USD 250,000–999,999**, the two-year program, learning cadence and annual global fee of **USD 1,750**, separately from local costs. SAR conversions state their basis/date. Recruitment numbers are targets, not achieved counts.

Local launch dates, fees, sponsor allocations, attendance terms and versioned bilingual privacy notices remain draft until approved. Do not infer partnerships from available artwork. The requested partner order is EO Riyadh, The Garage, RIDA, Misk, CODE. RIDA-to-RDIA identity mapping and CODE's standalone approved artwork remain unresolved. Unconfirmed organizations stay out of “Proud of Partners.”

The wider directory has 18 sourced entities/programs/opportunities with dated provenance and editorial locks. It is distinct from applicant companies and confirmed partners. Research does not establish private revenue, founder eligibility or an EO relationship.

## Brand design system

The shared palette lives in [`frontend/src/app/brand.css`](frontend/src/app/brand.css), consumed by global CSS, Tailwind utilities and component styles. Visual changes must preserve data, admission rules and authorization boundaries.

<details>
<summary>Design and asset guidelines</summary>

- Base: navy `#0C0C31`, white `#FFFFFF`, action blue `#3D46F2`.
- Supporting: pink `#FF346E`, orange `#FA653C`, yellow `#EFB82E`, green `#1EA691`, gray `#5E617D`; light/dark accent shades are available as `--brand-light-*` / `--brand-dark-*` tokens.
- Use semantic `--page-bg`, `--surface`, `--surface-soft`, `--text`, `--text-muted`, `--border`, `--border-soft`, `--action-*`, `--link`, `--focus-ring`, `--on-dark*`, `--error-*` and `--success-*` rather than introducing another literal palette. Shared radii, shadows and responsive section spacing keep journeys consistent.
- Pair white text with blue/navy and navy text with bright supporting colors. Bright pink/orange/yellow/green are not white-text body-copy backgrounds. Use dark pink/green feedback text on their light surfaces, and `--on-dark-muted` for muted text on navy.
- English uses locally bundled Roboto 400/700; Arabic uses Cairo. Use sentence-case headings, responsive `clamp()` sizing, logical spacing, normal Arabic letter spacing, visible keyboard focus and controls at least 44px tall. Honor `prefers-reduced-motion`; circular decoration is background artwork, never a replacement logo.
- Preserve existing Wosool artwork without recoloring or redrawing. EO artwork comes from official packages in [the asset register](docs/research/PARTNER-ASSETS.md): preserve entire artwork, aspect ratios and clear space.
- Authentic artwork does not establish a partnership. Replacement logos and new founder photography require owner-approved source assets; do not fabricate them. A fresh EO brand approval check remains a release prerequisite.

</details>

## Verification and release

```bash
npm run verify
cd backend
php artisan wosool:check-readiness
# On a configured release after the required approvals:
php artisan wosool:check-readiness --production
```

CI runs frontend lint/types/tests/data checks/security audit/build, and PHP syntax checks, backend tests, Composer/npm audits and the backend asset build. `/api/health` is liveness; `/api/ready` checks the database, applied migrations and EOA schema/program. Neither proves delivered email, running workers, backups, browser acceptance or legal compliance.

Follow [DEPLOYMENT.md](DEPLOYMENT.md) and [EOA operations](docs/EOA.md) for deployment, backups, restore rehearsal and rollback. Keep collection/intake closed until approvals and live checks pass. Never claim a release is live based only on a merge.

Remaining external dependencies: configured hosting/deployment access, production database validation, persistent private storage, real mail and supervised workers, approved local decisions/relationships, browser RTL/LTR/mobile accessibility acceptance, and backup recovery tests. No payment gateway, EO enrollment API or calendar integration is simulated.

Automated checks do not certify WCAG 2.2 AA. Review bilingual mobile/desktop layouts, keyboard navigation, reduced motion, dark/light contrast, form feedback, empty/error states and real authenticated journeys before sign-off.

## Documentation

| Guide | What you'll find |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | System structure and engineering context |
| [API reference](docs/API.md) | Backend interfaces |
| [Community homepage](docs/COMMUNITY-HOMEPAGE.md) | Main community experience |
| [EOA operations](docs/EOA.md) | Authoritative Accelerator workflows, access and approvals |
| [Startup directory](docs/STARTUP-DIRECTORY.md) | Sourcing, imports and ongoing review |
| [Testing](TESTING.md) | Automated coverage and manual acceptance gates |
| [Deployment](DEPLOYMENT.md) | Hosting, release, backup and rollback procedures |
| [Security policy](SECURITY.md) | Private reporting and operating controls |
| [EOA research](docs/EOA-RESEARCH.md) | Official program facts and sources |
| [Partner assets](docs/research/PARTNER-ASSETS.md) | Artwork provenance and approval constraints |
| [Reliability release notes](docs/WOSOOL-RELIABILITY-EOA-2026-10-09.md) | October 9 reliability, track and role changes |
| [Integration release notes](docs/EOA-INTEGRATION-2026-10-09.md) | Canonical EOA migration and legacy compatibility |
| [Changelog](CHANGELOG.md) | Release history |
| [Roadmap](ROADMAP.md) | Planned direction |

## Contributing

1. Open an [issue](https://github.com/king4arabs/wosool/issues) to discuss a bug or significant change. Include reproduction steps, expected/actual behavior and environment details; omit private data.
2. Create a focused branch from `main` and keep changes scoped. Preserve unrelated work and existing records, authorization boundaries and approval gates.
3. Add regression coverage for behavior changes, check Arabic/English and RTL/LTR, and update directly affected documentation.
4. Run `npm run verify` and the dependency audits in [Testing](TESTING.md). Record manual checks and any limitations separately.
5. Submit a pull request describing the change, linked issue and verification results. Use only approved, sourced brand assets.

## Security

Report vulnerabilities privately using [the security policy](SECURITY.md), not public issues. Never commit credentials, tokens, private applicant documents or backups. Keep production debug disabled, protect private storage and preserve the application encryption key with tested recovery materials.

## License

The repository is licensed under the [MIT License](LICENSE). Third-party artwork and trademarks remain subject to their owners' rights and applicable usage approvals; the software license does not grant partnership or brand endorsement.
