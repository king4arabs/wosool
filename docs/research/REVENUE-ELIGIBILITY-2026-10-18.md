# Revenue eligibility correction — 18 October 2026

## Finding and bounded change

The latest main revision at inspection was `62e1397`; its CI passed. Open work in PR #70 (Arabic/API/news and founder-region changes) and #41 was left untouched. This cycle corrects two existing revenue-evidence decisions and adds API presence guards; it does not add companies, accounts, news or images.

The startup source file retains 14 records. Eight remain eligible: Foodics, Tamara, Rasan, Jahez, Lisan, Verofax, Paymob and Canva. Six remain pending: Unifonic, Salla, Huspy, Kitopi, Swarm Robotics and Thiqa. These are fresh-import eligibility counts, not a new full-catalog verification or live count. The broader founder snapshots still have 144 profiles / 79 company groups / 42 stories.

## Primary sources actually reviewed

| Source | Observed evidence | Decision |
| --- | --- | --- |
| [Misk Launchpad](https://hub.misk.org.sa/en/programs/entrepreneurship/misk-launchpad/) | Swarm testimonial reports annual revenue above USD 200,000 without the reporting year. | Set Swarm revenue status to pending; retain the claim with attribution and the missing-year limitation. No year inferred from cohort dates. |
| [Swarm official about page](https://swarmrobotics.io/about) | Describes the Riyadh robotics business and names Mohammed Bukhamsin as CEO; no period-specific revenue result. | Confirms company identity for this evidence check; does not resolve the revenue year. No full profile/asset/social review date advanced. |
| [Huspy, 28 September 2022](https://huspy.com/blog/huspy-among-top-10-uae-startups-by-linkedin) | Mentions growth in revenue alongside other progress, without a specific revenue/ARR result and reporting period. | Set Huspy revenue status to pending; keep the source and identify the publication date as such. |
| [Huspy, 21 June 2022](https://huspy.com/blog/huspy-series-a) | Reports a funding round and annualised GMV. | Neither is earned revenue; retain as a reviewed supporting source, not revenue qualification. |
| [Falak, 10 June 2021](https://falak.sa/en/blogs/22/Startup-Story:-Mohtwize) | Describes production fees, sponsorships and subscriptions for Mohtwize. | Revenue model, not a revenue result for a stated period; remains pending. Company website/current role not reverified. |
| [LEAP, 18 August 2026](https://www.insights.onegiantleap.com/blogs/a-year-after-rocket-fuel-lisans-growth-story/) | Reports Lisan ARR of approximately USD 2.6 million. | Existing attributed ARR record unchanged; no claim of recognized period revenue, financial-statement verification or program approval. |
| [Mubadala, 21 September 2026](https://www.mubadala.com/en/news/mubadala-invests-in-the-35-million-pre-series-c-round-in-paymob) | Reports Paymob revenue growth over the preceding 18 months separately from investment. | Existing attributed growth evidence unchanged; no absolute amount inferred. |
| [Canva, 2025 review](https://www.canva.com/newsroom/news/canva-2025-wrap/) | Company reports USD 3.5 billion revenue in its year review. | Existing company-reported record unchanged; not relabeled audited. |

Only Swarm/Huspy nested revenue review dates and the actually reviewed Misk/Falak registry entries advance to 18 October. No whole-profile, website, portrait, social or broader-founder review date advances. Other registry sources were not re-reviewed in this bounded cycle; their dates and unresolved statuses remain unchanged. These findings do not imply an absence of revenue or affect eligibility for the broader non-revenue founder directory.

## Implementation and acceptance

- Change only `revenue_status` and evidence attribution for the two retained records; preserve `is_published` and user-owned records.
- Exclude missing/null/empty revenue source URLs or periods before the API computes sectors, totals or pages. The importer already validates these fields. This presence check does not semantically validate arbitrary text; source review and pending status remain required.
- Regression tests cover all six source/period absence variants, facets, counts, pagination, positive restoration, pending search/source filters, and retention of original profile/website dates. Existing tests retain import idempotency, moderation and newer-editor protections.
- `content:check` and `content:review` passed: 144 founders / 79 company groups / 42 stories, zero integrity errors and zero overdue founder reviews. These commands do not independently verify the startup catalog or fetch sources.
- Local frontend validation passed: 120 unit tests, ESLint and TypeScript. All 12 content regression tests passed. No frontend runtime file or dependency changed.
- Local PHP/Composer are unavailable. Required backend CI must pass the updated `StartupDirectoryTest` and full suite before merge. Required frontend CI retains lint, types, unit/content tests, production build and isolated browser checks. Final CI and merge status are available on the associated pull request.

## Release and existing-record correction

No production deployment, database import or admin write occurred during this source change. Hosting control and production database access are unavailable in this session. On 18 October the public `/api/openapi.json` returned HTTP 404; `/api/ready` returned HTTP 200 with `status=ready`; `/api/v1/startup-directory` returned an empty collection with `meta.total=0`. An empty public collection does not establish whether records have been imported or moderated. The hosting cause and deployed source revision remain unverified.

Use the existing deployment process, backup/staging checks, then `php artisan directory:import --dry-run` and the reviewed import. The importer preserves moderation and skips rows with newer whole-profile review dates. For Swarm/Huspy, inspect any skipped production row for newer owner evidence before applying `revenue_status=pending` through the authorized admin process. Preserve its biography, assets, unrelated fields and moderation. Do not advance the bundled whole-profile review date to defeat that protection. Verify that pending entries are absent from public results, source/search filters, sector facets and counts.

Next priority: verify this correction on the deployed backend and resolve the OpenAPI download through the existing hosting process; then extend founder/company/scorecard API contracts. Production imports and hosting verification remain separate from a source merge.
