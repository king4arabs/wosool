# Internal editorial evidence — 28 November 2026

Baseline main 708f2686fe36093446ce5c1d9e014aa815fd6007; prior PR #305 head 6db40e8d3165289e654f621d5d4e79b7f4de66d5. Previous CI run 45915067773 failed Composer audit in all three PHP jobs; frontend, pnpm and guardrails passed. Main has since received a Symfony security lock update. Only changelog overlaps between the two branches; retain both histories and require a fresh hosted run. No automatic merge promotion.

## Sources

- Mawj: https://www.fwdstart.me/p/saudi-ai-startup-mawj-raises-series-a-as-customer-service-competition-grows (26 November), https://mawj.ai/ (current official product and client claims), https://www.startupresearcher.com/news/mawj-raises-series-a-led-by-seedra-ventures. Full round size undisclosed. Founder additions held until an official founder-link source is verified.
- XEBO.ai: https://www.xebo.ai/about, https://www.egf.gov.ae/en/news/emirates-growth-fund-invests-%2410.5-million-in-uae-built-ai-company-xebo.ai (26 November), https://www.xebo.ai/me/pr/xebo-ai-series-a-emirates-growth-fund, https://www.gccbusinessnews.com/emirates-growth-fund-invests-in-xebo-ai/; official company and investor agree on Yash Sultania and Anand Nigam. Investor describes a signed investment agreement rather than confirmed disbursement; 350+ clients served since inception, not current paying customers or revenue. Personal profile URLs and artwork not added without verification. Name fallback retained.

## Candidate and verification

Two new founder records, one company and two briefs, on top of three founders and two briefs already pending in #305. Candidate totals 445 founders / 237 companies / 162 news. All existing main catalog pairs matched by blob SHA. Prior additions and news mirrors checked. New bilingual data, HTTPS references, unique news ids/slugs/URLs and synthetic duplicate detection checked in isolated JavaScript data checks. Updated existing registration and regression assertions; full PHP, TypeScript, browser and content-integrity suites require hosted CI. Local clone could not resolve github.com; application entry-point execution and before/after ordinary functional bug reproduction were not performed.

## Source-inspected feature map (runtime unverified)

| Feature ID | Entry | Role and prerequisites | Journey and states | Existing test |
|---|---|---|---|---|
| public-founders-discovery | /founders | public, AR/EN, moderated API | search and filter; loading/empty/error/success; fresh visit order, mobile | frontend/scripts/check-founder-directory-discovery.mjs |
| public-founder-scorecard | /founders/[slug] | public, AR/EN, published record | open card; missing/denied/not published; company attribution, name fallback, no membership implication | frontend/scripts/check-founder-presentation.mjs |
| public-news-discovery | /news | public, AR/EN | search/open, loading/empty/error/success; dates, source links, Arabic body and image fallback | frontend/scripts/check-news-discovery.mjs |

Next deterministic checks: route and selector inventory drift with deliberately broken fixture; catalog mirror drift and duplicate negative fixture; source notes absent from public Arabic/English cards; mobile and dark logo panel. Browser evidence and independent two-model 10/10 holdout unavailable. Trust stage remains local, source-inspected only; no promotion or production release. Existing data, editorial edits, private state, UI and Hostinger configuration untouched. No production import. Rollback source candidate by reverting its PR if merged; do not restore database over live writes.
