# Founder directory — country coverage and factual scorecards (29 October 2026)

Internal editorial audit. This research and evidence matrix is not for public UI. Public founder cards show sourced factual fields only, in Arabic and English.

## Country coverage

Existing reviewed editorial founder catalogs contained 182 profiles in 11 countries. This incremental batch adds exactly two unique profiles to **each** already represented country and two to Bahrain, making 206 profiles in 12 countries. This does **not** claim two profiles for every country in the world. No existing member record was changed.

| Country | Before | New | After | Added founders |
| --- | ---: | ---: | ---: | --- |
| Saudi Arabia (SA) | 93 | +2 | 95 | Naif Alzahri / Abdulrahman Alnamlah |
| United Arab Emirates (AE) | 48 | +2 | 50 | Philip Bahoshy / Vilhelm Hedberg |
| Bahrain (BH) | 0 | +2 | 2 | Ahmed AlRawi / Moayed AlMoayed |
| Kuwait (KW) | 2 | +2 | 4 | Athbi Al-Enezi / Nouri Al-Enezi |
| Oman (OM) | 3 | +2 | 5 | Adnan Al Shuaili / Awadh Al Shukaili |
| Qatar (QA) | 1 | +2 | 3 | Mohammed Aldelaimi / Ahmed Isse |
| Egypt (EG) | 8 | +2 | 10 | Moataz Soliman / Omar Gabr |
| Jordan (JO) | 14 | +2 | 16 | Ahmed Moor / Samer Atiani |
| Lebanon (LB) | 6 | +2 | 8 | Elie Habib / Eddy Maroun |
| United States (US) | 5 | +2 | 7 | John Collison / Dylan Field |
| Australia (AU) | 1 | +2 | 3 | Cliff Obrecht / Cameron Adams |
| Brazil (BR) | 1 | +2 | 3 | Cristina Junqueira / Edward Wible |

**Totals:** 24 new founders, 12 new company keys, 206 founder profiles / 114 companies, and 65 unchanged news briefs. Founders are listed by the country of the covered venture/ecosystem, not necessarily by citizenship. For example, Anghami started in Beirut and later moved its head office to Abu Dhabi; Nubank was founded in Brazil with an international founding team.

## Founder-card specification (public, bilingual)

Every new founder uses the existing `FounderCard` / `ProfileCard` components and contains:

- Founder identity: full Arabic and English name, sourced founder role in both languages.
- Business identity: company name, concise original company description, company website and sector in both languages.
- Geography: country/flag and Saudi → GCC → MENA → global grouping.
- Factual context: a short, evidence-aligned biography, canonical public sources and last-reviewed date **in the source catalog only**. No internal research or AI/editorial process notes in public UI.
- Asset policy: use existing branded fallbacks for missing portraits and logos; do not copy third-party images without documented rights or impersonate a person with synthetic portraits.
- Membership separation: `externalProfileOnly=true`, `activationStatus=unclaimed`, `isVerified=false`, `canCommunicate=false`. Do not make member scorecards, accounts, invitations, partnership or performance claims.
- Metrics policy: no unsupported revenue, valuation, follower totals or numerical “founder quality” score. Display dated financial/traction facts only if separately sourced later.

**Internal evidence scorecard checklist** (not an invented ranking): identity confirmed by a credible source; founder-company link explicit; company website HTTPS; current title backed by company or independently corroborated evidence; Arabic and English copy present; safe asset rights; no duplicate slug/person/company mismatch; no membership insinuation. Failed checks block publication rather than reducing a made-up score.

## Identity and business evidence

| Company | New founder(s) | Official website | Primary founder evidence |
| --- | --- | --- | --- |
| Sirdab | Naif Alzahri; Abdulrahman Alnamlah | [Company](https://sirdab.co/en/) | [Evidence](https://www.ycombinator.com/companies/sirdab) |
| MAGNiTT | Philip Bahoshy | [Company](https://magnitt.com/) | [Evidence](https://svc.com.sa/wp-content/uploads/2024/05/10Years_SaudiArabia_Founders_Report_EN.pdf) |
| ekar | Vilhelm Hedberg | [Company](https://www.ekar.me/) | [Evidence](https://endeavor.org/stories/endeavor-selects-23-entrepreneurs-11-markets-93rd-international-selection-panel-riyadh-saudi-arabia/) |
| Calo | Ahmed AlRawi; Moayed AlMoayed | [Company](https://calo.app/en-bh) | [Evidence](https://www.khwarizmivc.com/calo) |
| justclean | Athbi Al-Enezi; Nouri Al-Enezi | [Company](https://justclean.com/) | [Evidence](https://justclean.com/founders) |
| eMushrif | Adnan Al Shuaili; Awadh Al Shukaili | [Company](https://www.emushrif.com/) | [Evidence](https://www.emushrif.com/en/about-us) |
| SkipCash | Mohammed Aldelaimi | [Company](https://skipcash.app/) | [Evidence](https://skipcash.app/team) |
| Dibsy | Ahmed Isse | [Company](https://www.dibsy.one/) | [Evidence](https://www.forbesmiddleeast.com/lists/the-middle-easts-fintech-50-2026/dibsy-2/) |
| Luciq (formerly Instabug) | Moataz Soliman; Omar Gabr | [Company](https://www.luciq.ai/) | [Evidence](https://www.ycombinator.com/companies/luciq) |
| liwwa | Ahmed Moor; Samer Atiani | [Company](https://liwwa.com/) | [Evidence](https://liwwa.com/about/our-story) |
| Anghami | Elie Habib; Eddy Maroun | [Company](https://www.anghami.com/) | [Evidence](https://www.anghami.com/about) |
| Stripe | John Collison | [Company](https://stripe.com/) | [Evidence](https://stripe.com/newsroom/information) |
| Figma | Dylan Field | [Company](https://www.figma.com/) | [Evidence](https://config.figma.com/india/speakers/) |
| Canva | Cliff Obrecht; Cameron Adams | [Company](https://www.canva.com/) | [Evidence](https://www.canva.com/canva-create/watch-sessions/) |
| Nubank (Nu Holdings) | Cristina Junqueira; Edward Wible | [Company](https://nubank.com.br/) | [Evidence](https://international.nubank.com.br/company/nubank-10-years-by-david-velez/) |

Supporting URLs are stored in each `source_urls` array. Evidence dates are review dates, not purported publication dates; no new news articles were generated from this directory-only batch.

## Integrity, approval and release gates

- Changes only to the two mirrored 22 October expansion catalogs, two exact-count/integrity tests and this internal research document. All prior objects are unchanged. Existing private and membership data are not imported into editorial source records.
- Keep importer registration paths, host/runtime and deployment baseline `a7be830` unchanged; use existing CI and production deployment instructions in `AGENTS.md` and `DEPLOYMENT.md`.
- Run content integrity, TypeScript/frontend and backend tests. Before merging, confirm head/main compatibility, required checks, review state and policy gates.
- **Code commit is not a production import or live deployment.** Production database import requires existing authorized host access, backup and idempotent importer; verify active Hostinger release and live HTTP/API separately.
