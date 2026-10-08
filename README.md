# Wosool | وصول

**A founder-to-founder network for Saudi Arabia and the GCC.** Wosool connects founders through membership, company profiles, introductions, programs, events, and a private community.

[Website](https://wosool.org) · [API guide](docs/API.md) · [Deployment](DEPLOYMENT.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md)

[![CI](https://github.com/king4arabs/wosool/actions/workflows/ci.yml/badge.svg)](https://github.com/king4arabs/wosool/actions/workflows/ci.yml)

## Contents

- [Architecture](#architecture)
- [Features and readiness](#features-and-readiness)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Development commands](#development-commands)
- [Testing and CI](#testing-and-ci)
- [Deployment](#deployment)
- [Contributing and support](#contributing-and-support)

## Architecture

This is a two-application monorepo. The Next.js frontend serves the public website, member workspace, and admin portal. Laravel owns authentication, authorization, validation, and persistent data.

| Component | Implementation |
| --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Radix UI |
| Backend | Laravel 13, Sanctum session authentication, Spatie roles and permissions |
| Database | MySQL by default; SQLite for automated tests and optional local development |
| Realtime | Optional Laravel Reverb, Laravel Echo, and Pusher protocol |
| Languages | Arabic and English, RTL/LTR, Cairo for Arabic and Manrope for English |
| Delivery | Independent frontend and backend builds; repository-root GitHub Actions CI |

Browser API requests use the frontend's `/api` path. Next.js proxies them to `NEXT_PUBLIC_API_URL`; the versioned Laravel API lives at `/api/v1`. Session writes send the decoded `XSRF-TOKEN` cookie as `X-XSRF-TOKEN`. Laravel remains the access-control boundary; frontend route redirects are only a navigation aid.

```text
frontend/src/app/         Public, member, and admin routes; SEO metadata
frontend/src/components/ Shared layout, forms, cards, and UI primitives
frontend/src/lib/         API clients, session handling, localization, utilities
frontend/src/data/        Editorial and demonstration data
backend/app/             Controllers, models, services, resources, validation
backend/routes/api.php   Public, authenticated-member, and admin endpoints
backend/database/        Migrations, factories, and development seeders
backend/tests/           Feature and unit tests
.github/workflows/ci.yml  Frontend and backend quality checks
scripts/                 Local bootstrap and operational tools
docs/                    API reference and operational documentation
```

## Features and readiness

| Area | Implemented behavior / limitation |
| --- | --- |
| Membership | Application form, review workflow, approved-member registration, login/logout |
| Account recovery | Rate-limited reset requests, expiring single-use tokens, password validation; real email delivery requires a configured mail provider |
| Member workspace | Founder/company editing, introductions, scorecards, society, messages, event RSVPs, and program applications |
| Administration | Members, applications, companies, events, programs, content, and moderation screens |
| Public homepage | API-backed founders, companies, confirmed partners, news, and upcoming events; missing data does not become a fabricated testimonial or membership count |
| Events | Upcoming/past filters, Riyadh time display, empty/error states, and server-side rejection of RSVPs for ended events |
| Accessibility / SEO | Keyboard-visible focus, mobile menu controls, reduced-motion support, page metadata, canonical URLs, robots, and public sitemap |
| Content readiness | Some secondary directories still use seeded fallback content; the entrepreneurs directory deliberately contains fictional showcase profiles. Review and replace sample content before treating it as published membership or partner evidence |
| Localization | Shared navigation, recovery, and many public/member views are bilingual. Some application, contact, admin, and detail screens remain Arabic-first |

This repository contains implementation, not proof that every integration is configured on the live host. CI does not deploy the website.

## Requirements

- Node.js **22.12+ on the 22.x line**, or Node.js **24.x**, and npm.
- PHP **8.3+** and Composer 2; the lockfile is tested with PHP 8.3.
- PHP extensions required by Composer, including `mbstring`, `dom`, `curl`, and the database driver (`pdo_mysql` or `pdo_sqlite`).
- MySQL with an empty development database, or SQLite for an isolated local setup.

Use the committed lockfiles. Do not use `--ignore-platform-reqs` or force dependency downgrades to make installation pass.

## Quick start

```bash
git clone https://github.com/king4arabs/wosool.git
cd wosool
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env` with your local database credentials. The default is MySQL:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wosool
DB_USERNAME=your_local_user
DB_PASSWORD=your_local_password
```

Create the database using an account that has permission to do so:

```sql
CREATE DATABASE wosool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

For SQLite instead, set `DB_CONNECTION=sqlite` and set `DB_DATABASE` to an **absolute path** ending in `backend/database/database.sqlite`. The setup script creates the file if it does not exist.

Then install dependencies and apply local migrations:

```bash
npm run setup
```

Setup copies the backend environment template only if needed and generates an application key **only when one is missing**. It preserves existing keys and rejects production environments. It does not seed accounts automatically.

Start the frontend and API in separate terminals:

```bash
npm run dev:frontend
```

```bash
npm run dev:backend
```

Visit `http://localhost:3000`. The API health endpoint is `http://localhost:8000/api/health`. `npm run dev` starts both processes together on a Bash-compatible system.

### Optional local sample data

```bash
cd backend
php artisan db:seed
```

`WosoolSeeder` contains demonstration accounts and content, and refuses to run in production. Fixture credentials are defined in that seeder for local development. Use separate real users and credentials in production. `RoleAndPermissionSeeder` can be run independently to provision the role definitions.

### Optional workers and realtime

When configured, run these as separate local processes:

```bash
cd backend
php artisan queue:work
php artisan reverb:start
```

`RUN_REVERB=1 npm run dev` opts into automatic Reverb startup. Configure the server and public websocket variables first; realtime is not needed to render the public website.

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
