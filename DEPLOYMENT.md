# Deployment

Wosool has two deployable applications: `frontend/` is a Next.js Node.js server; `backend/` is a Laravel API with a database. Repository CI validates code and does not perform production deployment. Existing host names and process-manager services must be confirmed in the hosting account before a release.

## Production deployment contract (October 22, 2026)

Keep the **single GitHub monorepo** but deploy two independent services. The Next.js website runs at `https://wosool.org` with Hostinger Web App root `frontend/`, Node 22, pnpm, `pnpm run build`, output `.next`, and a managed server process. The Laravel API runs separately at `https://api.wosool.org`, serving `backend/public/`. Its database, private storage, queue workers and scheduler must not be coupled to the frontend build. Do not move the application files out of `frontend/`; that directory is the **source root**, not part of the public URL.

**Release environment gate:** from `frontend/`, run `pnpm run preflight:production` with the actual Hostinger build environment. It rejects non-HTTPS/missing site/API origins and demo mode not explicitly disabled. Set `NEXT_PUBLIC_SITE_URL=https://wosool.org`, `NEXT_PUBLIC_API_URL=https://api.wosool.org`, and `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false` as build environment variables. Hostinger may inject variables without a physical `.env` file. Do not print private values. Rebuild after changing public environment variables. The existing `pnpm run build` stays unchanged until Hostinger is configured to run the separate preflight gate; CI tests the gate with safe example values.

**Safe release order:** backup the live database and record both deployed source SHAs; validate staging with its own restricted domain and separate database; deploy compatible Laravel code and additive migrations; verify direct API readiness, authorization, queues and real SMTP; deploy the matching Next.js revision; verify the website and the same-origin proxy; record the result. Preserve `APP_KEY`, private media, uploads, and data. No automatic destructive migrations or demonstration seeders. Revert to the previous host artifact if verification fails, and never blindly restore a pre-release database over live user writes.

**Post-release smoke check:** run `node scripts/production-smoke.mjs` from the repository root. This requests the homepage, `/eoa`, frontend `/health`, Laravel `/api/health` and `/api/ready`, and the frontend proxy `/api/health`. The hourly [production health workflow](.github/workflows/production-health.yml) and manual GitHub Actions run detect regressions; configure failed-workflow notifications plus independent uptime/paging because Actions is not an instant alerting service. A green build or merged PR does not establish successful Hostinger publication.

**Diagnosing HTTP 500:** check Hostinger's Deployments page for the active source SHA and build status, the web-app root, effective Node/pnpm versions, generated `.next`, startup logs and resource limits. Check whether `api.wosool.org` has a healthy PHP handler/database independently. Never publish debug output or secrets to browser responses. Restore the previous successful web-app release if safe, then fix the cause and redeploy both compatible revisions.

For EO Accelerator, the authoritative workflow is [EOA operations](docs/EOA.md). Read the [October 9 integration notes](docs/EOA-INTEGRATION-2026-10-09.md) before release: legacy gateway writes are retired, existing data is retained, and EOA settings govern privacy/intake approvals.

## Runtime and configuration

| Surface | Runtime / configuration |
| --- | --- |
| Frontend | Node.js 22.12+ (22.x) or 24.x; production origin `https://wosool.org` |
| Backend | PHP 8.3+, Composer 2; web root must point to `backend/public/` |
| Database | SQLite in the local template; verify and preserve the deployed engine before migration |
| Workers | Supervise queue workers when jobs are used; Reverb only when configured |

Set frontend values **before building**:

```dotenv
NEXT_PUBLIC_SITE_URL=https://wosool.org
NEXT_PUBLIC_API_URL=https://api.wosool.org
```

The API value is an origin without `/api`. Browser requests remain same-origin through the Next.js `/api/:path*` rewrite. The Node.js process must be able to reach the configured API origin.

