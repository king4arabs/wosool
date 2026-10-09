# Wosool reliability and EO Riyadh Accelerator — 9 October 2026

## Delivered changes

| Surface | Behavior and implementation |
| --- | --- |
| Shared UI | Cairo Variable for Arabic and English, including Tailwind's sans family; clearer small text, usable form/touch targets, RTL/LTR alignment, responsive member/admin navigation and accessible dialogs. |
| Public directories | Founder/company profile destinations now exist. Founder, company, program, partner, sponsor and news collections have loading/error/retry and additional-page access. Program categories filter actual content. |
| Member discovery | Founder search uses the real paginated endpoint; introduction requests use the existing reviewed workflow. Header search and notifications lead to real destinations. |
| Sessions | A failed account check offers retry without incorrectly forcing onboarding or logging out. CSRF renewal retries only a 419 once; timeouts and server failures do not automatically replay writes. |
| Community | Feed pagination, shared-post destinations, save/unsave, touch/keyboard reactions and action failure feedback. Explanatory AI marketing copy removed from affected product screens. |
| Messaging | Newest history first, older-page loading, per-conversation drafts preserved after errors, confirmed sends, polling without a broker, realtime deduplication, mobile conversation navigation and room-bound references. Closed rooms and inactive participants cannot send. Broker failure cannot reverse an already persisted send. |
| Administration | Live match suggestions replace fake records. Event registration/attendance screens replace placeholder tabs. Program participants, progress and session attendance use the existing APIs. |
| EOA discovery | Requested hero message, supplied EO Riyadh logo, right-moving partner rail with pause/reduced-motion support, curriculum, eligibility, learning rhythm, application journey, track cards and FAQs. A three-part EOA infographic links from the Wosool homepage. |
| EOA applications | Preferred active track saved with the application; leadership confirms an active program-scoped track at acceptance. The accepted track appears in the applicant's `/dashboard/eoa` workspace and participant record. |
| EOA roles | Verified platform administrators search existing accounts and grant/revoke only `eoa_lead`, `eoa_staff`, `eoa_reviewer`, `eoa_coach`; unrelated roles are preserved and every change is audited. Leads manage tracks but cannot grant roles. |

Wosool's community homepage remains separate from EOA. `/eoa` redirects to the canonical `/EOA`. The EOA dashboard does not require community founder approval; protected EOA APIs retain their own ownership, verification and role checks.

## API and database changes

- New additive migration: `2026_10_09_120000_add_eoa_tracks.php` creates `eoa_tracks`, and nullable `eoa_track_id` references on applications/participants. Existing applicant data is not rewritten.
- `eoa:install` adds one standard track only when the program has no tracks. It does not approve intake, fees, privacy terms, partnerships or users.
- `GET /api/v1/eoa/program` includes published active tracks.
- Application saves accept `preferred_track_id`; complete submission requires an active track from this program. Existing submitted applications can be reviewed; acceptance requires an explicit `track_id`.
- Existing EOA operations create/update endpoints accept type `tracks`, restricted to leadership.
- `GET /api/v1/eoa/operations/accounts` searches/paginates existing accounts; `PATCH .../accounts/{account}` accepts the explicit EOA role set. Both require a verified platform administrator.
- `POST /api/v1/admin/matches` creates an audited suggestion between distinct active founders and rejects duplicate active pairs.
- Chat history is now newest-first at the API boundary. The updated frontend orders visible history chronologically and merges older pages. Deploy both applications together.
- `/broadcasting/auth` is proxied same-origin with the same session/CSRF handling.

## Verification

The local environment was provisioned with an isolated PHP 8.3 CLI and the repository's locked Composer dependencies; no system PHP installation or production database was modified.

- Backend: **103 tests passed, 564 assertions**, including EOA registration/submission/review/onboarding, track selection, role boundaries/revocation, chat persistence/authorization and admin match creation.
- Frontend: **14 regression tests passed**, ESLint without warnings, TypeScript, entrepreneur-data validation and production Next.js build.
- Composer audit and frontend production dependency audit: **no reported vulnerabilities** at verification time.
- Chromium: **160 route/language/viewport checks** across 390, 768, 1280 and 1440 px, with Cairo loaded, correct document direction and no document-width overflow. A final focused pass repeated the changed landing and conversation screens at phone/desktop widths.
- Browser workflows use intercepted fixture APIs: introductions, failed-send draft retention, retry/deduplication, account-outage recovery, EOA dashboard access, preferred-track saving, team role assignment, track creation and acceptance into a selected track passed in Arabic and English. API/database authorization and persistence are covered separately by Laravel tests.

These checks do not represent live mail delivery, production load testing, the actual production database engine, or deployed-host acceptance.

## Deployment

Repository CI does not deploy. Hosting tools were unavailable during this work, and no production deployment is claimed.

1. Back up the existing database, private storage and `APP_KEY`; preserve existing secrets and live records.
2. Deploy matching backend/frontend artifacts, install the committed locks, run additive migrations and `php artisan eoa:install`.
3. Rebuild caches/restart workers and Node processes using the existing host's procedure.
4. In EOA administration, configure tracks, confirm actual partners and assign verified team accounts. Publish only approved local dates, fees, privacy/participation terms and intake availability.
5. Verify registration email delivery, document privacy, an application through acceptance, accepted-track display, role revocation, sessions and both languages on the actual host.

Partner artwork is displayed unchanged. Transparent EO logo margins are cropped by its CSS frame; the source bitmap is not edited. Additional partner logos come from confirmed, verified organization records with artwork. No missing CODE artwork or uncertain RIDA identity is invented.

Program facts were checked against EO's official [Accelerator FAQ](https://eonetwork.org/accelerator/faqs/) on 9 October 2026. The supplied hero statement describes the growth goal; reaching it does not automatically confer EO membership.
