# Newsroom refresh — 29 October 2026

Scope: `/news` discovery, image framing and the synchronized news catalogs.

## Content evidence

Added 24 original bilingual briefs; the catalog has 89 stories. Facts and publication dates were checked against the linked article pages on 29 October. Targets, commitments, credit facilities and undisclosed amounts remain identified accurately. Duplicate announcements already represented in the catalog were omitted.

New article images passed HTTP retrieval and image decoding and were visually reviewed. Another 15 verified publisher images and two existing company logos fill previously empty artwork fields; 74 stories now have artwork. One truncated image, an unrelated first-place competition portrait and a generated shopping illustration were omitted. All images retain source attribution.

- 2026-10-29 — [BY Venture Partners closes a $60m fund for early-stage AI companies](https://www.wamda.com/2026/10/venture-partners-closes-60-million-fund-iii-early-stage-ai-startups)
- 2026-10-28 — [Tanmiya Capital closes its second fund at $130m](https://www.wamda.com/2026/10/egypts-tanmiya-capital-closes-130-million-fund-backed-eib-ifc-ebrd)
- 2026-10-28 — [GreenShift graduates 12 Egyptian green businesses](https://www.wamda.com/2026/10/nahdet-el-mahrousa-giz-support-12-green-scaleups-egp-57-5-million)
- 2026-10-28 — [Nclude reaches a final close above $112m](https://www.wamda.com/2026/10/dpi-venture-capital-closes-nclude-fund-112-million)
- 2026-10-27 — [Doha’s Downtown Tech Summit announces its speaker lineup](https://www.wamda.com/2026/10/fadi-ghandour-hamad-al-hajri-lead-discussions-dohas-downtown-tech-summit)
- 2026-10-27 — [Ajman Chamber announces plans for the Thara entrepreneurship ecosystem](https://www.wamda.com/2026/10/ajman-chamber-prepares-launch-thara-initiative-entrepreneurs-investors)
- 2026-10-27 — [Madica receives a further $6m commitment for African startups](https://www.wamda.com/2026/10/madica-secures-6-million-invest-30-african-startups)
- 2026-10-27 — [Rently secures a $12m credit facility for rental payments](https://www.wamda.com/2026/10/singapore-rently-secures-12-million-credit-facility-expand-uae)
- 2026-10-24 — [FinBursa launches an integrated platform for private markets](https://www.wamda.com/2026/10/finbursa-unveils-ai-native-platform-streamline-private-markets-operations)
- 2026-10-21 — [MNT-Halan begins trading on the Egyptian Exchange](https://www.wamda.com/2026/10/mnt-halan-completes-ipo-retail-tranche-attracts-41500-subscription-orders)
- 2026-10-20 — [Databuddy receives $500,000 from Y Combinator](https://www.wamda.com/2026/10/databuddy-analytics-raises-500000-y-combinator)
- 2026-10-19 — [Aqar Exit raises $200,000 at a reported $2m valuation](https://www.wamda.com/2026/10/egyptian-proptech-aqar-exit-attracts-investment-2-million-valuation)
- 2026-10-19 — [Tactful AI adds Hatem Dowidar as an investor](https://www.wamda.com/2026/10/tactful-ai-attracts-fresh-investment-hatem-dowidar-ahead-2027-series-a)
- 2026-10-19 — [Popcorn Studio AI announces a $1m funding package](https://www.wamda.com/2026/10/popcorn-ai-studio-secures-1-million-expand-ai-powered-filmmaking-platform)
- 2026-10-14 — [JustAd secures $5m for international expansion](https://www.wamda.com/2026/10/uae-justad-attracts-5-million-expand-new-markets)
- 2026-10-12 — [Alo Hakeem raises $165,000 for home healthcare services](https://www.wamda.com/2026/10/syrian-healthtech-alo-hakeem-raises-165000-pre-seed-led-ebla-ventures)
- 2026-10-12 — [Salehli receives $100,000 to expand home maintenance services](https://www.wamda.com/2026/10/salehli-raises-100000-expand-home-maintenance-services-syria)
- 2026-10-09 — [Endeavor Catalyst closes its fifth fund at $320m](https://www.wamda.com/2026/10/endeavor-catalyst-raises-320-million-startups-silicon-valley)
- 2026-10-09 — [COFE Tech announces backing from Phoenix Venture Partners](https://www.wamda.com/2026/10/cofe-tech-receives-new-backing-phoenix-venture-partners)
- 2026-10-07 — [Beltone and Amtaar plan an EGP2bn real estate fund programme](https://www.wamda.com/2026/10/beltone-amtaar-plan-38-million-multi-issuance-real-estate-fund)
- 2026-10-06 — [TiE Women MENA names five regional winners](https://www.wamda.com/2026/10/tie-women-mena-crowns-regional-winners-ahead-gitex-global-final)
- 2026-09-30 — [Qatar’s Aligator raises $1.2m for its PR technology platform](https://www.wamda.com/2026/09/qatar-aligator-raises-1-2-million-seed-round)
- 2026-09-28 — [Shorooq and Presight join Maven Robotics’ $100m Series A](https://www.wamda.com/2026/09/shorooq-presight-join-maven-robotics-100-million-series-a)
- 2026-09-28 — [Rela secures strategic backing for Saudi workforce housing](https://www.wamda.com/2026/09/rela-lands-strategic-investment-scale-workforce-housing-saudi-arabia)

## Behavior and release

The public region/topic controls and chronological selector are removed. Search and incremental display remain; legacy region/topic/sort query parameters are ignored and cleared on interaction. Stable identity ranks keep search/pagination consistent within each visit. Random seeds are initialized after hydration.

The image component uses centered `object-contain` within fixed frames, preserving the entire source image. Missing or failed images retain the source-name tile. The importer backfills missing artwork without replacing admin selections or reviving deleted records.

Before production import, follow DEPLOYMENT.md and preserve the database backup. Run `php artisan wosool:import-news --dry-run`, inspect the counts, then `php artisan wosool:import-news` in the released backend. Verify the new records and image fields through the public API. Frontend snapshots are outage-only and must not override successful empty, forbidden or withdrawn API responses.

Local browser QA was unavailable: the managed preview launcher supplies Vite flags (`--host`, `--strictPort`) to `next dev`. No production build or runtime setting was changed to accommodate it. Browser regression coverage is registered in CI for Arabic/English at 360, 768 and 1440 pixels. The local PHP version is below the repository's required floor, so PHP execution tests must run in CI on the supported runtime matrix.
