# EO Riyadh Accelerator on Wosool

**Wosool.org remains “Founders to Founders,”** the main founder-community website and membership journey. **Wosool.org/EOA is the digital gateway for EO Riyadh Accelerator**: “Saudi Founders. Global Connections. Extraordinary Growth.” Public Accelerator pages, accounts, applications, administration, coaching and recovery pages live under **`/eoa`**, using the canonical lowercase path. The dedicated applicant/participant workspace is **`/dashboard/eoa`** and does not require Wosool founder-network membership. Legacy uppercase `/EOA/...` redirects to the canonical lowercase path. A navigation link connects the two experiences; community membership does not confer Accelerator admission.

EO Riyadh provides chapter leadership and governance. EO Accelerator provides the applicable program framework. Wosool supports discovery, applications, coordination and participant services. Operating partners deliver only their approved scope. Mohammed Alsolami is identified as EO Riyadh Membership & Accelerator Chair, as supplied by project leadership. Application, local acceptance, official Accelerator enrollment and subsequent EO membership are distinct events.

## Architecture and setup

The October 9 integration repair makes this the authoritative operating guide. Older gateway writes are retired; legacy applications/events remain preserved and require reviewed transfer if present. See [integration and deployment notes](EOA-INTEGRATION-2026-10-09.md). Applicant data-rights requests are available in `/eoa/account`; existing administrators review them at `/admin/privacy-requests`, with audited status changes.

The existing Next.js 16 / React 19 frontend, Cairo typography, locale provider, Laravel 13 API, Sanctum sessions and Spatie roles are reused. Public components are in `frontend/src/components/eoa`; routes are in `frontend/src/app/eoa`. The API is registered by `backend/routes/eoa.php` at `/api/v1/eoa`. Laravel controllers/services enforce authorization; UI visibility is not a security boundary.

The normal README setup runs the installer. To repeat it or prepare an existing checkout, run from `backend/`:

```bash
php artisan migrate
php artisan eoa:install
php artisan queue:work --tries=5 --timeout=60
```

`eoa:install` creates five EOA roles, a closed/draft program, and nine sourced ecosystem organizations and eleven poster-sourced board members. It creates no users or confirmed partnerships. The owner-supplied 2026/27 board is published with its explicit term; later admin edits survive repeat installations. Existing program settings and organization slugs are never overwritten. Do not run the demo seeder in production. Mail defaults to `log` locally: it does not send messages.

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

Participant access is derived from `program_participants`, not a self-selectable role. A verified existing Wosool platform administrator uses **EOA administration → Team access** to search existing accounts and grant/revoke EOA lead, staff, reviewer and coach roles. Changes are audited; the endpoint accepts only these EOA roles and preserves all other account roles. Unverified accounts cannot receive new EOA privileges. EOA leads and staff cannot grant themselves or others privileges through this screen. Role checks run on subsequent API requests, so revocation removes the corresponding access even if reviewer assignments remain.

**Admission tracks** are managed by EOA leads and platform administrators. Each has Arabic/English names/descriptions and an availability flag. The installer creates one standard EO Riyadh Accelerator track only if the program has none; it does not overwrite locally configured tracks. Applicants select an active preferred track, and leadership must select an active track belonging to the same program when accepting an application. The accepted track is stored on the application and participant and shown in the Wosool EOA dashboard. Cohorts and accountability groups remain separate operational assignments. Closing a track to new applications preserves existing assignments.

## Administration and publication

`/eoa/admin` supports review, reviewer assignment, interviews, enrollment, cohort/session/group/material/announcement creation and editing, partner relationship confirmation, bilingual local content, inquiries, reporting and the audit trail. The coach workspace is `/eoa/coach`. Contact/partner inquiries use the existing contact table with an EOA subject prefix; marking one handled does not send an email.

Local settings are draft by default. Administrators must supply approval references rather than simply infer approval from the existence of code:

