# EO Accelerator integration repair — 2026-10-09

## What changed

Main commit `1c2f87e` combined PRs #17 and #18 with duplicate PHP declarations, malformed TSX, duplicate metadata/types and two writable workflows sharing the same program/application rows. The integration repair restores one canonical `/EOA` journey while preserving ecosystem, community, editorial and historical records.

- Repaired User, membership middleware, password-reset URL, homepage, navigation, metadata, sitemap, robots and public program serialization conflicts.
- `/accelerator` and its application page redirect to `/EOA`; `/review` and `/admin/accelerator` redirect to `/EOA/admin`. Shared login/navigation handles all EOA roles.
- Legacy registration, draft, submit, onboard, review and operational writes return HTTP 410. Requests are not redirected because their payloads and approval models differ. Old owned application reads and legacy assigned review reads remain available with private headers; canonical financial payloads cannot be read through those routes.
- EOA refuses to overwrite a legacy payload. Generic program administration cannot mutate the EOA program or bypass its controlled enrollment/settings actions.
- Preparation commands share the closed/draft EOA installer. Readiness checks target EOA schema and approvals, not the retired gateway flags.
- Applicants can request access, correction, deletion or consent withdrawal from `/EOA/account`, track private resolutions, and avoid duplicate outstanding requests. Administrative status changes are audited; request submission is not automatic deletion.
- CI checks PHP syntax across application, configuration, routes, migrations and tests before the backend suite.

No database records were deleted, production data modified, roles automatically elevated, approvals inferred, or hosting configuration changed by this repair.

## Legacy data review before release

On a protected staging copy, inspect counts of `program_applications.gateway_payload` for the EO program without logging their contents. If nonempty, keep intake closed and have an authorized operator plan a reviewed transfer with a backup and per-record audit. The old schema lacks explicit revenue reporting year, secure evidence and the current consent version; do not invent those values. Obtain missing information and consent from the applicant. Preserve original records and event history. Legacy reviewer roles/assignments require explicit re-authorization in the EOA role model.

The old `ecosystem_records` directory and its 18-source import remain separate from `ecosystem_organizations`, which powers EOA partnership publication. `partner_profiles` retains the unresolved RIDA placeholder. Availability of an RDIA logo does not resolve that identity mapping. Existing records are not overwritten by reinstallation.

## Verification

Run `npm run verify` and CI on the exact candidate commit. Regression coverage checks retired writes, legacy ownership/retention, cross-workflow reviewer isolation, closed preparation, generic-admin bypass prevention and privacy request access/audit. Existing EOA tests cover verification, versioned drafts, uploads, submission, decisions, onboarding, fees, cohorts and coaches.

The working session had Node but no PHP/Composer; system package installation was denied. Backend execution must therefore be verified in the existing GitHub CI runtime rather than claimed locally. Frontend build/static/unit checks are run locally. Browser QA is not available in this session's approved browser workflow.

## Deployment status and exact remaining work

On 2026-10-09, a direct request to `https://wosool.org/EOA` returned HTTP 404. This is not a deployed-release confirmation. Repository CI does not deploy.

1. Restore availability of the configured Hostinger connector; no hosting tools were callable in this session. Confirm the exact existing site/account and release mechanism before any hosting write.
2. Back up production database, `APP_KEY` and private storage; rehearse restore and migrations on the actual database engine. Inspect legacy-record counts as above.
3. Deploy the CI-verified backend and frontend together using the existing host; run additive migrations and `eoa:install`, retain existing secrets/storage, rebuild caches, restart supervised workers.
4. Verify actual sending credentials/domain, delivery of verification/reset/application emails, queue failure recovery and private uploads. Provision a verified, audited leadership account.
5. Approve Riyadh launch/intake, annual local fees and sponsorship, participation terms, bilingual privacy notice/controller/retention/processor arrangements and partner evidence. Resolve RIDA's exact identity and source approved CODE artwork.
6. Run readiness plus deployed `/EOA`/API, CSRF/session, ownership, review/onboarding, Arabic/English, keyboard/mobile/reduced-motion and restore checks. Record deployed commit. Open intake only after these pass.

Rollback uses the previous tested application artifacts while preserving additive schema/data, with intake closed. Do not run a destructive migration rollback: the retained gateway migration deliberately refuses `down()`. Database recovery requires the tested backup procedure, not dropping applicant tables.
