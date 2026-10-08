# EO Riyadh Accelerator on Wosool

Wosool is the local digital gateway for **EO Riyadh Accelerator**: “Saudi Founders. Global Connections. Extraordinary Growth.” All program pages, accounts, applications, administration, coaching and recovery pages live under **`/EOA`**, preserving the uppercase path. Lowercase `/eoa/...` redirects to the canonical path. The homepage introduces this gateway while retaining the wider Wosool network routes.

EO Riyadh provides chapter leadership and governance. EO Accelerator provides the applicable program framework. Wosool supports discovery, applications, coordination and participant services. Operating partners deliver only their approved scope. Mohammed Alsolami is identified as EO Riyadh Membership & Accelerator Chair, as supplied by project leadership. Application, local acceptance, official Accelerator enrollment and subsequent EO membership are distinct events.

## Architecture and setup

The existing Next.js 16 / React 19 frontend, Cairo typography, locale provider, Laravel 13 API, Sanctum sessions and Spatie roles are reused. Public components are in `frontend/src/components/eoa`; routes are in `frontend/src/app/EOA`. The API is registered by `backend/routes/eoa.php` at `/api/v1/eoa`. Laravel controllers/services enforce authorization; UI visibility is not a security boundary.

The normal README setup runs the installer. To repeat it or prepare an existing checkout, run from `backend/`:

```bash
php artisan migrate
php artisan eoa:install
php artisan queue:work --tries=5 --timeout=60
```

`eoa:install` creates five EOA roles, a closed/draft program, and seven sourced ecosystem organizations. It creates no users or confirmed partnerships. Existing program settings and organization slugs are never overwritten. Do not run the demo seeder in production. Mail defaults to `log` locally: it does not send messages.

The frontend uses the existing same-origin `/api` proxy. Configure `NEXT_PUBLIC_API_URL` with the backend origin, `NEXT_PUBLIC_SITE_URL=https://wosool.org`, `FRONTEND_URL=https://wosool.org`, the matching Sanctum/session domains, HTTPS cookies, database, mail transport and queue. Preserve `APP_KEY`: it decrypts financial fields as well as application secrets. See [DEPLOYMENT.md](../DEPLOYMENT.md).

## Journey and states

1. Public discovery and an indicative USD/SAR eligibility check do not store revenue or promise admission.
2. Registration requires an approved bilingual local data notice. Email verification uses a signed, email-bound link expiring in 60 minutes. An EOA account does not confer Wosool network membership.
3. Verified applicants save four-step drafts on the server, including explicit currency/year. Version checks reject stale-tab overwrites. Save/continue buttons and an unsaved-change warning provide draft recovery; unsaved financial data is not put in browser local storage.
4. Applicants upload up to five PDF/JPEG/PNG documents, at most 10 MB each. Server MIME validation, generated filenames and private storage apply. Submission requires complete declarations, supporting evidence, approved/open intake and a valid deadline.
5. Submission locks the application. Staff and assigned reviewers can request information, move review forward or record an interview time/location. Information requests unlock editing. Only leadership can accept, waitlist or reject. Updates create private account notifications and queue generic emails when a sending transport is configured.
6. Local acceptance creates an onboarding record. The participant completes the checklist. Leadership records official EO enrollment and payment/sponsorship references. All three are required for the `enrolled` state. No payment gateway or EO enrollment API is simulated.
7. Enrolled participants access their cohort calendar, registration, materials, accountability group, coach details, goals, milestone progress, announcements, feedback and attendance. Registering for a session does not mark attendance. Coaches/staff record attendance after the session starts.

Review transitions are constrained in `ReviewController`. A rejection cannot be silently reversed through another review action. Requests for a new application cycle require an explicit future policy/migration; the current model maintains one application per account/program.

## Roles