Set protected backend environment values, including:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.wosool.org
FRONTEND_URL=https://wosool.org
SANCTUM_STATEFUL_DOMAINS=wosool.org,www.wosool.org
SESSION_DOMAIN=.wosool.org
SESSION_SECURE_COOKIE=true
SESSION_ENCRYPT=true
GATEWAY_PRIVACY_READY=false
GATEWAY_EMAIL_UPDATES=false
```

Keep the existing `APP_KEY`. Set `MAIL_TEAM_ADDRESS` to the inbox that should receive contact, sponsorship and membership-application alerts (defaults to `MAIL_FROM_ADDRESS`). Configure database credentials, a real mail transport and sender, and appropriate queue/cache drivers. The default `MAIL_MAILER=log` is local-only and cannot deliver account recovery messages. Public websocket keys may be exposed to the frontend; secrets may not.

### Hostinger Web App (wosool.org)

Keep the hosting package manager as **pnpm** and Node.js as **22.x**. Approvals must be inside the directory delivered to the installer: `frontend/pnpm-workspace.yaml` approves only `esbuild` and `unrs-resolver` through `allowBuilds`, and `frontend/pnpm-lock.yaml` locks the standalone frontend install. These files are produced by `pnpm import` and `pnpm approve-builds esbuild unrs-resolver` with pnpm 12.14.0. The repository-root workspace policy and lockfile remain for full-monorepo installs. Do not add a competing `onlyBuiltDependencies` policy or enable all scripts. [Current pnpm approval documentation](https://pnpm.io/cli/approve-builds) writes `allowBuilds` when approving builds; legacy approval keys are ignored by pnpm 11+.

CI verifies both a root workspace install and a clean frontend-only archive outside the repository, using Node 22 and pnpm 11.24.0 (matching the reported hosting runtime), a fresh store, `pnpm install --frozen-lockfile`, the esbuild TypeScript loader, ESLint's native resolver and the hosting webpack build. A root-only approval cannot protect a hosting build that receives only `frontend/`. Existing npm locks remain for the npm CI jobs. When dependencies change, refresh both pnpm lockfiles from the corresponding npm locks and pass both install checks.

Redeploy the latest merged `main` through the existing Hostinger Web App process. Confirm that the build input contains `frontend/pnpm-workspace.yaml` and `frontend/pnpm-lock.yaml`, then verify the install reaches the webpack build and the new release is active. A successful GitHub check does not trigger or prove a Hostinger redeployment.

Build `01a162c9-3445-73d3-8205-a59e9d7f7946` successfully installed dependencies at `82a6496` with Node 22 / pnpm 11.24.0, then ran `pnpm run build` and stalled at Turbopack compilation until the hosting timeout. The earlier `build:webpack` alias was not selected by this hosting command. `frontend/package.json` now makes the default `build` run `next build --webpack`, so the reported hosting command uses webpack directly. The existing `build:webpack` alias still works. CI exercises `pnpm run build` on a standalone frontend archive.

Use root directory `frontend`, framework preset Next.js, Node 22.x, package manager pnpm, build command `pnpm run build` and output directory `.next`, with `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false` set as build environment variables. A new build should print `Next.js 16.4.0 (webpack)`, complete compilation and generate the route table. If it still prints `(Turbopack)`, verify the checked-out revision and application root before retrying.

Build `01a162f6-e836-7286-84a0-17766a96850f` checked out source `b7ad796` for a new deployment: installation, webpack compilation (20.7 seconds) and TypeScript passed. It then attempted **63 page-data workers** and aborted with Tokio `OS can't spawn worker thread` / `EAGAIN` / `SIGABRT`. This is resource exhaustion during the build, so no completed release can be inferred from that attempt. The log does not establish the account's exact process/thread quota.

