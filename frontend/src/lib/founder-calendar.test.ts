import assert from "node:assert/strict"
import test from "node:test"
import { ONLINE_ANCHOR, PROGRAM_END, PROGRAM_START, RAMADAN_BREAK_END, RAMADAN_BREAK_START } from "../data/founder-calendar"
import { acceleratorBreak, cohortMilestones, internationalCalendarHolidays, isAcceleratorOff, addCalendarDays, calendarDateLabel, calendarMonthDays, entriesOnDate, plannedFounderSessions, publishedCalendarEntries, riyadhDate, saudiCalendarHolidays, shiftCalendarMonth } from "./founder-calendar"
import type { Event } from "../types"

const sessions = plannedFounderSessions()

test("26 active weeks have distinct topics on the requested weekdays", () => {
  assert.equal(sessions.length, 91)
  assert.equal(new Set(sessions.map((event) => event.id)).size, 91)
  for (const [track, day, count] of [["learning", 3, 26], ["visit", 6, 26], ["peer", 0, 26], ["online", 5, 13]] as const) {
    const entries = sessions.filter((entry) => entry.kind === track)
    assert.equal(entries.length, count)
    for (const locale of ["ar", "en"] as const) assert.equal(new Set(entries.map((entry) => entry.title[locale])).size, count)
    entries.forEach((entry) => {
      assert.equal(new Date(`${entry.date}T00:00:00Z`).getUTCDay(), day)
      assert(entry.date >= PROGRAM_START && entry.date <= PROGRAM_END)
      assert.equal(entry.status, "planned")
      assert.equal(entry.event, undefined, "TBD sessions cannot expose live registration")
    })
  }
})

test("alternate Friday cadence stays anchored across months and the year", () => {
  const online = sessions.filter((entry) => entry.kind === "online")
  assert.equal(online[0].date, ONLINE_ANCHOR)
  online.slice(1).forEach((entry, index) => {
    let expected = addCalendarDays(online[index].date, 14)
    while (isAcceleratorOff(expected)) expected = addCalendarDays(expected, 14)
    assert.equal(entry.date, expected)
  })
  assert.equal(online.at(-1)?.date, "2027-04-30")
  assert.equal(sessions.at(-1)?.date, PROGRAM_END)
})

test("month grid begins Sunday, includes all dates, and handles leap years", () => {
  for (const [month, count] of [["2026-10", 31], ["2027-02", 28], ["2028-02", 29]] as const) {
    const days = calendarMonthDays(month)
    assert.equal(days.length % 7, 0)
    assert.equal(new Date(`${days[0]}T00:00:00Z`).getUTCDay(), 0)
    assert.equal(days.filter((day) => day.startsWith(month)).length, count)
  }
  assert.equal(shiftCalendarMonth("2026-12", 1), "2027-01")
  assert.equal(shiftCalendarMonth("2027-01", -1), "2026-12")
})

test("Riyadh dates stay consistent across UTC midnight and Arabic uses Gregorian months", () => {
  assert.equal(riyadhDate(Date.parse("2026-10-13T21:30:00Z")), "2026-10-14")
  assert.equal(riyadhDate(Date.parse("2026-10-13T20:30:00Z")), "2026-10-13")
  assert.match(calendarDateLabel("2027-03-10", "en"), /March/)
  assert.match(calendarDateLabel("2027-03-10", "ar"), /مارس/)
})

test("fixed and lunar holidays retain source and confirmation status", () => {
  const holidays = saudiCalendarHolidays(2027)
  assert.equal(holidays.find((entry) => entry.id === "founding-2027")?.date, "2027-02-22")
  assert.equal(holidays.find((entry) => entry.id === "national-2027")?.date, "2027-09-23")
  assert.equal(holidays.find((entry) => entry.id === "fitr-2027")?.status, "tentative")
  assert(holidays.every((entry) => entry.source?.startsWith("https://")))
  assert.equal(saudiCalendarHolidays(2028).length, 2, "do not invent future lunar dates")
  assert.equal(entriesOnDate([...sessions, ...holidays], "2027-03-10").length, 2, "holiday and proposed session both remain visible")
})

