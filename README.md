<p align="center">
  <img src="frontend/public/wosool-logo-eo.svg" alt="Wosool | وصول" width="420" />
</p>

<h1 align="center">Wosool | وصول</h1>
<p align="center"><strong>Founders to Founders</strong></p>
<p align="center">
  <a href="https://wosool.org">Website</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="https://github.com/king4arabs/wosool/actions/workflows/ci.yml">CI</a>
</p>

Wosool is an Arabic/English founders platform connecting Saudi Arabia, the GCC, MENA and the world. It brings founder and company profiles, events, news, introductions and community services together, with a dedicated EO Riyadh Accelerator experience.

Community membership, Accelerator admission and administrator access are separate permissions. Registration requires email verification; community membership requires review and approval.

## Architecture

| Layer | Technology and responsibility |
| --- | --- |
| Website | Next.js, React, TypeScript and Tailwind CSS; Arabic/English, RTL/LTR and responsive interfaces |
| API | Laravel, Sanctum cookie sessions and Spatie roles; validation, authorization and application workflows |
| Database | SQLite for local development and tests; production uses its configured database |
| Hosting | Separate Next.js frontend and Laravel API; browser requests use the same-origin `/api` proxy |

| Directory | Contents |
| --- | --- |
| [`frontend/`](frontend/) | Public website, member workspace, admin interface and frontend tests |
| [`backend/`](backend/) | API, domain services, migrations, authorization and backend tests |
| [`scripts/`](scripts/) | Setup, development, content validation and production checks |
| [`docs/`](docs/) | Product guides, operating procedures and source evidence |

See [ARCHITECTURE.md](ARCHITECTURE.md) for system details. Dependency manifests and lockfiles define the installed versions.

## Quick start

### Requirements

- Node.js **22.12+ on 22.x, or 24.x**, with npm.
- PHP **8.3.36+, 8.4.27+, or 8.5.12+** on a branch allowed by [`backend/composer.json`](backend/composer.json), plus Composer 2 and its required PHP extensions.
- Git and a Bash-compatible shell. The default local database requires SQLite support.

### Install and run

```bash
git clone https://github.com/king4arabs/wosool.git
cd wosool
npm run setup

test -f frontend/.env.local || cp frontend/.env.example frontend/.env.local
npm run dev
```

Open **http://localhost:3000**. The backend runs at **http://localhost:8000**.

Setup installs dependencies, prepares the local backend environment and SQLite database, runs migrations and installs the Accelerator configuration. It preserves existing keys/configuration and does not seed privileged accounts. Use a development database; configure `backend/.env` before setup if using another engine. A fresh legacy PostgreSQL schema may require `pgvector`.

For queued jobs, run a separate worker:

```bash
php backend/artisan queue:work --tries=5 --timeout=60
```

**Email:** the default log mailer does not deliver messages. Configure a controlled SMTP inbox for registration and recovery testing. Registration OTP delivery is synchronous and rejects log/array mailers. See [registration QA](docs/REGISTRATION-QA.md) for the complete verification flow.

## Configuration

| File | Purpose |
| --- | --- |
| [`frontend/.env.example`](frontend/.env.example) | Local frontend defaults; copy to `.env.local` |
| [`frontend/.env.production.example`](frontend/.env.production.example) | Public build-time production values |
| [`backend/.env.example`](backend/.env.example) | Database, sessions, mail, queue and backend configuration |

`NEXT_PUBLIC_API_URL` is the backend origin **without `/api`**. All `NEXT_PUBLIC_*` values are public; never put secrets in them. Keep backend credentials outside source control and preserve the production `APP_KEY`. See [deployment configuration](DEPLOYMENT.md) for session domains, HTTPS and mail settings.

## Development and testing

Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run frontend and backend |
| `npm run lint` | Check frontend code quality |
| `npm run type-check` | Validate TypeScript |
| `npm test` | Run frontend and backend tests |
| `npm run content:check` | Validate source catalogs and snapshot consistency |
| `npm run verify` | Run the complete verification pipeline, including builds |
| `npm run smoke:production` | Check live website/API health and critical route availability |

Before `npm run verify`, configure the frontend release values described in [TESTING.md](TESTING.md). For a local preview build, use `npm --prefix frontend run build:local` with the local example environment. CI additionally checks browser flows, accessibility, dependency security and the standalone hosting build.

## Deployment

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for release order, backups, migrations, mail, monitoring and rollback.

The established Hostinger frontend configuration is **`frontend` root · Node 22 · pnpm 11.24.0 · `pnpm run build` · `.next` output**. Preserve the webpack build wrapper, one-worker limits and traced runtime dependencies. Deploy Laravel separately at `api.wosool.org`.

**A successful build or merge is not a deployment.** Verify both releases, critical routes, real email delivery and authenticated account flows before declaring production ready. General health checks alone do not establish registration or OTP availability.

## Documentation

| Guide | Use it for |
| --- | --- |
| [Architecture](ARCHITECTURE.md) · [API](docs/API.md) | System structure and interfaces |
| [Registration QA](docs/REGISTRATION-QA.md) | Signup, OTP, account recovery and verified admin provisioning |
| [Founder activation](docs/FOUNDER-ACTIVATION.md) | Invitations and profile activation |
| [EOA operations](docs/EOA.md) | Accelerator applications, roles and program operations |
| [Administration](docs/ADMIN-OPERATIONS.md) | CRM, PR, analytics and community approval workflows |
| [Startup directory](docs/STARTUP-DIRECTORY.md) · [Research](docs/research/) | Source review, imports and publication evidence |
| [Testing](TESTING.md) · [Deployment](DEPLOYMENT.md) | Validation, releases and operational checks |
| [SEO operations](docs/SEO-OPERATIONS.md) | Search verification, sitemaps and social previews |
| [Changelog](CHANGELOG.md) · [Roadmap](ROADMAP.md) | Release history and planned work |

## Contributing and security

Start from current `main`, read [AGENTS.md](AGENTS.md), and keep changes focused. Preserve authorization boundaries, existing records and Arabic/English behavior. Add relevant regression coverage, run the appropriate checks, and update the affected documentation. Shared visual tokens are in [`brand.css`](frontend/src/app/brand.css).

Report vulnerabilities privately using [SECURITY.md](SECURITY.md). Do not publish credentials, OTPs, applicant documents or private contact data in code, logs or issues. Source records and third-party logos do not by themselves establish membership, partnership or endorsement.

## License

[MIT](LICENSE) for repository software. Third-party artwork and trademarks retain their owners’ rights.
