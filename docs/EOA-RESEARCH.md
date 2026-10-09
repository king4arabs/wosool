# EOA research register

Verified **2026-10-08** against the primary sources below. This register records program facts and public organizations, not private-company eligibility or local approvals.

EO's FAQ was rechecked **2026-10-09**: revenue limits, duration, learning cadence, fees and membership progression remain as recorded below. Integration review found conflicting RIDA identity claims in the merged project records. RDIA itself is verified, but the brief's RIDA-to-RDIA mapping is **not established**; keep the requested RIDA designation pending explicit confirmation. No live data was rewritten to force that mapping.

## Program facts and resolved conflicts

| Topic | Published fact / implementation | Primary source |
| --- | --- | --- |
| Revenue | Gross annual revenue **US$250,000–999,999**; preserve USD as the source currency. No claim that SAR250,000–1m is equivalent. | [EO Accelerator](https://eonetwork.org/accelerator), [EO FAQ](https://eonetwork.org/accelerator/faqs/) |
| Indicative SAR | At SAR3.75/US$1: SAR937,500–3,749,996.25. SAMA peg policy published 2020-05-04, checked 2026-10-08. This is a stated conversion basis, not a transaction quote or new eligibility rule. | [SAMA statement](https://sama.gov.sa/en-US/MediaCenter/News/Pages/news-557.aspx) |
| Venture-funded companies | FAQ publishes a private-funding alternative of US$250,000–999,999. The self-check routes such circumstances to human review, not automatic qualification. | [EO FAQ](https://eonetwork.org/accelerator/faqs/) |
| Duration | Two-year learning program; no approved local launch date assumed. | [EO FAQ](https://eonetwork.org/accelerator/faqs/) |
| Cadence | Four learning days annually plus monthly accountability, described as 8–12 accountability meetings, usually 2–4 hours monthly. Pillars: Cash, Strategy, People, Execution. Local attendance/absence policy awaits approval. | [EO overview](https://eonetwork.org/accelerator), [EO FAQ](https://eonetwork.org/accelerator/faqs/) |
| Fees | Global **US$1,750 annually**, additional local chapter costs; July–June year and proration. Local operating fees, sponsor contributions and participant payments remain separate draft fields. | [EO FAQ](https://eonetwork.org/accelerator/faqs/), [EO application/payment process](https://resources.eonetwork.org/legacy-knowledgebase/eoa-application-payment-process) |
| Membership | Reaching US$1m can support progression toward EO, subject to current criteria, application and chapter review. Accelerator application/acceptance does not confer membership. | [EO FAQ](https://eonetwork.org/accelerator/faqs/) |
| Three cohorts | Not represented as an official EO requirement. Cohorts are locally configurable operational records. | No primary evidence establishing this as an EO rule |
| Recruitment | 10–15 qualified participants before launch; at least 25 within two years. Selective company readiness/founder commitment. These are user-supplied **local targets**, not achieved counts. | Project brief; local planning, not a global rule |

Governance, chair title and target positioning are supplied by the project owner. Vision 2030 alignment describes entrepreneurship, private-sector growth, national capabilities and international connections, without claiming endorsement. No quantitative Saudi startup statistics are fabricated or published.

## Public ecosystem import

`backend/database/data/eoa-organizations.json` contains bilingual names, organization type/sector, location, official URL, founder-support summary, source URL, verification date/status and separate relationship status. `eoa:install` inserts only missing slugs. It does not overwrite live editorial work, merge applicant companies, invent contacts or determine private revenue/eligibility.

| Order | Organization / correction | Source and support | Initial relationship |
| --- | --- | --- | --- |
| 1 | EO Riyadh / EO الرياض | [Chapter site](https://eoriyadh.org/), [EO chapter directory](https://eonetwork.org/chapters/riyadh/): local chapter leadership and founder network | Prospective pending approved record |
| 2 | The Garage / الكراج | [Official site](https://thegarage.sa/): tech startup support, incubation/acceleration and founder ecosystem | Prospective |
| 3 (pending identity mapping) | **RDIA**, Research, Development and Innovation Authority / هيئة تنمية البحث والتطوير والابتكار | [Official site](https://www.rdia.gov.sa/en/): verified R&D and innovation entity. Do not substitute it for the requested “RIDA” without project confirmation. The separate RIDA review record remains in the partner registry. | Unconfirmed; mapping requires review |
| 4 | Mohammed Bin Salman Foundation “Misk” / مؤسسة محمد بن سلمان «مسك» | [Official site](https://misk.org.sa/en/): leadership and entrepreneurship development; program access follows the organization's terms | Prospective |
| 5 | **CODE**, MCIT's Center of Digital Entrepreneurship / مركز ريادة الأعمال الرقمية | [Official MCIT page](https://mcit.gov.sa/code): digital entrepreneurship, incubation and related support. It is not an unrelated organization named Code. | Prospective |
| 6 | Monsha’at / منشآت | [SME Support Centers](https://www.monshaat.gov.sa/en/ssc): SME advisory, training and business support | Ecosystem |
| 7 | National Technology Development Program / البرنامج الوطني لتنمية تقنية المعلومات | [NTDP](https://ntdp.mcit.gov.sa/), [MCIT 2024 annual report](https://www.mcit.gov.sa/sites/default/files/2025-04/MCIT_AnnualReport_2024.pdf), pp. 66–67: technology company development/support programs | Ecosystem |

No approved partnership records were found in the repository. Public-source existence or an available logo is not partnership evidence. Admission companies remain in private program applications; directory organizations remain separate records. No production database export was available to substantiate live duplicates or stale private records, so there is no claimed production cleanup.

## Authentic logo register

Assets remain unmodified in `frontend/public/partners`. No redraws, recoloring or wordmark recreation. CSS uses `object-fit: contain`, logical spacing, official links and accessible labels. Relationship confirmation controls publication independently from asset availability.

| Entity | Asset | Official origin |
| --- | --- | --- |
| EO Riyadh | `eo-riyadh.png`, `eo-riyadh-inverse.png` | [EO chapter brand resources](https://brand.eonetwork.org/chapter-resources/), [Riyadh ZIP](https://member.eonetwork.org/member/EOResources/Chapter%20Logos%202024/EO%20Riyadh.zip); RGB Primary PNG and inverse originals |
| The Garage | `the-garage.png` | [Logo used by its official site](https://thegarage.sa/assets/images/logo/logo.png), referenced by the site's application bundle |
| RDIA | `rdia.svg` | [Official logo](https://www.rdia.gov.sa/images/logo.svg) |
| Misk | `misk.svg` | [Official brand portal](https://brand.misk.org.sa/misk-logo/), [primary horizontal RGB SVG](https://brand.misk.org.sa/wp-content/uploads/2025/06/Misk_P_H_RGB.svg) |
| CODE | **Pending** | Identity verified on [MCIT](https://mcit.gov.sa/code). Its `CODE.png` asset was inspected and is an event photograph, not a standalone logo. Do not substitute it or redraw the mark. |

When CODE provides an approved asset, preserve it, record `logo_source_url`, update `logo_path` through a reviewed data change, and retain relationship evidence separately. Existing imported rows are intentionally not overwritten by a repeated install.

## Privacy operational reference

[SDAIA's privacy-policy preparation guideline](https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/ElaborationandDevelopingPrivacyPolicyGuideline), checked 2026-10-08, informs the local-notice approval fields: controller/contact, purposes, processors, storage locations, retention and deletion. This implementation is not a legal compliance certification. The actual operating entities, hosting locations, retention schedule, processor arrangements and rights-handling process require local review and approval before data collection.

## Ongoing verification

Recheck official requirements before each intake and when EO publishes changes. Keep global facts in source control with this register; keep local decisions in the audited admin settings. For source changes, propose a reviewed JSON/data migration with a before/after comparison and rollback record. Never turn an ecosystem entry into a confirmed partner based solely on public research, or into an eligible applicant based on speculation.
