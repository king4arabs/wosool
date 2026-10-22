# Events discrepancy — 11 October 2026

## Evidence and release comparison

Repository inspected: `main` at `29071988935000925e25428fc00351f5c47eea4b`. This investigation preserves the founder/mentor/partner work in that release and the EO Accelerator implementation.

The supplied [Drive capture](https://drive.google.com/file/d/135N0gjuAbWw3MBJQF_SuJdrNNdaBhfJ9/view) is a five-page PDF created at 11:55 UTC on 11 October. Its printed capture time is 14:54 and it shows six events under the upcoming heading, including 22 April, 6/15/28 May, 10 June and the 25 June Q2 2026 Demo Day. Those exact dates match the repository's historical frontend seed fixtures.

The events page before commit `c055ec8` initialized from `getSeedEvents`, retained those fixtures on API failure or an empty result, and did not apply a temporal filter. That behavior can explain the captured output. **The captured release SHA and its API response are not available, so that explanation remains an inference, not an established production root cause.**

Fresh live checks at approximately 16:32–16:43 UTC:

| Check | Observed result |
| --- | --- |
| `https://wosool.org/events` | HTTP 200, Hostinger headers, Next build ID `Nx4HEtjj5iHnT-eBhzRr9` |
| Events JavaScript | `/_next/static/chunks/app/events/page-a59c635f82012950.js`, 17,072 bytes; contains upcoming/past selection, date-based filtering, and API requests with `per_page=100&period=...`, consistent with the inspected main implementation |
| Hydrated upcoming tab | Explicit loading-failure alert; no event cards or fallback fixtures |
| Hydrated past tab | Same loading-failure alert; old eyebrow incorrectly still says “upcoming” |
| Same-origin `/api/v1/events?per_page=100&period=upcoming` | HTTP 500, plain `Internal Server Error` |
| Same-origin `/api/v1/events?per_page=100&period=past` | HTTP 500, plain `Internal Server Error` |
| API-origin `/api/v1/events?per_page=100&period=upcoming` and `/api/health` | HTTP 502 from the inspection transport, reporting connection refused; no application JSON available |

The current live experience differs from the earlier PDF. Its event logic matches main behavior, but the exact deployed commit cannot be established from an opaque build ID. Host logs and the hosting release record are needed to distinguish API process, upstream configuration, TLS/network, schema and application failures. An inspection-transport 502 is not proof of an application-generated 502.

## Confirmed code defects and corrections

- The public API applied expiry only with an explicit upcoming/past parameter. Requests without a period could return expired events with stale `upcoming` status. Public and member catalogs now apply the same end-date boundary by default, with completed records available through the past period.
- Invalid start dates, normalized impossible dates and inverted ranges could pass frontend filtering when an end date was parseable. Public dates now require valid ISO instants with a timezone; malformed schedules are omitted from both lists, rather than labelled as historical facts. API queries also reject inverted ranges.
- Frontend mapping discarded lifecycle and registration-deadline fields. These now survive mapping and control listing and registration eligibility. Draft/cancelled/archived records are not treated as future events; completed records require an elapsed end before appearing in the archive.
- The registration-status endpoint ignored dates/deadlines and could advertise an ended event as open. Status, RSVP writes and waitlist promotion now use a shared registration-window check. The exact deadline is closed; an expired event cannot promote a waitlisted attendee when another attendee cancels.
- The detail page now guards the initial CTA and modal submission with event dates/status/deadline, including anonymous views and pages left open across expiry. List/home cards refresh temporal classification while open. API failure remains explicit and does not substitute demonstration events.
- Period/locale changes reset request state, cancel superseded requests and bypass HTTP caching. The past tab has an archive eyebrow; cards display the year as well as time.
- Admin wall-clock inputs now use the event timezone (Riyadh by default), explicit offsets retain their instant, and storage is normalized to UTC before comparison. Editing an existing event converts its UTC timestamp back to the event timezone rather than slicing away the offset.

No event dates were moved forward. No new production events, seed imports, schema migrations or changes to existing event rows were made.

## Classification contract

Published/upcoming/live events with a valid future end remain in the upcoming collection (including a currently running event until its end). If the end is absent, the start is the cutoff. At `end <= now`, a publicly visible event belongs only in the past collection. An invalid/ambiguous schedule is not evidence of either a future or past event. A published schedule comes from the managed API; code validation does not independently verify the organizer's real-world event announcement.

Registration closes at the end/start fallback or the registration deadline, whichever applies first; lifecycle closure, visibility restrictions, RSVP configuration and capacity still apply. Existing registration history is retained.

## Validation

- Regression coverage uses the six captured April–June dates and a fixed October 11 clock.
- Frontend tests cover invalid dates, explicit offsets, leap dates, status/deadline mapping, sort order and exact expiry boundaries.
- Backend tests cover public/member listing, private/draft restrictions, status/write agreement, cancellation/waitlist behavior, valid future RSVP and admin UTC round trips.
- Full frontend tests: 44 passed. Lint and TypeScript checks passed.
- Full backend suite: 140 passed, 951 assertions, including existing EO Accelerator tests.
- Hostinger-compatible `npm run build:webpack` production build passed, including TypeScript and all 79 static pages, with production API/site origins and demo content disabled.

## Production handoff — pending access

Hostinger MCP configuration entries exist in this environment, but no callable Hostinger hosting tools are exposed. No authenticated hosting release record, backend logs, process controls or database access were available. **This work is not a verified production deployment.**

Using the existing Hostinger release process in `DEPLOYMENT.md`:

1. Read the current frontend/backend deployment records and source SHAs; preserve a rollback release and back up persistent data.
2. Inspect the failing API process and server logs, confirm the domain's actual upstream and `backend/public` web root, validate database/schema and the frontend's build-time API origin. Repair the observed failure based on logs, not by guessing or replacing production data.
3. Deploy the verified frontend and backend changes together using the existing Node/PHP process managers and locked dependencies. There are no new migrations in this patch. Do not run demonstration seeders or `migrate:fresh`.
4. Record the hosting release SHA and frontend build ID. Require successful API health/readiness responses and JSON for both event periods on the API origin and frontend proxy.
5. Inspect returned dates/statuses in both languages. Confirm every expired public event is absent from upcoming and present only in past; invalid schedules are withheld for editorial correction. If there are no confirmed future events, leave the genuine empty state.
6. Check an ended event detail and its registration-status response; use a controlled account to verify that RSVP is rejected without creating a registration. Confirm a verified future event follows the intended approval/capacity rules and recheck `/eoa` and founder/mentor views.

Do not infer production readiness from a successful commit, push, build, an empty list during an outage, or a source-code-only test.
