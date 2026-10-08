import assert from "node:assert/strict"
import test from "node:test"
import type { Event } from "@/types"
import { isPastEvent, upcomingEvents } from "./event-time"

const now = Date.parse("2026-10-08T12:00:00+03:00")
const make = (id: string, date: string, endDate?: string): Event => ({ id, date, endDate, title: id, slug: id, description: "", location: "Riyadh", type: "meetup", isVirtual: false, isPublic: true, tags: [] })

test("ended and invalid events cannot appear as upcoming; ongoing events can", () => {
  assert.equal(isPastEvent(make("old", "2026-04-22T12:00:00+03:00"), now), true)
  assert.equal(isPastEvent(make("invalid", "not-a-date"), now), true)
  assert.equal(isPastEvent(make("ongoing", "2026-10-08T10:00:00+03:00", "2026-10-08T13:00:00+03:00"), now), false)
  assert.equal(isPastEvent(make("boundary", "2026-10-08T12:00:00+03:00"), now), true)
})

test("upcoming results are chronological and leave input unchanged", () => {
  const events = [make("later", "2026-12-10"), make("past", "2026-01-10"), make("next", "2026-10-10")]
  assert.deepEqual(upcomingEvents(events, now).map((event) => event.id), ["next", "later"])
  assert.equal(events[0].id, "later")
})