- Program approval, start date and application deadline.
- The annual EOA journey is US$4,000 in total, including the existing US$1,750 global fee and US$2,250 local fee. A US$2,000 sponsor contribution (half) and US$2,000 participant contribution are planned, but sponsors and funding remain TBD. Leadership must confirm funding before approving the split; no sponsor or approved payment obligation is seeded.
- Participation terms in both languages and a real public contact address.
- A versioned bilingual local data notice: controller identity/contact, processing grounds and purposes, service providers/locations, rights, retention by category, destruction/backup handling, and approval evidence. Registration, saving financial drafts and document collection stay unavailable until this notice is approved. Opening intake additionally requires program approval and a sending mail driver. A configured driver is not evidence of delivered email.
- Public messages in both languages. Core official facts are version-controlled with their sources.

No launch date, cohort count, sponsor or funding arrangement is inferred. Planning targets are 10–15 qualified participants before launch and at least 25 within two years. Investment discussions remain separate from admission and participation.

The partner strip follows the hero, includes the supplied EO Riyadh chapter artwork, and renders additional partner records with a verified organization, confirmed relationship, approval evidence and an available official logo. It preserves supplied order, artwork and proportions, provides official links and accessible names without visible captions, pauses on focus/hover and respects reduced motion. When no additional partnerships are confirmed, only EO Riyadh is shown; no research-directory relationship is inferred. The supplied transparent EO logo is framed to its visible bounds in CSS without modifying its pixels. Movement has an explicit pause control. The public ecosystem directory is separately labeled and is not a partnership claim.

`/eoa/perks` describes common accelerator benefits publicly, but actual provider offers, logos and details are served only to verified enrolled participants with official enrollment confirmation. Leads can draft and approve offers under **EOA administration → Perks**, after confirming the provider relationship, logo and offer approval evidence. Unapproved offers never appear in the participant API. The public ecosystem directory uses its own read-only endpoint so that an unavailable program record does not prevent directory loading; deploy migrations and run `eoa:install` to populate the sourced organizations. It preserves supplied order, artwork and proportions, provides official links and accessible names without visible captions, pauses on focus/hover and respects reduced motion. When no additional partnerships are confirmed, only EO Riyadh is shown; no research-directory relationship is inferred. The supplied transparent EO logo is framed to its visible bounds in CSS without modifying its pixels. Movement has an explicit pause control. The public ecosystem directory is separately labeled and is not a partnership claim.

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
6. Verify `https://wosool.org/eoa`, `/eoa/account`, the same-origin API, both languages and phone layouts. Run the checklist below on the deployed release, record its SHA and results, then open intake.

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

See [the October 9 reliability and EOA release notes](WOSOOL-RELIABILITY-EOA-2026-10-09.md) for current verification results.

## Board and editorial management — October 11 release

See [the board release guide](EOA-BOARD-RELEASE-2026-10-11.md). The board and editorial tabs are in `/eoa/admin`; the public board is also shown on `/eoa/leadership`. Board photos are public assets, separate from private applicant documents. After deploying Laravel, run `php artisan storage:link` for uploaded portraits. Next.js proxies only `/storage/eoa/board/*` to that public backend directory. Never expose the private EOA document store.

The supplied EO logo is used unmodified on dark backgrounds. The included Riyadh WebM/MP4 video is 14 seconds, muted and optimized; a still from the same licensed clip remains visible when reduced motion is enabled or playback fails. Environment variables may override the media. Source and license details are in [the media register](research/EOA-SOURCES-2026-10-11.md).

## Mentor management and responsive journeys

See [the founder and mentor guide](FOUNDERS-MENTORS-2026-10-11.md). The **Mentors** operations tab manages bilingual profiles separately from private participant/coach assignments. Public cards appear on `/eoa`, `/eoa/mentors` and leadership after confirmed appointments are published. There is no invented initial mentor roster. Public portrait storage is restricted to `/storage/eoa/mentors/*`, with the same secure raster upload limits as board portraits. Deploy the additive mentor migration before using its admin endpoints.

## Management overview and responsibilities — October 11 enhancement

