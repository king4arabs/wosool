# Deployment

Wosool has two deployable applications: `frontend/` is a Next.js Node.js server; `backend/` is a Laravel API with a database. Repository CI validates code and does not perform production deployment. Existing host names and process-manager services must be confirmed in the hosting account before a release.

For the EO Accelerator release, follow [gateway operations](docs/ACCELERATOR_OPERATIONS.md) as well: role provisioning, preview-first imports, privacy readiness, supervised verification/status mail, and same-engine staging recovery are required before live intake.

## Runtime and configuration

| Surface | Runtime / configuration |
| --- | --- |
| Frontend | Node.js 22.12+ (22.x) or 24.x; production origin `https://wosool.org` |
| Backend | PHP 8.3+, Composer 2; web root must point to `backend/public/` |
| Database | MySQL by default; production engine changes require a separate migration review |
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
