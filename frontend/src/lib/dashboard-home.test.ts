import { test } from "node:test"
import assert from "node:assert/strict"
import { applicationHref, applicationStatus, homePrograms, homeSchedule, rsvpStatus } from "./dashboard-home"

const now = Date.parse("2026-10-21T09:00:00Z")
const event = (id: number, slug: string, startsAt: string, rsvp?: string) => ({ id, slug, title: slug, starts_at: startsAt, ...(rsvp ? { rsvp_status: rsvp } : {}) })

test("the schedule lists the member's places first and does not suggest an event twice", () => {
  const { mine, suggested } = homeSchedule(
    [event(1, "dinner", "2026-10-25T17:00:00Z", "waitlisted"), event(2, "live-session", "2026-10-21T08:00:00Z", "approved")],
    [event(1, "dinner", "2026-10-25T17:00:00Z"), event(3, "workshop", "2026-10-28T10:00:00Z"), event(4, "yesterday", "2026-10-20T10:00:00Z")],
    now,
  )
  assert.deepEqual(mine.map(item => item.slug), ["dinner", "live-session"])
  assert.deepEqual(suggested.map(item => item.slug), ["workshop"])
})

test("community events are never presented as the member's own", () => {
  const { mine, suggested } = homeSchedule(undefined, [event(3, "workshop", "2026-10-28T10:00:00Z")], now)
  assert.equal(mine.length, 0)
  assert.equal(suggested.length, 1)
})

test("records without a link or a valid date are skipped; a missing RSVP status means registered", () => {
  const { mine } = homeSchedule([event(5, "", "2026-10-28T10:00:00Z"), event(6, "bad-date", "not a date"), event(7, "ok", "2026-10-28T10:00:00Z")], [], now)
  assert.deepEqual(mine.map(item => [item.slug, item.rsvp_status]), [["ok", "registered"]])
})

test("RSVP and application states read the same in both languages", () => {
  assert.deepEqual(rsvpStatus("waitlisted", "ar"), { label: "في قائمة الانتظار", tone: "waiting" })
  assert.deepEqual(rsvpStatus("pending_approval", "en"), { label: "Awaiting approval", tone: "pending" })
  assert.deepEqual(rsvpStatus("approved", "en"), { label: "Place confirmed", tone: "confirmed" })
  assert.equal(applicationStatus("draft", "en").label, "Draft, not sent")
  assert.equal(applicationStatus("information_requested", "ar").label, "مطلوب منك معلومات إضافية")
  assert.equal(applicationStatus("rejected", "en").tone, "closed")
})

test("an unknown application state is shown readably, never as a raw code in Arabic", () => {
  assert.equal(applicationStatus("final_review", "en").label, "Final review")
  assert.equal(applicationStatus("final_review", "ar").label, "قيد المتابعة")
})

test("program recommendations leave out programs the member already applied to", () => {
  const sprint = { id: 1, name: "Growth Sprint", slug: "growth-sprint" }
  const lab = { id: 2, name: "Pricing Lab", slug: "pricing-lab" }
  const { mine, suggested } = homePrograms([{ id: 9, status: "submitted", program: sprint }, { id: 10, status: "submitted", program: null }], [sprint, lab])
  assert.deepEqual(mine.map(item => item.program.slug), ["growth-sprint"])
  assert.deepEqual(suggested.map(item => item.slug), ["pricing-lab"])
})

test("an accelerator application opens the accelerator workspace", () => {
  assert.equal(applicationHref("eo-riyadh-accelerator"), "/dashboard/eoa")
  assert.equal(applicationHref("growth-sprint"), "/programs/growth-sprint")
})
