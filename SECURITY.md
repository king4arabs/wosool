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

## 22 October 2026 hardening

- Composer install/update preflight rejects unpatched upstream PHP versions; CI covers patched 8.3, 8.4 and 8.5 runtimes.
- Production session cookies default to Secure when no explicit environment override exists. Local HTTP development remains supported; keep `SESSION_SECURE_COOKIE=true` in production.
- Canonical and Hostinger-mounted auth/member/admin API responses use private/no-store and noindex headers, including middleware-handled error responses. Public APIs retain their cache policy. API responses receive nosniff and a restrictive referrer policy.
- Regression tests cover private/public caching and patched PHP version boundaries.

Review scope: runtime floors, locked PHP dependency advisories, API response headers and session-cookie defaults. This is not a full penetration test or a guarantee that no security issues remain. The 124 locked Composer packages had no matching advisories in the Packagist advisory feed checked on 22 October; Composer's native audit remains required in CI. PHP/Composer were unavailable in the editing workspace, so PHPUnit execution must be confirmed in CI. See DEPLOYMENT.md for the observed live runtime and hosting steps still required.


## Registration and privileged access

Registration OTPs are HMAC-hashed, bound to the account and email, expire after ten minutes, allow five wrong attempts and are consumed on success. Resend rotates the challenge after a one-minute cooldown. Public registration ignores submitted roles, admin flags and verification timestamps. Registration responses, onboarding API data and the onboarding page have private/no-store and noindex protections; these complement authorization, not replace it.

Admin API access requires both an admin role (or supported legacy admin role token) and verified email. Before rolling this change out, audit existing administrator verification state through protected hosting access; unverified administrators must complete genuine email verification. Do not populate verification timestamps to avoid the check.

`php artisan wosool:admin EMAIL` is read-only inspection. An explicit `--grant --reason=CHANGE_REFERENCE` requires exactly one existing, verified account and adds only the admin role, preserving other roles and credentials. It neither creates accounts nor verifies email. Grants record the user ID and non-sensitive change reference in the configured application log after commit. Restrict shell access and protect/retain those logs with hosting audit records. The command does not revoke existing sessions or implement MFA; require a private unique password and use a fresh sign-in to verify the approved grant. Never reuse a password disclosed in a chat as a long-term administrator credential.

See [registration QA and operational gates](docs/REGISTRATION-QA.md). Hosted WAF, MFA, SMTP delivery and production deployment require separate operational verification; this change does not claim they are enabled.
