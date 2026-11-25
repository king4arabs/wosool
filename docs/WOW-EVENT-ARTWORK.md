# EO Riyadh WOW 2026 — artwork and release verification

The [event page](https://wosool.org/events/eo-riyadh-wow-2026) uses the organizer-provided golf sunset design and generated dress-code reference, not documentary photographs of the venue or actual attendees.

| Asset | Placement |
| --- | --- |
| `frontend/public/events/wow-2026/hero-golf-sunset.jpg` | Full-bleed decorative background |
| `frontend/public/events/wow-2026/dress-avatars.jpg` | Shared sprite for six full-body dress-code options |

Both artwork files are locally served JPEGs resized to at most 1600 pixels on the long edge, so no temporary asset hosting URL is required. The hero uses the existing official EO Riyadh logo and text contrast overlays. The avatars retain head-to-toe views with bilingual HTML captions; both golf looks use long trousers. Original generated artwork is illustrative. No new sponsorship claims are introduced.

## Acceptance checks

- Verify both asset URLs return HTTP 200 with image content after deployment.
- Verify the hero displays at 320, 390, 768 and 1440 CSS pixels in English and Arabic, with readable text and working buttons.
- Verify all six avatar crops remain visible, with no text from the sprite or neighboring figures leaking into the crop.
- Run frontend lint, type-check, tests and production build; do not mark any unrun check as passed.
- Verify the existing registration form and Luma handoff are unchanged.
- Confirm the active Hostinger frontend revision separately from GitHub merge status.

No new configuration, database migration or dependency change. Roll back to the previous successful source/hosting revision if necessary.

Return to the [README](../README.md) or [changelog](../CHANGELOG.md).

## Public experience refinement — 2026-11-24

- Compact hero, horizontal event navigation, directions/QR card, agenda and avatar captions. Avoid nested main landmarks; PublicLayout supplies the main landmark.
- Remove redundant explanatory copy, retain explicit attendance approval, membership verification, privacy consent and historical climate labels. Empty partner rail presents a partnership enquiry link rather than an unverified announcement.
- Registration API, Luma destination, partner approval rules, deployment configuration and dependencies remain unchanged.
- Verify at 320, 390, 768 and 1440 CSS pixels in Arabic and English: no horizontal page overflow; every submenu item reachable; hero and six avatars visible; keyboard focus visible; directions and registration actions usable. Verify both saved and fresh registration states and the weather qualification. Source inspection completed; CI and actual browser/production verification remain pending.

## Agenda styling — 25 November 2026

The organizer-supplied schedule includes Asr at 2:45 PM, the 3–5 PM golf tournament (first come, first served), a 4:30 PM winners announcement within that block, the 5:30 PM formal opening and 7 PM main session with special guests. Maghrib and Isha retain their previous time slots. Verify actual local prayer times with the organizer before the event. Check Arabic and English text, logical-start accent borders, legible foreground contrast and all ten rows on mobile and desktop. Colors are supplementary: all activities have explicit textual labels. No change to registration, event hours, location, dependencies or hosting. CI and live verification remain separate.
