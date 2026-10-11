import assert from "node:assert/strict"
import test from "node:test"
import type { Event } from "@/types"
import { canRegisterForEvent, eventLocalInput, eventPeriod, eventsForPeriod, isPastEvent, parseEventDate, upcomingEvents } from "./event-time"
import { mapEvent } from "./content-api"

const now = Date.parse("2026-10-08T12:00:00+03:00")
const make = (id: string, date: string, endDate?: string): Event => ({ id, date, endDate, status: "upcoming", title: id, slug: id, description: "", location: "Riyadh", type: "meetup", isVirtual: false, isPublic: true, tags: [] })

test("ended and invalid events cannot appear as upcoming; ongoing events can", () => {
  assert.equal(isPastEvent(make("old", "2026-04-22T12:00:00+03:00"), now), true)
  assert.equal(isPastEvent(make("invalid", "not-a-date"), now), true)
  assert.equal(isPastEvent(make("ongoing", "2026-10-08T10:00:00+03:00", "2026-10-08T13:00:00+03:00"), now), false)
  assert.equal(isPastEvent(make("boundary", "2026-10-08T12:00:00+03:00"), now), true)
})

test("upcoming results are chronological and leave input unchanged", () => {
  const events = [make("later", "2026-12-10T12:00:00Z"), make("past", "2026-01-10T12:00:00Z"), make("next", "2026-10-10T12:00:00Z")]
  assert.deepEqual(upcomingEvents(events, now).map((event) => event.id), ["next", "later"])
  assert.equal(events[0].id, "later")
})

test("October 11 capture: all six April–June dates belong only to the archive", () => {
  const dates = ["2026-04-22", "2026-05-06", "2026-05-15", "2026-05-28", "2026-06-10", "2026-06-25"]
  const events = dates.map((date) => make(date, `${date}T18:00:00+03:00`, `${date}T20:00:00+03:00`))
  const captureTime = Date.parse("2026-10-11T14:54:00+03:00")
  assert.deepEqual(upcomingEvents(events, captureTime), [])
  assert.deepEqual(eventsForPeriod(events, "past", captureTime).map((event) => event.id), [...dates].reverse())
  assert.ok(events.every((event) => !canRegisterForEvent(event, captureTime)))
})

test("invalid, ambiguous, normalized impossible dates and inverted ranges are not listed or registerable", () => {
  for (const date of ["bad", "", "2027-02-30T12:00:00Z", "2027-02-29T12:00:00Z", "2026-12-01", "2026-12-01T12:00:00", "2026-12-01T24:00:00Z"]) {
    const event = make("bad", date, "2027-12-01T12:00:00Z")
    assert.equal(eventPeriod(event, now), null, date)
    assert.equal(canRegisterForEvent(event, now), false, date)
  }
  for (const end of ["", "bad", "2026-10-01T12:00:00Z"]) {
    assert.equal(eventPeriod(make("bad-end", "2026-12-01T12:00:00Z", end), now), null)
  }
  assert.equal(parseEventDate("2028-02-29T12:00:00.000000Z"), Date.parse("2028-02-29T12:00:00Z"))
})

test("API mapping preserves authoritative lifecycle and deadline even with stale legacy status", () => {
  for (const status of ["draft", "cancelled", "archived", "completed", "pending_review"]) {
    const event = mapEvent({ id: 1, title: "Test", slug: "test", starts_at: "2026-12-01T12:00:00Z", status: "upcoming", status_flow: status, is_public: true })
    assert.equal(eventPeriod(event, now), null)
    assert.equal(canRegisterForEvent(event, now), false)
  }
  const closed = mapEvent({ id: 1, title: "Test", slug: "test", starts_at: "2026-12-01T12:00:00Z", status: "upcoming", status_flow: "published", registration_deadline: "2026-10-08T12:00:00+03:00", is_public: true })
  assert.equal(eventPeriod(closed, now), "upcoming")
  assert.equal(canRegisterForEvent(closed, now), false)
  assert.equal(canRegisterForEvent(closed, now - 1), true)
})

test("end instant and timezone offsets agree at the exact boundary", () => {
  const event = make("ongoing", "2026-10-08T08:00:00Z", "2026-10-08T12:00:00+03:00")
  assert.equal(eventPeriod(event, now - 1), "upcoming")
  assert.equal(eventPeriod(event, now), "past")
  assert.equal(canRegisterForEvent(event, now), false)
  assert.equal(eventLocalInput("2026-10-12T15:00:00Z", "Asia/Riyadh"), "2026-10-12T18:00")
  assert.equal(eventLocalInput("2026-10-12T15:00:00Z", "Asia/Dubai"), "2026-10-12T19:00")
})
