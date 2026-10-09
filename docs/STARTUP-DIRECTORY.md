# Sourced business and founder directory

## Public experience

The homepage and `/startups` share proportional logos, authentic available founder portraits, concise company/founder biographies, roles, websites and verified social links. Community cards use the same layout and retain member-profile links. The public research catalog does not create memberships, imply Wosool/EO endorsement or invent financial scores.

Cards default to two rows with three records per row per page. Manual left/right controls, swipe, keyboard scrolling, two/four/six-row selection, pagination and reduced-motion support are included. Search, region, business type, sector and program/event filters run before API pagination; Load more retrieves further result batches.

Classification reflects the primary offering, not whether a company uses technology:
- **Technology:** software, digital platforms, robotics and technology products.
- **Traditional goods & services:** physical goods and professional/consumer services, including technology-enabled service delivery.
- **Sector** describes the industry; **focus area** describes the concrete customer problem and offering.

Thiqa is classified under traditional services because the customer-facing offering is tutoring. Its technology-enabled/EdTech positioning is retained in its focus and sources.

## Evidence and publication rules

An entry appears publicly only when moderation permits publication, its official website has been reviewed as active, and it has a linked company-specific revenue source. Revenue statuses are `reported`, `financial_statement` or `pending`. Published evidence is **not** equivalent to an independent audit or approval by a program.

Every revenue record retains a source URL, reporting period, bilingual summary and actual review date. Distinguish ARR, cumulative revenue and period revenue. Never substitute investment, valuation, GMV, customer counts, forecasts, revenue targets or portfolio-wide totals for company revenue. Historical revenue proves activity in the stated period; it does not establish current annual revenue.

Website checks use retrieved official-site content, including indexed first-party pages when direct retrieval is blocked. A review date is not continuous uptime monitoring. Follow redirects, verify the identity and reject parked/unrelated sites. Never bypass access restrictions.

## Current catalog

13 researched profiles; 10 meet the current publication criteria.

| Region | Eligible profiles | Pending revenue evidence |
| --- | --- | --- |
| Saudi Arabia | Foodics, Tamara, Swarm Robotics, Rasan | Unifonic, Salla |
| Other GCC | Huspy, Lisan, Verofax, Thiqa Education | Kitopi |
| Other MENA | Paymob | — |
| Global | Canva | — |

Five newly researched entries come from Misk, Impact46, LEAP and GITEX/Expand North Star. The source registry tracks all ten requested organizations, including unresolved candidates and precise limitations. **Do not claim complete coverage of all ten.** CODE, Monshaat, Multiverse, Falak, Lamarka and The Garage remain in further research.

Rasan's current official leadership page lists Moayad Alfallaj as chairman; older CEO biographies were not reused as current roles. Rasan's investor page has inconsistent year labels, so no amount is reproduced. Tamara's financial evidence refers specifically to Tamara Finance Company and unaudited interim results. Swarm's Misk testimonial omits the revenue year. Thiqa's exhibitor total is cumulative and self-reported.

Canonical files:
- `backend/database/data/startup-directory.json`: reviewed profiles, classifications, revenue evidence and asset provenance.
- `backend/database/data/startup-directory-sources.json`: source coverage and research queue.

Eight logos and two portraits are bundled locally. Other original assets use published URLs with readable text/initial fallbacks; no portraits are synthesized. Lisan's and Verofax's original white logos sit on a dark surface to preserve their brand artwork. Social accounts are included only when linked by an official source or verified public profile. Country/region means business origin, not founder nationality. The catalog includes scaleups and listed businesses.

## Database rollout

After deploying:

```sh
php artisan migrate --force
php artisan directory:import --dry-run
php artisan directory:import
php artisan directory:review-due --all
```

The import validates the entire file before a transactional, idempotent upsert. It preserves moderation flags, skips newer editorial revisions and never deletes member data. Pending records remain stored but are excluded by the API. This initial migration has not previously been deployed.

Publishing code does not deploy hosting, migrate the production database or import live records. Those still require hosting/database access.

## Continuing review

A weekly Sunday-morning review targets Misk, CODE by MCIT, Monshaat, Multiverse by MCIT, Impact46 (requested as “Impact 64”), Falak, Lamarka, The Garage, LEAP and GITEX. Prioritize Saudi → other GCC → MENA → global; keep unsupported candidates out of public results.

`directory:review-due` lists records for source review without advancing dates. Only actual review changes `reviewed_at`. Recheck official websites, revenue periods, leadership, logo availability and social ownership; then validate, commit, deploy and re-import. Keep withdrawn profiles unpublished.

## Verification

109 Laravel tests and 18 frontend tests passed. Frontend lint, type checks and production build passed. Arabic/English browser checks passed at 390px and 1280px. Laravel coverage includes import idempotency, moderation preservation, publication gates, region ordering, pagination, combined filters, literal search, missing evidence, overdue flags and public active-only relationships. Frontend coverage includes primary-company and social-link mapping. Run backend tests, frontend tests, lint, type checks and production build. Browser QA covers Arabic/English at mobile and desktop widths with sourced fixtures; it does not prove production import or every external provider's availability.