The default `/eoa/admin` overview now shows actual application counts, review ownership, reviews unchanged for 14 days, onboarding, assignment gaps, verified coaching coverage, cohort capacity, upcoming sessions and goal completion. These are operational indicators, not admission decisions or independently verified business performance. Missing summary support is explicitly reported during mixed-version deployments.

Operations staff can assign a participant to a cohort and accountability group through the dedicated assignment endpoint. It validates program boundaries, group/cohort consistency, active cohort status and capacity, preserves financial/enrollment data, and records the change. Only leadership receives participant finance in the operations response and can confirm fees or official enrollment. Application search remains restricted to the reviewer's assigned applications.

The access guide explains applicant, enrollment-derived participant, reviewer, coach, staff, lead and platform administrator access. Team-access edits send the expected role set to detect concurrent changes and collect an audit reason. Existing API callers without the expected role set remain compatible; the new interface always sends it. Revoking access from an unverified account is allowed; granting new access remains blocked. Public board and mentor publication never grants an account role.

Participant goals can be organized under Cash, Strategy, People or Execution, with a measurable outcome and target date. Progress summaries distinguish recorded attendance from session registration. Coaches receive only sessions in their participants' cohorts that have started and are not cancelled; the server also rejects attendance for cancelled sessions or inactive enrollment.

Design references checked October 11, 2026:
- EO Accelerator FAQ: https://eonetwork.org/accelerator/faqs/ — learning pillars and monthly accountability.
- EO coach handbook: https://resources.eonetwork.org/legacy-knowledgebase/eo-accelerator-coach-handbook — measurable goals and progress reviews.
- OWASP authorization guidance: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html — server-side checks and restricted access.

This enhancement needs no new migration. Deploy Laravel and Next.js together; live email delivery and production backend health still require host verification.

Protected post-login destinations are loaded with the new session cookie, preventing a prefetched guest redirect from sending a signed-in participant back to login. Local verification covered 50 frontend tests, the existing 39 Accelerator-related backend tests, and 5 additional management/authorization tests. Production backend health remains a separate deployment gate.

## Authoritative local cohort model — October 11, 2026

Per the owner's updated direction, the Riyadh delivery model is **six months of coaching, training and prestigious activities**, with **new cohort rounds every six months**. This supersedes earlier two-year duration and annual learning-day descriptions on Wosool. Exact launch dates and calendars remain admin-managed, not automatically invented. The public API exposes this local model separately from sourced global eligibility/fee facts.

After cohort graduation, founders join the alumni program for continued coaching, activities, follow-ups and support toward **US$1 million in annual revenue**. Participants, founders and alumni may qualify to apply to EO once they satisfy all EO joining requirements and complete EO/chapter admission. Graduation, reaching the revenue target, and EO membership are separate milestones; this application never grants EO membership automatically. Membership reference: https://eonetwork.org/one/join-eo.

The public `/eoa/alumni` page, homepage, program journey and FAQs explain the model in Arabic and English. Core duration/membership FAQ answers take precedence over older copies of those answers in the editorial snapshot. Other custom FAQs are preserved. Annual fee references retain their original period: a six-month cohort does not imply automatic fee proration or a new approved price.

Leadership records graduation under **Graduation & alumni** after a dated cohort has run six calendar months and its recorded end date has passed. A graduation reference, next follow-up date and support plan are required. No participants are automatically graduated or bulk-updated. Status becomes `alumni`; the graduation date is preserved on later follow-ups. Alumni keep their cohort-scoped sessions, resources, goals and assigned coaching. Application status, financial confirmation and account roles are preserved; no EO membership role is granted. The ordinary enrollment editor cannot silently revert a graduate.

New dated cohorts without an end date default to six calendar months using month-end-safe arithmetic. Existing cohort dates are preserved. Operations can schedule `prestigious_activity` and `alumni_follow_up` sessions. Graduation details use the existing onboarding JSON and completion timestamp; no schema migration is required. The participant response exposes the support plan and follow-up date, but not the internal graduation reference or recording actor.
