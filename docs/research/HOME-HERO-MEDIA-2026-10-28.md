# Homepage background video — 28 October 2026

The homepage uses a 34.75-second silent, dissolving loop: Riyadh skyline → Kingdom Centre detail → AlUla Old Town → Jeddah Corniche / Red Sea → Dubai Marina → Giza / Cairo → London → Riyadh. Saudi scenes occupy approximately 60% of the sequence. The existing EO Accelerator video remains unchanged.

## Sources and rights

All excerpts are from Pexels, under the [Pexels License](https://www.pexels.com/license/) checked 28 October 2026. It permits editing and website backgrounds without required attribution; no endorsement by the depicted places, brands or creators is implied. Original clips are not redistributed as a stock collection.

| Scene | Creator | Original listing |
| --- | --- | --- |
| Riyadh skyline at dusk | ibrahim almuhanna | https://www.pexels.com/video/arab-19102792/ |
| Kingdom Centre detail | Grbr Snts | https://www.pexels.com/video/kingdom-tower-illuminated-at-night-in-riyadh-34505476/ |
| AlUla Old Town | Aamir Somewhere | https://www.pexels.com/video/alula-old-town-saudi-arabia-18819906/ |
| Jeddah Corniche | Md Amir Umar | https://www.pexels.com/video/jeddah-corniche-skyline-with-blue-sea-view-34747334/ |
| Dubai Marina | Nelemson G | https://www.pexels.com/video/scenic-dubai-marina-skyline-at-sunset-30346373/ |
| Giza / Cairo | Blanka OG | https://www.pexels.com/video/aerial-view-on-cairo-and-pyramids-10719817/ |
| London / Thames | Mike Bird | https://www.pexels.com/video/aerial-view-of-a-city-6099374/ |

The first scene reuses the documented `/eoa/riyadh-hero.mp4` excerpt; see `EOA-SOURCES-2026-10-11.md`. Other clips use their first 5–6 seconds. Clip durations before dissolves are 8, 5, 6, 6, 5, 5, 5 seconds. Kingdom Centre is cropped to 1080 × 608 at x=0/y=50 for a close architectural detail; other footage is scaled and center-cropped to 16:9. All clips are normalized to square pixels and 24 fps. Dissolves last 0.75 seconds; the final dissolve returns to the opening scene. Trimming the first second and ending at the same source position makes the loop continuous.

## Delivery

- Local `/media/home-journey.mp4` (H.264, 1280 × 720, CRF 27, capped 1.1 Mbps, fast-start) and `.webm` (VP9, CRF 38).
- Mobile variants: `/media/home-journey-mobile.mp4` and `.webm`, 768 × 432; MP4 CRF 28, capped 550 kbps. The player chooses a size once per mount to avoid duplicate downloads on rotation.
- `/media/home-journey.webp` is the opening frame and remains behind the video. The poster is preloaded; media is attached only after browser preferences are checked.
- No audio streams, third-party requests, embedded players, captions, text overlays or added music. Footage is decorative; page copy supplies the meaning.
- Reduced motion, Save-Data and 2G connections show the poster without requesting video. Runtime preference changes unmount the video. Playback pauses offscreen and in a hidden tab; a user pause survives scrolling back.
- Both formats failing leaves the poster and removes the unusable playback control. Browser autoplay rejection leaves a working Play control.

## Verification and release

Run `npm run lint`, `npm run type-check`, `npm run build:local`, then `node scripts/check-home-hero.mjs` in `frontend`. The browser check starts its own isolated Next server and stubs public APIs. It exercises Arabic/English, mobile/desktop, playback, persistent pause, reduced motion, data saving and media failure. Set `PLAYWRIGHT_EXECUTABLE_PATH` only when using a preinstalled browser.

Use the existing Hostinger frontend release process in `DEPLOYMENT.md`. No deployment configuration, dependencies, API or database changes are needed. A repository commit or passing CI is not evidence that wosool.org has been redeployed.

Validated locally on 28 October 2026: ESLint, TypeScript, webpack production-mode local build (92 routes), and all browser scenarios above passed. The browser checks used the preinstalled Chromium headless shell; desktop English and mobile Arabic screenshots were inspected. FFprobe confirmed a single video stream, 24 fps, 34.75 seconds and no audio. CI also runs the new browser check after installing its own Chromium. Production deployment has not been performed by this change.
