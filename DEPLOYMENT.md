# Deployment

Wosool has two deployable applications: `frontend/` is a Next.js Node.js server; `backend/` is a Laravel API with a database. Repository CI validates code and does not perform production deployment. Existing host names and process-manager services must be confirmed in the hosting account before a release.

## Production deployment contract (October 22, 2026)

Keep the **single GitHub monorepo** but deploy two independent services. The Next.js website runs at `https://wosool.org` with Hostinger Web App root `frontend/`, Node 22, pnpm, `pnpm run build`, output `.next`, and a managed server process. The Laravel API runs separately at `https://api.wosool.org`, serving `backend/public/`. Its database, private storage, queue workers and scheduler must not be coupled to the frontend build. Do not move the application files out of `frontend/`; that directory is the **source root**, not part of the public URL.

**Release environment gate:** from `frontend/`, run `pnpm run preflight:production` with the actual Hostinger build environment. It rejects non-HTTPS/missing site/API origins and demo mode not explicitly disabled. Set `NEXT_PUBLIC_SITE_URL=https://wosool.org`, `NEXT_PUBLIC_API_URL=https://api.wosool.org`, and `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false` as build environment variables. Hostinger may inject variables without a physical `.env` file. Do not print private values. Rebuild after changing public environment variables. The default `pnpm run build` now runs this gate automatically before compilation. It loads `.env.production.local`, `.env.local`, `.env.production` and `.env` with Next.js precedence; injected host variables take priority. Missing settings, loopback API targets, matching site/API origins, paths/credentials in origins, and enabled demo content stop the build. Use `frontend/.env.production.example` for the public production values. A physical `.env` file is optional when Hostinger injects all three values.

**Safe release order:** backup the live database and record both deployed source SHAs; validate staging with its own restricted domain and separate database; deploy compatible Laravel code and additive migrations; verify direct API readiness, authorization, queues and real SMTP; deploy the matching Next.js revision; verify the website and the same-origin proxy; record the result. Preserve `APP_KEY`, private media, uploads, and data. No automatic destructive migrations or demonstration seeders. Revert to the previous host artifact if verification fails, and never blindly restore a pre-release database over live user writes.

**Post-release smoke check:** run `node scripts/production-smoke.mjs` from the repository root. This requests the homepage, `/eoa`, frontend `/health`, Laravel `/api/health` and `/api/ready`, and the frontend proxy `/api/health`. It also posts empty JSON to `/api/v1/newsletter/subscribe` through both origins and requires HTTP 422 with email, locale and consent validation errors. These two probes never submit an address or consent and cannot create a subscription or send mail. The hourly [production health workflow](.github/workflows/production-health.yml) and manual GitHub Actions run detect regressions; configure failed-workflow notifications plus independent uptime/paging because Actions is not an instant alerting service. For non-200 responses the check records validated `x-hcdn-request-id` and `x-hcdn-cache-status` values when Hostinger supplies them, but never logs a response body. Use the request ID to correlate a failed request with provider runtime logs. A green build or merged PR does not establish successful Hostinger publication.

**Diagnosing HTTP 500:** check Hostinger's Deployments page for the active source SHA and build status, the web-app root, effective Node/pnpm versions, generated `.next`, startup logs and resource limits. Check Runtime logs and `domains/wosool.org/hbuilds/current/nodejs/stderr.log` for the current deployment, correlating any `x-hcdn-request-id` emitted by the smoke check. Check whether `api.wosool.org` has a healthy PHP handler/database independently. Never publish debug output or secrets to browser responses. Restore the previous successful web-app release if safe, then fix the cause and redeploy both compatible revisions.

For EO Accelerator, the authoritative workflow is [EOA operations](docs/EOA.md). Read the [October 9 integration notes](docs/EOA-INTEGRATION-2026-10-09.md) before release: legacy gateway writes are retired, existing data is retained, and EOA settings govern privacy/intake approvals.

## Runtime and configuration

