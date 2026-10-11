# Partner asset transparency audit — 2026-10-11

All nine requested partner assets have transparent backgrounds. No raster background removal, recoloring, generated logos, or CSS blend-mode simulation is required. Original brand colors remain intact. Visual inspection included the original PNGs and rendered previews of each SVG; previews were temporary inspection files, not website assets.

| Organization | Public asset | Dimensions / viewBox | Transparency and source |
| --- | --- | --- | --- |
| EO Riyadh | `eo-riyadh.png` | 6666 × 3201 | Original RGBA; alpha 0–255, 96.22% fully transparent. [Official chapter resources](https://brand.eonetwork.org/chapter-resources/) and [chapter archive](https://member.eonetwork.org/member/EOResources/Chapter%20Logos%202024/EO%20Riyadh.zip). Primary RGB PNG. |
| The Garage | `the-garage.png` | 357 × 174 | Original RGBA; alpha 0–255, 80.47% fully transparent. Black artwork from the [official header asset](https://thegarage.sa/assets/images/logo/logo.png). |
| Misk | `misk.svg` | 0 0 200.57 90.43 | Transparent SVG; two small rectangles belong to lettering, not a background. [Official primary horizontal RGB artwork](https://brand.misk.org.sa/wp-content/uploads/2025/06/Misk_P_H_RGB.svg), documented by the [brand portal](https://brand.misk.org.sa/misk-logo/). |
| HUMAIN | `humain.svg` | 0 0 101 14 | Transparent SVG paths, no background. Exact [official artwork](https://www.humain.com/content/dam/PIF-Humain/hero-logos/humain-logo.svg), previously recorded in `docs/research/EOA-SOURCES-2026-10-11.md`. |
| RDIA | `rdia.svg` | 0 0 567 172 | Transparent SVG, no background. [Official artwork](https://www.rdia.gov.sa/images/logo.svg). White letters and the Saudi emblem sit inside the black connected tiles; the bilingual text is black. A normal transparent frame on the light section preserves the intended contrast. The previous gray backing was unnecessary and has been removed. |
| Flat6Labs | `flat6labs.png` | 170 × 46 | Existing RGBA; alpha 0–255, 58.03% fully transparent. Its yellow square is part of the logo, not an unwanted background. Retained unchanged. [Official website](https://flat6labs.com/) references its own current PNG variants; the original download URL of this pre-existing local file is not recorded, so no new byte-for-byte provenance claim is made. |
| PwC | `pwc.svg` | 0 0 70 53 | Existing transparent SVG with no background rectangle; retained unchanged. [Official website](https://www.pwc.com/). Exact origin of the pre-existing local SVG is not recorded in the existing research notes. |
| SVC | `svc.png` | 319 × 120 | Existing RGBA; alpha 0–255, 63.34% fully transparent. Navy/teal artwork retained unchanged. [Official website](https://svc.com.sa/en/). Exact origin of the pre-existing local PNG is not recorded in the existing research notes. |
| KAUST | `kaust.svg` | 0 0 63.176 60.795 | Replaced the pre-existing International Programs Office sub-brand with the exact original university symbol referenced by the [main university homepage](https://www.kaust.edu.sa/en/): [official SVG](https://www.kaust.edu.sa/ResourcePackages/KAUSTMain/assets/dist/images/kaust-logo.svg). Transparent paths and original colors. Original artwork; line endings normalized from CRLF to LF. |

## EO hero asset and layout

The separately supplied `eo-riyadh-supplied.png` is 375 × 134 with an opaque black background (alpha 255 throughout). It remains archived unchanged, but the hero now uses the authentic transparent `eo-riyadh-inverse.png` to fulfill the request for transparent logos. This inverse original is 6665 × 3201, RGBA alpha 0–255. Light sections use the primary original. Both are framed to their visible bounds with 160 original pixels of clear space on every side, without modifying the image pixels.

The primary EO artwork's non-transparent bounding box is `(1708, 1081, 4922, 2120)` within its original canvas. The inverse artwork's box is `(1717, 1081, 4912, 2120)`. These measurements explain why equal image dimensions produce unequal apparent sizes. Retain approved clear space when balancing layout dimensions; do not stretch or recolor artwork.

The old KAUST SVG's white rectangle was inside a `clipPath`, not an opaque background. Its actual problem was identity: it explicitly read “International Programs Office.” The new original main-site symbol corrects that scope without synthesizing or editing the logo. The replacement was parsed and checked for scripts, event handlers, foreign objects and embedded images before copying its original artwork, with only CRLF-to-LF normalization. The downloaded original SHA-256 is `08f8b64a1b01d005d4e3da6efb006a4cfb30ff11187e0d1201bea3cfb41a4386`.

No organization relationship states, publication settings, source records, or component markup were changed in the initial asset audit. Asset authenticity and visual fit are independent of relationship approval.

## Follow-up: shared logo fitting and company assets

`BrandLogo` now renders partner strips, partner-directory cards, founder scorecards and company scorecards using a transparent bounded contain box. It preserves original colors, aspect ratios and alpha channels; there is no multiply blend, color filter or browser canvas background removal. Failed images resolve to the company name. Partner cards now display the available `logoUrl` instead of always showing initials. Wosool header/footer intrinsic dimensions match the original 914 × 205 SVG viewBox.

The existing Kitopi and Salla PNGs remain unchanged. Their large empty margins are framed with SVG viewBoxes, including clear space: Kitopi `(326, 242, 3349, 1053)` in a 4000 × 1542 canvas, and Salla `(321, 164, 858, 1173)` in a 1500 × 1500 canvas. Every nontransparent pixel remains inside these frames. This makes the visible marks readable without stretching or depending on `object-view-box` support.

Five opaque or externally hosted JPEG/WebP references now resolve to reviewed transparent assets. Swarm's existing transparent original is also served locally for reliability. The frontend maps all six legacy URLs, so existing API records benefit without reseeding the production database. Editorial snapshots use the new paths; other company facts and publication states are unchanged.

| Organization | New local asset | Official source and handling |
| --- | --- | --- |
| Canva | `startup-directory/canva-logo.svg` | Original gradient wordmark, viewBox 2000 × 642, from [Canva's brand guidelines](https://canvacreative.team/brand-logo), linked by Canva's newsroom. [Source SVG](https://canvacreative.team/brand-logo/_assets/media/1a28ab381da510b00de5bb6df43622dc.svg). Only the external legacy DOCTYPE was removed; artwork nodes and attributes match the original. |
| Foodics | `startup-directory/foodics-logo.svg` | Original charcoal transparent wordmark, viewBox 194.141 × 26.235, from [Foodics](https://www.foodics.com/wp-content/uploads/2021/12/foodics-logo.svg). |
| Paymob | `startup-directory/paymob-logo.svg` | Original blue transparent wordmark, viewBox 148 × 32, referenced by [Paymob's official Saudi checkout](https://checkout.paymob.sa/): [source SVG](https://checkout.paymob.sa/_next/static/media/paymobLogo.29ead46c.svg). |
| Rasan | `startup-directory/rasan-logo.png` | Original transparent white/green wordmark from the header of [Rasan Careers](https://careers.rasan.co/), linked by the official company site. [Source](https://images.teamtailor-cdn.com/images/s3/teamtailor-production/logotype-v3/image_uploads/07c88afb-3845-42e4-a6db-7613dda3bc5d/original.svg) returns actual PNG bytes despite its URL suffix. Its native 144 × 30 image is capped at 144 CSS pixels and uses the existing navy card header for contrast. No recoloring. |
| Jahez | `startup-directory/jahez-logo.webp` | Original transparent RGBA wordmark, 2560 × 638, from the [official homepage asset](https://jahezgroup.com/wp-content/uploads/2025/07/Jahez-Logo-Red-1-scaled.webp). The previous 768 × 191 variant returns HTTP 200 but is opaque RGB with a black matte. |
| Swarm Robotics | `startup-directory/swarm-logo.svg` | Exact existing [official homepage asset](https://swarmrobotics.io/_app/immutable/assets/swarm-logo.5jvVSQNz.svg), served locally unchanged. Transparent SVG with four embedded original PNG/mask layers, no external resources or scripts. The original remote URL remains healthy; it was localized for reliable delivery. |

The replacement SVGs were inspected for scripts, event handlers, external resources, foreign objects and embedded images; raster alpha channels were verified. Swarm's embedded original raster layers are intentional and were inspected. Original source hashes and dimensions were checked before use. Transparency of future third-party uploads still depends on the supplied image; use transparent PNG, WebP or SVG artwork instead of JPEG or an opaque screenshot.

## Follow-up validation

The production build generated all 79 pages. Lint, TypeScript and all 44 frontend tests passed. Browser checks covered 80 responsive combinations: five routes (`/`, `/eoa`, `/eoa/partners`, `/partners`, `/founders`), Arabic and English, widths 320/390/768/1440, and Chromium 141/Firefox 142. Generic, framed and EO image-failure fallbacks were also checked in both engines. Eight final targeted checks confirmed fully loaded responsive EO images and the local transparent Jahez and Swarm originals. There was no horizontal overflow, artwork clipping or JavaScript error; all eight founder logos loaded. Fixture-backed directory previews validated logo-bearing records without changing production data.

WebKit/Safari runtime checks could not run because the available WebKit installation lacks required native libraries. The implementation uses standard image sizing, SVG viewBoxes and alpha transparency; Safari compatibility is not claimed as runtime-verified.
