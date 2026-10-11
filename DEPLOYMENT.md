# Deployment

Wosool has two deployable applications: `frontend/` is a Next.js Node.js server; `backend/` is a Laravel API with a database. Repository CI validates code and does not perform production deployment. Existing host names and process-manager services must be confirmed in the hosting account before a release.

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

Keep the existing `APP_KEY`. Configure database credentials, a real mail transport and sender, and appropriate queue/cache drivers. The default `MAIL_MAILER=log` is local-only and cannot deliver account recovery messages. Public websocket keys may be exposed to the frontend; secrets may not.

## Hostinger setup for wosool.org

Open the existing [wosool.org website in hPanel](https://hpanel.hostinger.com/websites/wosool.org).
Confirm its hosting plan and current release before changing anything. This link
does not grant deployment access, and the settings below have not been applied
to the account.

### 1. Choose the correct application hosting

The frontend requires **Node.js web apps hosting** or a VPS with a supervised
Node process. Ordinary PHP/static hosting cannot run this Next.js application;
uploading the repository or `.next` to `public_html` is not a deployment.
Do not convert it to a static export: authentication, API rewrites, and dynamic
routes require the Node server.

Keep two separate application roots:

- `https://wosool.org`: the Next.js frontend, with `www` configured to redirect
  to the canonical domain.
- `https://api.wosool.org`: the Laravel API on PHP hosting or a VPS.

Confirm the existing API hostname before creating/changing a subdomain or DNS.
If the plan does not provide both runtimes, arrange compatible hosting before
replacing the live site. Do not delete the existing website to enable Node.js.

### 2. Configure the frontend deployment

Import `king4arabs/wosool` using the authorized GitHub integration and select
the approved release branch. Override monorepo auto-detection with one of these
configurations; do not mix the two:

| hPanel setting | Repository-root deployment | Frontend-root deployment |
| --- | --- | --- |
| Application/root directory | Repository root | `frontend` |
| Framework | Next.js | Next.js |
| Node.js | 22.x (at least 22.12) or 24.x | 22.x (at least 22.12) or 24.x |
| Install command | `npm run hostinger:install` | `npm ci --include=dev` |
| Build command | `npm run hostinger:build` | `npm run build` |
| Start command | `npm run hostinger:start` | `npm run start -- --hostname 0.0.0.0` |

The root commands install/build **only the frontend**, without requiring PHP,
Composer, backend Vite assets, or database access in the Node build container.
Development dependencies must be available during the build for TypeScript and
Tailwind. Do not use the local `npm run setup` or combined `npm run build` as
Hostinger frontend commands.

Set these variables in hPanel **before** building:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://wosool.org
NEXT_PUBLIC_API_URL=https://api.wosool.org
NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false
```

Next.js reads Hostinger's `PORT` environment variable automatically; the start
commands bind to `0.0.0.0`, not loopback. Use the port supplied by the platform,
not a hard-coded public port. On a VPS, set `PORT` to your internal upstream
port and terminate HTTPS at the reverse proxy.

Use Hostinger's Next.js framework output handling and retain the matching
`.next` build, `public` assets, package files, configuration, and runtime
dependencies. This setup uses `next start`, not a standalone `server.js`.
If the account's interface cannot set the application root or custom commands,
confirm a supported monorepo configuration with Hostinger rather than deploying
the root package as a generic Node app. Hostinger documents its Node.js workflow
in [Deploy a Node.js website](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).

### 3. Configure the Laravel API separately

Select PHP 8.3+ for **both web and SSH/cron**, Composer 2, and the extensions
required by the lockfile (including `pdo_mysql` for MySQL). Run
`composer check-platform-reqs --no-dev` after installing dependencies.

The API document root must be the deployed Laravel **`backend/public`** directory.
The Laravel source, `.env`, `vendor`, and private `storage` must remain outside
the web root. If hPanel fixes the subdomain root to `public_html`, have Hostinger
configure it to serve Laravel's public directory or use a VPS with an explicit
document root. Do not serve the repository root or expose the whole backend.

For a **new installation only**, copy `backend/.env.production.example` to a
private `backend/.env`, then fill in database and SMTP values from the hosting
account. Generate `APP_KEY` once with `php artisan key:generate --force` from
the backend directory before caching config. For an existing deployment, retain
its `.env`, `APP_KEY`, database engine, and persistent files; the template is
not a replacement for live configuration. MySQL is a fresh-install option,
not an instruction to migrate an existing SQLite/PostgreSQL database.

Use the actual MySQL hostname and full database/user names shown in hPanel;
do not assume the template's `127.0.0.1` is correct for every account.
Set a verified SMTP sender and test delivery. Port 587 uses `MAIL_SCHEME=smtp`;
providers requiring implicit TLS on port 465 use `MAIL_SCHEME=smtps`.
All credentials belong only in protected hosting configuration.

Grant the PHP process write access to `storage` and `bootstrap/cache`, without
world-writable permissions. Preserve `storage/app/private/eoa` outside the web
root. If public uploaded media is used, run `php artisan storage:link`; only
`storage/app/public` may be linked.

Deploy/install/migrate using the release sequence below, then run
`php artisan eoa:install`. Never use `migrate:fresh` or the demonstration seeder.
If Hostinger terminates TLS through a proxy, verify HTTPS detection and session
cookies; trust only the hosting provider's confirmed proxy addresses, not every
internet client.

### 4. Run background work and verify the release

Database queues require a worker for EOA mail and notifications. On a VPS use
a supervised `php artisan queue:work --tries=3 --timeout=60` process. If the
PHP plan only supports cron, configure a once-per-minute job from the absolute
deployed backend directory, using the account's PHP 8.3+ executable:
`php artisan queue:work --stop-when-empty --max-time=50 --tries=3 --timeout=60`.
Prevent overlapping invocations with the host's job locking, and confirm the
plan's cron frequency/process limits. Do not launch an unsupervised permanent
SSH worker. Reverb/chat requires a separately supervised websocket service;
leave broadcasting at `log` and frontend Reverb variables unset until it exists.

Run the existing Laravel scheduler once per minute with `php artisan schedule:run`
from the deployed backend directory, using the same PHP executable.
Back up the database and private uploads before deployment. Install the backend
first, verify its HTTPS health endpoint, then deploy the frontend. Complete all
checks under [Verification](#verification), including:

- `https://api.wosool.org/api/health` and `https://wosool.org/api/health`.
- `php artisan wosool:check-readiness --production` and `/api/ready`.
- Login/logout, CSRF protection, public uploads, and actual queued email delivery.
- `/eoa`, static logo assets, and the deployed commit in both application logs.

A successful frontend deployment does **not** deploy Laravel or prove that the
database, mail, workers, or API are ready. Keep intake closed until the EOA
release checks and privacy approvals are complete.

## Release sequence

1. Record the currently deployed commit, back up the database, and stage the candidate release. Run CI and `npm run verify` in development/staging.
2. Deploy backend source and install locked PHP dependencies:

   ```bash
   cd backend
   composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
   php artisan migrate --force
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan queue:restart
   ```

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

## Verification

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

All EOA frontend routes remain under `/EOA`. Follow [the EOA release procedure](docs/EOA.md#release-and-validation) after the normal deployment. Run `php artisan eoa:install` after migrations; it imports sourced records without overwriting local settings and leaves intake closed. EOA email verification/notifications require a supervised queue worker and actual sending credentials. Back up persistent `storage/app/private/eoa` with the database and preserve `APP_KEY`, which encrypts financial fields. Never expose this directory through `/storage`.

Configure and approve the bilingual local data notice before account/financial-data collection. Verify real email delivery, role boundaries, private files and both `/EOA` languages on the deployed SHA before enabling applications. Availability of a configured mail driver alone does not establish deliverability. No deployment automation or hosting credentials are added by this feature.