const event: Event = { id: "1", slug: "real-event", title: "Published event", description: "Community event", status: "published", date: "2026-10-14T23:00:00+03:00", endDate: "2026-10-16T00:00:00+03:00", location: "Riyadh", type: "workshop", isVirtual: false, isPublic: true, tags: [] }

test("published multi-day events occupy Riyadh days and reject invalid or non-public schedules", () => {
  const entries = publishedCalendarEntries([event, { ...event, id: "bad", date: "invalid" }, { ...event, id: "draft", status: "draft" }, { ...event, id: "cancelled", status: "cancelled" }], Date.parse("2026-10-12T00:00:00Z"))
  assert.equal(entries.length, 1)
  assert.equal(entries[0].date, "2026-10-14")
  assert.equal(entries[0].endDate, "2026-10-15")
  assert.equal(entriesOnDate(entries, "2026-10-15").length, 1)
  assert.equal(entriesOnDate(entries, "2026-10-16").length, 0)
  assert.equal(entries[0].event?.slug, "real-event")
})


test("Ramadan pauses every accelerator track without losing or reordering topics", () => {
  assert.equal(sessions.filter((entry) => isAcceleratorOff(entry.date)).length, 0)
  assert.equal(isAcceleratorOff(RAMADAN_BREAK_START), true)
  assert.equal(isAcceleratorOff(RAMADAN_BREAK_END), true)
  assert.equal(isAcceleratorOff(addCalendarDays(RAMADAN_BREAK_START, -1)), false)
  assert.equal(isAcceleratorOff(addCalendarDays(RAMADAN_BREAK_END, 1)), false)
  for (let date = RAMADAN_BREAK_START; date <= RAMADAN_BREAK_END; date = addCalendarDays(date, 1)) assert.equal(entriesOnDate([acceleratorBreak], date).length, 1)
  const resumed = sessions.filter((entry) => entry.date > RAMADAN_BREAK_END)
  assert.equal(resumed[0].date, "2027-03-10")
  assert.equal(resumed[0].week, 18)
  for (const track of ["learning", "visit", "peer"] as const) {
    assert.deepEqual(sessions.filter((entry) => entry.kind === track).map((entry) => entry.week), Array.from({ length: 26 }, (_, index) => index + 1))
  }
  assert.equal(sessions.at(-1)?.date, "2027-05-09")
})

test("May milestones retain requested dates, Diriyah, TBA details and the Arafat overlap", () => {
  assert.equal(cohortMilestones.find((entry) => entry.id === "eoa-demo-day-2027")?.date, "2027-05-15")
  const summit = cohortMilestones.find((entry) => entry.id === "eo-saudi-summit-2027")!
  assert.equal(summit.date, "2027-05-20")
  assert.match(summit.location!.en, /Diriyah.*TBA/)
  assert(cohortMilestones.every((entry) => !entry.event && entry.status === "scheduled"))
  assert.equal(entriesOnDate([...cohortMilestones, ...saudiCalendarHolidays(2027)], "2027-05-15").length, 2)
})

test("international holidays are sourced, distinctly categorized and do not cancel sessions", () => {
  const holidays = internationalCalendarHolidays(2027)
  assert.equal(holidays.length, 10)
  assert.equal(new Set(holidays.map((entry) => entry.id)).size, 10)
  assert(holidays.every((entry) => entry.kind === "international" && entry.source?.startsWith("https://")))
  assert.equal(holidays.find((entry) => entry.id === "lunar-new-year-2027")?.date, "2027-02-06")
  assert.equal(holidays.find((entry) => entry.id === "easter-2027")?.date, "2027-03-28")
  assert.equal(entriesOnDate([...sessions, ...holidays], "2027-03-28").length, 2, "Easter is not an accelerator off day")
  assert.equal(isAcceleratorOff("2027-01-01"), false)
})
