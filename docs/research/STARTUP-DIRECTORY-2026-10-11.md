# Startup directory review — 11 October 2026

Base: main `0a2bcef2a3af6696a931c985620e4098bf525d98` (PR #24). No root/backend AGENTS.md was present; frontend files were not changed.

## Reviewed changes

- Add **Jahez**, Saudi Arabia, technology / delivery platforms. Co-founder identity is sourced to [Impact46's announcement](https://impact46.sa/jahez-successfully-closed-its-series-a-funding-round-led-by-impact46-vc-in-saudi-arabia/); current CEO/board role and original portrait to [official governance](https://jahezgroup.com/corporate-governance/). The official website and original logo URL were retrieved through public web research. Company/founder social accounts are left empty: no ownership provenance was established. Images are original remote assets, not redrawn or synthesized; transparency and continuous availability are not asserted.
- Jahez's [FY2024 consolidated statement](https://jahezgroup.com/jahez-ar/2024/assets/img/pdfs/financials/Consolidated%20Statement%20of%20Profit%20or%20Loss%20and%20Other%20Comprehensive%20Income.pdf), printed page 170, reports SAR 2,218,662,735 revenue for the year ended 31 December 2024. The [HTML table](https://jahezgroup.com/jahez-ar/2024/financial-statements.html) corroborates the revenue line. This is historical group revenue, not GOV, a forecast or a current run rate. No independent audit assurance is claimed. The newer [2025 landing page](https://jahezgroup.com/jahez-ar/2025/) contained placeholders; it was not used as financial evidence.
- Replace Rasan's ambiguous 2020–2023 investor-page description with **SAR 517.5 million for the six months ended 30 June 2026** from its [issuer announcement carried by Euroland](https://gamma.euroland.com/tools/PressReleases/GetPressRelease/?ID=8116409&companycode=sa-rasan&lang=en-GB&v=ticker). Use the current-period column, not the SAR 256.5 million quarter column. Classify as `reported`: official financial-report links were discovered, but full PDF inspection failed. Saudi Exchange direct retrieval returned 403; no restriction was bypassed. Current [official leadership](https://rasan.sa/en/about) still lists Moayad Alfallaj as chairman and Nicola Garelli as CEO.
- Retain **Thiqa Education** in research, with `website_status=pending` and `revenue_status=pending`. [GITEX's indexed exhibitor page](https://plus.gitex.com/newfront/exhibitor/thiqa-education) still mentions AED 8M+ cumulative revenue, but direct retrieval fails, and the statement does not establish a cutoff date. The previous “to Expand North Star 2025” period was too specific. Official website/about URLs returned no substantive text. This is insufficient verification, not a claim that the business is inactive. Previous successful website/evidence dates remain 9 October.
- Re-read revenue sources for Swarm, Lisan, Verofax and Canva; advance only their nested revenue review dates. Do not label these full profile/asset/social rechecks.

Result: **14 research records; 10 eligible**, assuming existing moderation permits publication: 5 Saudi, 3 other GCC, 1 MENA and 1 global. Unifonic, Salla, Kitopi and Thiqa remain outside public results. No production records were accessed.

## Source coverage and unresolved evidence

| Source | Evidence inspected or attempted | Outcome |
| --- | --- | --- |
| [Misk](https://hub.misk.org.sa/en/programs/entrepreneurship/misk-launchpad/) | Swarm testimonial; company [about page](https://swarmrobotics.io/about) | Annual revenue above USD 200k is program-reported; year remains unspecified. No invented reporting year. |
| [CODE / MCIT](https://mcit.gov.sa/code) | Official redirected program page; public revenue searches | No new qualifying named-company result. Verofax's LEAP story describes MCIT scouting, which does not establish CODE admission. |
| [Monshaat](https://www.monshaat.gov.sa/en/node/468929) | Indexed university accelerator report; direct retrieval failed | >188% is cohort growth, not a named company's revenue. Successful-review date retained. |
| [Multiverse / MCIT](https://www.spa.gov.sa/en/N2411086) | Indexed SPA report dated 30 September 2025; direct body unavailable | Twenty startups and sector coverage are not revenue evidence. Unrelated UK Multiverse/Multiverse Computing results discarded. |
| [Impact46](https://impact46.sa/) | Company-specific Jahez announcement; official company financial sources | Jahez added; Rasan revenue improved. Investment is only relationship evidence. |
| [Falak](https://falak.sa/en/blogs/22/Startup-Story:-Mohtwize) | Mohtwize story, dated 10 June 2021; [company site](https://www.mohtwize.com/en/us) | Fees/sponsorships/subscription model, audience and clients do not supply a revenue result for a stated period. Pending. |
| [Lamarka evidence](https://amplifaihealth.com/news/amplifai-health-secures-strategic-funding-to-scale-ai-powered-diabetic-foot-screening) | Amplifai's 8 March 2025 funding announcement | Existing-backer relationship established; revenue not established. Pending. |
| [The Garage](https://thegarage.sa/garage-programs) | Official accelerator sales eligibility | Eligibility is not company revenue. [Bandar Digital Solutions](https://bandar.solutions/ar/open-data) surfaced in indexed search as a company-reported lead; period/affiliation require further review, no profile added. |
| [LEAP / Lisan](https://www.insights.onegiantleap.com/blogs/a-year-after-rocket-fuel-lisans-growth-story/) | 18 August 2026 report | Approximately USD 2.6m ARR; distinguish annualized metric from recognized annual revenue. |
| [LEAP / Verofax](https://www.insights.onegiantleap.com/blogs/rocket-fuelled-results-verofax-is-scaling-up/) | 25 July 2023 founder interview | Above USD 1m revenue in 2022; retain historical, founder-reported basis. |
| [GITEX](https://plus.gitex.com/newfront/exhibitor/thiqa-education) | Indexed content; direct retrieval failure | Thiqa pending website and cumulative-period verification. |

Canva's [2025 review](https://www.canva.com/newsroom/news/canva-2025-wrap/) still says USD 3.5bn revenue; retain the company's wording and company-reported status. No whole-profile review date was advanced.

The registry separates `last_attempted_at` / `retrieval_status` from `reviewed_at`. Failed/partial retrievals retain the last successful review date. Coverage means sources were searched or inspected, not that each yielded a publishable business, and never implies program approval or affiliation with Wosool/EO.

## Validation and deployment

Local JSON integrity, publication counts, URL syntax, original-asset provenance and whitespace checks passed. PHP/Composer were unavailable locally; Laravel tests run in GitHub CI before merge. Regression coverage checks newer editorial revisions, moderation, unrelated records, financial periods and exclusion of pending research.

Repository changes do not deploy hosting, migrate or import the production database. Existing import behavior and moderation flags are unchanged. After hosting deployment, an authorized operator must run migrations and `directory:import --dry-run`, review it, then `directory:import`. Live hosting and production database access remain unavailable in this review.
