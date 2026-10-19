# Anonymous founder API contract — 19 October 2026

## Bounded change

OpenAPI document 1.2.0 describes the existing anonymous `GET /api/v1/founders` and `GET /api/v1/founders/{slug}` responses. Seven existing paths and their operation identifiers are retained. No controller, resource, migration, importer, account or moderation behavior changes.

- All 35 founder fields, nullable account and scorecard relationships, 24-field nested companies, pivot data and sourced traction are described. Traction is not a revenue qualification or membership claim.
- Anonymous account email must be null. Unexpected founder/account/company fields fail the contract tests; this does not change runtime serialization or constitute a complete privacy audit.
- Claimed/legacy active accounts remain distinct from unclaimed sourced profiles. Catalog imports in isolated tests create no users or invitations.
- Scorecard computed fields, alerts and suggestions are typed. The existing serializer passes arbitrary historical log contents through: arrays and associative objects remain accepted, but their internals are explicitly untyped and not certified safe for publication. Separate review of that existing behavior remains necessary.
- Pagination supports the controller's 1–100 clamp, empty and out-of-range pages. JSON detail 404s are typed. The previous founder-query 422 promise was removed because this controller does not validate filters with a Form Request; no new input-validation guarantee is invented. Intermediary 429 bodies remain unspecified.
- These schemas apply to requests without credentials, not authenticated member/admin variants. Standalone company endpoints and revenue-evidenced startup-directory schemas remain future work.

## Verification

Local: 124 frontend tests, 12 content tests, lint, TypeScript, production frontend build, entrepreneur validation, `content:check` and `content:review` passed; 144 founders / 79 company groups / 42 stories, zero integrity problems and zero founder reviews due. The shared Ajv validator accepted the fresh live anonymous founder collection sample (`per_page=1`, total 29) on 19 October. This verifies one response, not every production record or a deployed source revision.

Seven added Laravel tests exercise the actual resources, all 144 imported profiles in Arabic and English, minimal/claimed/legacy profiles, visibility and soft deletion, nested companies, pagination, scorecards, and intentionally invalid fields/account emails. Backend execution requires CI because local PHP/Composer are unavailable. See the associated pull request for required frontend/backend check results; never treat test fixtures as a production import.

## Limited source review

Read publicly accessible primary pages on 19 October 2026:

| Source | Evidence and decision |
| --- | --- |
| [The Garage programs](https://thegarage.sa/garage-programs) | Accelerator eligibility refers to businesses with sales. No named company-specific revenue amount and reporting period was established by this page; eligibility alone does not qualify a directory entry. |
| [Amplifai Health funding announcement](https://amplifaihealth.com/news/amplifai-health-secures-strategic-funding-to-scale-ai-powered-diabetic-foot-screening), published 8 March 2025 | Describes funding and names Lamarka among existing backers. Funding and device/regulatory milestones do not establish earned revenue or ARR. The older executive attribution was not promoted to a newly verified current role. |

No qualifying additions, company/founder biography changes, registry dates or profile verification dates result from this limited review. Other registry sources were not newly verified in this cycle. Existing uncertain candidates remain pending; no partnership, program approval, audit or Wosool membership is implied.

## Release boundary and next priority

`https://wosool.org/api/openapi.json` returned HTTP 404 HTML on 19 October. The live anonymous founder list reported 29 records, not the 144 in checked-in catalogs. The hosting revision, routing cause, deployed frontend/backend and production import state remain unverified; configured hosting access is unavailable in this environment. No deployment, database import or admin correction was performed.

Publish this source only after local checks; merge only after required CI passes. Existing deployment processes must deliver and verify the frontend OpenAPI route separately. No database import is required for this contract change. After that external release gate, continue standalone company/startup schemas and full-database newsroom filters, preserving concurrent PR #70 work.
