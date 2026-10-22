# Homepage founder discovery — 22 October 2026

The homepage requested only the first 12 public API founders. The carousel selected a fixed first 18 records; the broader 144-profile editorial catalog appeared only while loading or after errors. This prevented visitors from discovering most of the researched profiles during normal operation.

The homepage now shows a permanent, explicitly labeled public-source spotlight and a separate collection of current public API profiles. Matching live slugs are excluded from the spotlight to avoid duplicates. Membership and messaging remain properties of the live profile. The editorial spotlight is an independent published collection, not a substitute response for a denied member/API collection; individual profile pages retain their existing denial and withdrawal handling.

Each homepage showcase uses a new random seed after hydration. A stable per-visit order provides up to 36 carousel cards with a Saudi-first cadence, including GCC, MENA and global profiles. The shuffle control creates another mix without reload. Search and region/sector filters keep the same seed; clearing them restores the visit's selection. The full grid preserves its source ordering and pagination. Switching languages clears translated sector selections and resets grid pagination while preserving the visit's shuffle seed. Reduced-motion settings, keyboard controls, touch scrolling and pause behavior remain available. Other directory carousels retain their existing order and size.

Public API requests use the existing `community=1` restriction to exclude unclaimed editorial imports and fetch 100 founders per page, with a 20-page limit, abort support and slug deduplication. A failed later page fails the collection rather than silently claiming a complete result. Client errors clear earlier live founders. Available sourced company traction now reaches the founder scorecard instead of being omitted by its adapter.

## Newly sourced editorial profiles

All listed pages were retrieved on 22 October 2026. Only the six new rows receive that review date. Existing biographies, moderation and review dates are unchanged.

| Founder | Company | Verified role | Evidence |
| --- | --- | --- | --- |
| Hassan Albalawi / حسن البلوي | WakeCap | Co-founder & CEO | [Investor profile](https://sosv.com/company/wakecap/), [official product site](https://www.wakecap.com/), [Web Summit speaker identity and Saudi location](https://qatar.websummit.com/attendees/qat26/f40574fd-fc77-4c25-8f8b-9aed0f7ac8db/hassan-albalawi/) |
| Jad Antoun / جاد أنطون | Huspy | Co-founder & CEO | [Official company page](https://www.huspy.com/ae/about), [company leadership article](https://www.huspy.com/ae/blog/jad-antoun-featured-as-one-of-the-gcc-s-most-influential-leaders) |
| Mohamed Al Fayed / محمد الفايد | grubtech | Co-founder & CEO | [Official founding team and product description](https://grubtech.com/en/about) |
| Brian Chesky / برايان تشيسكي | Airbnb | Co-founder & CEO | [Official biography](https://news.airbnb.com/about-us/leadership/brian-chesky) |
| Nathan Blecharczyk / ناثان بليتشارزيك | Airbnb | Co-founder & Chief Strategy Officer | [Official biography](https://news.airbnb.com/about-us/leadership/nathan-blecharczyk) |
| Joe Gebbia / جو غيبيا | Airbnb | Co-founder | [Official biography](https://news.airbnb.com/about-us/leadership/joe-gebbia) |

The company websites and biographies support short original Arabic/English descriptions. Five authentic portraits were retrieved from these company/investor pages and their exact image URLs and source pages are recorded in `asset_sources`. Jad's portrait and all unverified social accounts/logos remain empty, using the existing initials fallback. A company-linked LinkedIn URL for Jad returned 999 and was not added as a verified account. No revenue figures, audit claims, approvals, membership or invitations were added. Huspy remains pending in the separate revenue-gated startup catalog.

The new frontend/backend catalog pair is registered explicitly in the content checker, source mapper and additive founder importer. Totals: 150 founders, 83 company groups, 42 stories. Existing editor-owned records and moderation continue through the existing importer behavior.

## pnpm install fix

The root workspace file approves `esbuild` and `unrs-resolver` with `allowBuilds`; no `onlyBuiltDependencies` or blanket script approval is added. The pnpm lockfile imports the checked-in npm dependency locks. A non-interactive frozen install passed under Node 22.23.4 with pnpm 12.14.0 and both approved postinstallers completed. The imported locks currently select esbuild 0.28.1 and unrs-resolver 1.11.1; name-based approvals also cover the versions reported by hosting without requiring dependency upgrades. npm locks remain for the established npm CI jobs. Hostinger settings retain pnpm and Node 22.

## Verification and release boundary

Local content checks report zero integrity problems and zero overdue reviews; 12 content tests and 164 frontend tests pass. TypeScript, lint, the frontend production build and the backend Vite asset build pass. PHP is unavailable in this runner. Local browser acceptance passes with the available Chromium headless shell (the new-version download returned a truncated archive); GitHub CI independently checks: Arabic/English at 390px and 1366px, full API pagination, 36 unique cards, shuffle, stable search reset, community-only requests, grid navigation, locale changes with selected sectors, fresh reload, no overflow and no hydration errors. Required Laravel CI validates the 150-founder/83-company import, editor preservation and the existing public contracts on each PHP runtime.

Merge only after all required checks pass. The frontend release makes the editorial cards available; importing the six additions into the production API requires the existing backup/staging and `wosool:import-founders` process. Source publication and a preview build do not establish Wosool.org deployment, production database imports or the hosting build result. No production import, account activation, invitation or hosting configuration change is part of this source change.
