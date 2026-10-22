# Revenue-qualified startup API contract — 22 October 2026

## Bounded change

OpenAPI document 1.4.0 adds a field-level schema for the existing anonymous `GET /api/v1/startup-directory` route. The nine-route document now describes each startup record, its compact pagination and bilingual sector facets, social and asset provenance, ecosystem-source relationship, website verification, and revenue evidence.

The 40 documented record properties distinguish `reported` revenue/ARR from a `financial_statement` source. The latter classification identifies the source document; it does not promise that Wosool independently verified an audit opinion. Both classifications require an active website plus a nonempty evidence URL and reporting period before a record can appear. Program participation does not establish approval, investment, partnership or Wosool membership.

The schema rejects pending revenue, inactive websites, missing evidence periods, insecure evidence/source links, unknown response fields and malformed review dates. Optional `logo_tone` and `review_note` fields remain available for reviewed editorial records. Existing controller behavior, records, moderation, accounts and review dates are unchanged.

## Verification

Local checks before publication: 155 frontend tests, 12 content tests, lint, TypeScript, entrepreneur validation, a production Webpack build and diff checks passed. `content:check` and `content:review` report 144 founders / 79 company groups / 42 stories, zero integrity problems and zero reviews due. The default local Turbopack build encountered a runner persistence-cache parsing error before application compilation; the clean GitHub runner remains the required normal-build gate.

Four new Laravel contract tests must pass in required CI. They exercise all eight eligible imports in both locales, filters, compact pagination, bilingual facets, empty and out-of-range pages, JSON validation errors, and deliberate eligibility/private-field drift. PHP and Composer are not installed in this local runner, so merge is prohibited until that CI gate passes.

## Limited source and registry review

Sources were re-opened on 22 October 2026 without changing repository review dates:

- Foodics' official site remains active and describes its restaurant POS, operations and payment products. Its LinkedIn ARR evidence was not independently retrievable in this review, so no evidence date was advanced.
- Tamara's official H1 2025 filing identifies condensed consolidated interim information as unaudited and covers the six months ended 30 June 2025. The record remains a finance-entity figure, not a group-wide estimate.
- Mubadala's 21 September 2026 Paymob announcement attributes threefold consolidated-revenue growth to the preceding 18 months. It is investor-reported growth, not an absolute revenue amount or financial statement.
- Canva's own 2025 review reports USD 3.5 billion revenue. It remains company-reported.
- Rasan's issuer announcement reports SAR 517.5 million revenue for the six months ended 30 June 2026. The source remains an interim-results announcement; no audit claim was added.
- LEAP's dated Lisan article reports approximately USD 2.6 million ARR, while its 25 July 2023 Verofax interview attributes more than USD 1 million of 2022 revenue to the founder. ARR and historical founder-reported revenue remain separately labeled.
- Jahez's consolidated profit-or-loss statement lists SAR 2,218,662,735 revenue for the year ended 31 December 2024. The directory does not infer a current run rate or independently certify the audit.

The registry review produced no new eligible company. Misk's Swarm testimonial still gives annual revenue without a reporting year. The Garage states only that its accelerator accepts companies with sales. Impact46 identifies investments and IPO-backed businesses; investment is not earned revenue. Amplifai Health's Lamarka evidence announces funding, not revenue. CODE returned 404; Monsha'at, SPA/Multiverse and Falak timed out; the GITEX exhibitor page returned 502. Access restrictions were not bypassed. Pending candidates, registry status, moderation and verification dates were preserved.

## Release boundary and next priority

This change requires frontend deployment for the downloadable contract and backend CI only for response validation; it does not require a database import. A merged commit is not proof that Wosool.org serves the new route. After CI, verify `/api/openapi.json` and the startup collection on the deployed frontend/backend revision, then review legacy scorecard-log exposure and production import/cron status through the existing hosting process.
