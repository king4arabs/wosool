# Founder expansion — 10 November 2026

Eight new bilingual public profiles across five companies extend the existing catalog to 367 founders and 200 companies. These companies are new to this directory; founding and funding dates are not presented as new November events. Profiles are unclaimed and do not create member accounts or send invitations. The existing per-visit shuffle is preserved.

## Evidence

| Company | Founders added | Primary evidence |
| --- | --- | --- |
| COGNNA | Ibrahim Alshamrani, Ziyad Alshehri | [Investor founder record](https://faithcapital.com/portfolio/cognna); [company funding statement](https://www.cognna.com/blog/series-a-funding-cybersecurity) |
| Rekaz | Abdulrahman Alomran, Abdulaziz Alkharashi | [Investor statement](https://impact46.sa/impact46-participates-in-rekazs-5m-seed-round-to-digitize-service-businesses/); [product](https://rekaz.io/) |
| Nabt | Abdullah Alotaibi | [Merak founder profile](https://merak.capital/blog/nabt-leading-the-future-of-agritech-in-saudi-arabia); [product](https://nabt.app/) |
| Flawless | Shaima Alghamdi | [Company founder and product page](https://weflawless.co/about-us) |
| Ovasave | Torkia Mahloul, Majd Abu Zant | [Company founder biographies](https://www.ovasave.com/our-story); [product](https://www.ovasave.com/) |

COGNNA's US$9.2m Series A is dated December 2025 in its own statement, despite a secondary roundup dating it October 2026. The company date is retained. Rekaz's operating figures are attributed to Impact46's July 2025 statement. Flawless's figures are explicitly company-reported. Funding and usage are not labelled revenue. Ovasave's own history dates its launch to October 2022; some secondary pages say 2023, so the primary date is used. Unconfirmed founding years and social links are omitted.

## Original logos

Copied without alteration; white artwork uses the existing dark header treatment. Sources:

- COGNNA: https://cdn.prod.website-files.com/68619c5d239c7a3f045f1866/68627ff979447e86b21d5462_COGNNA-LOGO-White%20(1).webp
- Nabt: https://nabt.app/new-nabt/logo-white.svg
- Flawless: https://weflawless.co/_next/static/media/Main-Logo.3b470656.svg
- Ovasave: https://www.ovasave.com/_next/static/media/footer-bottom-logo.b5b65073.png

## Responsive changes

- Switch carousel and grid columns using the available container width, including narrow desktop panes.
- Keep long names, roles, domains and engagement labels within each card.
- Use 16px text in mobile search/select inputs to avoid iOS focus zoom.
- Keep pagination controls within narrow containers and use compatible carousel vertical overflow behavior.
- Preserve native expandable evidence, 44px touch targets, reduced-motion support and per-visit ordering.

## Validation and release

Content integrity and mirror checks passed (367 founders, 200 companies, zero problems). All 344 frontend unit tests, 12 content tests, logo validation, lint, TypeScript and the production build passed. Chromium preview checks covered Arabic and English carousel/grid rendering, a search for the new COGNNA profiles, and expanded source details. CSS viewport checks at 272, 340, 909 and 1363 pixels found no document or card overflow. These were browser zoom checks, not a physical iPhone or Safari test. The local environment has no PHP/Composer runtime; Laravel import repeatability must pass in repository CI. Production publication and `php artisan wosool:import-founders` require the authenticated Hostinger deployment environment; the merged source is not evidence of a live database import.
