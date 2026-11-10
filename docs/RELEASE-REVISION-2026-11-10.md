# Release revision verification — 10 November 2026

## Problem

The existing health checks proved that the frontend process, Laravel process and required database state responded, but not which Git revisions they served. Wosool deploys the Next.js frontend and Laravel API independently, so a green route could coexist with a stale or mismatched service. This is the unresolved release-parity part of issue #166.

## Source correction

- Frontend `/health` returns `revision` from `WOSOOL_BUILD_REVISION`, or from `GITHUB_SHA` in a CI environment when the explicit value is absent.
- Laravel `/api/health` and `/api/ready` return `revision` from `APP_REVISION`.
- Both implementations accept only a 7–40 character hexadecimal Git revision, normalize it to lowercase and return `null` for a missing or malformed value. They never echo arbitrary environment data.
- OpenAPI 1.7.1 documents the nullable field.
- The production smoke monitor reports the frontend and backend revisions independently. It rejects malformed revisions and conflicting backend answers from the direct health, readiness and same-origin proxy probes.
- Optional GitHub repository variables `WOSOOL_EXPECTED_FRONTEND_REVISION` and `WOSOOL_EXPECTED_BACKEND_REVISION` make missing or mismatched public values fail the monitor.

## Deployment acceptance

1. Back up production and record the currently active frontend and backend revisions and release roots.
2. Deploy the reviewed Laravel revision through the existing backend process, set `APP_REVISION` to the full deployed commit, clear/cache configuration as documented and verify both direct health endpoints.
3. Deploy the compatible frontend revision through the existing Hostinger Web App process with `WOSOOL_BUILD_REVISION` set to the full deployed commit, then verify `/health` and the same-origin API proxy.
4. Confirm direct and same-origin backend responses agree. Set the two expected GitHub repository variables to the observed full revisions and run the production health workflow manually.
5. Complete the remaining issue #166 checks: controlled-inbox registration/OTP and recovery, authenticated founder-card journeys, OpenAPI/privacy headers and limits, queues/mail, and production import state. Preserve user records and moderation state.

Hostinger documents that Node.js application environment variables can be added during deployment or edited afterward; changes may require redeployment before they take effect. The repository does not perform that account operation.

## Verification in this source cycle

- `node --test scripts/production-smoke.test.mjs`: 12 passed.
- Frontend Node test suite: 344 passed, including release-revision normalization and OpenAPI 1.7.1 export.
- ESLint and TypeScript passed. The local production-mode webpack build compiled, type-checked and generated all 97 static pages with the required one-worker limit.
- Laravel coverage was added for null, normalized and malformed revisions. A patched PHP runtime is not installed in this workspace, so Laravel execution remains a required CI gate.
- PR CI run 608 passed all backend, pnpm/Hostinger, production-guardrail and frontend steps through the last axe crawl, where GitHub cancelled the frontend job at its existing 25-minute timeout with no failed step. The frontend ceiling is raised to 40 minutes without removing or skipping any check; a complete rerun remains mandatory before merge.
- Content catalogs were not edited: 356 founders, 193 companies and 126 stories; zero integrity problems and zero reviews due at inspection.

## Boundary

No Hostinger setting, GitHub expected-revision variable, live service, production database or import changed in this source cycle. A merge is not a deployment. Keep issue #166 open until the public responses identify the active services and the controlled release checks pass.
