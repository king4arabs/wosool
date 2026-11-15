# Saudi-business founder expansion — 15 November 2026

Internal research and release evidence. Public cards contain concise bilingual business biographies, official websites and source links.

## Identities and geography

Nine new people at four companies were checked against the existing 398 profiles by name, slug, company key and website. Both 15 November JSON catalogs now contain 11 profiles, including the two previously added Lambda Studios founders. Overall totals: **407 founders, 219 companies, 139 news briefs**.

| Founder | Company | Origin evidence | Saudi business connection |
| --- | --- | --- | --- |
| Mohammed Omar / محمد عمر | Q Mart / كيو مارت | The owner identified him as Yemeni; no independent primary nationality statement was established during this review, so the public biography does not make that claim. | His podcast appearance confirms founding Q; the company describes itself as a Jeddah-based Saudi retailer. |
| Talha Ansari / طلحة أنصاري | Retailo / ريتيلو | Forbes identifies the three co-founders as Pakistani. | Official company announcement identifies Retailo as founded and headquartered in Riyadh in 2020. |
| Wahaj Ahmed / وهاج أحمد | Retailo / ريتيلو | Same nationality source; official company page confirms the individual co-founder identity. | Same founding-business connection. |
| Muhammad Nowkhaiz / محمد نوخيز | Retailo / ريتيلو | Same nationality source; official company page confirms this spelling. | Same founding-business connection. |
| Mohamed Nabil / محمد نبيل | WideBot / وايد بوت | EgyptInnovate identifies the founders as Egyptian entrepreneurs. | Investor profile and Egypt's 2026 ecosystem report describe the headquarters relocation to Riyadh. |
| Mohamed Mostafa / محمد مصطفى | WideBot / وايد بوت | EgyptInnovate identifies him by name in the founding story. | Same headquarters connection. |
| Saif Ahmed / سيف أحمد | WideBot / وايد بوت | The innovation-fund profile and investor founder roster identify him in the Egyptian founding team. | Same headquarters connection. |
| Gaurav Biswas / غوراف بيسواس | TruKKer / تراكر | Forbes identifies both founders as Indian. | Current company professional page lists Riyadh headquarters; official contact page lists its Riyadh office. |
| Pradeep Mallavarapu / براديب مالافارابو | TruKKer / تراكر | Same nationality source; Raed Ventures confirms the individual co-founder identity. | Same headquarters connection. |

`country_code=SA` and `region=saudi` describe the business location used by the existing directory. They do not establish the founder's citizenship, current personal residence or membership. No new nationality schema, account, invitation or membership association is created. No portraits are inferred from names.

## Sources

- **Q Mart:** https://qeu.app/ ; https://sa.linkedin.com/company/qmartsa ; identity-matched profile https://sa.linkedin.com/in/محمد-عمر-099114240 . The publisher's **15 July 2026** Btroli episode, “كيو Q: من العمل بالأجر اليومي إلى تغيير شكل السوق,” is linked in full in both catalogs (Apple Podcasts episode `1000776966983`, show `1532674246`). It distinguishes his earlier co-founding of Al-Sala Al-Eqtisadiya from founding Q. No founding year, customer count or revenue is asserted.
- **Retailo:** https://retailo.co/about names Talha Ansari, Muhammad Nowkhaiz and Wahaj Ahmed. https://www.forbesmiddleeast.com/lists/50-most-funded-startups-2022/retailo/ supplies the nationality evidence. Company-issued release: https://www.prnewswire.com/news-releases/retailo-raises-36m-million-in-landmark-series-a-round-for-empowering-community-commerce-in-mena-region-301472407.html . The **February 2022 US$36m Series A** combined equity and venture debt; it is retained as a dated historical financing event. The biography describes the Riyadh founding connection rather than claiming each person's present residence or job title.
- **WideBot:** https://denvc.com/meet-our-portfolio/widebot/ provides the three founder identities, CEO/CTO/CPO titles and their exact personal LinkedIn targets. https://mbrif.ae/member/widebot/ confirms Nabil and Ahmed and the 2016 founding year. Founding story: https://egyptinnovate.com/en/success-stories/widebots-success-story-from-incubation-at-the-technology-innovation-and-entrepreneurship-center . Egypt's 2026 report confirms relocation: https://mcit.gov.eg/Upcont/Documents/Reports%20and%20Documents_2192026000_ar_Egypt_Startup_Ecosystem_Report_2026_21092026.pdf . Current company website https://widebot.ai/ supplies the attributed **300+ enterprises / 40+ countries** figures; older investor reach figures are not substituted for those current website claims. The official site redirects from `widebot.net` to `widebot.ai`.
- **TruKKer:** https://raed.vc/portfolio/trukker/ confirms both founders. https://www.forbesmiddleeast.com/lists/50-most-funded-startups-2022/trukker/ supplies Indian nationality. https://www.linkedin.com/company/trukkertech lists Riyadh headquarters, corroborated by https://www.trukker.com/contact-us . https://www.trukker.com/about-us supplies the attributed **75,000+ verified trucks / three continents** figures and 2016 founding year. The company began in the UAE; the biographies do not claim it was founded in Saudi Arabia.

## Original logo assets

| Company | Local artwork | Official asset source | Surface |
| --- | --- | --- | --- |
| Q Mart | `/company-logos/q-mart.png` | https://framerusercontent.com/images/Qq9X89lZNx94WL3VOIJAONc7E.png, referenced by https://qeu.app/ | Light |
| Retailo | `/company-logos/retailo.svg` | https://retailo.co/images/retailo-logo-eng.svg | Light |
| WideBot | `/company-logos/widebot.webp` | https://cdn.prod.website-files.com/67e9abca114b7db95b2e01ae/67eac162477f3cab5a0f5f55_logo-header%403x.webp, referenced by https://widebot.ai/ | Dark |
| TruKKer | `/company-logos/trukker.webp` | https://www.trukker.com/images-new/trukker-logo.webp | Dark |

Artwork is original and unmodified. The SVG was checked for scripts, event handlers and external references. The existing shared renderer preserves proportions and provides the registered dark surface for pale wordmarks. The audit registry now covers **201/219 companies and 373/407 founder cards**; 18 companies retain existing fallbacks.

## Validation and release boundary

Frontend/backend catalogs are byte-identical and loaded by the existing frontend and additive Laravel importer. Existing integrity expectations were updated to the new totals. The content check verifies duplicate identities, complete bilingual data, HTTPS evidence, traction attribution and mirror parity. No hosting configuration or dependency inputs changed.

Local validation passed: 12 content-review tests; the content integrity command with zero problems; all 395 frontend tests, including founder links, bilingual search, identity and logo checks; TypeScript; and the production-environment webpack build. PHP is unavailable in this workspace, so the Laravel importer test must run in GitHub CI. No production database import was executed here.

Production database import and live Hostinger publication require their own observed results. The repository does not deploy production through GitHub CI. Preserve the accepted `a7be830` Hostinger deployment baseline and all administrator edits and deletion controls when releasing.
