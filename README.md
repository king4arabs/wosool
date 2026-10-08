# Wosool | وصول

[![CI](https://github.com/king4arabs/wosool/actions/workflows/ci.yml/badge.svg)](https://github.com/king4arabs/wosool/actions/workflows/ci.yml)

**A founder-to-founder network for Saudi Arabia and the GCC.** Wosool brings together founder profiles, membership, introductions, programs, events, and a private community.

[Website](https://wosool.org) · [API reference](docs/API.md) · [Deployment guide](DEPLOYMENT.md) · [Security policy](SECURITY.md)

## Get started

**Prerequisites:** Node.js 22.12+ (22.x) or 24.x with npm; PHP 8.3+ with Composer 2 and the required extensions (`mbstring`, `dom`, `curl`, `pdo_sqlite`). The local setup uses SQLite and requires no database server.

From the repository root:

```bash
git clone https://github.com/king4arabs/wosool.git
cd wosool
cp frontend/.env.example frontend/.env.local
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Check the API at [http://localhost:8000/api/health](http://localhost:8000/api/health). `npm run dev` starts both services on a Bash-compatible system; alternatively, use `npm run dev:frontend` and `npm run dev:backend` in separate terminals.

`npm run setup` installs locked dependencies, creates `backend/.env` if absent, generates a Laravel key only if missing, creates the SQLite file, and runs migrations. It refuses to prepare a production environment and **does not seed demo accounts**. The frontend example environment points to the local API; update `frontend/.env.local` if your API runs elsewhere.

To load **fictional local-only** demonstration data, run `php backend/artisan db:seed`. Never seed demonstration accounts in production. See [backend/database/seeders](backend/database/seeders) for fixture details.

### Other database engines

The supplied `backend/.env.example` selects SQLite. To use MySQL or PostgreSQL instead, copy it to `backend/.env` **before** running setup, create an empty local database, and set `DB_CONNECTION` and the matching `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` values. Install the corresponding PHP PDO driver (`pdo_mysql` or `pdo_pgsql`). Keep real credentials out of source control.

## What is included

| Surface | Capabilities |
| --- | --- |
| Public site | Founder and company discovery, programs, events, news, contact and membership applications |
| Member workspace | Profile and company management, event RSVPs, program applications, introductions, scorecards and community features |
| Admin | Application review, member and content management, event/program administration and moderation |
| Platform | Arabic/English interfaces, RTL/LTR support, responsive layouts, SEO metadata and optional realtime messaging |

**Readiness:** This is a pre-launch product, not a claim that the live host or every integration is configured. Some directories use fallback or fictional showcase content; some screens remain Arabic-first. Password recovery requires a real mail transport to deliver messages (`MAIL_MAILER=log` does not send email). Check content and translations before public use.

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
| `FRONTEND_URL` | Frontend origin used to construct password reset links |
| `DB_*` | Database connection settings |
| `SANCTUM_STATEFUL_DOMAINS` | Frontend hosts, including local ports where applicable; no URL scheme |
| `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE` | Session cookie domain and HTTPS behavior appropriate to the deployment |
| `MAIL_*` | Mail transport and sender; the default `log` driver does **not** deliver email |
| `QUEUE_CONNECTION`, `CACHE_STORE` | Queue/cache drivers; both default to database-backed storage |
| `BROADCAST_CONNECTION`, `REVERB_*` | Optional backend websocket configuration |
| `NEXT_PUBLIC_REVERB_*` | Public websocket connection details; never the Reverb secret |

Changing `NEXT_PUBLIC_*` settings requires rebuilding the frontend. After backend configuration changes, clear/rebuild Laravel's configuration cache as described in [DEPLOYMENT.md](DEPLOYMENT.md).

## Development commands

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run setup` | Install both applications and prepare the local database |
| `npm run dev` | Run the frontend and Laravel API together |
| `npm run dev:frontend` / `npm run dev:backend` | Start one application |
| `npm run lint` | Frontend ESLint checks |
| `npm run type-check` | TypeScript validation |
| `npm run test:frontend` | Redirect, session/CSRF, and event-date regression tests |
| `npm run test:backend` | Laravel feature and unit tests |
| `npm run test` | Both test suites |
| `npm run validate:entrepreneurs` | Validate the demonstration directory dataset |
| `npm run build` | Next.js production build and Laravel's Vite assets |
| `npm run verify` | Lint, types, both test suites, data validation, and both builds |

## Testing and CI

[CI](.github/workflows/ci.yml) runs on pushes to `main`, pull requests, and manual dispatch. It validates frontend lint/types/tests/data/build, audits production npm dependencies, and audits backend PHP/npm dependencies, runs backend tests, and builds backend assets. Backend tests use an isolated in-memory SQLite database from `backend/phpunit.xml`.

See [TESTING.md](TESTING.md) for coverage and manual acceptance checks. An automated build or unit test is not a substitute for Arabic/English, mobile, email-delivery, and authenticated staging checks.

The runtime is patched to Next.js 16.4.0. The existing ESLint 16.2.2 configuration and React Hooks 7.0.1 rules are retained so a runtime security update does not silently introduce a different lint policy across unrelated screens. Known development-only dependency advisories are recorded in [the review](docs/REVIEW_2026-10-08.md).

## Deployment

Follow [DEPLOYMENT.md](DEPLOYMENT.md). Deploy the Laravel API and Next.js server as separate applications. The API requires its database, protected environment, writable Laravel storage, mail configuration, and optional workers. The frontend requires a Node.js process and a correct API origin.

Deploy backend changes and migrations before exposing new frontend account-recovery routes. Do not run the demonstration seeder on production. Preserve `APP_KEY`, keep a database backup and prior release available, and verify real login, reset-link delivery, and health endpoints after rollout.

## Contributing and support

1. Start from current `main` and use a focused branch.
2. Read [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), and any applicable `AGENTS.md`.
3. Include regression tests for meaningful behavior changes, and keep Arabic/English and RTL/LTR behavior in mind.
4. Run the relevant checks, update documentation and the changelog, and open a pull request with the problem, solution, and validation results.

Report ordinary bugs through [GitHub issues](https://github.com/king4arabs/wosool/issues). Include reproducible steps without personal data or secrets. Report security issues privately following [SECURITY.md](SECURITY.md).

Licensed under the [MIT License](LICENSE).
