# Company logo coverage — 12 November 2026

Reviewed the 209 companies in all published founder catalogs. Assigned 34 additional original company logos from official websites or their identified investors (33 new local files and one existing original asset). Local logo coverage is now **197 of 209 companies**, covering **364 of 385 founder profiles**. Every existing registered asset was checked for readability and renderability; all 163 rendered successfully. New assets and contrast candidates were inspected on light and dark surfaces.

## Presentation

- The shared logo renderer serves founder cards, company cards and their existing views. It preserves original colors and proportions using contain sizing.
- Reviewed white/pale marks use dark panels, including OmniOps, Mozn, Nooks, Abwab.ai, Think AI, SITR and BY Venture Partners. Salla's pale mark now also uses a dark panel.
- Local images and uploads are sampled after load. Predominantly pale ink on a transparent canvas receives a dark backing. Opaque images retain their own background. Cross-origin images retain reviewed settings; the renderer does not request extra cross-origin permissions or alter the images.
- Abwaab uses the English wordmark and book icon from its investor-provided canvas, framed through an SVG viewport. No paths or raster pixels are redrawn.
- Founder snapshots and backend import rows are synchronized. Existing uploaded artwork, editorial edits and deletion controls remain authoritative. Existing missing-logo imports can pick up these assets through `php artisan wosool:import-founders`.

## Provenance and boundaries

The per-company source URLs, local paths and unresolved entries are in `docs/COMPANY-LOGO-AUDIT-2026-11-12.json`. The theQA symbol comes from its rendered official homepage SVG, with its two CSS colors resolved to the displayed RGB values. Other inline SVG marks (Nooks, Journify, Solink, TalMal and Upwind) come from their official homepage markup.

Wafr's corporate release points to WafrChain. Its source records now use https://www.wafrchain.com/ and the WafrChain brand artwork, replacing the previously listed consumer waitlist URL; the founder biographies are unchanged. Existing production website fields are preserved by the importer and may require an admin correction after deployment.

Twelve companies retain name/website-icon fallbacks: AIREV, Barq, Dukkantek, ekar, Glowork, Istinara, Lomar, Mercado Libre, Mercor, Project Suppliers, Rekaz and RIME. Their accessible source pages did not yield a verifiable downloadable logo during this pass, or the asset request was blocked. Third-party images with unclear identity or reuse rights were not substituted.

No accounts, messages or partnership claims are created. Source merge and verified production deployment/database import remain separate release steps.
