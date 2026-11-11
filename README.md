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

**Documentation version: 0.6.2 · Updated: 11 November 2026.**

Wosool is an Arabic/English founders platform connecting Saudi Arabia, the GCC, MENA and the world. It brings founder and company profiles, events, news, introductions and community services together, with a dedicated EO Riyadh Accelerator experience.

Community membership, Accelerator admission and administrator access are separate permissions. Registration requires email verification; community membership requires review and approval.

**Administration:** `/admin/services` provides bilingual search, work-area filters and daily shortcuts across management tools. The mobile menu shares the desktop service directory; CRM/PR queues preserve filters and record links in the URL, and Accelerator sections support direct links. EOA administration groups services by task and preserves API capability checks. See [administration](docs/ADMIN-OPERATIONS.md) for navigation and CRM workflows. Public partner cards include local logo artwork and service search.

**EOA program update:** the two-year curriculum, annual US$4,000 package with US$2,000 sponsor contribution, learning calendar, dedicated board and protected readiness controls are described in [the release notes](docs/EOA-GLOBAL-ALIGNMENT-2026-11-10.md).

**EOA leadership:** [`/eoa/leadership#program-lead`](https://wosool.org/eoa/leadership#program-lead) presents Mohammed Alsolami (Program Lead), Fouad Alnazawi (Program Operation Partner) and Bashaier Abdullah (EOA Riyadh PMO Leader) in three equal-sized bilingual cards. See [EOA operations](docs/EOA.md#public-program-leadership) for profile sources and maintenance details.

**Founder integrity checkpoint (30 October 2026):** founder profiles use immutable public identities and one private scorecard per profile. Approving a community application cannot reactivate a suspended founder profile; an administrator must resolve that moderation state separately before approval. These source safeguards require the matching Laravel release and production verification before they can be treated as live behavior.

**Founder cards (11 November 2026):** the catalog now contains **370 external/unclaimed founders across 201 companies**, with **128 original bilingual sourced briefs**. The latest reviewed additions cover Persona and AIREV; company-reported activity and investment are not presented as earned revenue or membership. Compact responsive cards retain full biographies and source links in expandable details. The carousel and grid share a fresh visit order; searching, pagination and language changes preserve that order. `content:check` reports zero integrity problems, while `content:review` identifies 15 profiles due for a new source review. See [11 November sources and release boundaries](docs/research/CONTENT-REFRESH-2026-11-11.md).

**Editorial checkpoint (10 November 2026):** **356 external/unclaimed founder profiles**, **193 companies** and **126 original bilingual sourced briefs** in mirrored frontend/backend catalogs. Added Egypt's Turuq co-founders Ahmed Atta and Karim Kamal and a 27 October 2026 article on Den VC's **undisclosed** seed investment. Refreshed Saudi Vrtx's two existing profiles using its official 19 October statement confirming pre-seed financing and SAMA **in-principle** (not final) regulatory approval; corroborated the existing INVE founder profile with a first-person interview. No membership/invitation, private data or Hostinger changes. See [10 November sources](docs/research/CONTENT-REFRESH-2026-11-10.md). CI, database import and live publication are separate gates.

**Founder freshness checkpoint (10 November 2026):** re-verified the 12 profiles that reached their 30-day deadline across Unifonic, Foodics, Salla, Tamara and Kitopi. Corrected Saman Darkan's current Kitopi title to **Co-founder & Chief Product and Technology Officer** in both languages; no other public claim required correction. The catalogs remain at **356 founders / 193 companies / 126 briefs**, with zero reviews due after verification. See [review evidence and boundaries](docs/research/FOUNDER-REVIEW-2026-11-10.md).

**Editorial checkpoint (8 November 2026):** **348 editorial/unclaimed founder profiles**, **190 company groups** and **123 unique bilingual sourced briefs** in byte-mirrored frontend/Laravel catalogs. Added Saudi founders Ibrahim Manna (BRKZ) and Adam Bataineh (Madeed), with two dated bilingual briefs. BRKZ's **14 September 2026** funding announcement, distinguishing US$13m equity from an US$18m growth-debt commitment within an existing US$30m facility, with source-linked platform figures rather than invented income. Madeed's 5 May 2026 report documents US$925k cumulative pre-seed funding including an earlier US$400k tranche, not a new US$925k round or revenue. No new identity claims, memberships, invitations, sourced image reuse or hosting changes. See [8 November evidence](docs/research/CONTENT-REFRESH-2026-11-08.md). Production database import and independently verified Hostinger publication remain unconfirmed.

**Editorial checkpoint (7 November 2026):** **346 editorial/unclaimed founder profiles**, **188 company groups** and **121 unique bilingual sourced briefs** in byte-synchronized frontend/backend JSON catalogs. Source-verified 6 November additions cover HUMAIN/CNTXT, Mamun, Journify and Kalepa; the 7 November refresh repairs conflicting merge artifacts, removes three duplicated canonical news records and adds a dated Saudi venture-capital market brief and a verified Bahrain SITR launch and founder profile. Editorial profiles are not activated memberships. No accounts, invitations, private records or production database imports are created by these source updates. See [6 November evidence](docs/research/CONTENT-REFRESH-2026-11-06.md) and [7 November evidence](docs/research/CONTENT-REFRESH-2026-11-07.md). CI, authorized backend import, active Hostinger SHA and live publication remain separate checks; the a7be830 deployment baseline is unchanged.

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

The established Hostinger frontend configuration is **`frontend` root · Node 22 · pnpm 11.24.0 · `pnpm run build` · `.next` output**. Preserve the webpack build wrapper, one-worker limits and traced runtime dependencies. Deploy Laravel separately at `api.wosool.org`. Set `WOSOOL_BUILD_REVISION` for the frontend and `APP_REVISION` for Laravel to the full commit deployed by each service; health responses expose only a validated Git-shaped value (or `null`).

**A successful build or merge is not a deployment.** Verify both release revisions, critical routes, real email delivery and authenticated account flows before declaring production ready. General health checks alone do not establish registration or OTP availability.

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
