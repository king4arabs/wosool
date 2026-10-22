# Founder discovery, mentor profiles and responsive journeys

## Public discovery

The homepage places founder scorecards directly after the partner strip. Cards show the founder portrait or initials, name, role, short biography, company logo and summary, sector, location and available professional links. The homepage and `/founders` now share one horizontal row that advances one card physically right every three seconds in both languages. It loops back instantly at the end and never scrolls the document vertically. Arrows, Home/End, swipe and pause/resume controls remain available. Autoplay pauses during hover, after focus/manual interaction, while the row is out of view, and when the grid is open; reduced-motion preferences disable autoplay.

**View all founders** opens a separate responsive grid below the row, with six profiles per page initially, numbered previous/next navigation, and 6/12/24 profile page sizes. The grid shares the row's search and sector filters. Filter changes reset pagination. Opening or paging the grid moves focus to its heading area; closing it returns focus to the toggle. Card details and company/profile links work in both views.

Approved public `/founders` API records remain the community directory source. When none are available, the page presents a separately labeled **Founder spotlight** containing eight public editorial profiles. These do not create accounts, imply membership or link to nonexistent member pages. The spotlight is available in the initial frontend render even during an API outage. No private contacts, financial metrics or fictional entrepreneur fixtures are included. Homepage API sections update independently.

The public snapshot is `frontend/src/data/founder-spotlight.json`; its display mapping is `frontend/src/lib/founder-spotlight.ts`. Review this snapshot when changing names, roles, sources or images. Unifonic and Kitopi use existing original local portraits; Swarm and Jahez use their official image URLs; the other profiles use initials. Preserve original logos and photos.

| Founder | Company | Role reviewed on 11 October 2026 | Primary source |
| --- | --- | --- | --- |
| Ahmed Hamdan | Unifonic | Co-founder & CEO | https://www.unifonic.com/en/about |
| Mohammed Bukhamsin | Swarm Robotics | Co-founder & CEO | https://swarmrobotics.io/about |
| Ghassab Bin Mandeel | Jahez | Co-founder, CEO & Board Member | https://jahezgroup.com/corporate-governance/ |
| Ahmad AlZaini | Foodics | Co-founder & CEO | https://www.foodics.com/press/foodics-completes-full-acquisition-of-norma-a-greek-data-intelligence-company-expanding-its-dedicated-ai-division/ |
| Nawaf Hariri | Salla | Co-founder & CEO | https://salla.com/en-ae/blog/salla-leap-2026 |
| Abdulmajeed Alsukhan | Tamara | Co-founder | https://tamara.co/en-kw/blog-post/tamara-secures-up-to-2-4-billion-dollar-facility |
| Moayad Alfallaj | Rasan | Co-founder & Chairman | https://rasan.sa/en/about |
| Mohamad Ballout | Kitopi | Co-founder & CEO | https://www.kitopi.com/leadership |

Founding evidence supplements: Swarm's company presentation at https://www.flat6labs.com/wp-content/uploads/2024/02/Swarm-Robotics.pdf (page 13); Jahez at https://impact46.sa/jahez-successfully-closed-its-series-a-funding-round-led-by-impact46-vc-in-saudi-arabia/; Salla at https://stv.vc/blog/en/investing-in-salla; Rasan at https://www.rasan.co/en/investor-relations/ipo. Executive titles are not inferred from founder status; Rasan's chairman is not presented as its CEO.

## Mentor profiles

Mentor cards appear on `/eoa`, `/eoa/mentors` and the leadership page. Public cards support bilingual names, positions, company/role, biography, expertise, portrait positioning and optional professional links. Search and expertise filters work with manual carousel controls, keyboard and touch. A useful mentoring/contact panel appears until public appointments are available, including when the API cannot load.

Use **EOA operations → Mentors** to prepare profiles. Staff can edit drafts. Leadership records an appointment and public-profile consent, uploads a portrait, then publishes. Name, position, biography, an existing portrait from the secured upload flow and confirmation references are required before publication. Missing or guessed portrait paths are rejected. There is no automatic mentor seed: board membership, account roles and private participant assignments do not establish a public mentor appointment.

Endpoints under `/api/v1/eoa/operations/mentors` support GET/POST, PATCH `/{mentor}`, and POST `/{mentor}/portrait`. PATCH and portrait upload require the current `version`; stale updates return 409. Portrait uploads accept JPEG/PNG/WebP up to 2 MB and 160–6000 pixels per dimension. Files use generated names under public `storage/eoa/mentors`. Published program responses include only active, published, confirmed, consented profiles and exclude private source, consent and linked-account details. Administration changes are audited.

## Partner logos

