# EO Riyadh Accelerator board and editorial release — 11 October 2026

## Scope

The Wosool homepage retains its Founders to Founders purpose. The dedicated `/eoa` landing page now includes a licensed Riyadh skyline video with WebM/MP4 sources and a persistent poster, official EO colors, the supplied EO Riyadh artwork, a controlled partner strip, EO/chapter overview, Cash/Strategy/People/Execution learning pillars, a nine-stage application-to-completion roadmap, published operator/enabler content, bilingual FAQs, and the 2026/27 board before the final invitation. The EOA footer links to its application, account, participant workspace and privacy notice.

Official EO information was reviewed on 11 October: the learning program is two years, usual annual revenue eligibility is US$250,000–999,999, global annual fees are US$1,750 plus local fees, and participants attend four learning days and 8–12 accountability meetings yearly. EO membership remains a separate application and chapter decision. Sources and media licensing are in [the source register](research/EOA-SOURCES-2026-10-11.md).

## Board extraction and publication

The supplied poster explicitly says **Board Members 26/27**. Its 11 portraits were cropped by adjacent name/role labels, with no face generation or identity inference. Original source, crop rectangles and native-resolution WebP files are retained under `frontend/public/eoa/board/`. Names and poster roles are preserved. A low-resolution poster cannot support genuinely high-resolution portraits; administrators can upload better originals later.

Nine company names, eight company websites, nine LinkedIn profiles and two X profiles were corroborated. Facebook and Instagram links remain empty. Mazin Alrukayani and Abdelrahman Al kuhaymi company/social details remain unresolved; Gilbert Rustom's company website remains unverified. The poster's “Forum & GESA Chair” spelling is preserved pending editorial review. Older board listings on the chapter website are documented rather than silently substituted. See [the board research register](research/EO-RIYADH-BOARD-2026-27.md).

The additive `eoa_board_members` migration stores bilingual names/roles/company details, optional verified URLs, portrait path/position/alt text, order, term, active/publication state and internal sources/verification date. `eoa:install` inserts missing slugs only; repeat runs preserve edited records and IDs. The supplied 2026/27 roster is published with its explicit term. The public API filters active published records and excludes internal research references.

## Administration

Use `/eoa/admin`:

- **Board members:** staff can prepare drafts; leadership can publish and edit visible cards. Add a draft, upload a JPEG/PNG/WebP portrait, then publish. Uploads have MIME, image-dimension and 2 MB limits, generated filenames and server authorization. Optional socials are separate fields; absent links have no public icons.
- **Page content:** leadership edits bilingual FAQs and operator content, reorders/hides entries, saves drafts and explicitly publishes. Draft changes preserve the last published snapshot. Version checks reject stale saves. Unpublish removes the public snapshot while retaining the working draft.
- **Partner records:** leadership can maintain official names, descriptions, websites, local logo paths, source URLs, display order and relationship evidence. Roles are operator/enabler/supporter. The public strip shows confirmed relationships with verified identities and available logos. The owner-supplied EO chapter identity remains visible.
- **Audit:** board, portrait, editorial and partner changes are recorded in the existing administration audit log.

LAMARKA and HUMAIN are researched prospective records. No local partnership was invented or activated. RIDA's identity is unresolved; it must not silently become RDIA. CODE and LAMARKA original standalone logos remain unavailable. Existing official EO, Garage, Misk and RDIA assets and the newly retrieved HUMAIN SVG remain unchanged. Confirmed operator content can be published through the editor once its identity, website and role are established.

## Deployment sequence

1. Record the current production release. Back up the database, public portrait storage, private application documents and existing encryption key. No production database migration or data change was executed from this workspace.
2. Deploy backend source and locked Composer dependencies; preserve production environment configuration and `APP_KEY`.
3. Run `php artisan migrate --force`, `php artisan eoa:install`, and `php artisan storage:link`. Imported records are additive. Do not run demonstration seeders or `migrate:fresh`.
4. Rebuild Laravel caches/restart supervised workers through the existing deployment procedure.
5. Build/deploy the frontend using Hostinger's existing `frontend` root and `build:webpack` script. Set `NEXT_PUBLIC_API_URL` to a healthy Laravel origin before building. Next.js proxies only `/storage/eoa/board/*` for public uploaded portraits; private applicant storage is never exposed.
6. Verify `/api/health`, `/api/ready`, `/api/v1/eoa/program`, the published board, admin upload/publication, privacy/registration, a controlled real email and application submission on the deployed release. Keep intake settings as authorized; source changes do not approve local program or data policies.

Rollback should deploy the preceding application release while retaining additive tables and newly uploaded portraits. Dropping the board table destroys editorial records; do not use the migration's `down()` as routine rollback.

## Validation and status

Local validation passed: frontend ESLint, TypeScript, 30 frontend tests, entrepreneur data validation, production dependency audit, Next.js webpack build, Laravel suite (125 tests), Composer audit, PHP syntax and backend Vite build. Focused editorial tests were rerun after the final unpublish refinement. Local HTTP testing returned all 11 board members and a healthy API from an isolated SQLite database with no real accounts.

Browser verification passed at 1440px desktop and 390px mobile in both English/LTR and Arabic/RTL: eleven cards, no document overflow or JavaScript page errors, poster-only reduced motion, rightward autoplay, pause, keyboard navigation, muted video and public/account/admin route availability. Screenshots are recorded in the repository README. These use the built frontend and isolated real Laravel API; they are not production screenshots.

Production observation on 11 October 2026: `/eoa` served HTTP 200, but `/api/v1/eoa/program` and `/api/health` through Wosool returned HTTP 500; `https://api.wosool.org/api/health` returned HTTP 502. Hostinger MCP server entries exist in this environment, but no Hostinger tools are callable in this session. Production deployment, production migrations, real mail and application delivery remain **unverified and blocked by hosting/API access**. A successful source push does not change this status without a verified host release.
