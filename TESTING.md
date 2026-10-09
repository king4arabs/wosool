# Testing

## Automated checks

From the repository root after local setup:

```bash
npm run verify
```

The command runs ESLint, TypeScript, frontend regression tests, Laravel tests, the entrepreneur dataset validator, and both production builds. CI is defined in `.github/workflows/ci.yml`; workflows nested under `backend/.github/` are not executed by GitHub for this monorepo.

| Coverage | Purpose |
| --- | --- |
| Frontend session requests | CSRF cookie decoding/bootstrap, custom headers, same-origin token handling |
| Authentication navigation | Reject external, script, malformed, and looping redirects |
| Event dates | Expired/invalid dates, ongoing events, ordering, and timezone-independent boundaries |
| Backend authentication | Registration eligibility, login, role boundaries, account recovery and rate limiting |
| Password recovery | Real notification dispatch through the broker, frontend link origin, password validation, expired and single-use tokens |
| Public/member/admin API | Submission validation, profile/company ownership, event RSVP, program applications, settings, moderation and authorization |
| Dataset validation | Explicitly fictional entrepreneur profiles and avatar/data constraints |

The Laravel suite uses in-memory SQLite and the array mail driver. Notifications are faked in password tests; running the tests does not send user email. Positive member fixtures use `User::factory()->member()`; an ordinary factory user must remain forbidden from member endpoints.

The production dependency checks are:

```bash
npm --prefix frontend audit --omit=dev --audit-level=high
composer --working-dir=backend audit
npm --prefix backend audit --audit-level=high
```

## Manual release checks

- Public homepage and content links at mobile, tablet and desktop widths.
- Arabic/English navigation, RTL/LTR alignment, keyboard-only use, focus visibility, Escape to close the mobile menu, and reduced-motion settings.
- Application/contact validation errors preserve entered data and never claim success when the API fails.
- A real staging account can log in, navigate, log out, request a reset email, and use that link once.
- Upcoming/past event dates use Riyadh time; registration is rejected after the event ends.
- Backend API outage gives an actionable event error/empty state and does not create fictional homepage membership evidence.
- Canonical URLs, crawler exclusions, sitemap, and production asset delivery.

Build and unit-test success do not establish browser rendering quality, actual SMTP delivery, or successful production deployment. Record those checks separately.

## EO Accelerator regression coverage

`AcceleratorGatewayTest` covers verified account creation, signed account-bound/expiring verification, private server-saved drafts and revision conflicts, complete review/information-request/onboarding lifecycle, assigned reviewer and final-decision boundaries, cohort isolation, configured eligibility, import preview/idempotency/editorial locks, partner approval, public resource privacy, privacy request handling, private cache headers/readiness, participant resources/mentors/milestones/attendance, notification completed-delivery deduplication and paused intake. Tests use in-memory SQLite with notification/mail fakes or mocks; no real applicant email is sent.

Frontend gateway tests validate signed verification path handling. See [the release report](docs/EO_ACCELERATOR_RELEASE_2026-10-08.md) for actual results and [browser acceptance](docs/ACCELERATOR_OPERATIONS.md#browser-acceptance-gate) for the remaining hosted visual/email checks.
## EO Accelerator

`backend/tests/Feature/EoaPlatformTest.php` exercises verification/signature expiry, network isolation, private/versioned/encrypted drafts, required evidence and consent, scoped document/reviewer access, decisions and notifications, onboarding and official/fee confirmation, coach/cohort isolation, privacy/publication approvals, operational edits and inquiry handling. `frontend/src/lib/eoa.test.ts` checks USD/SAR eligibility boundaries, including the incorrect SAR250,000 equivalence and the US$1m progression boundary.

See [the EOA verification matrix](docs/EOA.md#release-and-validation) for required browser, real mail, production-engine and deployment checks. API tests use faked notification delivery and SQLite; do not report them as live integration tests.