The homepage and EOA use the same native horizontal partner carousel. Each logo appears once, retains its original colors and proportions, and sits within a responsive transparent frame. A shared contain renderer also serves partner-directory and founder/company cards. The EO chapter artwork retains clear space and uses the transparent inverse original in the hero. RDIA's white lettering is already inside its black symbol and needs no colored backing. Failed images fall back to the organization's name. The [asset audit](PARTNER-ASSETS-2026-10-11.md) records optical framing and authentic transparent company-logo replacements.

Touch scrolling, arrow buttons, keyboard arrows and Home/End work at mobile and desktop widths. Optional motion moves logos physically rightward in both languages and pauses for hover, focus or interaction. Reduced-motion preferences disable autoplay. The homepage still requires confirmed partner records; visual changes do not publish or approve organizations. [The asset audit](PARTNER-ASSETS-2026-10-11.md) records transparency and official source details, including the corrected KAUST university symbol.

## Account and application fixes

Community registration and applications use the shared bilingual layout and Cairo styles. Invite-only links without a prefilled email now allow email entry; the server still validates the invitation. Password guidance matches server rules. Touch targets, validation focus and mobile form controls have been improved.

The three-step community application keeps its optional browser draft, tolerates unavailable/corrupt storage, prevents duplicate in-flight submission and returns users to the step containing server validation errors. Storage cleanup cannot turn a successful server submission into an apparent failure. No request failure is displayed as success.

EOA sign-in uses `/eoa/account?mode=login`; protected-route redirects retain a validated internal destination. Registration remains the default account mode for the application journey. The global skip link follows the selected language.

## Deployment

Back up production data and portrait storage before applying migrations. Deploy the Laravel source, run `php artisan migrate --force`, retain the existing environment/encryption key, and ensure `php artisan storage:link` has been completed. The mentor migration is additive and creates no users or appointments. Public mentor portrait rewrites are limited to `/storage/eoa/mentors/*`; private application documents remain private.

Deploy the frontend with its existing Hostinger build workflow. Verify the program API, mentor administration, upload/publication, registration and application submission against the actual backend. Frontend deployment does not prove that backend migrations or mail delivery are working. The previously observed production API 500/502 errors require hosting repair; no production database or account changes were made during this implementation.

Use `npm run build` or `npm run build:webpack` for releases. Their prebuild hook clears only `.next/server/route-cache`, the generated runtime page responses. Browser QA found that this Next.js version can otherwise retain old responses after an in-place build even when the new prerendered HTML is correct. Build in the normal release directory with the previous serving process stopped; deploy and start the completed release. Source files, uploaded assets and dependency caches are not removed.

## Validation

The single-row follow-up passed ESLint, TypeScript, all 44 frontend tests and the 79-page production webpack build. This follow-up changes frontend presentation only; the backend checks below describe the initial feature release.

Follow-up browser checks passed all 16 homepage/directory combinations across Arabic and English at 320, 390, 768 and 1440 pixels. They covered one-row card fitting, manual and keyboard direction, 44px controls and reduced motion. The grid checks covered open/close focus, six-to-two profile pagination, page-size changes and shared filters. A delayed homepage news response preserved the user's manually chosen carousel position.

Initial feature-release validation passed: ESLint, TypeScript, 40 frontend tests, entrepreneur-data validation and the 79-page production webpack build; the Laravel suite passed 135 tests with 897 assertions. Mentor coverage includes authorization, publication/consent, stale versions, restricted portraits, upload-to-publication and private-field exclusion.

Initial browser checks used the built frontend and isolated Laravel database in both Arabic/RTL and English/LTR at 320, 390, 768, 1440 and 1920 pixels, plus 844 × 390 landscape. Founder search, sector filters, rows, directory, API-outage spotlights and approved-member replacement passed. Mentor filtering, locale reset, keyboard controls, biography expansion and touch targets passed. The initial 320px nested-container clipping was corrected and retested on both the dedicated mentor page and landing page. No document overflow or JavaScript page errors remained in those cases.

The partner matrix passed 20 cases across both sites/languages, including original logo fitting, unique links, failed-image fallback, rightward motion, pause, reduced motion and 44px controls. Account checks covered invite email entry, password visibility, sign-in mode, responsive forms and the short-screen mobile menu. Browser-only mocked application responses verified validation-step recovery and success despite browser-storage cleanup failures. Test mentor/partner records were browser fixtures only, never production records; the actual mentor roster remained empty. No real applications or emails were sent.

A fresh runtime after the final build served the new founder cards and application fields without manually clearing its page cache, verifying the prebuild hook. Live API checks on 11 October still returned HTTP 500 through Wosool and HTTP 502 from `api.wosool.org`; production migration, mail delivery and server-dependent interactions remain unverified until hosting is repaired.