| Surface | Runtime / configuration |
| --- | --- |
| Frontend | Node.js 22.x or 24.x with the current provider security patch; production origin `https://wosool.org` |
| Backend | PHP 8.3.36+, 8.4.27+, or 8.5.12+ on the corresponding stable branch; Composer 2; web root must point to `backend/public/` |
| Database | SQLite in the local template; verify and preserve the deployed engine before migration |
| Workers | Supervise queue workers when jobs are used; Reverb only when configured |

Set frontend values **before building**:

```dotenv
NEXT_PUBLIC_SITE_URL=https://wosool.org
NEXT_PUBLIC_API_URL=https://api.wosool.org
NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false
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

Keep the existing `APP_KEY`. Contact, sponsorship and membership-application alerts are routed to `info@wosool.org` in `config/mail.php`; the old `MAIL_TEAM_ADDRESS` override is no longer used. Configure database credentials, a real mail transport and sender, and appropriate queue/cache drivers. The default `MAIL_MAILER=log` is local-only and cannot deliver account recovery messages. Public websocket keys may be exposed to the frontend; secrets may not.

### Hostinger Web App (wosool.org)

Keep the hosting package manager as **pnpm** and Node.js as **22.x**. Approvals must be inside the directory delivered to the installer: `frontend/pnpm-workspace.yaml` approves only `esbuild` and `unrs-resolver` through `allowBuilds`, and `frontend/pnpm-lock.yaml` locks the standalone frontend install. Both package manifests pin `pnpm@11.24.0`, matching CI and the reported host. Keep dependency updates and build approvals compatible with that version. The repository-root workspace policy and lockfile remain for full-monorepo installs. Do not add a competing `onlyBuiltDependencies` policy or enable all scripts. [Current pnpm approval documentation](https://pnpm.io/cli/approve-builds) writes `allowBuilds` when approving builds; legacy approval keys are ignored by pnpm 11+.

CI verifies both a root workspace install and a clean frontend-only archive outside the repository, using Node 22 and pnpm 11.24.0 (matching the reported hosting runtime), a fresh store, `pnpm install --frozen-lockfile`, the esbuild TypeScript loader, ESLint's native resolver and the hosting webpack build. A root-only approval cannot protect a hosting build that receives only `frontend/`. Existing npm locks remain for the npm CI jobs. When dependencies change, refresh both pnpm lockfiles from the corresponding npm locks and pass both install checks.

Redeploy the latest merged `main` through the existing Hostinger Web App process. Confirm that the build input contains `frontend/pnpm-workspace.yaml` and `frontend/pnpm-lock.yaml`, then verify the install reaches the webpack build and the new release is active. A successful GitHub check does not trigger or prove a Hostinger redeployment.

Build `01a162c9-3445-73d3-8205-a59e9d7f7946` successfully installed dependencies at `82a6496` with Node 22 / pnpm 11.24.0, then ran `pnpm run build` and stalled at Turbopack compilation until the hosting timeout. The earlier `build:webpack` alias was not selected by this hosting command. `frontend/package.json` now makes the default `build` run `next build --webpack`, so the reported hosting command uses webpack directly. The existing `build:webpack` alias still works. CI exercises `pnpm run build` on a standalone frontend archive.

Use root directory `frontend`, framework preset Next.js, Node 22.x, package manager pnpm, build command `pnpm run build` and output directory `.next`, with `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false` set as build environment variables. A new build should print `Next.js 16.4.2 (webpack)`, complete compilation and generate the route table. If it still prints `(Turbopack)`, verify the checked-out revision and application root before retrying.

Build `01a162f6-e836-7286-84a0-17766a96850f` checked out source `b7ad796` for a new deployment: installation, webpack compilation (20.7 seconds) and TypeScript passed. It then attempted **63 page-data workers** and aborted with Tokio `OS can't spawn worker thread` / `EAGAIN` / `SIGABRT`. This is resource exhaustion during the build, so no completed release can be inferred from that attempt. The log does not establish the account's exact process/thread quota.

