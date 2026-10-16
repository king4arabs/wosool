# Public collections: source and release checkpoint

Review date: 16 October 2026. Base main: `23cd902`. Main CI was green. Concurrent PR #70's Arabic startup/API changes and PR #41 were inspected and left untouched.

## Bounded correction

`usePublicCollection` previously collapsed every failure into a message. Founder and news consumers could consequently restore bundled records after an authoritative denial or withdrawal; founders also showed snapshots before the first API response. The shared state now distinguishes network/server failure from client errors, clears previous pages on client errors, and prevents later outages from reversing an earlier successful/client-error response within the same mounted collection. Existing source data, moderation, account claims and editor changes are untouched.

Consumers updated: `/founders`, `/news`, and profile-associated news. Company/startup lists share safer pagination/error state but have no newly added snapshot. This does not claim a cross-session withdrawal ledger, alter server publication rules, or finish the separate homepage/detail fallback review. A network outage before any authoritative response may still use a labeled reviewed snapshot. No migration/import is needed.

## Primary-source spot-checks

- [Misk Launchpad](https://hub.misk.org.sa/en/programs/entrepreneurship/misk-launchpad/): retrieved its Swarm Robotics testimonial. Annual revenue above USD 200,000 is still program-reported without a named reporting year. No year, audit or approval was inferred; no new candidate qualified.
- [Falak's Mohtwize story](https://falak.sa/en/blogs/22/Startup-Story:-Mohtwize), published **10 June 2021**: business-model discussion (production fees, sponsorship, subscriptions) and listener/episode counts do not establish a revenue result for a defined period. The `/en/startups` landing-page retrieval failed; that failure is not a completed source review.
- [Mohtwize's official about page](https://www.mohtwize.com/en/us): the company story names Khalid Alkenaa as its founder, but the retrieved team section contains repeated/conflicting CEO names. The older Falak founder/CEO wording is insufficient to establish today's role. Keep revenue and current-role verification unresolved; do not infer a current title or copy a potentially mismatched portrait. No new public profile or story was created.

This is not a fresh review of every program, founder, social link or asset. Registry/profile review dates remain unchanged. No outreach or invitations were sent.

## Verification and release boundaries

- `content:check`/`content:review`: 44 founders, 33 companies, 42 news stories; zero integrity failures and zero founder reviews due. The separate startup dataset remains 14 researched records; no entries promoted.
- Local lint, TypeScript, 115 unit tests, entrepreneur validation and production build passed. Six new state tests cover empty responses, loading, 4xx, 5xx/network errors, retry precedence, pagination deduplication and resource isolation.
- `npm run test:collections:browser` starts an isolated production frontend and intercepts API responses; no live database or accounts are used. CI installs Chromium and requires 84 scenarios across three consumers, two languages, two viewport sizes and seven response states, including outage → denial → outage retries. Local browser installation returned invalid/truncated archives; local browser acceptance is not claimed. CI must pass before merge.
- PHP/Composer are unavailable locally; backend tests remain a CI gate. No backend code changed.
- Live checks on **16 October 2026, 05:41 UTC** observed Unifonic company-specific metadata, `noindex` on an unknown founder route, and HTTP 200 `ready` from `/api/ready`. The founder-specific title was also observed earlier in this review. These verify the preceding SEO behavior, not this new collection fix, hosting source SHA, production imports or cron.
- Source push/merge and Cloudflare checks are distinct from Wosool.org's Hostinger deployment. Deploy through the existing hosting process, then verify this new behavior independently. No configured Hostinger control or production database session is available in this run.

Next: pass PR CI (including browser scenarios), verify release status, then continue OpenAPI field schemas, whole-database newsroom filters and remaining fallback surfaces. Existing role/traction corrections needing admin application remain listed in `docs/CONTINUOUS-DEVELOPMENT.md`.
