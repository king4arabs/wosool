# Requested partner assets

Reviewed: **2026-10-08**. This register preserves the owner’s requested sequence: EO Riyadh, The Garage, RIDA, Misk, CODE. It records asset provenance and unresolved publication decisions; it does not establish a partnership.

## Review result

| Order | Requested organization | Identity | Original logo | Relationship designation |
| --- | --- | --- | --- | --- |
| 1 | EO Riyadh | Verified chapter | Official primary RGB transparent PNG | Needs review |
| 2 | The Garage / الكراج | Verified | Official header transparent PNG | Needs review |
| 3 | RIDA | Exact entity unresolved | Not supplied; no substitute | Needs review |
| 4 | Misk Foundation | Verified | Current official horizontal RGB SVG | Needs review |
| 5 | CODE | Verified MCIT Center of Digital Entrepreneurship | Standalone approved artwork required | Needs review |

`asset_status: verified` means the saved file is an authentic, unmodified asset from the stated official source. It does **not** mean Wosool has permission to publish a partnership claim. `designation_status` stays `needs_review` until an administrator records the approved relationship and logo-use basis. Do not make an unverified partner visible merely because a logo file exists.

The reviewed repository files, including `backend/database/seeders/WosoolSeeder.php`, `frontend/src/data/seed.ts`, localized seed data, and `docs/`, contain no requested partner records or documented approvals. Existing generic/demo partner records are not evidence. The owner’s brief establishes the requested list but explicitly requires unresolved identities/designations to be queued for review.

## Official sources and use requirements

### EO Riyadh

- Chapter identity and destination: https://member.eonetwork.org/riyadh/
- Official chapter asset selector: https://brand.eonetwork.org/chapter-resources/
- Original package: https://member.eonetwork.org/member/EOResources/Chapter%20Logos%202024/EO%20Riyadh.zip
- Exact archive member: `EO Riyadh/RGB/Primary/PNG/EO_Riyadh_RGB_primary.png`.
- Saved unchanged as `/partners/eo-riyadh.png`. The source package was delivered successfully by the publicly linked official endpoint.
- Usage: https://brand.eonetwork.org/logo/ and the chapter-resource guide. Use approved chapter artwork, preserve clear space, and do not alter its colors, elements, or proportions. EO’s general external-use guidance calls for its full organization name with the primary or stacked mark; chapter approval should confirm the proposed external partner-strip context. Do not compose a new logo by adding text to the saved chapter artwork.

### The Garage

- Official destination: https://thegarage.sa/
- Original asset: https://thegarage.sa/assets/images/logo/logo.png
- Saved unchanged as `/partners/the-garage.png`. The official homepage’s JavaScript bundle references this exact file in the public header.
- Use on a light, high-contrast background; the original artwork is black with transparency. No artificial background removal, recoloring, or cropping was applied.
- Official terms: https://thegarage.sa/terms. Articles 6 and 10 require authorization for use of the name/logo in a way that implies partnership, sponsorship, or accreditation. Record written authorization before publishing such a designation.

### RIDA

- No official identity or website is assigned. Existing records and the supplied abbreviation do not distinguish it reliably from similarly named entities.
- Keep the admin record with requested order 3. Obtain the exact entity name and official website, then source its genuine logo and confirm its designation. Do not substitute RDIA or Riyadah.

### Misk Foundation

- Official destination: https://misk.org.sa/en/
- Official logo guide: https://brand.misk.org.sa/misk-logo/
- Original asset: https://brand.misk.org.sa/wp-content/uploads/2025/06/Misk_P_H_RGB.svg
- Saved byte-for-byte as `/partners/misk.svg`. It is the current primary horizontal RGB asset supplied by the brand guide, including the full bilingual foundation wordmark. No SVG optimization or artwork edits were applied.
- The guide requires clear space based on the M in the wordmark, correct color variants, adequate contrast, and preservation of all logo elements. The chosen positive version belongs on a light background. The old 2021 header logo remains on parts of the corporate site; the brand portal’s current asset takes precedence.
- Reference guide: https://brand.misk.org.sa/wp-content/uploads/2026/02/Misk_guidelines_v3.1.pdf

### CODE

- Verified official identity and current destination: https://mcit.gov.sa/code
- Former destination: https://code.mcit.gov.sa/ (redirects to the page above).
- The MCIT page explicitly identifies CODE as its digital-entrepreneurship program. Its application links are hosted on `code.datalexing.sa`, as linked from that official page.
- The current page uses ministry branding. `https://mcit.gov.sa/themes/custom/mcit/images/code/CODE.png` was visually inspected and is an event photograph, not a logo; it was rejected and is not stored in the repository.
- The indexed official report URL `https://code.mcit.gov.sa/sites/default/files/2024-08/CodeReportQ1V22Aug.pdf` now redirects to HTML. No report crop or unrelated logo was used.
- Obtain a current approved standalone CODE SVG/PNG from MCIT. The identity may be shown in an accurately sourced directory, but the requested partner strip entry remains pending asset and designation review.

## File integrity

All saved artwork is copied without modification. PNG files include original transparency. The SVG parses successfully and contains no script or foreign-object elements. Temporary inspection previews are not website assets.

| File | Original dimensions | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `eo-riyadh.png` | 6666 × 3201 | 213,805 | `335fae8a3057760c725b01125169242355360b363bde717797e2aee653fc51db` |
| `the-garage.png` | 357 × 174 | 8,836 | `dc86d6f9b07dee303d93e176f0292bc7627c0c329722bcd0c9bc215e74563df3` |
| `misk.svg` | viewBox 0 0 200.57 90.43 | 35,695 | `3df8bb3476088298877568ace0c55e4fa337224bd15ea3ceef4ba6bcbc9eaa61` |

## Integration guidance

- Import the five records in `PARTNER-ASSETS.json` idempotently by slug, preserving the requested display order.
- Keep unresolved entries available in the admin queue with the specific issue shown in `notes`; use null for unknown URLs and missing assets.
- Require verified identity, the approved relationship designation, a verified logo asset, and an explicit visibility decision before listing an entry in **Proud of Partners / نفخر بشركائنا**.
- Render approved logos as linked images using `object-fit: contain`, original aspect ratios, accessible organization names, and generous clear space. Do not add visible descriptions beneath the logos.
- Do not crop the EO file’s built-in transparent margins to make it appear larger. Adjust the layout’s available width while retaining the complete original image.
- Link to the verified organization website in each record. Any motion must respect reduced-motion preferences and allow pause.
