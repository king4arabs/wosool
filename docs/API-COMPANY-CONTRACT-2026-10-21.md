# Standalone company API contract — 21 October 2026

## Bounded change

OpenAPI document 1.3.0 adds the existing anonymous `GET /api/v1/companies` and `GET /api/v1/companies/{slug}` routes. The contract now has nine read paths. It describes 24 company-detail fields, the list-only `founders_count`, and 33 fields for each loaded public-founder relationship. Authenticated member/admin variants remain outside this contract.

The review found one runtime visibility mismatch: the returned `founders` array already excluded private, inactive and deleted profiles, while `founders_count` counted every linked profile. The list query now applies the same active/public conditions to the count. This avoids exposing the existence of hidden relationships and makes the count match the visible collection. Company and founder moderation, deletion and account records are otherwise unchanged.

The schema preserves observed database behavior: `founded_year` can be null, an integer or a four-digit string. Nested anonymous account email must be null. Unexpected company/founder fields, nested company or scorecard relationships and account emails fail the contract. A passing response contract validates shape and visibility rules; it does not independently verify biography, revenue, audit, program admission, partnership or Wosool membership.

## Verification

Local checks before publication: 129 frontend tests, 12 content tests, lint, TypeScript, production frontend build, entrepreneur validation and diff checks passed. `content:check` and `content:review` still report 144 founders / 79 company groups / 42 stories, zero integrity problems and zero reviews due. A rate-limited fresh check of the English list plus every one of the 22 live company detail responses passed the shared Ajv validator. The live startup-directory endpoint returned zero public records.

Six new Laravel tests must pass in required CI. They cover all 79 imported company groups in Arabic and English, minimal/list/detail shapes, private/inactive/deleted companies, hidden founder relationships, anonymous account fields, filters, pagination clamps and deliberate schema/privacy regressions. The test import is isolated and creates no production accounts or records.

## Limited source review

- [The Garage programs](https://thegarage.sa/garage-programs), retrieved 21 October 2026, states that its accelerator accepts operating companies with sales. This is program eligibility, not a named company's earned-revenue result for a stated period.
- [Impact46's Jahez Series A announcement](https://impact46.sa/jahez-successfully-closed-its-series-a-funding-round-led-by-impact46-vc-in-saudi-arabia/), published 3 June 2020, reports a SAR 137 million investment transaction and projected order value. Funding, GMV/order value, users and orders do not replace earned-revenue evidence. Jahez's existing financial-statement evidence remains separate.
- Monsha'at's 13 September 2026 university-accelerator search result reports aggregate cohort revenue growth above 188%, not a named company's revenue amount and period; direct retrieval timed out. The current CODE page also timed out. Access restrictions were not bypassed, and neither source was marked freshly verified.

No candidate, biography, portrait, social link, source-registry status or review date changed. Existing uncertain candidates remain private/pending. No program participation is represented as approval, partnership or Wosool membership.

## Release boundary and next priority

On 21 October 2026, `https://wosool.org/api/ready` returned 200 `ready`, while `/api/openapi.json` still returned 404 HTML. The company API reported 22 public records and the startup-directory API reported zero. Source merge, Cloudflare preview checks and GitHub CI do not prove which revision Wosool.org serves. The hosting connector is configured but no Hostinger account tools are exposed in this run, so the deployed frontend/backend revision, route configuration, production import, cron and database state cannot be changed or verified.

Merge only after required frontend/backend CI passes. No production database import is required for this contract/visibility change. Next: type the revenue-evidenced startup-directory response, then use the existing hosting release process to deploy and verify the OpenAPI route. Preserve newer editorial/admin corrections and PR #70's concurrent dashboard/accessibility/API work.
