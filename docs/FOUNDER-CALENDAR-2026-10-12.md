# Founder growth calendar

`/events` includes an Arabic/English month calendar, day details, monthly agenda, topic search, activity filters, Ramadan off days, Saudi and international holiday references, and the May 2027 cohort milestones. Existing upcoming/archive event cards and event detail/registration routes remain available.

## Program and Ramadan pause

The proposed learning journey starts **12 October 2026** and preserves **26 active learning weeks** through **9 May 2027**, excluding the Ramadan pause. These are editorial planning dates, not a confirmed cohort admission date. The first implementation ended in April; the program now carries all topics forward after the requested Ramadan break.

| Track | Cadence outside Ramadan | Sessions | First proposed date |
| --- | --- | --- | --- |
| Founder growth lab | Every Wednesday | 26 distinct topics | 14 October 2026 |
| Inside the business | Every Saturday | 26 distinct visit programs | 17 October 2026 |
| EOA peer-to-peer | Every Sunday | 26 distinct discussions | 18 October 2026 |
| Cohort online learning | Every other Friday | 13 practical workshops | 16 October 2026 |

Topics progress through growth diagnosis, customer discovery, positioning, pricing, unit economics, cash flow, sales, retention, product, AI, people, execution, partnerships and expansion. Peer sessions and online workshops are labelled for EOA cohort participants.

**Ramadan is accelerator off time.** The expected pause is **8 February–9 March 2027 inclusive**, subject to the official Saudi announcement. All four planned tracks pause. Calendar days are highlighted and show the break throughout both February and March. Topics resume from the next undelivered item; none are discarded. Friday recurrence remains anchored to 16 October 2026, with occurrences inside the break skipped. Expected resumption: Wednesday 10 March; first post-break online workshop: Friday 19 March. Eid arrangements remain TBA, including the learning session that currently overlaps expected Eid al-Fitr.

Every proposed session marks time, host/facilitator, venue/format or joining link, and registration **TBD**. Visit themes describe learning programs, not confirmed host partnerships. Proposals cannot accept RSVPs. Published community events remain intact; the pause governs the proposed accelerator curriculum and does not cancel unrelated community events.

## May milestones supplied by the program lead

| Date | Milestone | Location / details |
| --- | --- | --- |
| 15 May 2027 | EOA Cohort Demo Day & Investment Opportunity | Venue, companies, investors, time, agenda and registration TBA |
| 20 May 2027 | EO Saudi Summit | Diriyah; exact venue, speakers, time, agenda and registration TBA |

Prominent milestone cards jump to the relevant calendar day. Dates are retained exactly as requested. Demo Day shares the provisional Arafat Day date, so its detail card flags the holiday overlap without moving it. No investor participation, investment outcome, venue booking or EO invitation is implied.

## International calendar

A separate category includes New Year’s Day, International Women’s Day, Earth Day, Labour Day, UN MSME Day and Western Christmas annually. For 2027 it also includes Lunar New Year, Western Good Friday/Easter, and Singapore’s published Deepavali date. Country/tradition qualifications are visible where needed. These entries are reference dates for global partner availability, **not Saudi public holidays or automatic accelerator closures**.

## Date sources (reviewed 12 October 2026)

- [Saudi Central Bank: Holidays and Working Hours](https://www.sama.gov.sa/en-us/Supervision/pages/holidayschedules.aspx): Founding Day (22 February) and National Day (23 September). Entries identify national occasions, not sector-specific substitute leave days.
- [Saudi Arabia 2027 calendar](https://www.timeanddate.com/holidays/saudi-arabia/2027): estimated Ramadan start (8 February), Eid al-Fitr (10 March), Arafat Day (15 May) and Eid al-Adha (16 May). Ramadan break ends the day before the listed Eid date; this boundary is a planning inference, not an official announcement. All lunar entries remain tentative. Other years currently show only fixed Saudi occasions and an explicit lunar-date availability notice.
- [Singapore Ministry of Manpower 2027 calendar](https://www.mom.gov.sg/newsroom/press-releases/2026/0618-public-holidays-for-2027): New Year, Lunar New Year (6 February), Good Friday (26 March), Labour Day, Singapore Deepavali (28 October) and Christmas. Do not generalize Singapore’s country-specific leave rules or its Deepavali date worldwide.
- [Princeton religious calendar](https://religion.princeton.edu/2026-2027-religious-holidays): Western Easter on 28 March 2027.
- United Nations: [Women’s Day](https://www.un.org/en/observances/womens-day), [Earth Day](https://www.un.org/en/observances/earth-day/background), [MSME Day](https://www.un.org/en/observances/micro-small-medium-businesses-day).

## Maintenance

- `frontend/src/data/founder-calendar.ts`: bilingual curriculum, track descriptions, planning bounds, Ramadan boundaries and Friday anchor.
- `frontend/src/lib/founder-calendar.ts`: date-only recurrence, break exclusions, month grids, sourced holidays, milestone records and public-event adaptation.
- `frontend/src/components/events/FounderCalendar.tsx`: interactive calendar, agenda, off-day styling and milestone navigation.
- The learning sequence does not automatically repeat after the planning window. For another cohort, review bounds, Ramadan dates and topic sequences together.
- Proposals and milestones are versioned editorial data, not database events with invented times. Confirmed community events use the existing API (upcoming/past feeds, up to 100 each). No schema or production seed changes are required.
- To confirm an event, publish its real schedule through existing event administration and replace/remove its matching editorial entry; do not leave duplicate copies visible.

## Verification and delivery

Date tests cover the full 91-session curriculum, unique bilingual topics, weekdays, fortnightly parity around the Ramadan gap, complete break coverage, topic preservation, exact milestone dates, Diriyah/TBA details, holiday classifications, year/leap-month boundaries, Riyadh dates and multi-day published events. Browser validation covers Arabic/English, responsive layouts, calendar/agenda navigation, search and filters, API-error resilience and existing event-detail links.

This is a frontend release requiring a Next.js rebuild and host deployment; see `DEPLOYMENT.md` for Hostinger’s `build:webpack` setup. GitHub publication to `king4arabs/wosool` was explicitly authorized on 12 October 2026. Verify the remote commit after pushing and verify the production calendar separately; a source push alone does not prove deployment.
