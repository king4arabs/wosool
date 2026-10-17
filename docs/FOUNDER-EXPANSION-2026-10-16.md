# Wosool public founder directory expansion — 16 October 2026

## Scope and publication standard

This research batch adds **100 profiles associated with 54 company groups** to the existing **44 profiles / 33 company groups**, resulting in **144 public editorial founder/entrepreneur profiles at 79 distinct company keys** in the checked-in catalogs. Geographic distribution: **Saudi Arabia 76**, **other GCC (UAE) 39**, **MENA outside GCC 26**, and **global 3**. Regional classification describes the company's ecosystem, *not a person's citizenship*.

New records: **40 Saudi, 35 other GCC, 25 other MENA**. These are public-source researched entries only. They do **not** create a verified Wosool member, endorsement, Accelerator affiliation, private contact address, or account. The existing verified/claimed-user process remains separate. An entrepreneur-network listing is described as “Featured entrepreneur,” not automatically elevated to founder/CEO. Leadership may change and sourced profiles need periodic review.

New records store bilingual names, company context, brief biographies, source links, sector, region, and company website. If an authenticated portrait, company logo, exact role, founding year, verified personal social account, or performance metric is unavailable, keep it blank; cards have readable fallback names/initials. **Do not invent sales or revenue.** Existing sourced traction statements stay unchanged and distinguish funding, turnover, user counts and transactions.

## Source hierarchy and example documents

1. **First-party entrepreneur directories**: [Endeavor Saudi entrepreneurs](https://saudi.endeavor.org/entrepreneur-companies/), [Saudi company directory](https://saudi.endeavor.org/companies/), [Jordan company directory](https://jordan.endeavor.org/companies/), [Lebanon company directory](https://lebanon.endeavor.org/companies/), [Endeavor Dubai multiplier research](https://endeavor.org/dubaimultipliers/). These identify companies and associated named entrepreneurs but do not necessarily establish each person's present management title.
2. **First-party company details**: [Nawy founders and roles](https://www.nawy.com/about-us), [Ziina company story](https://ziina.com/about), [Pure Harvest founding team](https://pureharvestfarms.com/investors), [eyewa leadership](https://eyewa.com/sa-en/careers), [nybl founding team](https://nybl.ai/our-story/), [Property Finder corporate history](https://www.propertyfinder.sa/en/about-us.html).
3. **Ecosystem / investor evidence**: [Misk Launchpad testimonials](https://hub.misk.org.sa/en/programs/entrepreneurship/misk-launchpad/), [RAED portfolio](https://raed.vc/portfolio/), [Y Combinator — baraka](https://www.ycombinator.com/companies/baraka), [Y Combinator — Ziina](https://www.ycombinator.com/companies/ziina), [The National on Dukkantek's team](https://www.thenationalnews.com/business/start-ups/2022/04/11/generation-start-up-how-dukkantek-is-transforming-traditional-retail/).

Canonical link(s) for each individual row are in `source_url` and `source_urls` of the JSON; review date denotes editorial inspection, *not* verification of site uptime or formal identity.

## Structured catalogs

- `backend/resources/data/founder-directory.json` — original 44 editorial entries.
- `backend/resources/data/founder-directory-expansion-2026-10-16.json` — 100 additions.
- `frontend/src/data/founder-spotlight.json` — original fallback snapshot.
- `frontend/src/data/founder-spotlight-expansion-2026-10-16.json` — equivalent read-only frontend snapshot.

The importer loads both catalogs, validates all records **before the transaction**, and creates sourced public founder/company rows without registering users, emailing invites or changing existing member-entered content. Existing companies are matched by `directory_key` and, where needed, website host. Founder profiles are matched by `directory_key` and (name + company). Existing rows are preserved. Country order is Saudi → GCC → MENA → global. The client still honors API visibility and withdrawal decisions; source snapshots are available only on transient API errors before the API has provided an authoritative response.

## Interface changes

- Browse cards in the existing three-second auto-moving founder rail; at most 18 cards are mounted in the rail at once to avoid rendering all 144 simultaneously.
- Switch between Saudi, GCC, MENA and other region filters; counts and filter labels are bilingual and selection is accessible through `aria-pressed`.
- Browse the entire filtered directory in a separately paginated grid (6, 12 or 24 per page), without silently discarding the remaining records.
- The `/founders` page requests 100 records per API page to reduce repeated network fetches; subsequent pages remain reachable via the load-more control.
- An editorial sourced card displays “Public-source profile” instead of “Awaiting activation” or “Verified member.”

## Production rollout (required)

**A Git commit is not a production import.** Frontend build release and Laravel release should use the *same* deployed revision. Follow production change control, including a database backup before any import, then run:

```sh
cd backend
php artisan migrate --force
php artisan wosool:import-founders
```

Expected total **on an empty database with only canonical catalog data**: 144 founder profiles / 79 company groups; on existing production, added counts will be smaller because existing entities/edits are preserved. No members, invitations or email are created.

After deployment, smoke test `/founders` in both Arabic and English, confirm live `/api/v1/founders?per_page=100` region-order and total metadata, load page two, search a new Saudi/GCC/MENA founder, open individual profiles, verify links and responsive cards, confirm withdrawn/hidden records stay hidden, and confirm no unapproved member or privileged information is exposed.

## Future source maintenance

Prioritize confirmed Saudi founders through CODE (MCIT), Multiverse, Tech Founders, Misk, Monsha'at, LEAP and Money20/20, then other GCC, then wider MENA. Add company websites and independently corroborated founders where possible; source the precise founder–company pairing rather than the mere existence of an organization. Recheck changing leadership roles and stale links, and use official company or investor publications for revenue (period and unit required). Avoid scraping sites that disallow automated access, and never republish personal emails without an appropriate consent basis.

## Validation checkpoints

Run frontend lint/type-check/unit tests, frontend build, and Laravel test suite (including `FounderActivationTest`) via CI before merge. In source data check:
- 144 total entries, 100 new, 79 unique company keys
- no duplicate slug or person name in the combined directory
- all entries contain bilingual core content and an HTTPS company/source URL
- zero fabricated portraits/social handles or unsourced traction figures in the expansion
- importer remains additive, repeatable and never creates user accounts
- editorial snapshots equal backend JSON catalogs and do not replace live moderation.
