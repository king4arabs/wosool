# Content-review coverage — 17 October 2026

## Inspection and bounded change

Started from clean main `0f86154f68b25f1c55cf9212b6bb442e173cddae`; its latest CI passed. Open PR #70 contains concurrent Arabic startup/API and newsroom work; #41 is the older scaffold. Neither was changed.

Main already contains 144 public-source profiles, but `content:check` and `content:review` loaded only the original 44. The expansion had separate frontend parity tests, yet its 100 review deadlines were absent from the operational report. This reliability gap took priority over the planned OpenAPI field schemas.

The content commands now load both declared founder pairs and the existing news pair. Each report includes catalog counts/paths and each review entry includes its backend catalog. Duplicate slugs are checked across all founder catalogs; company counts are deduplicated. New matching founder files fail until explicitly registered, rather than being silently omitted or automatically published. Missing/broken files fail with their path. Validation covers bilingual identity/company/role fields, primary evidence inclusion, HTTPS without embedded credentials, strict review calendar dates, regions and supported bilingual traction.

No public catalog, source-review date, importer, account, moderation flag, frontend route or backend runtime changed. No invitation, message, source-feed ingestion or production import was performed. Existing source records and editor decisions are preserved.

## Source spot-checks

These limited checks on 17 October are not a complete re-verification of 144 people. No profile or registry review date was advanced, and no new record or private news draft was added.

- [Endeavor Saudi entrepreneur companies](https://saudi.endeavor.org/entrepreneur-companies/): the first-party directory associates Ayman Alsanad and Naif Alsamary with MRSOOL and Abdulmohsin Al-Rabiah with Shawarmer. This supports the expansion's conservative entrepreneur associations, not a newly verified current CEO title, website-uptime claim or Wosool membership.
- [CODE / MCIT](https://mcit.gov.sa/code): official page describes Tech Founders and lists entrepreneurial companies. Program descriptions, listings and aggregate investment counters do not establish individual earned revenue or approval by Wosool. No candidate was promoted.
- [Misk Launchpad](https://hub.misk.org.sa/en/programs/entrepreneurship/misk-launchpad/): Swarm testimonial still reports annual revenue over USD 200k without a reporting year. It is a program-published testimonial, not a financial statement or evidence of an audit. The period remains unresolved; no new qualification was made.
- [SiFi / Money20/20 announcement](https://www.sifi.app/en/resources/news/sifi-and-idemia-secure-transactions-expand-partnership-and-with-launch-of-tap-to-activate-at-money20-20-middle-east/): page header is 13 September 2026 while the article dateline is 14 September 2026. It names Rami Panayoti as co-founder/chief business officer and reports serving 7,000+ businesses. Customer counts are not revenue. The story already exists in the checked-in newsroom; no duplicate or inferred new publication date was added.

The startup directory/source registry was inspected but not modified. Multiverse, Monshaat, The Garage, LEAP, GITEX, Impact46, Falak and Lamarka were not freshly re-verified in this bounded cycle; their evidence gaps remain open.

## Verification and release boundaries

- `npm run content:test`: 12 regression tests pass, including expansion-only drift, cross-catalog duplicates, exact 30-day deadlines, invalid/future dates, malformed sources/rows, missing and unregistered files, and CLI behavior outside the repository working directory.
- `npm run content:check` / `content:review`: 144 founders, 79 company groups, 42 stories; zero structural integrity problems and zero reviews due as of 17 October. This is not a factual audit, website check or production count.
- Frontend lint, type checking, unit tests, entrepreneur validation and production Turbopack build passed locally. PHP/Composer are not installed here; backend tests and the existing 84-scenario isolated-browser gate must pass in required CI before merge. Exact final CI results belong in the PR/release report.
- Live check on 17 October: `https://wosool.org/founders` returned HTTP 200, included the Arabic initial-loading placeholder and had no saved Unifonic profile links in its initial HTML. `https://wosool.org/api/ready` returned `{"status":"ready"}`. This is consistent with the earlier collection loading safeguard, but does not verify all browser denial/retry scenarios, hosting source SHA or imports.
- No Hostinger control or production database session is available in this environment. This change is repository/CI tooling and needs no application deployment or database import. Earlier application releases and the expansion still require independently verified hosting/import evidence.

Next independent development priority: field-level OpenAPI schemas with backend contract-drift tests. Preserve concurrent PR #70 and continue source review without equating program participation, investment or customer counts with earned revenue.
