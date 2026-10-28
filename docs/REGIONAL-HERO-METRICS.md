# Regional hero indicators

Four cards occupy a 2×2 desktop grid on the right of the homepage hero. On smaller viewports the panel follows the text. Buttons select Saudi Arabia, GCC, MENA or World; these are overlapping scopes, not additive groups. Arabic/English copy, keyboard buttons and reduced-motion support are included.

This is a partial data implementation: do not publish claims that every requested regional metric is populated. Only two figures are currently verified:

- Saudi SME operating revenue growth: +7.0%, 2024 versus 2023, GASTAT Small and Medium Establishments Statistics 2024. The publication reports SAR 1,720 billion of operating revenue. This is an SME measure, not startup-only revenue. Use the published rate, not an inferred financing-growth proxy.
- Saudi venture-capital deal count growth: +31%, H1 2025 versus H1 2024, Monsha’at Q2 2025 monitor as reproduced by SPA on the Saudi national portal. The source reports 114 deals. This is funding-deal growth, explicitly selected by the owner instead of new connections.

Both source URLs and reference periods appear directly on their cards. These are verified historical observations, not a claim of the latest available release. Research was performed on 28 October 2026.

Founder and unique company totals for all four regions remain unavailable pending comparable verified datasets. Saudi 1.7m commercial registrations are not unique startups/companies and were deliberately excluded. MAGNiTT's cross-market database size is not a MENA total; its 74% funding growth is not revenue or deal-count growth. GCC, MENA and World revenue/deal-growth cells likewise remain unavailable until a source establishes the exact scope and period. No annual-to-monthly interpolation or invented baseline is used.

A ChatGPT monthly research automation has been enabled for the first day of each month, morning Asia/Riyadh. It checks primary sources, prepares tested GitHub updates and reports gaps. It does not automatically deploy Hostinger. An annual observation should remain annual even when reviewed monthly; never advance a period just to make data look fresh.

Before publication, expand the comparable data coverage or explicitly accept the unavailable states. Prefer licensed deal/company datasets where public sources cannot supply deduplicated totals. Do not expose private platform analytics as regional ecosystem statistics.

## Public-copy revision

Removed public methodology/review prose from the hero and the accelerator editorial review date. Source links, scope labels and reporting periods remain functional product information. Saudi cards now use Crunchbase's Saudi Arabia Startups hub: 781 founders and 705 for-profit companies, from the retrieved October 2026 snapshot. Both are explicitly labeled "Tracked by Crunchbase"; they are database coverage counts, not census estimates. Search snippets showed a different founder count, so the opened source page's count was used. Other regions remain unpopulated rather than borrowing Saudi figures or inventing estimates. No unavailable-data explanation is displayed publicly.

## Approved GCC model

The owner approved a revenue-growth planning estimate only: Saudi SME revenue growth 7% × 1.12 = 7.84%. This is a relative 12% uplift, not 12 percentage points. Public copy says Estimated revenue growth / نمو الإيرادات التقديري; the tooltip states the calculation and that this is not measured GCC growth. Keep this modeled figure distinct from sourced observations during monthly refreshes; do not automatically substitute it for actual GCC revenue statistics.

Other GCC cells use the researched observations: Crunchbase GCC Startups hub, 2,977 founders and 2,430 for-profit companies (retrieved October 2026); Lucidity Insights, 342 funding rounds in 2025 versus 513 in 2024, -33.3%. Lucidity's wider financing coverage includes debt and corporate rounds, so the scope label says Funding rounds. No Saudi uplift was applied to those figures. Formatting now treats founder/company counts as counts and preserves negative growth signs.


## MENA and world — 28 October 2026

MENA: Crunchbase opened hub reports 10,307 founders and 7,722 for-profit companies; these are coverage counts. Revenue card uses PwC 2026 Middle East CEO survey's 12% average as an explicitly labeled Middle East benchmark, not a measured MENA startup rate. MAGNiTT FY2025 reports 688 deals and +6% deal growth.

World: GSER 2026 covers 5.5M+ companies (dataset coverage, not active startup census). Approximate founder model: 5.5M × (10,307 / 7,722), rounded to 7.3M. The transfer of a MENA database ratio globally is an unvalidated modeling assumption; this must remain visibly Estimated founders with formula tooltip and both source links. Do not treat it as measured unique people or automatically update it as an observation. AWS 2026 survey reports 65% average annual revenue growth among surveyed startups; BVK/CB Insights reports approximately -17% global VC deal count in 2025. All URLs are stored on the corresponding cards. No monthly interpolation.
