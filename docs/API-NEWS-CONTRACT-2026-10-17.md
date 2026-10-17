# Public news contract — 17 October 2026

## Delivered scope

Started from main `01b1ead630118ae5c381cc645b6a3177e25ef888`, whose CI was green. Preserved open PR #70 (Arabic API/startup copy and newsroom HTML) and #41. Content coverage remains 144 founders / 79 company groups / 42 stories, zero integrity errors and zero reviews due. No content or review date changed in this cycle.

`/api/openapi.json` now exports document version **1.1.0**. `NewsItem` describes all 22 fields emitted by `NewsItemResource`, including mandatory keys whose values can be null, publisher attribution, image credit, company associations, region, tags, translations and publication timestamps. The public `status` and `is_public` values are constrained to published/true. Record fields are closed so a new serializer field requires an explicit contract update; nullable values are not silently confused with absent keys. List/detail envelopes and pagination metadata remain extensible.

Compatibility follows existing serialization: null translations become `{}`, while a stored empty PHP array becomes `[]`. Existing associative tags/key-facts are supported rather than rewritten. Top-level editorial fields are not automatically translated by the API; localized content is in `translations`. Published stories with no publication date remain visible, as already implemented. Future, hidden, draft, archived and deleted stories remain excluded. JSON 404 and 422 errors have named schemas; intermediary rate-limit bodies have no guaranteed JSON shape.

This does **not** change a controller, resource, authorization policy, record, importer or database schema. Other record contracts (founder/company/scorecard and revenue-evidenced startup directory) are still incomplete. No new public endpoint or private-data export was introduced.

## Contract checks

Five frontend tests compile schemas in strict JSON Schema 2020-12 mode with date-time formats, test nullable and legacy shapes, reject wrong types/missing keys/private fields, exercise empty pagination and error bodies, and compare the actual OpenAPI route output with the in-memory specification.

Seven Laravel feature tests send real responses through the same validator. They cover manual records, the checked-in newsroom import in an isolated test database, Arabic/English requests, first/last/out-of-range pages, filters, unavailable/deleted/future records, invalid queries and associative fields. A negative-control test mutates real responses to prove the gate rejects type drift, missing slugs, invalid timestamps and `author_id` leakage. The validator consumes stdin, never fetches schemas or changes response values, and has no production request-path role.

Install frontend development dependencies before running backend tests because the shared validator uses Node, `tsx`, Ajv and `ajv-formats`. Normal `npm run setup` already installs frontend dependencies first; backend CI now does so explicitly before Composer tests. Missing dependencies fail the contract tests rather than skipping them.

```sh
npm --prefix frontend ci
npm --prefix frontend test
composer --working-dir=backend run test
npm run content:test
npm run content:check
```

Local lint/types, 120 frontend tests and 12 content regression tests pass. Backend tests require CI here because PHP/Composer are unavailable. Required CI must also pass the existing 84 browser scenarios and both application builds before merge; final results and commit IDs are recorded in the PR.

## Dependency and specification sources

- [OpenAPI 3.1 Schema Object](https://spec.openapis.org/oas/v3.1.0.html#schema-object) and [Ajv JSON Schema versions](https://ajv.js.org/json-schema.html) were consulted on 17 October; local installed Next.js route-handler documentation was read before editing frontend code.
- Ajv **8.20.0** and ajv-formats **3.0.1** are test-only development dependencies. The initially selected older Ajv was upgraded after audit identified its advisory; no affected new Ajv version is intentionally retained.
- The full development dependency audit also identifies the existing `braces` **3.0.3** dependency through ESLint/Next lint tooling (five high dependency entries for one advisory). Its version and dev-only classification are unchanged from main. [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched release as of this check; npm proposes a breaking Next lint-config downgrade. No forced downgrade, audit suppression or weakened CI gate is applied. Track a compatible upstream fix separately. Production dependency audit is a separate required check.

## Release boundary and next actions

On 17 October, `https://wosool.org/api/v1/founders?per_page=1` again returned HTTP 200 with `meta.total=29`. A read-only `/api/v1/news?per_page=1` returned HTTP 200, reported 34 public stories, and its one-record payload passed the new list schema. This sampled response is not a full production content audit or evidence of the deployed source SHA. These are public visibility counts, not an audit of imported, hidden or owner-edited records. Hostinger controls and a production database session remain unavailable. No deployment, import or outreach occurred.

The contract update becomes live only after deploying the frontend through the existing process. Confirm downloaded `info.version=1.1.0` and `components.schemas.NewsItem` afterwards; a green Cloudflare check is not Hostinger proof. This change needs no migration or production import. Next: founder/company/scorecard response schemas and actual-response tests, then startup-directory evidence schemas; preserve existing moderation and owner edits during separate production import verification.
