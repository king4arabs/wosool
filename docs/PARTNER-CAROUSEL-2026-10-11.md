# Partner logo sections — October 11, 2026

The Wosool homepage and EO Riyadh Accelerator now share a continuous rightward logo strip. Equal-width logo slots, identical gaps, and half-gap padding at each repeat boundary keep the spacing even. Original artwork retains its aspect ratio and transparency. The strip includes pause/play, arrows, touch scrolling, keyboard navigation, and a complete responsive grid. Reduced-motion visitors receive the static grid automatically. Repeated groups are hidden from assistive technology and their links are excluded from tab order.

All carousel images load eagerly so an approaching repeat is ready before it enters the viewport. Other BrandLogo consumers retain their existing loading behavior. The server renders a single-height strip rather than briefly showing a multi-row grid during hydration.

## Partner content and availability

The homepage now requests every public partner page instead of stopping at twelve entries. Publication filters remain unchanged. A successful API response, including an empty list, remains authoritative. Previously fetched partners survive a temporary retry failure.

On October 11, `https://wosool.org/api/v1/partners` returned HTTP 500. During that outage, the frontend displays the owner's explicitly requested, identified organizations using local assets:

- Wosool: EO Riyadh, The Garage, Misk, CODE.
- EOA: EO Riyadh, The Garage, Misk, CODE, LAMARKA, HUMAIN.

EOA uses the same release snapshot while its program data is unavailable, and retains the existing EO chapter mark once a successful API response arrives. These display lists record the owner's October 11 instruction; they are not a claim that externally verified partnership agreements were obtained. No production database rows, approval flags, or relationship evidence were changed. Existing administrator publication controls continue to govern successful API responses.

RIDA remains unresolved: the supplied abbreviation does not establish a specific organization. RDIA's existing asset remains available for API-approved records; it is not substituted for RIDA.

## Additional original artwork

| Organization | Asset and source | Handling |
| --- | --- | --- |
| CODE | `/partners/code.png`, [NauaTech's published partner artwork](https://naua.tech/assets/images/partners/code.png), labeled on its [partner list](https://naua.tech/thank/en). Identity is separately established by [MCIT](https://mcit.gov.sa/code). | Original 450 × 450 RGBA PNG. Actual alpha transparency. Visible artwork lies at x=70, y=117, width=308, height=198. An SVG viewBox `(58,105,332,222)` removes excess canvas from the display while keeping all artwork and clear space; image bytes are unchanged. |
| LAMARKA | `/partners/lamarka.png`, [original PNG](https://www.armadaiq.com/_next/static/media/Lamarka.69833ab9.png) explicitly labeled “Lamarka logo” on [Armada IQ](https://www.armadaiq.com/). Identity and company website are separately established by the [company's LinkedIn page](https://sa.linkedin.com/company/lamarka-global). | Original 560 × 73 RGBA transparent white wordmark. It is presented on the existing navy brand surface for contrast, retaining original white artwork. No inversion, recoloring, background removal, or generated replacement. |

These two assets are sourced from organizations displaying the named brands, not claimed to be downloaded from the brand owner's identity portal. LAMARKA's own website returned HTTP 502; MCIT's current CODE page did not provide a standalone logo. The EOA organization import catalog now records these exact asset paths and source URLs; relationship states remain unchanged. Legacy artwork URLs resolve to local originals for stable loading and deduplication.

Existing EO Riyadh, Garage, Misk, HUMAIN, RDIA, Flat6Labs, PwC, SVC, and KAUST assets remain available. PwC's existing SVG is framed with its visible artwork and clear space to avoid an off-center mark. See [the previous asset audit](PARTNER-ASSETS-2026-10-11.md) for provenance.

## Verification and release

The production webpack build generated all 81 routes successfully. Full frontend lint, TypeScript checks, and all 55 frontend tests passed. Targeted lint also passed after the final changes.

Chromium checks covered the homepage and `/eoa` in Arabic and English at 320, 390, 768, and 1440 pixels; the final source was rechecked at 390 and 1440 pixels. These checks confirmed uniform gaps across repeat boundaries, rightward motion, loaded artwork, no horizontal page overflow, no JavaScript errors, and hidden duplicate tab stops. Desktop and mobile strip/grid screenshots were visually reviewed. Separate control checks passed for pause, arrows, loop wrapping, keyboard focus and navigation. Reduced-motion grids, successful empty API responses, all nine previously available assets, and retaining an empty publication list after a failed refresh were checked with browser fixtures. Fixtures do not establish live API or database success.

The available WebKit runtime cannot launch because required native libraries are missing; Safari is not runtime-verified. Code publication is separate from production deployment; the repository CI workflow does not deploy hosting. The production API failure requires hosting/API follow-up independently of this frontend change.
