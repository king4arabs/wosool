import assert from "node:assert/strict"
import test from "node:test"
import { calendarAgendaEntries, nextCalendarEntry } from "./calendar-discovery"
import type { CalendarEntry } from "./founder-calendar"

const entry = (id: string, date: string, endDate?: string): CalendarEntry => ({ id, date, endDate, kind: "ecosystem", status: "published", title: { ar: id, en: id }, description: { ar: "", en: "" } })
const entries = [entry("future", "2026-11-02"), entry("past", "2026-10-05"), entry("ongoing", "2026-10-28", "2026-11-01"), entry("today", "2026-10-29")]

test("current agenda keeps ongoing and today's events while hiding elapsed dates", () => {
  assert.deepEqual(calendarAgendaEntries(entries, "2026-10", "2026-10-29").map((item) => item.id), ["ongoing", "today"])
  assert.deepEqual(calendarAgendaEntries(entries, "2026-10", "2026-10-29", true).map((item) => item.id), ["past", "ongoing", "today"])
})
test("historical and future months remain browsable, including crossing events", () => {
  assert.equal(calendarAgendaEntries(entries, "2026-10", "2026-11-10").length, 3)
  assert.deepEqual(calendarAgendaEntries(entries, "2026-11", "2026-10-29").map((item) => item.id), ["ongoing", "future"])
  assert.equal(calendarAgendaEntries(entries, "2026-12", "2026-10-29").length, 0)
})
test("next matching date respects the supplied filter and does not mutate its input", () => {
  const filtered = entries.filter((item) => item.id === "future")
  assert.equal(nextCalendarEntry(filtered, "2026-10-29")?.id, "future")
  assert.equal(nextCalendarEntry(entries, "2026-10-29")?.id, "ongoing")
  assert.equal(nextCalendarEntry(entries, "2026-11-03"), undefined)
  assert.equal(entries[0].id, "future")
})
