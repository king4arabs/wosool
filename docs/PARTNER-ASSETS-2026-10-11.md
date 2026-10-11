# Partner asset transparency audit — 2026-10-11

All nine requested partner assets have transparent backgrounds. No raster background removal, recoloring, generated logos, or CSS blend-mode simulation is required. Original brand colors remain intact. Visual inspection included the original PNGs and rendered previews of each SVG; previews were temporary inspection files, not website assets.

| Organization | Public asset | Dimensions / viewBox | Transparency and source |
| --- | --- | --- | --- |
| EO Riyadh | `eo-riyadh.png` | 6666 × 3201 | Original RGBA; alpha 0–255, 96.22% fully transparent. [Official chapter resources](https://brand.eonetwork.org/chapter-resources/) and [chapter archive](https://member.eonetwork.org/member/EOResources/Chapter%20Logos%202024/EO%20Riyadh.zip). Primary RGB PNG. |
| The Garage | `the-garage.png` | 357 × 174 | Original RGBA; alpha 0–255, 80.47% fully transparent. Black artwork from the [official header asset](https://thegarage.sa/assets/images/logo/logo.png). |
| Misk | `misk.svg` | 0 0 200.57 90.43 | Transparent SVG; two small rectangles belong to lettering, not a background. [Official primary horizontal RGB artwork](https://brand.misk.org.sa/wp-content/uploads/2025/06/Misk_P_H_RGB.svg), documented by the [brand portal](https://brand.misk.org.sa/misk-logo/). |
| HUMAIN | `humain.svg` | 0 0 101 14 | Transparent SVG paths, no background. Exact [official artwork](https://www.humain.com/content/dam/PIF-Humain/hero-logos/humain-logo.svg), previously recorded in `docs/research/EOA-SOURCES-2026-10-11.md`. |
| RDIA | `rdia.svg` | 0 0 567 172 | Transparent SVG, no background. [Official artwork](https://www.rdia.gov.sa/images/logo.svg). It combines a white RDI symbol with dark bilingual lettering; preserve both and choose a container background with sufficient contrast. |
| Flat6Labs | `flat6labs.png` | 170 × 46 | Existing RGBA; alpha 0–255, 58.03% fully transparent. Its yellow square is part of the logo, not an unwanted background. Retained unchanged. [Official website](https://flat6labs.com/) references its own current PNG variants; the original download URL of this pre-existing local file is not recorded, so no new byte-for-byte provenance claim is made. |
| PwC | `pwc.svg` | 0 0 70 53 | Existing transparent SVG with no background rectangle; retained unchanged. [Official website](https://www.pwc.com/). Exact origin of the pre-existing local SVG is not recorded in the existing research notes. |
| SVC | `svc.png` | 319 × 120 | Existing RGBA; alpha 0–255, 63.34% fully transparent. Navy/teal artwork retained unchanged. [Official website](https://svc.com.sa/en/). Exact origin of the pre-existing local PNG is not recorded in the existing research notes. |
| KAUST | `kaust.svg` | 0 0 63.176 60.795 | Replaced the pre-existing International Programs Office sub-brand with the exact original university symbol referenced by the [main university homepage](https://www.kaust.edu.sa/en/): [official SVG](https://www.kaust.edu.sa/ResourcePackages/KAUSTMain/assets/dist/images/kaust-logo.svg). Transparent paths and original colors. Original artwork; line endings normalized from CRLF to LF. |

## EO hero asset and layout

The separately supplied `eo-riyadh-supplied.png` is 375 × 134 with an opaque black background (alpha 255 throughout). It is the user's requested hero artwork and remains unchanged. Partner strips should use the existing transparent primary or inverse chapter originals. `eo-riyadh-inverse.png` is 6665 × 3201, RGBA alpha 0–255, with the same original clear space.

The primary EO artwork's non-transparent bounding box is `(1708, 1081, 4922, 2120)` within its original canvas. The inverse artwork's box is `(1717, 1081, 4912, 2120)`. These measurements explain why equal image dimensions produce unequal apparent sizes. Retain approved clear space when balancing layout dimensions; do not stretch or recolor artwork.

The old KAUST SVG's white rectangle was inside a `clipPath`, not an opaque background. Its actual problem was identity: it explicitly read “International Programs Office.” The new original main-site symbol corrects that scope without synthesizing or editing the logo. The replacement was parsed and checked for scripts, event handlers, foreign objects and embedded images before copying its original artwork, with only CRLF-to-LF normalization. The downloaded original SHA-256 is `08f8b64a1b01d005d4e3da6efb006a4cfb30ff11187e0d1201bea3cfb41a4386`.

No organization relationship states, publication settings, source records, or component markup were changed in this asset audit. Asset authenticity and visual fit are independent of relationship approval.
