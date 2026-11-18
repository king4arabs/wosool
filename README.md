<p align="center">
  <img src="frontend/public/wosool-logo-eo.svg" alt="Wosool | وصول" width="420" />
</p>

**Backend build security update (18 November 2026):** required CI now verifies a repository-contained `picomatch` mitigation before retaining the unsuppressed high-severity npm audit. The package is derived from upstream 4.0.7, applies the narrowly scoped fix proposed in `micromatch/picomatch#238`, and is used across Vite, `tinyglobby`, `fdir` and Laravel's reload plugin until an official patched release is available. Local regression, audit and Vite build checks pass; this source change does not deploy either service or import production data. See [mitigation provenance and retirement criteria](docs/security/PICOMATCH-2026-11-18.md).

**Frontend security and admin review update (18 November 2026):** Next.js is patched from 16.4.2 to 16.4.6 in the npm and pnpm locks, clearing the two current cache-isolation advisories while preserving the accepted Hostinger webpack, hoisted-dependency and one-worker baseline. `/admin/opportunities` now keeps newly typed source lines, validates bilingual evidence fields before saving, maps API errors to fields and provides accessible loading, error, focus and empty states. Source merge and CI are separate from a Hostinger rebuild, production activation and database changes.

**Editorial update (17 November 2026):** The editorial source catalogs now contain **411 external/unclaimed founders, 222 company identities and 142 bilingual source-dated briefs**. Added Paul Farhi (Vision Makers, UAE) and Ibrahim Anwar and Mohammed Darwish (Sabika, Egypt), plus two original 16 November 2026 news briefs. No license to reuse their logos was verified, so names remain legible as fallback. Source catalogs are not proof of production imports or Hostinger deployment. See [17 November source evidence](docs/research/CONTENT-REFRESH-2026-11-17.md).

**Editorial update (16 November 2026):** **408 external/unclaimed founders, 220 companies and 140 bilingual source-linked news briefs**. Added Fahad Alarifee (Rkiza) and the 13 November issuer-dated Alwaleed Philanthropies–RDIA Open RAN partnership. Its SAR 10m is overall partnership value, not individual startup financing. Unverified logos use the name fallback. Source commits are not production database imports or live Hostinger releases.

<h1 align="center">Wosool | وصول</h1>
<p align="center"><strong>Founders to Founders</strong></p>
<p align="center">
  <a href="https://wosool.org">Website</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="https://github.com/king4arabs/wosool/actions/workflows/ci.yml">CI</a>
</p>

**Documentation version: 0.6.10 · Updated: 18 November 2026.**

Wosool is an Arabic/English founders platform connecting Saudi Arabia, the GCC, MENA and the world. It brings founder and company profiles, events, news, introductions and community services together, with a dedicated EO Riyadh Accelerator experience.

Community membership, Accelerator admission and administrator access are separate permissions. Registration requires email verification; community membership requires review and approval.

**Administration:** `/admin/services` provides bilingual search, work-area filters and daily shortcuts across management tools. The mobile menu shares the desktop service directory; CRM/PR queues preserve filters and record links in the URL, and Accelerator sections support direct links. EOA administration groups services by task and preserves API capability checks. See [administration](docs/ADMIN-OPERATIONS.md) for navigation and CRM workflows. Public partner cards include local logo artwork and service search.

**Company administration (16 November 2026):** `/admin/companies` now keeps stored English company text separate from Arabic directory translations, regardless of the administrator's current locale. The labelled bilingual editor validates before saving, maps API validation failures to fields, searches Arabic and English company data on submit, and identifies whether each company is publicly listed. Required PR CI run 716 passed Laravel on PHP 8.3–8.5, frontend/browser checks, pnpm installation and production guardrails before merge `f584e44`. The merge and preview builds are not evidence of a production deployment or database update.

**Event and company administration (17 November 2026):** `/admin/events` now follows the administrator's Arabic or English locale, labels and validates every editor field, keeps event wall-clock times in the event's own time zone, maps API validation errors to their fields and runs search only when submitted. The admin companies API now loads the linked founder account fields required to report email-verification state, preventing the strict-mode 500 and the non-strict false-unverified result. Required PR CI run 724 passed the complete matrix before merge `ad09a39`. No migration, catalog import, production deployment or hosting setting changed.

**Member identity:** `/admin/users` combines registered accounts and invited founder records with private origin indicators, identity matching, administrator verification and bulk invitation controls. Email verification triggers private matching; administrator approval links the canonical founder profile or publishes a new one. Existing founder IDs, source links and scorecards are preserved. Apply the additive identity-review migration before rollout. See [registration and identity review](docs/MEMBER-IDENTITY-REVIEW.md).

**Admin scorecards (13 November 2026):** `/admin/scorecards` now follows Arabic/English direction, validates integer score overrides before sending, requires an audit reason, shows all five current measures and explains invitation/verification failures without exposing raw API text. Only entered scores are submitted; verified accounts remain visible, inactive or pending profiles cannot trigger email, and a founder cannot be switched while a request is in flight. Source merge and CI do not establish deployment or a production data change.

**Backend security update (14 November 2026):** the locked Laravel framework is updated from 13.35.0 to 13.42.0, beyond the 13.40.0 patched boundary for GHSA-63hm-g96r-2m2q. Required PR CI run 683 and post-merge run 684 passed the complete matrix, restoring the Composer-audit gate without changing application code, frontend dependencies or the accepted Hostinger packaging baseline. Source merge and CI do not establish that the production Laravel service has received the patch; backend deployment and serving-revision verification remain separate release steps.

