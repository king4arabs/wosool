# Regional hero indicators

## Current evidence review — 1 November 2026

Component: `frontend/src/components/sections/RegionalHeroMetrics.tsx`.
Four cards show founder counts, company counts, revenue growth and **funding-deal-count growth**. Regions overlap and must never be summed. Each populated card preserves source, period and population scope. Counts below are database coverage, not censuses of active businesses or unique regional founders. Review dates must not appear as editorial badges in the public interface; observation dates for dynamic counts are reference periods.

| Region | Founders | Companies | Revenue growth | Funding-deal-count growth |
| --- | --- | --- | --- | --- |
| Saudi Arabia | 808 tracked founders | 762 tracked for-profit companies | +7%, SMEs, 2024 / 2023 | −39%, VC deals, 9M 2026 / 9M 2025 |
| GCC | 2,978 tracked founders | 2,429 tracked for-profit companies | +3.6%, listed companies, Q4 2025 / Q4 2024 | −33.3%, funding rounds, 2025 / 2024 |
| MENA | 10,307 tracked founders | 7,722 tracked for-profit companies | Unavailable | −33%, VC deals, 9M 2026 / 9M 2025 |
| World | Unavailable | 5.5M+ companies studied, GSER 2026 | +65%, survey average annual revenue growth, AWS 2026 survey | Approximately −17%, VC deals, 2025 / 2024 |

## Changes and retained periods

- Saudi counts increased from 781 / 705 to 808 / 762; GCC changed from 2,977 / 2,430 to 2,978 / 2,429. These are snapshots retrieved 1 November 2026, not measured growth. Opened hub pages take precedence over inconsistent search snippets. Founder deduplication across companies is not independently established; never describe these as census totals.
- MENA counts rechecked unchanged; retain October 2026 observation label rather than imply a new statistical release. Crunchbase MENA and MAGNiTT MENA may use different coverage; do not derive ratios or aggregate them.
- Saudi deal growth replaces +31% H1 2025 with −39% 9M 2026 versus 9M 2025. MAGNiTT reports 113 deals. This is the published count-growth rate, not the −29% funding-amount rate. Do not infer an exact prior count from rounded growth.
- MENA deal growth replaces +6% FY2025 with −33% 9M 2026 versus 9M 2025. Do not substitute the −7% funding-amount change. Public summary does not provide an absolute comparable deal-count pair; retain the reported growth only.
- Removed worldwide 7.3M founder model (5.5M × MENA founders/company ratio). The unvalidated geographic extrapolation is unsupported under the current requirements. Render an accessible unavailable dash with no formula or source implying a measured total.
- Removed MENA +12% Middle East CEO survey benchmark: geographic/sample coverage does not establish MENA startup revenue growth.
- Preserve GSER's **5.5M+** qualifier, not an exact 5.5M census.
- Saudi SME +7%, GCC listed-company +3.6%, GCC funding-round −33.3%, AWS survey +65% and global annual VC approximately −17% retain their existing reporting periods. No monthly interpolation.

## Primary sources and coverage

### Founder and company coverage

