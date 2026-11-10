# FAQ maintenance

The public help experience uses `FaqExplorer` on `/faq`, `/eoa/faq` and the embedded FAQ on `/eoa`. `/accelerator` redirects to `/eoa`; its unused legacy component is not a separate public FAQ.

## Content ownership

- Wosool questions live in `frontend/src/data/faq.ts`. Keep every question, answer and action bilingual, with a stable ID and a working destination. Describe supported product journeys; do not invent benefits, timelines or outcomes.
- EO defaults live in `frontend/src/lib/eoa-editorial.ts`. Published editorial content takes precedence. The existing core guidance about the two-year curriculum and separate EO membership requirements remains enforced.
- The EO editorial admin offers **Add suggested questions** for missing defaults. It preserves existing text and visibility, respects the 30-question limit, and changes only the draft until the administrator publishes it.

## Interaction

FAQ titles and containers are centered. Compact search sits above a desktop topic sidebar and an answer list; mobile uses a native topic selector. Quick-answer shortcuts remain available in a collapsed disclosure. Result counts, Escape and Clear filters help visitors navigate; answer text follows the active language direction. Search works across Arabic and English and opens matching answers automatically. Visitors can collapse a search result, expand or collapse the visible questions, choose a topic (including EOA program, applying, fees and coaching), copy an answer link or ask a follow-up. Follow-up links prefill the relevant contact subject.

Arrow Up/Down move between visible questions, Home/End select the first/last, and Enter/Space toggle the focused answer. Native disclosure buttons retain `aria-expanded`, `aria-controls` and labelled answer regions. Deep links open their answer; malformed URL fragments are ignored safely. JSON-LD follows the displayed language and published question set.

## Verification

Run `npm test`, `npm run type-check` and `npm run lint` in `frontend`. The CI browser check `scripts/check-faq-experience.mjs` covers `/faq`, `/eoa/faq` and the embedded `/eoa` FAQ in Arabic and English at 390px and 1440px. It verifies centered layout, search, topics, keyboard navigation, quick-answer focus, above-the-fold questions, EOA topic filtering, Escape reset, direct answer links, contact handoff and serious/critical accessibility violations, and saves review screenshots.