| Role | Access |
| --- | --- |
| `eoa_applicant` | Own account, draft, evidence, decisions and notifications |
| Accepted/enrolled participant | Enrollment-linked access to own checklist and cohort services; no other company's application or finances |
| `eoa_reviewer` | Only assigned applications/evidence; review, information requests and interviews; no final decisions or operational settings |
| `eoa_coach` | Assigned enrolled participants' goals, reflections, feedback and attendance; no application or financial documents |
| `eoa_staff` | Program applications, reviewer assignment, operating content, inquiries and reports; no final decisions, financial confirmation or local approvals |
| `eoa_lead` / existing administrator | Final decisions, program/privacy/fee approvals, partner confirmation, financial and official-enrollment confirmation, plus staff capabilities |

Participant access is derived from `program_participants`, not a self-selectable role. Leadership/staff can also coordinate coaching. Assignments must refer to existing verified accounts with the appropriate role. No privileged account is seeded. An authorized operator can provision the initial lead using Tinker, after checking the exact account and preserving an audit record:

```php
$actor = App\Models\User::where('email', 'EXISTING_ADMIN_EMAIL')->firstOrFail();
abort_unless(App\Services\Eoa\Access::lead($actor), 403);
$user = App\Models\User::where('email', 'VERIFIED_LEAD_EMAIL')->firstOrFail();
abort_unless($user->hasVerifiedEmail(), 422);
$user->assignRole('eoa_lead');
App\Models\AdminAction::log($actor->id, 'eoa.role_grant', 'user', $user->id, null, null, ['role' => 'eoa_lead']);
```

Replace placeholders; do not mark an unverified address verified merely to bypass the workflow. Staff/reviewer/coach roles use the same controlled process. Revoke roles with `removeRole`, audit the change, and revoke active sessions when removing access.

## Administration and publication

`/EOA/admin` supports review, reviewer assignment, interviews, enrollment, cohort/session/group/material/announcement creation and editing, partner relationship confirmation, bilingual local content, inquiries, reporting and the audit trail. The coach workspace is `/EOA/coach`. Contact/partner inquiries use the existing contact table with an EOA subject prefix; marking one handled does not send an email.

Local settings are draft by default. Administrators must supply approval references rather than simply infer approval from the existence of code:

- Program approval, start date and application deadline.
- Annual local operating fees, annual sponsorship and participant contributions, explicitly in USD. Global US$1,750 is separate; approved contributions must balance the sum of global and local fees. No proposed local amount is seeded.
- Participation terms in both languages and a real public contact address.
- A versioned bilingual local data notice: controller identity/contact, processing grounds and purposes, service providers/locations, rights, retention by category, destruction/backup handling, and approval evidence. Registration, saving financial drafts and document collection stay unavailable until this notice is approved. Opening intake additionally requires program approval and a sending mail driver. A configured driver is not evidence of delivered email.
- Public messages in both languages. Core official facts are version-controlled with their sources.

No launch date, cohort count, sponsor or funding arrangement is inferred. Planning targets are 10–15 qualified participants before launch and at least 25 within two years. Investment discussions remain separate from admission and participation.

The partner strip follows the hero and renders only records with a verified organization, confirmed relationship, approval evidence and an available official logo. It preserves supplied order, artwork and proportions, provides official links and accessible names without visible captions, pauses on focus/hover and respects reduced motion. A hidden strip with no confirmed records is intentional. The public ecosystem directory is separately labeled and is not a partnership claim.

## Data, privacy and recovery

The additive migration extends existing program applications and participants and adds groups, reviewer assignments, private-document metadata, account notifications, session registrations and a separately sourced ecosystem directory. Financial application data and enrollment-finance records use Laravel encrypted casts and are hidden from generic serialization. Downloads recheck ownership/assignment. Private responses use `no-store`; account routes are excluded from indexing.

Documents are stored under `storage/app/private/eoa`, never the public storage link. Use persistent storage with restrictive OS permissions, encrypted volumes/backups, TLS and a tested restore process. Application-field encryption does not encrypt uploaded files on disk. Do not expose private storage in the web server configuration. No antivirus service is bundled; adopt the operator's approved scanning/quarantine procedure before collecting real documents where required.