The build now caps `experimental.cpus` at **1** in `next.config.ts`. Both build scripts run `scripts/build.mjs`, which starts the webpack CLI with `TOKIO_WORKER_THREADS=1` and `RAYON_NUM_THREADS=1` before native modules initialize. These documented [Tokio](https://docs.rs/tokio/latest/tokio/runtime/struct.Builder.html#method.worker_threads) and [Rayon](https://docs.rs/rayon/latest/rayon/struct.ThreadPoolBuilder.html#method.num_threads) controls limit their worker pools; they do not claim to limit every Node/OS thread. The environment limits apply only to the build child process. No hosting environment edits or package changes are required.

The standalone CI build sets `CIRCLE_NODE_TOTAL=64` (which would produce Next 16.4.0's 63-worker default) and verifies that both page collection and static generation instead report **1 worker**. It then starts the same frontend-only archive through `pnpm run start` and requires `/health`, `/` and `/eoa` to pass, with real page content and nonempty JavaScript/CSS assets served with the correct MIME types. On the next Hostinger attempt, check that same output, successful route generation, final publish/activation and all production probes. If the one-worker build still gets `EAGAIN`, obtain the account's actual task quota and usage through Hostinger support before increasing resources or concurrency. A local/CI build cannot measure the hosting account's limits.

## Hostinger release settings — 23 October 2026

| Setting | Value |
| --- | --- |
| Repository / branch | `king4arabs/wosool` / `main` |
| Framework | Next.js |
| Root directory | `frontend` |
| Node.js | 22.x, patched by Hostinger; verify the effective patch |
| Package manager | pnpm 11.24.0 (pinned in `package.json`) |
| Install | `pnpm install --frozen-lockfile` |
| Build | `pnpm run build` |
| Output | `.next` |
| Start, if configurable | `pnpm run start --hostname 0.0.0.0` (use the host-provided `PORT`) |
| Site origin | `NEXT_PUBLIC_SITE_URL=https://wosool.org` |
| API origin | `NEXT_PUBLIC_API_URL=https://api.wosool.org` |
| Demo content | `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false` |

Hostinger's [monorepo documentation](https://www.hostinger.com/support/how-to-deploy-monorepos-with-npm-yarn-or-pnpm-on-hostinger/) confirms the app-root setting and `packageManager` version selection. Preserve the Laravel service separately at `api.wosool.org`; do not replace it with the frontend or publish `backend/` as static files.

**Runtime security:** Hostinger reports an October 2026 rollout of Node 22.23.4 / 24.22.1 security patches and application restarts. Verify the effective serving version or provider backport evidence; the major-version selector and a package audit do not prove the runtime is patched. See [Hostinger's rollout notice](https://www.hostinger.com/support/node-js-24-22-1-security-update-on-hostinger-hosting/). The repository does not install or restart the hosting runtime.

For a local production-mode preview, set both origins to separate explicit loopback origins (for example `http://localhost:3000` and `http://localhost:8000`) and run `npm run build:local` inside `frontend/`. This is an explicit development artifact and must not be published. `npm run dev` is unchanged.

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

## Newsletter delivery

Deploy the additive newsletter migration before the matching frontend. Keep the authenticated sender and existing `APP_KEY`; replies and site correspondence use `info@wosool.org`. The footer offers confirmed email subscription. Active, email-verified community members are included unless they disabled `weekly_digest` or unsubscribed. Imported unclaimed founders and pending members are excluded.

Run Laravel's scheduler every minute using the hosting account's existing PHP binary and the absolute backend path (`php artisan schedule:run`). `wosool:newsletter --digest` runs hourly: it sends new-member welcomes and retries failed deliveries up to three attempts. Monthly issues become due on the first day at 09:00 Asia/Riyadh, with a 72-hour retry window. They contain up to five public, published news briefs from the previous calendar month (featured items first), up to six new public member profiles, and up to three upcoming public events. Member profiles respect directory visibility and exclude unclaimed or inactive accounts. Empty issues are skipped. The subscriber/campaign delivery key prevents ordinary duplicate runs; the same email is deduplicated across membership and newsletter signups. The existing `weekly_digest` preference key is retained for API compatibility and existing opt-outs, but its visible label and cadence are monthly. Welcome messages stay separate and are sent once; the hourly job does not send an hourly newsletter. No queue worker is required for this command.

A real SMTP/API mail transport is required; log/array transports fail closed. Before enabling the production scheduler, verify signup, confirmation, welcome, Arabic/English layout, embedded logo, replies to info@wosool.org, unsubscribe, and member preferences with controlled inboxes. The scheduled command sends to all eligible recipients, so use an isolated staging database for validation. Inspect `newsletter_deliveries` for failed or sending rows. A row left `sending` after a process crash is not automatically resent because SMTP may already have accepted it; reconcile provider logs before retrying. Schedule installation and inbox delivery are not established by CI or a merge.

### Founder activation outreach

Run the new migration before deploying the admin UI. Public founder cards omit the pending activation badge; admin cards retain it. `/admin/founders` supports selecting individual profiles or all unclaimed profiles across pages, verifying recipients, queuing invitations, starting missing-email research and stopping queued work. Suspended and claimed profiles are excluded. Valid or revoked invitations are not silently resent by bulk actions.

The existing Laravel scheduler runs `wosool:founder-outreach` every five minutes (no separate queue worker required). Each pass processes at most 25 records, including at most five research requests. Configure a delivering mail transport and the existing `OPENAI_API_KEY`, `OPENAI_BASE_URL` and `OPENAI_MODEL` (must support Responses web search). Missing credentials are reported to admins. No new public endpoint exposes research/contact data.

Research uses public professional identity only, stores candidate emails encrypted, includes source evidence, and requires admin verification before sending. It retries every 1–7 days until a candidate is found, the profile is claimed, the requesting admin loses permission or an admin stops the task. Review provider spend and set a provider budget; tasks are not started automatically for new records. Web search documentation: https://developers.openai.com/api/docs/guides/tools-web-search

Invitations reuse the existing single-use token, email-code and account-ownership checks. A scheduler outage leaves work queued. Failed sends require manual review/requeue; an interrupted `sending` record is deliberately not automatically resent because transport acceptance may be ambiguous. Check the mail provider before changing such a record. Validate actual inbox delivery and the activation link on hosting after deployment; fake-mail tests do not prove delivery.

### Newsletter and company logo verification — 29 October 2026

Run `php artisan wosool:newsletter --check` before enabling scheduled sends. It reads aggregate counts and mail transport configuration only: it does not add subscribers, send email, test credentials, or prove inbox delivery. The admin dashboard shows active/pending subscriptions, 30-day sent counts, failed/ambiguous sends and the last command run. A missing/stale run requires checking server cron; the heartbeat uses the configured Laravel cache, so clearing that cache resets it. Manual command runs also update this heartbeat. The default SMTP timeout is 30 seconds (`MAIL_TIMEOUT`).

Monthly/welcome mail now carries RFC 8058 unsubscribe headers when `APP_URL` is HTTPS. Set `APP_URL=https://api.wosool.org`; verify a signed `POST /api/v1/newsletter/one-click/{id}/{token}` with `List-Unsubscribe=One-Click` returns 204 directly, without a redirect, login, cookie or CSRF requirement. GET never unsubscribes. Configure the mail provider to DKIM-sign both List-Unsubscribe headers, and verify SPF, DKIM and DMARC alignment with a controlled inbox. Exclude the one-click path tokens from access-log/analytics collection. Body links retain confirmation buttons and fragment tokens. No real campaign is sent by tests or the readiness check. Provider-accepted `sent` counts are not open rates, inbox placement or bounce tracking.

Official references: https://www.rfc-editor.org/rfc/rfc8058.html and https://support.google.com/mail/answer/81126.

Company logos are reviewed local assets for 155 of 168 companies, covering 285 of 308 sourced founder records. See `docs/COMPANY-LOGO-AUDIT-2026-10-29.json` for all companies, source URLs and unresolved artwork. The frontend resolves missing/broken legacy logos by exact official website host, then falls back to the website icon or company name. Existing uploaded member artwork takes priority. `wosool:import-founders` can safely backfill empty company logo fields without overwriting existing artwork. No accounts, visibility settings or founder identities change. Confirm grid rendering in Arabic and English at 320/390/768/1440px after release.

### Repair a missing newsletter route — 29 October 2026

A live empty-body check returned HTTP 404 for both `https://wosool.org/api/v1/newsletter/subscribe` (Laravel reports `v1/newsletter/subscribe`) and `https://api.wosool.org/api/v1/newsletter/subscribe` (Laravel reports `api/v1/newsletter/subscribe`). Current source registers both through `backend/bootstrap/app.php`. This is consistent with an old backend release or stale route cache; a frontend rebuild alone cannot restore the backend route. Read the actual serving revision and document root before changing hosting.

After the normal backup and staging checks, deploy the matching `backend/` release to the existing API service. Preserve the existing `.env`, `APP_KEY`, database and storage. From the actual backend root, using the hosting PHP binary:

```sh
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan route:clear
php artisan config:cache
php artisan route:cache
php artisan route:list --path=newsletter
php artisan wosool:newsletter --check
```

The route list must contain POST `api/v1/newsletter/subscribe`, `confirm`, `unsubscribe` and their mounted `v1/` equivalents. Do not flush the application cache or change the frontend rewrite to work around a missing backend release. If the CLI route list is correct but HTTP still returns 404, verify the web document root/release symlink and reload PHP through the hosting controls to replace stale OPcache workers.

Run the eight production probes after the API release and again after the frontend release. Route validation establishes routing, not SMTP delivery; verify confirmation, welcome and unsubscribe using a controlled inbox before treating subscriptions as operational. Do not run the newsletter dispatch command as a test against live recipients. The browser keeps a failed address for retry and never reports success on 404/503. The current frontend change improves the error message but is not a substitute for this backend repair.


## Registration / OTP recovery — 30 October 2026

Production diagnosis: CSRF initialization and cookie-authenticated empty registration returned 200/422, but both `/api/v1/auth/registration/verify` and `/api/v1/auth/registration/resend`, and `/api/v1/registration/application`, returned 404 through the website. Direct canonical OTP verification also returned 404. `/api/ready` returned 200 despite this older release. The live registration validator lacked the current consent requirement. These observations identify a backend version/route mismatch; they do not establish SMTP credentials or inbox delivery.

Release the matching **backend**, not just the Next.js frontend. Follow the safe release order above, preserve the existing database, `APP_KEY`, mail credentials and uploads, and run from the deployed backend directory:

```sh
php artisan migrate --force
php artisan route:clear
php artisan config:cache
php artisan route:cache
php artisan route:list --path=registration
```

Confirm both canonical `/api/v1/` and mounted `/v1/` registration routes are listed. Run `node scripts/production-smoke.mjs` from the repository; the 16 probes now require guest OTP/application requests to return 401 (not 404), and empty registration to validate consent. Probes do not submit addresses, create accounts, or send mail. A passing readiness endpoint alone is insufficient.

Use a controlled inbox to register, receive the six-digit code, test resend after one minute, activate, reload, sign out/in and submit the profile. Confirm approved membership grants dashboard access while pending accounts retain onboarding access. Existing accounts from the old registration flow can sign in with their password and request an OTP from onboarding; existing member/founder/admin and Accelerator journeys remain separate. Do not bypass email verification or application approval to repair registration. Record the active backend/frontend SHAs and delivery evidence before declaring the incident resolved.

The browser allows 45 seconds for registration/resend to accommodate the default 30-second SMTP timeout. Failed or timed-out writes are never automatically replayed; CSRF rejections alone may be retried once. Review SMTP duration if the configured mail timeout exceeds this budget.

## Founder identities and scorecard ownership — 30 October 2026

After a verified database backup and staging rehearsal, apply the two new additive founder identity migrations before releasing the matching backend/frontend. The first adds stable random founder UUIDs to existing, imported, registered and soft-deleted profiles. The second enforces at most one private scorecard per founder and **refuses to delete or merge historic duplicates**. Existing numeric foreign keys and registration/activation checks remain unchanged. Read the [founder identity guide](docs/FOUNDER-IDENTITY-2026-10-30.md) before running migrations.

Run `php artisan wosool:check-founder-identity --json` after migration. This read-only command reports aggregate identity and relationship integrity and never changes membership, scores or accounts. A green commit/CI or Cloudflare preview does not prove Hostinger deployment or production database migration.
