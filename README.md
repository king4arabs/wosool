# Wosool | وصول

[![CI](https://github.com/king4arabs/wosool/actions/workflows/ci.yml/badge.svg)](https://github.com/king4arabs/wosool/actions/workflows/ci.yml)

Wosool is the digital gateway for **EO Riyadh Accelerator**, alongside its existing Saudi/GCC founder community.

**Saudi Founders. Global Connections. Extraordinary Growth.**

The canonical program journey is **https://wosool.org/EOA**. Discovery, eligibility, accounts, applications, review, participant services and coaching remain under uppercase `/EOA`. The older `/accelerator` pages redirect there. Applications and local acceptance do not guarantee official Accelerator enrollment or EO membership.

EO Riyadh provides chapter leadership and governance; EO Accelerator provides the program framework; Wosool provides the local digital gateway; operating partners deliver only their approved scope. Program leadership: Mohammed Alsolami, EO Riyadh Membership & Accelerator Chair.

## Architecture

| Component | Implementation |
| --- | --- |
| Frontend | Next.js 16.4, React 19, TypeScript, Tailwind 4, Cairo, Arabic/English RTL/LTR |
| Backend | Laravel 13, PHP 8.3+, Sanctum cookie sessions, Spatie roles |
| Database | SQLite local/tests; preserve and verify the actual production engine |
| EOA routes | `frontend/src/app/EOA`, `frontend/src/components/eoa`, `backend/routes/eoa.php` |
| EOA domain | `backend/app/Services/Eoa`, `backend/app/Http/Controllers/Api/Eoa` |
| Ecosystem directory | `/opportunities`, `ecosystem_records`, source ledger in `docs/research` |
| Deployment | Separate Node and PHP applications; GitHub CI validates, **does not deploy** |

Browser API requests use the same-origin `/api/v1` proxy. Sessions use CSRF protection. Financial applications are encrypted, versioned server-side drafts; supporting documents are private and authorized on download. Do not expose the backend storage directory or rotate away the encryption key without a recovery plan.

The October 9 integration repair resolves the conflicting merge of two Accelerator implementations. The older gateway's application/review/operations writes return **410** with the canonical path; its owned, private records remain readable. It cannot grant enrollment or overwrite EOA approvals. Existing legacy records require staff-reviewed transfer; no silent data conversion or deletion occurs. Ecosystem imports, editorial administration and privacy-request operations remain supported. See [integration release notes](docs/EOA-INTEGRATION-2026-10-09.md).

## Local setup

Requirements: Node 22.12+ on 22.x or 24.x, PHP 8.3+, Composer 2, and the extensions required by the committed Composer lockfile.

```bash
git clone https://github.com/king4arabs/wosool.git
cd wosool
npm run setup
npm run dev
```

Setup installs both lockfiles, prepares a missing local environment/key, migrates and runs `eoa:install`. It preserves existing configuration and refuses production setup. It creates no applicant or administrator accounts. For SQLite, configure an absolute `DB_DATABASE` path if needed.

Run a worker separately:

```bash
cd backend
php artisan queue:work --tries=5 --timeout=60
```

Local URLs: frontend http://localhost:3000 and API http://localhost:8000/api/health. The default log mailer **does not deliver email**. Use a controlled mail sink for tests, not real applicant addresses.

`eoa:install` inserts missing roles, a closed/draft program and sourced EOA organization records, without replacing existing settings or confirmations. Optional wider ecosystem import:

```bash
cd backend
php artisan wosool:import-ecosystem
php artisan wosool:import-ecosystem --apply
```

The first command previews the changes. Production imports require verified staging and backups. The compatibility `wosool:prepare-gateway --apply` command now uses the same closed EOA installer and preserves legacy partner records. Never use the full fictional demo seeder in production.

## Configuration

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

## Contributing

Use a focused branch from main, preserve unrelated work, add regression coverage, check Arabic/English, and document verification in the PR.

[API](docs/API.md) · [Architecture](ARCHITECTURE.md) · [Testing](TESTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md)
