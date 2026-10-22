# Wosool community homepage

The root `/` is **Founders to Founders**. EO Riyadh Accelerator remains at `/EOA` with independent admission and account workflows.

## Content and assets

- `useHomeContent` reads the existing public APIs independently. No fallback people, companies, scores, partnerships, or membership counts are invented. Failures in one collection do not hide successful collections.
- Founder cards use the public API's associated primary company, not a name-based join. The API already excludes private companies. Portrait, company logo, description, sector, stage, and website are taken from those records.
- The homepage shows up to 12 public founders in two alternating rows. A single record uses one row. Each row has independent physical left/right controls, native touch/trackpad scrolling, keyboard access, boundary-disabled buttons, and no autoplay. Text follows the selected language while rows start at the right in both languages.
- Short biographies are limited to two lines; native expandable details expose the complete public biography and company description. This avoids linking to unimplemented individual founder/company pages. Private details and financial information are not fetched.
- Partner logos are directly after the hero, from `/partners`. That endpoint requires confirmed relationship, verified identity/assets, approved designation, public visibility, and an available logo. Missing approvals must be completed in the existing administrative process; do not bypass the gate to populate the strip.
- Logos keep original colors, lettering and proportions with `object-contain`, transparent wrappers, no filters, and no captions. Upload original approved transparent PNG/SVG artwork when available. CSS cannot remove an opaque background embedded in source artwork. Missing or failed assets use accessible text fallbacks, not invented logos.
- More than four logos move gently right. Pause is available; hover pauses; keyboard focus and reduced-motion preferences stop animation and leave native scrolling available. Only one copy is rendered, keeping every visible logo usable.
- Website links accept only explicit HTTP(S) URLs without embedded credentials. Existing records lacking usable URLs do not receive invented links.

## Page structure

Community hero → approved partners → community value → two founder rows → joining steps → live upcoming events → separate Accelerator gateway → published news → footer.

The shared footer contains established navigation/social destinations, privacy and terms, account access, and a back-to-top control that restores main-content focus. The community invitation is omitted inside `/EOA`.

## Verification

Run `npm run type-check`, `npm test`, `npm run lint`, and `npm run build` in `frontend`. Unit coverage includes row distribution, safe URLs, and preservation of the founder/company relationship. No database migration is required.

Before production sign-off, check Arabic and English at mobile/tablet/desktop sizes against real approved API records; exercise both row controls, swipe and keyboard scrolling, image failures, empty/error/retry states, logo pause/reduced motion, details expansion, external links, and footer navigation. Browser-level visual and interaction QA is still required when a supported browser environment is available. Deployment must be independently verified.
