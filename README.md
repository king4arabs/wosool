# Wosool | وصول

[![CI](https://github.com/king4arabs/wosool/actions/workflows/ci.yml/badge.svg)](https://github.com/king4arabs/wosool/actions/workflows/ci.yml)

**Founders to Founders.** Wosool is the digital gateway for **EO Riyadh Accelerator**, alongside its Saudi/GCC founder network. The Accelerator journey lives at **https://wosool.org/EOA**: discovery, eligibility, verified accounts, private applications, committee review, onboarding and participant development.

**Saudi Founders. Global Connections. Extraordinary Growth.** Read the [EOA operating guide](docs/EOA.md) and [verified research register](docs/EOA-RESEARCH.md) before opening an intake.

[Website](https://wosool.org) · [API reference](docs/API.md) · [Deployment guide](DEPLOYMENT.md) · [Security policy](SECURITY.md)

## Get started

**Prerequisites:** Node.js 22.12+ (22.x) or 24.x with npm; PHP 8.3+ with Composer 2 and the required extensions (`mbstring`, `dom`, `curl`, `pdo_sqlite`). The local setup uses SQLite and requires no database server.

Clone the repository and start both services:

```bash
git clone https://github.com/king4arabs/wosool.git
cd wosool
cp frontend/.env.example frontend/.env.local
npm run setup
npm run dev
```

Install the closed/draft Accelerator and sourced organizations with `php backend/artisan eoa:install`. For email verification and notifications, run a queue worker from `backend/` with `php artisan queue:work --tries=5`; the default log mailer does not deliver email.

Open [http://localhost:3000](http://localhost:3000). Check the API at [http://localhost:8000/api/health](http://localhost:8000/api/health). `npm run dev` starts both services on a Bash-compatible system; alternatively, use `npm run dev:frontend` and `npm run dev:backend` in separate terminals.

`npm run setup` installs locked dependencies, creates `backend/.env` if absent, generates a Laravel key only if missing, creates the SQLite file, and runs migrations. It refuses to prepare a production environment and **does not seed demo accounts**. The frontend example environment points to the local API; update `frontend/.env.local` if your API runs elsewhere.

To load **fictional local-only** demonstration data, run `php backend/artisan db:seed`. Never seed demonstration accounts in production. See [backend/database/seeders](backend/database/seeders) for fixture details.

### Other database engines

The supplied `backend/.env.example` selects SQLite. To use MySQL or PostgreSQL instead, copy it to `backend/.env` **before** running setup, create an empty local database, and set `DB_CONNECTION` and the matching `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` values. Install the corresponding PHP PDO driver (`pdo_mysql` or `pdo_pgsql`). Keep real credentials out of source control.

## What is included

| Surface | Capabilities |
| --- | --- |
| EO Accelerator `/EOA` | Bilingual discovery, USD/SAR self-check, private versioned applications and evidence, assigned review, onboarding, cohorts, learning, goals, coach workspace and audited operations |
| Public site | Founder and company discovery, programs, events, news, contact and membership applications |
| Member workspace | Profile and company management, event RSVPs, program applications, introductions, scorecards and community features |
| Admin | Application review, member and content management, event/program administration and moderation |
| Platform | Arabic/English interfaces, RTL/LTR support, responsive layouts, SEO metadata and optional realtime messaging |

**Readiness:** This is a pre-launch product, not a claim that the live host or every integration is configured. Production seed fallbacks for founder/company/partner/sponsor/program/event/news lists are disabled. The separate entrepreneurs showcase is explicitly fictional; some legacy screens remain Arabic-first. EOA is bilingual, but browser and deployed-email checks are release requirements. Password recovery requires a real mail transport to deliver messages (`MAIL_MAILER=log` does not send email). Check content and translations before public use.

## How it works

The monorepo has a **Next.js App Router / React 19 / TypeScript** frontend and a **Laravel 13** API. Laravel handles validation, data persistence, Sanctum session authentication and role-based authorization. Browser requests go through the frontend's same-origin `/api` rewrite to the backend origin (`NEXT_PUBLIC_API_URL`); the versioned API is under `/api/v1`. Frontend navigation checks are not an authorization boundary.

| Location | Responsibility |
| --- | --- |
| `frontend/src/app/`, `frontend/src/components/` | Public, member and admin routes; shared UI |
| `frontend/src/lib/`, `frontend/src/data/` | API/session helpers, localization and editorial/demo data |
| `backend/app/`, `backend/routes/api.php` | Domain logic and API routes |
| `backend/database/`, `backend/tests/` | Migrations, seeders and Laravel tests |
| `scripts/`, `docs/` | Local tooling and detailed documentation |

Realtime uses Laravel Reverb/Echo when configured; it is not required for the public site. See [the API reference](docs/API.md) for endpoints and [architecture](ARCHITECTURE.md) for design context.

## Configuration

Never commit real `.env` files, passwords, API keys, reset tokens, or database exports. `NEXT_PUBLIC_*` values are browser-visible and must not contain secrets.

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
| `npm run setup` | Install both applications and prepare the local database |
| `npm run dev` | Run the frontend and Laravel API together |
| `npm run dev:frontend` / `npm run dev:backend` | Start one application |
| `npm run lint` | Frontend ESLint checks |
| `npm run type-check` | TypeScript validation |
| `npm run test:frontend` | Frontend regression tests |
| `npm run test:backend` | Laravel feature and unit tests |
| `npm run test` | Both test suites |
| `npm run validate:entrepreneurs` | Validate the demonstration directory dataset |
| `npm run build` | Next.js production build and Laravel's Vite assets |
| `npm run verify` | Lint, types, both test suites, data validation, and both builds |

[CI](.github/workflows/ci.yml) checks both apps on pushes to `main`, pull requests and manual runs, including dependency audits. Laravel tests use an in-memory SQLite database. See [TESTING.md](TESTING.md) for coverage and manual checks; passing CI does not establish browser quality, email delivery or production readiness.

## Deployment and operations

The Next.js server and Laravel API deploy separately; repository CI **does not deploy**. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for configuration, release order, verification and rollback. Preserve `APP_KEY`, back up the database, configure real mail delivery and never run the demonstration seeder in production. EOA notification queue workers are required and must be supervised. Reverb remains optional. Keep EOA collection/intake closed until the local data notice, program decisions, roles and sending service are approved/configured.

## Documentation

- [EOA operations](docs/EOA.md) — setup, roles, workflows, approvals, privacy, deployment and release checklist
- [EOA research](docs/EOA-RESEARCH.md) — official requirements, factual corrections, organization sources and logos

- [API reference](docs/API.md) — routes and authentication
- [Architecture](ARCHITECTURE.md) — application boundaries
- [Testing](TESTING.md) — automated and manual checks
- [Deployment](DEPLOYMENT.md) — production release procedure
- [Security policy](SECURITY.md) — controls and private vulnerability reporting
- [Changelog](CHANGELOG.md) and [roadmap](ROADMAP.md) — releases and planned work

## Contributing and support

Use a focused branch from `main`. Include regression tests for behavior changes; check Arabic/English and RTL/LTR behavior, run relevant checks and describe validation in your pull request. Report bugs via [GitHub issues](https://github.com/king4arabs/wosool/issues) without personal data or secrets; report vulnerabilities privately via the [security policy](SECURITY.md).

Licensed under the [MIT License](LICENSE).