- [Crunchbase Saudi startups](https://www.crunchbase.com/hub/saudi-arabia-startups): opened overview, 808 founders, 762 for-profit companies (769 organizations; do not substitute the organization count).
- [Crunchbase GCC startups](https://www.crunchbase.com/hub/gulf-cooperation-council-startups): 2,978 founders, 2,429 for-profit companies (2,457 organizations).
- [Crunchbase MENA startups](https://www.crunchbase.com/hub/middle-east-and-north-africa-startups): 10,307 founders, 7,722 for-profit companies (7,792 organizations).
- [Startup Genome GSER 2026 methodology](https://startupgenome.com/report/the-global-startup-ecosystem-report-2026/methodology) and [publisher announcement, 17 June 2026](https://startupgenome.com/insights/gser-2026-ecosystem-leaders-must-prioritize-startup-policy-or-risk-being-left-behind): 5.5M+ companies across 350+ ecosystems, research coverage; not all currently active startups.
- [SVC/MAGNiTT Saudi founders report](https://svc.com.sa/wp-content/uploads/2024/05/10Years_SaudiArabia_Founders_Report_EN.pdf), methodology p.10: 400 founders of the 200 most-funded Saudi startups during 2014–2023. This selected historical sample cannot replace a current regional founder total. [SVC report index](https://svc.com.sa/en/reports/) also lists FY2025 VC reports, older than the adopted 9M2026 MAGNiTT observations.

### Revenue

- [GASTAT SME Statistics 2024](https://www.stats.gov.sa/documents/20117/2435267/SME%2B2024%2BEN.pdf/4cb50fc7-fcb2-729c-92fe-08b5790f75d8?t=1766944990175): +7.0% operating revenues, micro/small/medium establishments, 2024 / 2023. [Statistics index](https://www.stats.gov.sa/en/statistics-tabs?category=123088&tab=436312) still lists 2024. [SPA 29 October 2026](https://www.spa.gov.sa/en/N2713724) reports +2.3% for the **whole business sector** in 2025: rejected as a replacement because the population differs.
- [Kamco GCC Corporate Earnings Q4 2025](https://www.kamcoinvest.com/sites/default/files/research/pdf/GCC%20Corporate%20Earnings%20Report%20-%20Q4-2025.pdf): retained previously verified +3.6%, listed-company revenues. Re-fetch returned 403 in this run. Secondary reporting suggests +17% Q2 2026, but the primary Q2 report could not be retrieved: do not advance the card's period without it. No Saudi-uplift model is used.
- [AWS, 30 June 2026](https://press.aboutamazon.com/2026/6/aws-global-startup-trends-report-reveals-ai-native-startups-are-reaching-billion-dollar-valuations-in-half-the-time): +65% average annual revenue growth in a survey of 3,400+ startup founders and senior leaders across 20 countries/four continents. Self-reported sample benchmark, not world aggregate revenue growth. Retain survey label, not a fabricated calendar-year comparison.

### Deal counts

- [MAGNiTT Saudi Q3 2026 update](https://www.magnitt.com/research/ksa-venture-capital-the-q3-2026-update-51062): public key takeaways, 113 deals, −39% YoY in 9M2026.
- [MAGNiTT MENA Q3 2026 update](https://www.magnitt.com/research/Q3-2026-MENA-VC-Update-51060): public key takeaways, −33% deal activity YoY in 9M2026. Full reports require subscription; country-level methodology is not fully reproduced in the public summaries.
- [Lucidity Insights, 17 February 2026](https://lucidityinsights.com/infobytes/gcc-investors-double-down-scale-2025): 342 GCC funding rounds in 2025 / 513 in 2024, −33.3%. Includes debt/corporate rounds, so this is not a strictly comparable VC-only series. Prose supports annual figures despite the chart alt text saying projected 2025. Retain funding-round label.
- [BVK / CB Insights 2025 report](https://www.bvkap.de/files/content/Studien/Studien%20Archiv/20260126_BVK%20Global%20Venture%20Capital%20report%202025_FINAL.pdf), p.3: approximately −17% global VC deal count, around 29,500 versus over 35,000. [CB Insights Q3 2026](https://www.cbinsights.com/research/report/state-of-venture-q326/) confirms shrinking deal activity but its public summary does not provide a comparable annual count-growth pair. Rolling three-month tracker data are not substituted for annual figures.
- [Monsha’at report index](https://monshaat.gov.sa/en/monshaat-reports): search retrieval lists Q2 2025 SME Monitor; direct open timed out. No newly verified comparable founder/company census or revenue observation obtained. Registration totals and entrepreneurship survey rates remain excluded.

## Data gaps and next refresh

Unique ecosystem-wide founder and active-company totals remain unavailable for every region; the displayed covered populations must stay qualified. MENA revenue and worldwide founders are explicitly unavailable. Obtain primary Kamco Q2 2026 evidence before updating GCC revenue; obtain comparable public global deal observations before replacing annual 2025. Do not add overlapping regions, convert annual data into monthly statistics, or substitute funding amounts, profits, registrations or survey entrepreneurship rates for requested metrics.

Validation: run frontend TypeScript, lint/build and `node frontend/scripts/check-regional-metrics.mjs` against the local app. Browser checks cover all four regions, Arabic/English, mobile/desktop, source links, negative signs and unavailable states.

A pull request or successful build does not establish production deployment. Hostinger must be separately released and verified with serving SHA and route/assets checks under `DEPLOYMENT.md`.

### Validation results — 1 November 2026

Passed: production build with required public environment values, TypeScript, targeted ESLint, all 265 frontend tests, and `git diff --check`. Browser regression script was added but could not execute: Playwright's required Chromium v1248 was absent and repeated downloads returned invalid ZIP archives. Arabic/mobile/desktop browser validation remains outstanding; no visual or production verification is claimed.
