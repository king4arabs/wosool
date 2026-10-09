# Accelerator operations

## Deployable scope and host prerequisites

The implementation uses the existing Laravel/Next.js deployment layout. There is no production deploy job or configured hosting integration in this checkout. Obtain the actual host/project identifiers, release process, PHP/Node services, private environment, database engine/version, queue supervisor and mail configuration. Do not create a duplicate site or change DNS to work around missing access.

Keep production intake closed until the owner approves the named legal controller, privacy contact, purposes/recipients, retention period and hosting/mail processor register (including processing locations and transfer assessment). Update `/privacy` with those approved facts, then set `GATEWAY_PRIVACY_READY=true`. Configure mail and workers, verify with an authorized controlled recipient, then enable `GATEWAY_EMAIL_UPDATES=true`.

The privacy review used SDAIA’s official [PDPL guide](https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/GPDPL). The implemented workflow is a technical aid, not a legal compliance determination.

## Backup, staging and imports

1. Record the deployed SHA, environment configuration versions and database engine. Take an encrypted database backup and separately preserve uploads and the existing `APP_KEY`. Keep backups outside the public web root and Git.
2. Restore into an isolated staging database on the **same engine/version** as production. Verify table counts, foreign keys, representative historical applications and upload references. Disable outbound mail or use a controlled sink. A backup command finishing is not evidence of recoverability.
3. Deploy the backend to staging and run `php artisan migrate --pretend` for review, then `php artisan migrate --force`. Run the automated suite against a separate test database, never production.
4. Seed role definitions only. Preview the gateway and research commands and retain the reports:

   ```bash
   php artisan db:seed --class=RoleAndPermissionSeeder --force
   php artisan wosool:prepare-gateway
   php artisan wosool:import-ecosystem
   ```

5. Apply in staging, repeat both commands and confirm no duplicate records or revision rows. Run `wosool:check-readiness`, then the browser/email checks below.
6. After actual backup recovery and staging verification, perform the production migration and approved import:

   ```bash
   php artisan migrate --force
   php artisan wosool:prepare-gateway --apply --backup-verified --staging-verified
   php artisan wosool:import-ecosystem --apply --backup-verified --staging-verified
   ```

   These switches are attestations, not automated backups. Never use them to skip the checks. Never run `migrate:fresh`, production demo seeders or key rotation.

The new migration is additive. Its `down()` refuses destructive reversal; roll back application artifacts while retaining schema/data. After a partial MySQL DDL failure, inspect the failed step and restore/reconcile in staging before retrying—MySQL DDL is not uniformly transactional. Do not mark migrations complete manually to conceal errors.

The import report contains added/corrected/unchanged/merged/archived/unresolved lists. Merging and archival are deliberately not inferred from a shared domain: potential duplicates require editorial review. Missing source fields stay null. Expired imported records and deadlines are labelled historical/closed and have no active application CTA. They preserve their IDs and provenance. No research import touches user profiles or application records. Editorial review locks a record against future differing imports; reconciling its structured conditions requires an explicit reviewed correction, not deletion/re-import.

The local rehearsal in `research/IMPORT-REPORT-2026-10-08.json` tested online SQLite backup, restore to a separate database, integrity, existing-user preservation, migration replay and repeated import. It is not a production backup or hosted staging validation.

## Release and rollback

Build locked dependencies in a fresh release directory; deploy backend/schema before frontend. Keep intake paused during incompatible changes. Run `optimize:clear`, `config:cache`, `route:cache`, `view:cache` and `queue:restart` from the backend after configuration is correct. A restarted queue still needs supervisor/systemd or the host’s worker manager to keep it running.

Build frontend with the real HTTPS API origin. Switch release artifacts using the established host mechanism and retain the previous release. Verify `/api/health` and `/api/ready` through both the backend and frontend proxy, public pages and static assets, robots/canonical/sitemap, login/logout/CSRF, safe test email delivery and the complete application flow. Record the deployed SHA and actual verification time.

On failure, pause intake, revert to previous frontend/backend artifacts and restart workers/caches. Retain additive schema. Restore database backups only under an incident plan accounting for post-backup writes and the impact on applications. Never restore an old database over new submissions as routine code rollback.

## Notifications and monitoring

Verification email uses a signed, relative, account-bound link valid for 60 minutes. Resending is limited to once per minute. Application updates are generic bilingual notices with a sign-in link; applicant financial information and internal reviewer messages are not included.

Application update jobs run after commit, use a unique event key and delivery lock, retry four times (30/120/600-second backoff) and persist a sent timestamp. Completed deliveries/internal notes are skipped. SMTP cannot guarantee exactly-once delivery if the worker crashes after a provider accepts a message but before the sent timestamp commits. If stronger guarantees are required, configure a provider with an idempotency key/receipt before advertising that guarantee.

Watch `/api/ready`, HTTP 5xx/419/429 rates, queue depth/failed jobs, scheduled processes, mail provider bounces, disk space and backup age. Do not place tokens or request bodies into logs/alert payloads. Slow-query logs omit SQL and bindings. Review `php artisan queue:failed`; retry only after correcting the cause. If queue dispatch failed after a status transaction committed, an operator can redispatch the corresponding `SendApplicationUpdate` job by event ID after checking its `notification_sent_at`. Keep production error detail disabled.

## Account, review and program operations

Provision trusted admin/reviewer/mentor roles through the established administration process; never public registration. Ensure staff email verification is completed. Reviewers use `/review`, admins `/admin/accelerator`. Drafts are absent from review queues. Applicants edit drafts/information requests only; stale versions return 409. Final decisions are admin-only. Applicant-visible transition messages and internal notes are separated in the audit history and API.

Admins create cohorts and sessions, assign cohorts/reviewers, provide HTTPS participant resources, record attendance, and assign existing mentor/coach users and milestones. Accepted/onboarded accounts see only their program’s global or assigned-cohort materials. Onboarding creates one participant record. Mentor assignment itself does not grant broad account or applicant access.

## Privacy request handling

Applicants submit access/correction/withdrawal/deletion requests inside their account; duplicate unresolved received requests of the same type are collapsed. Admins review them in `/admin/privacy-requests`. Request resolution records actor, reason and time. **Marking completed does not itself export or delete data.** Confirm identity through the authenticated account, fulfil the approved request securely, consider any documented lawful retention, and then record completion. A deletion operation must cover the user’s account, private profiles, company relationship, application payload, audit messages, notifications, uploaded assets and processors where applicable; avoid deleting shared company/community history without review.

The owner must choose the retention schedule and exception process before live intake. There is intentionally no invented 30/90-day purge. Configure a reviewed scheduled retention process after that policy exists. Restrict staff access, log handling without copying applicant data into notes, and do not send exports in public links or ordinary issue comments.

## Browser acceptance gate

Use a controlled staging identity and mail sink. Confirm Arabic RTL and English LTR at 360, 768 and 1280 CSS pixels; keyboard focus, labels, errors, contrast, mobile menu and password visibility controls; registration/verification expiry and wrong-account rejection; language changes during unsaved edits; slow-network autosave, conflict/resume and submission; assigned-reviewer vs unrelated-account restrictions; information request/resubmission/final decision/onboarding; cohort resource boundaries and attendance; search/filter/detail/deadline/source links; approved partner sizing and destinations; recovery/logout/session expiry. Capture evidence before opening production intake.

No supported browser QA capability was available in this implementation environment. Build output and integration tests are recorded separately and do not imply these visual checks passed.
