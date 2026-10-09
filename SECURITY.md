# Security policy

## Reporting a vulnerability

Report security issues privately to the repository owner using GitHub private vulnerability reporting when enabled. If that feature is unavailable, use the contact form at https://wosool.org/contact to request a private reporting channel. Do not include exploit details, credentials, personal data, or reset tokens in public issues.

## Implemented controls

- Laravel Sanctum sessions and backend member/admin authorization.
- Form Request validation and throttling for public submissions, login, registration, and password recovery.
- Same-origin CSRF token handling in the shared frontend API clients.
- Laravel password broker with hashed, expiring, single-use reset tokens and generic request responses. Successful recovery rotates remember tokens and revokes database-backed sessions.
- Local-only demonstration seeding and idempotent local application-key preparation.
- Company ownership checks and soft deletion; event visibility filtering and ended-event registration rejection.
- Security response headers and no-index headers on account, member, and administrative pages.
- Lockfiles, frontend production-dependency auditing in CI, and backend regression tests.

## Operating requirements

Keep `APP_DEBUG=false` and HTTPS enabled in production. Store secrets outside source control, preserve `APP_KEY`, use least-privilege database accounts, configure a real mail provider, and restrict trusted hosts/proxies at the web server. A frontend redirect or robots exclusion is not an authorization control.

The public repository includes known demonstration credentials inside development seeders. Never provision those accounts in production. Review any existing installation separately; the production seeder guard does not remove accounts that were created earlier.

Do not log application bodies, credentials, or password reset URLs. Configure monitoring, backups, recovery procedures, and retention controls for founder/application data. This document is an implementation guide, not a compliance certification.

## Dependency maintenance

Run `npm --prefix frontend audit --omit=dev` and `composer --working-dir=backend audit` for releases. Review development-tool advisories separately, and update dependencies through tested, compatible changes. Never force a framework downgrade merely to obtain a clean audit output.

See [the October review](docs/REVIEW_2026-10-08.md) for the current audit and validation limitations.

## Accelerator gateway

Verified email, owner/reviewer/admin boundaries, strict status transitions, revision checks and internal-note filtering protect application records. New applicant profiles remain private; community membership is a separate grant. Application APIs send private/no-store and noindex headers. Verification links are account-bound, signed and expire after 60 minutes. New application accounts require 12-character mixed-case/numeric passwords.

Production intake defaults closed until the approved privacy notice, controller/contact, retention and processor register are in place. Privacy requests have an administrative review workflow; deletion/export and retention policy decisions are operational obligations, not automatic effects of changing a request status. See [gateway operations](docs/ACCELERATOR_OPERATIONS.md).
