import assert from "node:assert/strict"
import test from "node:test"
import {
  canOpenRsvp,
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
  // Multi-day events and end times before the start do not produce a misleading range.
  assert.doesNotMatch(formatEventDateTime("2026-10-20T10:00:00Z", "en", "2026-10-22T13:00:00Z"), / – /)
  assert.doesNotMatch(formatEventDateTime("2026-10-20T10:00:00Z", "en", "2026-10-20T09:00:00Z"), / – /)
})

test("invalid or missing event dates render nothing instead of 'Invalid Date'", () => {
  assert.equal(formatEventDateTime("not a date", "en"), "")
  assert.equal(formatEventDateTime(null, "ar"), "")
  assert.equal(formatEventTime(undefined, "en"), "")
})

test("registration labels exist in both languages for every state", () => {
  const states = ["open", "invite_only", "registration_closed", "waitlisted", "pending_approval", "approved", "registered", "cancelled_by_user", "requires_approval", "full_capacity"]
  for (const state of states) {
    const ar = registrationCtaLabel(state, "ar")
    const en = registrationCtaLabel(state, "en")
    assert.ok(ar && en && ar !== en, state)
    assert.match(ar, /[؀-ۿ]/, `${state} Arabic label`)
    assert.doesNotMatch(en, /[؀-ۿ]/, `${state} English label`)
  }
  assert.equal(registrationCtaLabel("cancelled_by_user", "en"), "Register")
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
