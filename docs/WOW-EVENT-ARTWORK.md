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