**Newsroom search update (14 November 2026):** `/news` now sends its shareable Arabic/English query to the public API before pagination, so results cover the full database rather than only pages already loaded in the browser. OpenAPI 1.8.0 documents the 120-character, all-term text search plus exact company/tag matching. The page retains withdrawal-safe outage snapshots and one API-backed load-more path. Source checks do not establish deployment; the live OpenAPI route and serving frontend/backend revisions remain unverified.

**EOA program update:** the two-year curriculum, annual US$4,000 package with US$2,000 sponsor contribution, learning calendar, dedicated board and protected readiness controls are described in [the release notes](docs/EOA-GLOBAL-ALIGNMENT-2026-11-10.md).

**EOA leadership:** [`/eoa/leadership#program-lead`](https://wosool.org/eoa/leadership#program-lead) presents Mohammed Alsolami (Program Lead), Fouad Alnazawi (Program Operation Partner) and Bashaier Abdullah (EOA Riyadh PMO Leader) in three equal-sized bilingual cards. See [EOA operations](docs/EOA.md#public-program-leadership) for profile sources and maintenance details.

**Editorial update (15 November 2026):** **408 external/unclaimed founder profiles, 220 company identities and 140 original Arabic/English sourced news briefs**. Nine additional Saudi-business founder profiles cover Q Mart's Mohammed Omar, Retailo's three Pakistani co-founders, WideBot's three Egyptian co-founders and TruKKer's two Indian co-founders. Their bilingual biographies distinguish founder origin from the business location; original company logos are served locally, with dark panels for pale wordmarks. See [identities, sources and logo provenance](docs/research/SAUDI-INTERNATIONAL-FOUNDERS-2026-11-15.md). The earlier Lambda Studios founder additions and financing brief are documented in [the daily source review](docs/research/CONTENT-REFRESH-2026-11-15.md). Repository changes are not production database imports or a verified Hostinger deployment.

**Founder freshness review (15 November 2026):** current first-party, government and investor sources re-verify Abdullah Asiri (Lucidya), Hisham Al-Falih (Lean Technologies) and Ahmed Alenazi (Barq). Barq's role is corrected to founder and CEO with a 2023 founding year; Lucidya's company-reported reach is updated to 75M-plus customers across 13 countries through its clients. Funding, processed volume and customer reach remain explicitly separate from earned revenue. `content:check` reports zero integrity problems and 126 profiles still due for current-source review. See [review evidence and boundaries](docs/research/FOUNDER-REVIEW-2026-11-15.md).

**Editorial update (14 November 2026):** **396 external/unclaimed founder profiles, 214 companies and 138 bilingual source-dated news briefs** across nine mirrored catalog pairs (eight founders, one news). Added four Safqah Capital co-founders and Signit's co-founder/CEO; enriched three existing Ejari founder cards without duplication. Two new Saudi financing briefs cover Ejari's rental warehouse facility (10 November) and COGNNA's undisclosed Wa'ed Ventures backing (9 November), distinguishing financing capacity from equity and revenue. See [dated official sources and editorial safeguards](docs/research/CONTENT-REFRESH-2026-11-14.md). Source and tests are not a production database import or verified Hostinger release.

**Editorial update (13 November 2026):** **391 external/unclaimed founder profiles, 212 company keys and 136 original bilingual sourced news briefs** across eight mirrored catalog pairs. Saudi Solidrange's Jamal M. Labani now has an identity-matched professional URL, and the **11 November** SVC/Jadwa release distinguishes an undisclosed investor contribution from total credit-fund commitments. New GCC profiles cover Multipolitan and 44.01. See [dated sources](docs/research/CONTENT-REFRESH-2026-11-13.md). Neither repository commits nor mergers establish production database imports or verified live publication.

**Editorial update (12 November 2026):** **385 external/unclaimed founder profiles, 209 company identities and 132 original bilingual news briefs** across seven mirrored catalog pairs. Source-verified new founders: Saudi OmniOps' Mohammed Altassan and UAE Wafr's Mahmoud Bouchelif and Anthony Murphy. New product/funding briefs retain **11 November** and **10 November 2026** announcement dates. See [evidence and release boundary](docs/research/CONTENT-REFRESH-2026-11-12.md). No membership state, production database import or verified Hostinger deployment is implied.

**Company logos:** Reviewed local artwork covers **201 of 222 companies** and **373 founder cards**. Pale transparent logos use dark panels, including locally served uploads detected after image load. The remaining 21 companies keep name/website-icon fallbacks. See the [logo audit](docs/COMPANY-LOGO-AUDIT-2026-11-12.json) and [presentation rules](docs/research/COMPANY-LOGOS-2026-11-12.md).

**Editorial update (11 November 2026):** **375 external/unclaimed founder profiles, 203 company identities and 130 original bilingual news briefs** across six mirrored frontend/backend catalogs. New Saudi Raff, UAE AIREV and US Mercor co-founder profiles are source-verified. Raff's 25 August pre-seed, Persona's 5 November pre-seed, AIREV's 4 November strategic funding and Mercor's 10 November Series D retain the original announcement dates. Financing/valuation are not revenue; company-reported activity is labeled. See [11 November sources](docs/research/CONTENT-REFRESH-2026-11-11.md). No membership changes, production import or Hostinger deployment is implied.

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