The build now caps `experimental.cpus` at **1** in `next.config.ts`. Both build scripts run `scripts/build.mjs`, which starts the webpack CLI with `TOKIO_WORKER_THREADS=1` and `RAYON_NUM_THREADS=1` before native modules initialize. These documented [Tokio](https://docs.rs/tokio/latest/tokio/runtime/struct.Builder.html#method.worker_threads) and [Rayon](https://docs.rs/rayon/latest/rayon/struct.ThreadPoolBuilder.html#method.num_threads) controls limit their worker pools; they do not claim to limit every Node/OS thread. The environment limits apply only to the build child process. No hosting environment edits or package changes are required.

The standalone CI build sets `CIRCLE_NODE_TOTAL=64` (which would produce Next 16.4.0's 63-worker default) and verifies that both page collection and static generation instead report **1 worker**. On the next Hostinger attempt, check that same output, successful route generation, and the final publish/activation result. If the one-worker build still gets `EAGAIN`, obtain the account's actual task quota and usage through Hostinger support before increasing resources or concurrency. A local/CI build cannot measure the hosting account's limits.

## PHP security update — 22 October 2026

The live API advertised `PHP/8.3.35` on 22 October 2026. This is below the upstream patched version. A version header cannot establish whether a provider backported fixes; obtain provider evidence if applicable.

For the existing 8.3 installation, update to **8.3.36 or later on 8.3** immediately. CI additionally checks **8.4.27** and **8.5.12**; promote a newer branch only after tests and staging pass. These releases fix CVE-2026-109618 and CVE-2026-109619 ([PHP advisory](https://www.php.net/archive/2026.php#2026-10-21-5)). Application headers do not fix these runtime vulnerabilities.

1. Confirm the PHP handler and account for `api.wosool.org` in Hostinger. Patch the actual web-serving PHP runtime, CLI, queue and scheduled-job runtimes; selecting a major/minor version alone does not prove the patch is installed.
2. Restart the relevant PHP workers through the host's supported controls so old processes are replaced. Preserve the existing application key and database.
3. Run `php scripts/check-php-runtime.php` from the repository root using the deployment PHP binary. Composer install/update also invokes this check. Do not bypass it with `--no-scripts`. For vendor backports below the upstream version floor, obtain provider attestation and review the gate explicitly rather than treating the displayed version as proof of safety.
4. Verify the web handler's patch using authenticated hosting diagnostics; CLI `php -v` alone is insufficient. Do not publish a `phpinfo()` endpoint. Check API health/readiness, sign-in, CSRF, private downloads, queues and scheduled jobs.
5. Set `expose_php=Off` in the hosting PHP configuration after verification. Removing the version header reduces disclosure but is not remediation.

Repository CI does not deploy or restart hosting. Runtime installation/restart and production verification remain an operational release step.

## Release sequence

1. Record the currently deployed commit, back up the database, and stage the candidate release. Run CI and `npm run verify` in development/staging.
2. Deploy backend source and install locked PHP dependencies:

   ```bash
   cd backend
   composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
   php artisan migrate --force
   php artisan storage:link   # once per server; serves board, mentor and member portraits
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan queue:restart
   ```

   The `2026_10_12_000001` migration creates `introductions_ledger` when it is missing (fresh installs previously skipped it, which broke introductions, matches and the admin intro console); it is a no-op on databases that already have the table.

   The `2026_10_08_000001` migration adds `deleted_at` only when missing from an existing company table. Fresh installations already have it. For Laravel's optional welcome-page assets, run `npm ci && npm run build` in `backend/` during the build stage. Do not install development npm dependencies inside a running release.

3. Build frontend artifacts in a new release directory:

   ```bash
   cd frontend
   npm ci
   npm run build
   npm run start -- --hostname 127.0.0.1 --port 3000
   ```

   Use the hosting platform's process manager for the final command. `next start` requires the matching `.next` output and installed runtime dependencies. This application is not a static export. On managed platforms, use root directory `frontend`, build command `npm run build`, and start command `npm run start` with the host's port binding.

4. Switch the host to the new processes/artifacts, then verify the checks below. Rebuild the frontend whenever `NEXT_PUBLIC_*` variables change.

Never run `migrate:fresh`, rotate `APP_KEY`, or seed demonstration accounts during deployment. Provision production roles separately with `php artisan db:seed --class=RoleAndPermissionSeeder --force` only when needed.

## Post-deploy content imports

All imports are idempotent and never overwrite edits made in the admin. Run them after `migrate`:

```bash
cd backend
php artisan eoa:install                 # EO Riyadh Accelerator records (intake stays closed)
php artisan wosool:import-founders      # researched founder scorecards, Saudi first
php artisan wosool:import-news          # reviewed, sourced news briefs
php artisan directory:import            # startup directory (pending evidence stays hidden)
php artisan news:sync                   # verified publisher feed (also scheduled daily)
```

`wosool:import-ecosystem` (programs and opportunities) is gated: run it without flags to review, then with `--apply --backup-verified --staging-verified` only after the checks in [accelerator operations](docs/ACCELERATOR_OPERATIONS.md).

## Verification

For the October 11 events incident, see [the investigation and release checks](docs/EVENTS-INVESTIGATION-2026-10-11.md). Record the hosting source SHA alongside the frontend build ID; the public build ID alone does not identify a Git commit. Deploy the events frontend/backend fixes together and verify API JSON before treating an empty event list as valid.

- `GET /api/ready` verifies database/schema and prepared gateway; run `php artisan wosool:check-readiness --production` and separately verify mail/worker delivery.
- `GET /api/health` succeeds on both the API origin and the frontend proxy.
- Public pages, logo assets, `/robots.txt`, and `/sitemap.xml` respond correctly.
- Canonical links point to the current page; member/admin/auth responses carry `X-Robots-Tag: noindex, nofollow`.
- Login, logout, an application, and a contact submission work through the same-origin proxy; no CSRF 419 or session redirect loop.
- A controlled account receives a password reset email with a link on `FRONTEND_URL`; an invalid/expired token is rejected and a consumed token cannot be reused.
- Upcoming and past events display correctly; ended events cannot accept a new RSVP.
- Check mobile navigation, keyboard focus, Arabic/English switching, reduced motion, and server error logs.

## Rollback

Restore the previously recorded frontend and backend release artifacts using the existing host's deployment mechanism. Restart application workers and clear/rebuild Laravel caches as appropriate. Keep additive gateway schema and the company column; its migration intentionally does not drop historical deletion data. Restore database backups only under an explicit incident plan that accounts for writes received after deployment.

## Hosting status

A successful GitHub push is not proof of production deployment. The repository currently has no production deployment workflow or host credential configuration. Use the established hosting account/process manager to deploy, and record the deployed SHA and verification result in the release log.

## EO Accelerator release

All EOA frontend routes live under lowercase `/eoa` (`frontend/src/app/eoa`); legacy uppercase `/EOA/...` links are 308-redirected by `src/proxy.ts`. Follow [the EOA release procedure](docs/EOA.md#release-and-validation) after the normal deployment. Run `php artisan eoa:install` after migrations; it imports sourced records without overwriting local settings and leaves intake closed. EOA email verification/notifications require a supervised queue worker and actual sending credentials. Back up persistent `storage/app/private/eoa` with the database and preserve `APP_KEY`, which encrypts financial fields. Never expose this directory through `/storage`.

Configure and approve the bilingual local data notice before account/financial-data collection. Verify real email delivery, role boundaries, private files and both `/EOA` languages on the deployed SHA before enabling applications. Availability of a configured mail driver alone does not establish deliverability. No deployment automation or hosting credentials are added by this feature.

## Founder directory release

After migrations, run `php artisan wosool:import-founders` and `php artisan wosool:import-news` (both safe to repeat). The founder import adds 43 researched founder scorecards at 33 companies — Saudi first, then GCC, MENA and global — with sourced traction and founding year, and backfills those facts on existing companies without overwriting edits. The news import adds reviewed, sourced briefs with region, key facts and Arabic translations; it never overwrites an editor's text and never restores a story an editor deleted. After the additive `2026_10_11_190000` migration, the founder import is the same command and runs once (safe to repeat). It imports researched public records without creating accounts or sending messages. Configure real mail delivery before using administrator invitations. Review [founder activation](docs/FOUNDER-ACTIVATION.md) and verify the backend as well as the frontend before announcing activation as live.

## Board profile revision update — 14 October 2026

Run `php artisan migrate --force` before activating this API release; the additive migration initializes existing `eoa_board_members.version` values to 1. Release the API and frontend together. Board PATCH and portrait POST requests now require the `version` returned by the staff board API; a stale version returns 409. Administrators should reload the list after deployment or a conflict. The public board payload remains unchanged. EO community profiles and portraits ship with the frontend and require no database import. Existing mentor appointments and program settings are preserved.

See [14 October founder research update](docs/FOUNDER-RESEARCH-2026-10-14.md) for sources, import expectations and the revenue-evidence policy.
