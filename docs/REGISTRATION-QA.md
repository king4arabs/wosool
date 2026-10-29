# Registration QA and administrator provisioning

This runbook separates repository validation, production deployment, actual email delivery and privileged access. None substitutes for another.

## Current production evidence — 30 October 2026

| Check | Observed result |
| --- | --- |
| `/register` renders in a real browser | Passed; Arabic form, password guidance and consent controls visible |
| Requested QA identity | Name `Admin Wosool`, email `admin@wosool.org`; name/email prepared in the browser |
| Account creation | Not submitted by this QA run; secure signup handoff required |
| OTP route through website | `POST /api/v1/auth/registration/verify` with empty JSON returns 404 |
| Earlier direct/proxy checks | Verify, resend and application routes return 404; old registration validation lacks consent |
| OTP inbox access | Connected mail account does not include the requested mailbox |
| Actual delivery and verification | Not proven; no OTP retrieved or entered |
| Admin promotion | Not performed; conditional on verified account and successful live QA |

Do not record passwords, OTPs, session cookies or private message bodies here. The owner's requested password must not be committed or printed. Before privileged use, replace any shared test password with a private, unique password through the account's secure password flow.

## Deployment prerequisites

1. Follow [DEPLOYMENT.md](../DEPLOYMENT.md). Record frontend/backend source SHAs and back up the production database. Preserve keys, records, uploads and mail secrets.
2. Release the current Laravel backend, run additive migrations, clear/rebuild configuration and route caches, and confirm both `/api/v1/` and `/v1/` registration routes.
3. Confirm HTTPS, stateful origins, secure encrypted sessions and a delivering mail transport. Registration rejects log/array transports. SMTP acceptance alone does not prove inbox delivery.
4. Run `node scripts/production-smoke.mjs` from the repository. All 16 probes must pass. Empty bodies and guest requests do not create accounts or send messages. General liveness/readiness alone is insufficient.
5. Connect only the intended QA mailbox through an authorized mail connector. Do not search unrelated mailboxes or forward OTPs elsewhere.

## Live acceptance sequence

Use a controlled inbox, test both Arabic and English, and check narrow/mobile and desktop layouts. Save non-sensitive screenshots and timestamps where useful.

| Step | Expected result |
| --- | --- |
| Enter account details and consent | Clear required-field/password validation; no duplicate request while submitting |
| Submit once | 201 and onboarding screen; no public/member/admin access automatically granted |
| Observe delivery | Real message received in the intended inbox; branding and code readable |
| Enter one wrong code | Clear localized error; attempt recorded; no verification or privilege change |
| Resend after one minute | New message received; previous code invalidated |
| Enter newest code | Email verified; profile form displayed; code cannot be reused |
| Reload and sign out/in | Session persists correctly; workflow resumes at the appropriate step |
| Submit a real founder profile, if applicable | Review state; no fabricated company or financial facts published |
| Approve a genuine member application | Active member workspace and public founder card; private contact data remains hidden |
| Open admin routes as ordinary member | Access denied |
| Grant approved administrator role | Only after successful verification and explicit owner authorization; fresh login accesses `/admin` |

An operations administrator does not need a fabricated founder/company application. Keep founder publication separate from a server-authorized admin grant. If the email already exists, use authorized sign-in/recovery; do not overwrite an existing account or create duplicates.

## Admin provisioning

Run only from the correct deployed backend through protected server access. The owner must authorize the target and the live registration/verification checks must already pass. No public endpoint performs this operation.

```sh
# Inspection only: no account or role changes.
php artisan wosool:admin admin@wosool.org

# After verification, QA and explicit owner authorization:
php artisan wosool:admin admin@wosool.org --grant --reason=APPROVED_CHANGE_REFERENCE
```

The command refuses missing/ambiguous accounts and unverified email, requires a non-sensitive change reference, preserves existing roles/passwords and is idempotent. It never marks email verified or sends a code. A committed grant logs the user ID and change reference through Laravel's configured logger. Retain that log with the operator's hosting audit trail; use a ticket ID, never a password or message body, as the reference.

Verify with a fresh sign-in, confirm the intended identity and `/admin` access, and ensure ordinary-user accounts remain denied. The command does not terminate other active sessions. Review sessions and require a unique private credential before using a formerly shared QA account for administration. MFA and edge access restrictions remain separate hosting/application work.

## Failure diagnosis

| Symptom | Next check |
| --- | --- |
| OTP/application endpoint 404 | Wrong/older backend release or stale route cache; do not disable verification |
| 419 | CSRF cookie/header, same-origin rewrite, session domain and stateful origins |
| 401 after signup | Session persistence/cookie delivery; resume through sign-in, not another registration |
| 422 | Show field errors; duplicate email requires sign-in or password recovery |
| 429 | Respect cooldown and rate limits; do not loop resend |
| 503 or mail failure | Real mail transport/sender/credentials and server logs; avoid exposing secrets |
| Slow or uncertain submission | Do not replay automatically; inspect the existing session/account before retrying |
| Admin 403 with `email_unverified` | Complete genuine OTP verification; never bypass it with a database timestamp |

## Automated coverage

- `MembershipRegistrationTest`: canonical/mounted signup, OTP, session resume, application state, expiry, attempts, resend, rollback on delivery failure and approval boundaries.
- `AdminProvisioningTest`: read-only inspection, missing-account refusal, verified-email requirement, idempotent grants, preserved roles/credentials, rejected public privilege injection and private onboarding headers.
- `frontend/scripts/check-member-onboarding.mjs`: Arabic/English mobile/desktop signup, wrong-code recovery and profile review with isolated API fixtures. These browser fixtures do not prove SMTP delivery.
- `scripts/production-smoke.test.mjs`: monitoring detects missing routes and old registration validators.
- CI runs dependency audits, frontend build/types/lint/tests, browser checks and backend tests on the supported PHP patch branches. Store final run and deployed revisions with release evidence.