Set PHP `upload_max_filesize` and the proxy request-body limit to at least 10 MB (for example 12 MB), and `post_max_size` high enough for multipart overhead (for example 16 MB). An attachment is uploaded in its own request. Hosting limits lower than the application's limit must surface a clear upload error and be corrected before collecting evidence.

Material administrative actions record actor, entity, action and relevant status/settings in `admin_actions`. Application financial values, uploaded documents and applicant-facing review messages are not copied to logs or generic email bodies. Configure production logging with `APP_DEBUG=false`, protect logs, monitor application errors and failed jobs, and avoid request-body logging at the proxy.

No production database access was available during implementation. Existing live records were not mass-edited or deduplicated. The researched import uses unique slugs and preserves existing rows; any future corrections must be reviewed with a before/after export, provenance and a reversal plan. Production fallback fictional founder/company/partner/sponsor/news data is disabled. The separately labeled fictional entrepreneurs showcase remains an existing unrelated fixture, not an EOA prospect database.

Back up the database, `storage/app/private/eoa`, and the encryption key securely as a consistent set. Test restoration in an isolated environment. The EOA schema migration has a `down()` method, but using it destroys EOA-specific data: close intake, preserve writes and take backups first. For an application rollback, prefer deploying the previous release while retaining additive tables. The repeatable research import is not an automatic data-deletion command; remove only its exact new slugs after confirming there are no local edits or dependencies. Do not delete existing program or user rows to undo an import.

## Release and validation

1. Record the current live SHA and back up the database/private files/key. Review migrations on the actual production engine.
2. Deploy the backend release, install locked dependencies, run `php artisan migrate --force`, then `php artisan eoa:install`. Preserve existing `.env` and files. Cache configuration/routes after setting production values.
3. Build/deploy Next.js with the correct origins. Run its Node server through the existing process manager. No static export is supported.
4. Start/supervise a Laravel database queue worker and restart it on every release. Inspect `php artisan queue:failed`; retry only after diagnosing transport/configuration errors. Test a real verification email, password reset and submission notification in staging.
5. Provision verified leadership access. Approve local program/data/fee terms, confirm only documented partners, and assign reviewers/coaches. Keep intake closed until these checks pass.
6. Verify `https://wosool.org/EOA`, `/EOA/account`, the same-origin API, both languages and phone layouts. Run the checklist below on the deployed release, record its SHA and results, then open intake.

| Critical check | Automated coverage | Required deployed check |
| --- | --- | --- |
| Verification | Signature, expiry, email binding, write gating and network isolation | Delivery, proxy signature URL and cookie/session behavior |
| Drafts | Encryption, ownership, stale version rejection | Save, sign out/in, reload and mobile keyboard usability |
| Submission | Approval/deadline/state, required fields/evidence, consent version, notification | Real email delivery, queue retry and private attachment download |
| Review | Assigned-only access; lead-only decisions; information request, interview, waitlist/reject and acceptance | Reviewer handoff and private interview details |
| Onboarding | Checklist, payment/official references, cohort isolation and coach boundaries | Real operational references and approved terms |
| UI | Types, lint and production build; Arabic/English components and RTL CSS | Keyboard, screen reader, 375/768/1440 px, RTL/LTR, reduced motion |

Run repository `npm run verify` plus the CI dependency audits. Database tests use SQLite; they do not certify MySQL/PostgreSQL or a hosting environment. Browser screenshots, actual mail delivery, real payments, official EO integration and deployed host health must not be inferred from passing automated tests.

## Remaining external dependencies

- Hosting access to deploy both applications, database migration permissions, persistent private storage, backups and a supervised queue.
- Real sending credentials/domain verification and delivery testing; no live payment gateway, EO API, calendar service, analytics or monitoring vendor was added.
- Approved local program launch, annual fees/sponsorship, participation/privacy terms, operating arrangements and partnership evidence.
- CODE's approved standalone logo asset; its organization identity is verified, but the public hero photograph is not a logo. Other prepared assets have source records.
- Visual/browser, production database, mail delivery and disaster-recovery checks in the target environment.

See [EOA-RESEARCH.md](EOA-RESEARCH.md) for the factual corrections, citations and asset inventory.
