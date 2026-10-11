# EO global network directory

The `/eoa/mentors` page now contains 26 public professional profiles: 16 people from EO's Global Speakers Academy directory and 10 members of EO's published global board. These are network discovery profiles, not a list of confirmed EO Riyadh mentors. Local availability is coordinated through the program team. Existing API-managed program mentor records retain their publication and appointment controls.

## Sources and editorial scope

- EO leadership roster: https://eonetwork.org/about/leadership/
- EO speaker directory: https://event.eonetwork.org/global-speakers-academy/database/
- Each entry in `frontend/src/data/eo-global-network.json` records the individual EO biography, original portrait URL, and professional LinkedIn profile used for identity/company corroboration.
- English and Arabic briefs summarize professional experience. Titles distinguish global leaders from speakers/coaches. No personal contact details, invented ratings, local appointments, availability promises, or network-wide membership totals are published.
- Chapter names reflect EO's own directory/biography, including regional chapters such as Belgium, Orange County and Queensland. A residence or company address is not substituted for a membership city.
- The three statistics count this directory's profiles, distinct chapter affiliations and editorial experience categories, not EO's entire membership.
- Original source portraits were downloaded, proportionally resized and encoded as WebP for delivery (about 372 KB combined); identities and backgrounds were not retouched. Source URLs remain in the dataset for review.
- Profiles are an editorial snapshot reviewed 11 October 2026 and should be rechecked when EO updates its public rosters.

## Interaction and accessibility

Cards have equal widths and 24 px gaps. The LTR scroll viewport moves the cards physically right every 3 seconds in both interface languages and resets at its boundary. Controls allow either direction or pause. Hover, keyboard focus, touch/pointer interaction, hidden tabs, and reduced-motion preferences suspend automatic motion. Search supports names, companies, chapters and bilingual briefs. Network and expertise filters combine. The grid view exposes all matching cards without motion. External links identify their person and open with `noopener noreferrer`.

## Verification

- TypeScript and targeted ESLint passed.
- 59 frontend tests passed, including profile/source/portrait integrity and combined bilingual discovery filters.
- Production webpack build completed: 81 routes.
- Chromium checked English and Arabic at 360, 768 and 1440 px: 26 photos decode, card widths match, page/grid do not overflow, filters work and no page errors occur.
- Timed browser checks confirm no motion before 3 seconds, physical rightward advancement, pause, manual-right navigation, hover/focus pause, and reduced-motion behavior.
- Browser fixtures cover an unavailable program API and an authoritative empty roster. The global directory remains independently available.

Publishing a Git commit and deploying the production host are separate steps; live deployment must be verified independently.
