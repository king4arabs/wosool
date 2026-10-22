# Knowledge/API cycle: source and release evidence

Research date: 14 October 2026. These are company statements, not independently audited operating results. No public listing establishes Wosool membership or an Accelerator appointment.

## Founder changes

- **Rami Panayoti / رامي بانايوتي** — new SiFi co-founder and Chief Business Officer profile. The September company announcement explicitly identifies his role. No personal portrait or social URL was inferred. Country fields describe the company's Saudi market/location, not personal nationality.
- **Ahmed Alhakbani** — role clarified to **Co-founder & CEO** using the company's February 2026 funding announcement. SiFi's September announcement reports more than 7,000 businesses, replacing the older investor-reported traction statement in the repository snapshot. This is customer count, not revenue. Existing production records are preserved by imports and need the authenticated admin correction workflow.
- No new record was added to the separate revenue-evidenced startup directory: these sources do not establish earned revenue.

Primary sources opened and read:

1. [SiFi: IDEMIA collaboration and Tap to Activate](https://www.sifi.app/en/resources/news/sifi-and-idemia-secure-transactions-expand-partnership-and-with-launch-of-tap-to-activate-at-money20-20-middle-east/) — Rami's current role; September company-reported business count. Page publication date is **13 September 2026**, while the body dateline is **14 September 2026**. Both meanings are preserved in the independent news brief.
2. [SiFi: Series A announcement](https://www.sifi.app/en/resources/news/simplified-financial-solutions-company-secures-dollar20m-series-a-to-scale-saudi-arabias-leading-spend-management-platform/) — **9 February 2026**; explicitly identifies Ahmed as co-founder and CEO. This older release reports 3,500+ organizations at that date; it is not combined with later counts or described as revenue.
3. [SiFi newsroom](https://www.sifi.app/en/resources/news/) — confirms the publication listing and source link.
4. [Penny: Local Content Tracker on SAP Store](https://penny.co/news/local-content-tracker-sap-store/) — page publication date **31 August 2026**, release-body dateline **18 August 2026**. Describes integration with SAP Ariba and SAP S/4HANA. The original brief attributes the availability claim to Penny; it does not certify integration performance.
5. [Penny newsroom](https://penny.co/newsroom/) — confirms publication listing and source link.

Two new original Arabic/English news briefs link to the announcements, retain publication dates and explicitly describe source dateline differences. No new publisher image was copied; the existing branded fallback tile is used. Source duplication is checked across the news dataset. Reviews of these records do not re-verify every older record.

## Repository and database boundaries

- Frontend/backend source snapshots: **44 founders, 33 companies, 42 stories**.
- Fresh local SQLite: **44 founders and 33 companies created**, **42 news items created**.
- Repeat import: **0 founders/companies/news created**, **44 founder profiles preserved**, **42 stories unchanged**.
- On a database with the complete previous snapshot, expected additions are **1 founder, 0 companies, 2 stories**; actual results depend on existing records.
- Ahmed's corrected role and SiFi's updated traction are snapshot changes; existing non-empty database values are intentionally not overwritten. Verify/apply through admin after checking for newer owner edits.
- No users were deliberately created and no invitations were sent by these imports. Local validation is not a production import.

## Release verification

See [Continuous development](../CONTINUOUS-DEVELOPMENT.md) for release commands, acceptance gates and operational next actions. This research record does not assert live deployment or production imports. Commit/push and CI status must be verified independently.

Local HTTP checks passed for API documentation, OpenAPI JSON, the existing news proxy, wiki pages, article metadata/structured data, readiness, activation noindex headers and public-record sitemap. Unknown static wiki pages return 404. Missing dynamic news pages emit noindex and the not-found view; Next.js streaming may retain HTTP 200. Browser visual checks were attempted but the available Chromium process exited with SIGSEGV, so responsive visual acceptance is not claimed.
