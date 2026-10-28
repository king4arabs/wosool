# Founder directory presentation — 28 October 2026

## Country discovery

- `/founders` offers 247 supported country/territory options in four groups: Saudi Arabia, the remaining GCC countries, MENA, then the world. These are filter choices, not invented founder records. Empty countries show the ordinary empty state.
- Country/region/search filters run in the API before pagination. Legacy profiles without a founder country use their primary public company. Sector/stage facets cover the full visible directory.
- The shared coverage policy omits `IL` and `IR` from options and public founder/company/startup results, counts and relationships. Direct excluded profile URLs return 404. Frontend snapshots, cards, metadata and sitemap generation apply the same policy. Records are retained for authorized administration; no explanatory exclusion message is rendered publicly.
- Labels and sort order are stored in both languages to avoid server/browser ICU differences. The country-code list comes from the system ISO 3166 registry; names are localized with ICU and reviewed short names for Palestine, Hong Kong and Macao.

## Cards and regions

- All founder cards use the shared `ProfileCard`, including future API registrations. The upper logical corner contains a small country flag from the founder or company location.
- Flags are original 4:3 SVGs from [flag-icons 7.3.2](https://github.com/lipis/flag-icons/tree/v7.3.2); the MIT license is included in `frontend/public/flags/LICENSE.txt`. They are served locally without an external flag CDN.
- Company logos use an uncropped contain box with reserved space beside the flag. Missing/broken logos try the company's own website favicon, then its name. Favicons remain compact rather than being enlarged across the logo area.
- Portraits use a stable circular frame, natural proportions and a slightly raised crop. Missing/broken images show initials; no portraits or membership evidence are fabricated. Source portrait upgrades for Mazin and Faisal are recorded separately in `FOUNDER-COPY-PORTRAITS-2026-10-28.md`.
- Saudi Arabia, GCC, MENA and World buttons use equal grid tracks/heights. Narrow layouts use two columns and desktop layouts use a single row when sufficient space is available, in Arabic and English.

## Community indicator

The percentage is a measured activation/participation indicator, separate from private operating scorecards. Active accounts start at 50 for activation, plus five points for each approved introduction (up to 25) and each published community post (up to 25) in the last 90 days. Hidden/deleted posts, pending/declined introductions and old activity do not contribute. The maximum is 100.

Unclaimed profiles and unavailable measurements display an em dash beside activation status. A random 62–92% value is intentionally not presented as real engagement. The card's tooltip explains the scoring criteria without editorial or AI-process notes. Only the aggregate indicator is public; private introduction text, post text, operational scores and logs remain hidden.

## Validation

- The three new backend presentation/coverage/engagement tests pass on PHP 8.3.36, 8.4.27 and 8.5.12 in [CI run 40740249654](https://github.com/king4arabs/wosool/actions/runs/40740249654). Existing founder/company privacy and contract tests also pass. Each backend matrix job reports 266 passed and 16 failures caused by the known duplicate news source URL from the baseline.
- Frontend: 206 of 207 tests pass; the sole failure is the same pre-existing newsroom duplicate. Lint and production compilation pass.
- `frontend/scripts/check-founder-presentation.mjs` checks actual browser geometry, country requests, hidden records, empty states, broken assets, flags, score values and region controls at 320, 390, 768 and 1440 px in both languages. All eight development and all eight clean-production browser cases pass without hydration errors. Mobile Arabic and desktop English screenshots were visually reviewed. The check is included in frontend CI.
- Deployment remains separate from this change. Publish frontend/backend together and apply the guarded biography migration through the normal release procedure.
