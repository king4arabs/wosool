# Wosool | وصول

[![CI](https://github.com/king4arabs/wosool/actions/workflows/ci.yml/badge.svg)](https://github.com/king4arabs/wosool/actions/workflows/ci.yml)

**Founders to Founders.** Wosool is the digital gateway for **EO Riyadh Accelerator**, alongside its Saudi/GCC founder network. The Accelerator journey lives at **https://wosool.org/EOA**: discovery, eligibility, verified accounts, private applications, committee review, onboarding and participant development.

**Saudi Founders. Global Connections. Extraordinary Growth.** Read the [EOA operating guide](docs/EOA.md) and [verified research register](docs/EOA-RESEARCH.md) before opening an intake.

Wosool supports local intake and review. It does not replace EO’s global enrolment systems, confer EO membership, or promise admission or funding. The requested partnership designations require documented approval before public display.

[Website](https://wosool.org) · [Release assessment](docs/EO_ACCELERATOR_RELEASE_2026-10-08.md) · [Gateway operations](docs/ACCELERATOR_OPERATIONS.md) · [Deployment](DEPLOYMENT.md) · [Research sources](docs/research/SOURCES-2026-10-08.md)

## Architecture

| Component | Implementation |
| --- | --- |
| Frontend | Next.js 16.4, React 19, TypeScript, Tailwind 4, App Router |
| Backend | Laravel 13 / PHP 8.3+, Sanctum cookie sessions, Spatie roles |
| Database | SQLite in the local environment template and automated tests; retain the deployed engine when releasing |
| Authentication | Existing community authentication plus verified accelerator applicant accounts; existing password recovery retained |
| Localization | Arabic/English gateway, shared navigation and new administration; RTL/LTR, locally hosted Cairo and Manrope fonts |
| Delivery | Separate Node frontend and PHP backend; GitHub Actions CI validates both and does not deploy |

Browser requests use `/api/v1` on the frontend origin. Next proxies requests to the configured backend origin. Session writes use the XSRF cookie/header; Laravel enforces ownership and permissions. Applicant drafts stay on the server, with optimistic revisions to prevent stale overwrites.

| Path | Purpose |
| --- | --- |
| `frontend/src/components/accelerator` | Landing, partner strip, application, directory, reviewer and program operations views |
| `frontend/src/app/accelerator`, `opportunities`, `review` | Public discovery and protected applicant/reviewer routes |
| `backend/routes/gateway.php` | Versioned accelerator, research, program operations and privacy APIs |
| `backend/app/Services/AcceleratorGateway.php` | Eligibility rules, transitions, authorization and private profile creation |
| `backend/app/Console/Commands` | Preview-first imports, gateway preparation and readiness checks |
| `docs/research` | Dated primary-source records, asset provenance and local import/recovery report |

Existing community membership, founder/company editing, introductions, events, society, messaging and administrative functionality remain in the repository. New applicant accounts do not receive community membership implicitly. Public directories no longer substitute fictional fixtures when an API is unavailable; the old fictional entrepreneur showcase route redirects to `/opportunities`.

## Local setup

Use Node **22.12+ on 22.x or 24.x**, PHP **8.3+**, Composer 2 and the extensions required by Composer, including a database driver. Install the committed lockfiles.

```bash
git clone https://github.com/king4arabs/wosool.git
cd wosool
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run setup
cd backend
php artisan db:seed --class=RoleAndPermissionSeeder
php artisan wosool:prepare-gateway
php artisan wosool:prepare-gateway --apply
php artisan wosool:import-ecosystem
php artisan wosool:import-ecosystem --apply
cd ..
npm run dev
```

For SQLite, set `DB_DATABASE` to an absolute path if the framework default is unsuitable. For MySQL or PostgreSQL, configure the existing `DB_*` variables, install the matching PDO driver and create an empty local database first. Validate migrations against the actual deployed engine before release. Setup generates a missing local key, preserves existing keys and rejects production. It does not seed users automatically. Run `php artisan queue:work` in a separate backend terminal for verification email. The default `log` mailer is local-only; use a controlled mail sink while testing. Do not send test messages to real applicants.
Install the closed/draft Accelerator and sourced organizations with `php backend/artisan eoa:install`. For email verification and notifications, run a queue worker from `backend/` with `php artisan queue:work --tries=5`; the default log mailer does not deliver email.

Open [http://localhost:3000](http://localhost:3000). Check the API at [http://localhost:8000/api/health](http://localhost:8000/api/health). `npm run dev` starts both services on a Bash-compatible system; alternatively, use `npm run dev:frontend` and `npm run dev:backend` in separate terminals.

The full `db:seed` includes fictional demonstration content and accounts and refuses production. Use only `RoleAndPermissionSeeder` and the two explicit import/preparation commands for this gateway.

## Configuration

Never commit secrets, environment files, reset/verification tokens or database backups. Public frontend variables are browser-visible.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical frontend origin; production `https://wosool.org` |
| `NEXT_PUBLIC_API_URL` | Backend origin without `/api`; used for the same-origin proxy |
| `APP_ENV`, `APP_DEBUG`, `APP_KEY` | Production mode, disabled debug, stable protected encryption key |
| `APP_URL`, `FRONTEND_URL` | HTTPS origins; frontend URL controls reset and verification links |
| `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` | Hosts and cookie scope matched to the actual deployment |
| `SESSION_SECURE_COOKIE`, `SESSION_ENCRYPT` | Set both true in production |
| `DB_*`, `CACHE_STORE`, `QUEUE_CONNECTION` | Durable database, shared cache/locking and supervised queue storage |
| `MAIL_*` | Verified mail transport/sender; `log` cannot deliver email |
| `GATEWAY_PRIVACY_READY` | Defaults false; production registration and draft intake are blocked until the privacy notice and operating policy are approved |
| `GATEWAY_EMAIL_UPDATES` | Defaults false; enables queued application status email once transport/workers are verified |
| `BROADCAST_CONNECTION`, `REVERB_*` | Optional community realtime services; not required for the application journey |

Configure source-backed eligibility, intake availability, global fee and confirmed local dates/fees in `/admin/accelerator`. Keep unknown local arrangements empty. Rebuild the frontend after public environment changes. Clear and rebuild Laravel’s configuration cache after backend environment changes.

## Roles and application states

- Applicants can save their own draft, submit, respond to an information request and acknowledge onboarding after acceptance. Verified email is required for applications.
- `accelerator-reviewer` sees assigned submitted applications, may start review, request information, shortlist and add internal notes. It cannot accept, waitlist, decline or assign reviewers/cohorts.
- `admin` manages final decisions, assignments, cohorts, sessions, attendance, participant resources, mentors, milestones, editorial records, partners and privacy requests.
- `mentor` is an assignment role, not blanket access to applicant data. Administrators manage coaching assignments and materials.
- Existing `member` access remains separate.
| Surface | Capabilities |
| --- | --- |
| EO Accelerator `/EOA` | Bilingual discovery, USD/SAR self-check, private versioned applications and evidence, assigned review, onboarding, cohorts, learning, goals, coach workspace and audited operations |
| Public site | Founder and company discovery, programs, events, news, contact and membership applications |
| Member workspace | Profile and company management, event RSVPs, program applications, introductions, scorecards and community features |
| Admin | Application review, member and content management, event/program administration and moderation |
| Platform | Arabic/English interfaces, RTL/LTR support, responsive layouts, SEO metadata and optional realtime messaging |

**Readiness:** This is a pre-launch product, not a claim that the live host or every integration is configured. Production seed fallbacks for founder/company/partner/sponsor/program/event/news lists are disabled. The separate entrepreneurs showcase is explicitly fictional; some legacy screens remain Arabic-first. EOA is bilingual, but browser and deployed-email checks are release requirements. Password recovery requires a real mail transport to deliver messages (`MAIL_MAILER=log` does not send email). Check content and translations before public use.

The supported states are Draft, Submitted, Under Review, Information Requested, Shortlisted, Accepted, Waitlisted, Declined and Onboarded. Server-side allowed transitions, revision checks and audit events are defined in `AcceleratorGateway::TRANSITIONS`. New applicant/company profiles are private. Existing user-submitted profiles are not overwritten by research or application snapshots.

## Research and partners

The initial snapshot contains **18** organizations, programs and opportunities. It distinguishes provider entities, programs and dated opportunities, and records Arabic/English names, sources, verification date, conditions and unknowns. Expired records remain labelled historical; past deadlines never produce an active application link. See the [source ledger](docs/research/SOURCES-2026-10-08.md).

Imports default to preview, use stable slugs/hash comparison, flag duplicate identities, and preserve editorial locks. Administrators can review provenance, update descriptions/links/deadlines/statuses and archive records in `/admin/opportunities`. No automatic merge deletes historical relationships. Production apply commands require `--backup-verified --staging-verified`, which attest to work the operator must actually perform.

“Proud of Partners” / “نفخر بشركائنا” is positioned immediately after the homepage hero. Entries are prepared in EO Riyadh, Garage, RIDA, MISK, CODE order. Three authentic assets are committed unchanged. All five remain hidden until designation approval; RIDA identity and CODE artwork need resolution. `/admin/partners` manages order, links, identity/asset/designation approval and visibility. See [asset sources and usage conditions](docs/research/PARTNER-ASSETS.json).

## Development commands

Run from the repository root:
| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical frontend origin; `https://wosool.org` in production |
| `NEXT_PUBLIC_API_URL` | Backend origin, without `/api` or `/api/v1`; used by the Next.js rewrite and server API client |
| `APP_ENV`, `APP_DEBUG` | `production` and `false` on the live backend |
| `APP_KEY` | Laravel encryption key; generate once, retain securely across releases |
| `APP_URL` | Backend URL |
| `FRONTEND_URL` | Frontend origin used for password reset and signed EOA verification links |
| `NEXT_PUBLIC_ENABLE_DEMO_CONTENT` | Opt-in local fictional fallback content; ignored in production builds |
| `DB_*` | Database connection settings |
| `SANCTUM_STATEFUL_DOMAINS` | Frontend hosts, including local ports where applicable; no URL scheme |
| `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE` | Session cookie domain and HTTPS behavior appropriate to the deployment |
| `MAIL_*` | Mail transport and sender; the default `log` driver does **not** deliver email |
| `QUEUE_CONNECTION`, `CACHE_STORE` | Queue/cache drivers; both default to database-backed storage |
| `BROADCAST_CONNECTION`, `REVERB_*` | Optional backend websocket configuration |
| `NEXT_PUBLIC_REVERB_*` | Public websocket connection details; never the Reverb secret |

Changing `NEXT_PUBLIC_*` settings requires rebuilding the frontend. After backend configuration changes, clear/rebuild Laravel's configuration cache as described in [DEPLOYMENT.md](DEPLOYMENT.md).

## Develop and verify

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev:frontend` / `npm run dev:backend` | Start one service; `npm run dev` starts both on Bash |
| `npm run lint` / `npm run type-check` | Frontend static checks |
| `npm run test:frontend` / `npm run test:backend` | Targeted application suites |
| `npm run test` | Both suites |
| `npm run validate:entrepreneurs` | Retained development fixture validation |
| `npm run build` | Next.js and backend Vite production builds |
| `npm run verify` | Lint, types, tests, fixture validation and both builds |

## Verification and deployment

```bash
npm run verify
cd backend
php artisan wosool:check-readiness
# On the actual configured release, after required approvals:
php artisan wosool:check-readiness --production
```

CI runs frontend lint, types, tests, fixture validation, production dependency audit and build; backend tests, Composer/npm audit and Vite build. `/api/health` checks liveness; `/api/ready` checks database/schema and gateway preparation. Readiness is not proof of mail delivery, supervised workers, browser acceptance or legal compliance.

Follow [DEPLOYMENT.md](DEPLOYMENT.md) and [gateway operations](docs/ACCELERATOR_OPERATIONS.md) for backups, restore rehearsal, migration order, monitoring, rollbacks, privacy request handling and post-release checks. No deployment is automatic on GitHub push. The existing host/release mechanism, credentials and production database access must be supplied before hosted staging or production can be verified.

## Known limits
The Next.js server and Laravel API deploy separately; repository CI **does not deploy**. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for configuration, release order, verification and rollback. Preserve `APP_KEY`, back up the database, configure real mail delivery and never run the demonstration seeder in production. EOA notification queue workers are required and must be supervised. Reverb remains optional. Keep EOA collection/intake closed until the local data notice, program decisions, roles and sending service are approved/configured.

The new journey has bilingual content and responsive/keyboard-oriented markup; browser acceptance on mobile/RTL/LTR remains a release check. Some retained community/admin screens are still Arabic-first. Local SQLite tests do not replace migration testing against the deployed database engine. Real mail delivery, authoritative Riyadh dates/fees, chapter designation, approved partner use and the privacy controller/contact/retention/processor register remain external dependencies. No automatic legal-compliance claim is made.

- [EOA operations](docs/EOA.md) — setup, roles, workflows, approvals, privacy, deployment and release checklist
- [EOA research](docs/EOA-RESEARCH.md) — official requirements, factual corrections, organization sources and logos

- [API reference](docs/API.md) — routes and authentication
- [Architecture](ARCHITECTURE.md) — application boundaries
- [Testing](TESTING.md) — automated and manual checks
- [Deployment](DEPLOYMENT.md) — production release procedure
- [Security policy](SECURITY.md) — controls and private vulnerability reporting
- [Changelog](CHANGELOG.md) and [roadmap](ROADMAP.md) — releases and planned work

[API reference](docs/API.md) · [Architecture](ARCHITECTURE.md) · [Testing](TESTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md) · [Roadmap](ROADMAP.md)

Use a focused branch from `main`, include regression coverage for behavior changes, check both languages/directions, run relevant checks and document validation in the pull request.

Report ordinary bugs in [GitHub issues](https://github.com/king4arabs/wosool/issues); report security issues privately using [SECURITY.md](SECURITY.md). License: [MIT](LICENSE).
