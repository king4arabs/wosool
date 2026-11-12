# Founder expansion — 12 November 2026

Adds seven bilingual profiles at four Saudi companies. The editorial catalog now contains 385 founders and 209 companies. The frontend snapshot, backend importer and content-review registry share the same batch. Public profiles remain unclaimed; adding a sourced profile does not create a member account or send an invitation. Existing per-visit shuffling and responsive cards are preserved.

## Evidence and identity

| Company | Founders | Evidence |
| --- | --- | --- |
| SEVEN Car Lounge | Adel Alrajab; Talal Alrajab | [Company-issued release, 2 March 2024](https://www.einpresswire.com/article/692839694/seven-concours-2024-unveils-world-class-automotive-show-in-the-gcc), [company website](https://sevencarlounge.com/), [Singer partnership report identifying Adel as CEO](https://driven.site/news/singer-seven-car-lounge-partnership-saudi-arabia) |
| NOB Marketing Solutions | Naseer Alodah / ناصر العودة | [Founder's public LinkedIn biography](https://www.linkedin.com/in/naseer-alodah-%D9%86%D8%A7%D8%B5%D8%B1-%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9-53ab04151/), [MENA Leaders profile](https://bridgemena.com/mena-leaders/naseer-alodah), [official services](https://nob.sa/) |
| Salasa | Abdulmajeed Alyemni; Hasan Alhazmi | [Company announcement naming both founders and their roles](https://salasa.co/resources/blog/30-million-series-b-round-led-by-artal-capital), [company history](https://salasa.co/about-us) |
| Lawazem | Abdulhakim Albisher; Nasser Alshaya | [Investor announcement naming both founders](https://merak.capital/blog/merak-capital-leads-usd-8-million-pre-series-a-round-in-lawazem), [current investor portfolio](https://merak.capital/portfolio-companies/lawazem), [official product website](https://www.lawazem.com/) |

Six professional LinkedIn profiles were matched by name and company. Talal's LinkedIn remains blank because a matching profile was not verified. No portraits, contact details, membership claims or revenue estimates are added.

Lawazem's 2024 announcement names Abdulhakim as CEO while the current portfolio names Nasser as CEO. Both cards use the stable co-founder role without assigning a disputed current executive title. Salasa's live article heading is dated 29 July 2025, but its announcement body explicitly says 4 August 2025; the card uses only August 2025. Its own current history says 2017, which takes precedence over a contradictory investor timeline. Funding is described as funding, never revenue.

## Original company logos

- SEVEN: official website icon, https://sevencarlounge.com/seven-favicon.png (gold mark on black).
- NOB: original embedded purple SVG from https://nob.sa/; copied without modifying paths, colors or viewBox.
- Salasa: original embedded SVG from https://salasa.co/; copied without modifying paths, colors or viewBox.
- Lawazem: investor-provided company logo, https://cdn.prod.website-files.com/67ca547b3438f540d7a9161f/68f189c5bde40b75b34137e1_lawazem-min.png .

Logos use the existing contain sizing and dark/light card treatment. The source images identify the companies; no endorsement is implied. The Lawazem storefront denied the local HTTP request, so its investor's confirmed link and logo were retained without bypassing the restriction.

## Recurring upkeep and release

The existing “Wosool daily news and founders” automation was updated with the owner's instruction to keep discovering and publishing verified founder profiles; its existing schedule was preserved. No duplicate scheduled task was created.

After backend release, run the existing idempotent `php artisan wosool:import-founders` command to add these records to the production database. It preserves editor changes, deletions and existing account status. Source merge, production import and live deployment must be reported separately.
