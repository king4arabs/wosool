import assert from "node:assert/strict"
import test from "node:test"
import {
  EVENT_TYPE_CODES,
  REGISTRATION_STATES,
  canOpenRsvp,
  eventTypeLabel,
  isAcceleratorOnlyAccount,
  rsvpSuccessMessage,
  eventSignInHref,
  formatEventDateTime,
  formatEventTime,
  holdsRegistration,
  registrationCtaLabel,
} from "./event-registration"

test("event times are shown in Riyadh time whatever the device timezone", () => {
  // 10:00 UTC is 13:00 in Riyadh (UTC+3, no daylight saving).
  const en = formatEventDateTime("2026-10-20T10:00:00+00:00", "en")
  assert.match(en, /20 October 2026/)
  assert.match(en, /13:00/)
  assert.match(en, /Riyadh time$/)
  const ar = formatEventDateTime("2026-10-20T10:00:00+00:00", "ar")
  assert.match(ar, /بتوقيت الرياض$/)
  assert.match(ar, /2026/, "Arabic dates use the Gregorian calendar with Latin digits")
  assert.match(formatEventTime("2026-10-20T13:30:00Z", "en"), /16:30/)
})

test("a same-day end time is shown as a range before the timezone label", () => {
  assert.match(formatEventDateTime("2026-10-20T10:00:00Z", "en", "2026-10-20T13:00:00Z"), /13:00 – 16:00 Riyadh time$/)
  assert.match(formatEventDateTime("2026-10-20T10:00:00Z", "ar", "2026-10-20T13:00:00Z"), / – .+ بتوقيت الرياض$/)
  // End times before the start do not produce a misleading range.
  assert.doesNotMatch(formatEventDateTime("2026-10-20T10:00:00Z", "en", "2026-10-20T09:00:00Z"), / – /)
})

test("invalid or missing event dates render nothing instead of 'Invalid Date'", () => {
  assert.equal(formatEventDateTime("not a date", "en"), "")
  assert.equal(formatEventDateTime(null, "ar"), "")
  assert.equal(formatEventTime(undefined, "en"), "")
})

test("a multi-day event shows its full end date and time", () => {
  const en = formatEventDateTime("2026-10-20T10:00:00Z", "en", "2026-10-22T13:00:00Z")
  assert.match(en, /^Tuesday,? 20 October 2026 at 13:00 – Thursday,? 22 October 2026 at 16:00 Riyadh time$/)
  // 23:00 Riyadh to 01:00 Riyadh the next day is two Riyadh dates even though UTC is one.
  assert.match(formatEventDateTime("2026-10-20T20:00:00Z", "en", "2026-10-20T22:00:00Z"), /Wednesday,? 21 October/)
})

test("registration labels exist in both languages for every state the API returns", () => {
  for (const state of REGISTRATION_STATES) {
    const ar = registrationCtaLabel(state, "ar")
    const en = registrationCtaLabel(state, "en")
    assert.ok(ar && en && ar !== en, state)
    assert.match(ar, /[؀-ۿ]/, `${state} Arabic label`)
    assert.doesNotMatch(en, /[؀-ۿ]/, `${state} English label`)
  }
  assert.equal(registrationCtaLabel("cancelled_by_user", "en"), "Register")
  for (const terminal of ["rejected", "checked_in", "no_show"]) {
    assert.notEqual(registrationCtaLabel(terminal, "en"), "Register", terminal)
    assert.ok(!canOpenRsvp(terminal), terminal)
  }
})

test("RSVP confirmations are localized and keep the pending or waitlist meaning", () => {
  assert.equal(rsvpSuccessMessage("registered", "en"), "You are registered for this event.")
  assert.match(rsvpSuccessMessage("waitlisted", "en"), /waitlist/)
  assert.match(rsvpSuccessMessage("pending_approval", "en"), /review/)
  for (const state of ["registered", "approved", "waitlisted", "pending_approval", undefined]) {
    assert.match(rsvpSuccessMessage(state, "ar"), /[\u0600-\u06FF]/)
  }
})

test("every admin event type has an Arabic and English label", () => {
  for (const code of EVENT_TYPE_CODES) {
    assert.match(eventTypeLabel(code, "ar"), /[\u0600-\u06FF]/, code)
    assert.doesNotMatch(eventTypeLabel(code, "en"), /[\u0600-\u06FF]/, code)
  }
  assert.equal(eventTypeLabel(null, "en"), "Event")
  assert.equal(eventTypeLabel("Something new", "ar"), "Something new")
})

test("EO Accelerator-only accounts are not treated as Wosool members", () => {
  assert.ok(isAcceleratorOnlyAccount({ is_accelerator_applicant: true, roles: [] }))
  assert.ok(isAcceleratorOnlyAccount({ roles: ["eoa_applicant"] }))
  assert.ok(!isAcceleratorOnlyAccount({ is_accelerator_applicant: true, roles: ["member"] }))
  assert.ok(!isAcceleratorOnlyAccount({ roles: ["eoa_applicant"], isAdmin: true }))
  assert.ok(!isAcceleratorOnlyAccount({ roles: [] }))
  assert.ok(!isAcceleratorOnlyAccount(null))
})

test("only open states open the form and only held places can be cancelled", () => {
  assert.ok(canOpenRsvp("open"))
  assert.ok(canOpenRsvp("cancelled_by_user"))
  assert.ok(!canOpenRsvp("registered"))
  assert.ok(!canOpenRsvp("registration_closed"))
  assert.ok(holdsRegistration("waitlisted"))
  assert.ok(!holdsRegistration("open"))
})

test("visitors are sent to sign in and back to the same event", () => {
  assert.equal(eventSignInHref("founders-dinner"), "/login?redirect=%2Fevents%2Ffounders-dinner")
})
