import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  activeRegistrations,
  attendanceType,
  dateTile,
  eventTime,
  fill,
  formatLabel,
  memberEventsCopy,
  organiserLabel,
  registrationLabel,
  stateAfterRsvp,
  type MemberRsvpRecord,
} from "./member-events"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/dashboard/events/page.tsx", import.meta.url), "utf8")

test("member events copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(memberEventsCopy.ar).sort(), Object.keys(memberEventsCopy.en).sort())
  for (const [key, value] of Object.entries(memberEventsCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(memberEventsCopy.en)) assert.doesNotMatch(value, arabic, key)
})

test("the events page renders from the dictionary and follows the member's language", () => {
  assert.doesNotMatch(page, arabic, "the page still has fixed Arabic text")
  assert.match(page, /memberEvents\(locale\)/)
  assert.match(page, /resolveDashboardLocale/)
  assert.doesNotMatch(page, /ARABIC_DATE_LOCALE/, "dates must follow the page language")
})

test("the events page does not show a relevance score or a stock recommendation line", () => {
  assert.doesNotMatch(page, /relevance_score|why_recommended/)
})

test("cancelled, rejected and no-show registrations do not count as registered", () => {
  const record = (slug: string, status: string): MemberRsvpRecord => ({ event: { id: 1, slug, title: slug, starts_at: "2026-11-10T16:00:00Z" }, registration: { status } })
  const states = activeRegistrations([
    record("approved", "approved"),
    record("pending", "pending_approval"),
    record("waiting", "waitlisted"),
    record("checked", "checked_in"),
    record("cancelled", "cancelled_by_user"),
    record("old-cancel", "cancelled"),
    record("rejected", "rejected"),
    record("missed", "no_show"),
  ])
  assert.deepEqual(Object.fromEntries(states), { approved: "registered", pending: "pending", waiting: "waitlisted", checked: "checked_in" })
})

test("a waitlisted or pending RSVP is labelled as such, not as registered", () => {
  assert.equal(stateAfterRsvp("waitlisted"), "waitlisted")
  assert.equal(stateAfterRsvp("pending_approval"), "pending")
  assert.equal(stateAfterRsvp("approved"), "registered")
  assert.equal(registrationLabel("en", "waitlisted"), "Waiting list")
  assert.equal(registrationLabel("ar", "pending"), "بانتظار التأكيد")
})

test("online events register as online attendance, everything else in person", () => {
  assert.equal(attendanceType({ format: "virtual" }), "online")
  assert.equal(attendanceType({ format: "in-person", mode: "online" }), "online")
  assert.equal(attendanceType({ format: "virtual", mode: "in-person" }), "online", "older events carry the in-person mode default")
  assert.equal(attendanceType({ format: "in-person" }), "in_person")
  assert.equal(attendanceType({ mode: "hybrid" }), "in_person")
})

test("format and organiser show readable labels, never API codes", () => {
  assert.equal(formatLabel("en", { format: "in-person" }), "In person")
  assert.equal(formatLabel("ar", { format: "virtual" }), "عن بُعد")
  assert.equal(formatLabel("en", { mode: "hybrid" }), "In person and online")
  assert.equal(organiserLabel("en", "wosool"), "Hosted by Wosool")
  assert.equal(organiserLabel("ar", "partner"), "فعالية شريك")
  assert.equal(organiserLabel("en", "Founder Circle"), null)
})

test("dates and times use Riyadh time in the page language", () => {
  // 21:30 UTC is 00:30 the next day in Riyadh.
  const iso = "2026-11-10T21:30:00Z"
  assert.deepEqual(dateTile("en", iso), { day: "11", month: "Nov" })
  assert.equal(dateTile("ar", iso).day, "11")
  assert.match(eventTime("en", iso), /^0?0:30$/)
  assert.match(eventTime("ar", iso), arabic)
})

test("fill replaces known placeholders only", () => {
  assert.equal(fill(memberEventsCopy.en.summary, { upcoming: 3, registered: 1 }), "3 upcoming · 1 registered")
  assert.equal(fill("{a} {b}", { a: 1 }), "1 {b}")
})
