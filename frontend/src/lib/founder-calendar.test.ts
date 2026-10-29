import assert from "node:assert/strict"
import test from "node:test"
import { ONLINE_ANCHOR, PROGRAM_END, PROGRAM_START, RAMADAN_BREAK_END, RAMADAN_BREAK_START } from "../data/founder-calendar"
import { acceleratorBreak, cohortMilestones, ecosystemCalendarEntries, internationalCalendarHolidays, isAcceleratorOff, addCalendarDays, calendarDateLabel, calendarMonthDays, entriesOnDate, plannedFounderSessions, publishedCalendarEntries, riyadhDate, saudiCalendarHolidays, shiftCalendarMonth } from "./founder-calendar"
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

test("sourced ecosystem conference calendar spans the requested archive and future years without fabricated daily dates", () => {
  const entries = ecosystemCalendarEntries()
  assert.equal(entries.length, 96)
  assert.equal(new Set(entries.map(item => item.id)).size, entries.length)
  assert.deepEqual([...new Set(entries.map(item => item.date.slice(0, 4)))].sort(), ["2025", "2026", "2027", "2028", "2029"])
  const validDay = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date)
    && Number.isFinite(Date.parse(date + "T00:00:00Z"))
    && new Date(date + "T00:00:00Z").toISOString().slice(0, 10) === date
  for (const entry of entries) {
    assert.equal(entry.kind, "ecosystem")
    assert.equal(entry.status, "published")
    assert.ok(validDay(entry.date), entry.id)
    assert.ok(validDay(entry.endDate!), entry.id)
    assert.ok(entry.date <= entry.endDate!, entry.id)
    assert.ok(entry.date <= "2029-10-29" && entry.endDate! >= "2025-10-29", entry.id)
    assert.ok(entry.title.en && entry.title.ar && entry.description.en && entry.description.ar)
    assert.ok(entry.source?.startsWith("https://"))
    assert.ok(entry.location?.en && entry.location?.ar)
    assert.ok(["riyadh", "saudi", "gcc", "mena", "global"].includes(entry.ecosystem!.region))
    assert.ok(["registration", "application", "invitation", "trade"].includes(entry.ecosystem!.access))
    assert.ok(entry.ecosystem!.organizer)
    assert.equal(entry.event, undefined, "external event must not impersonate a Wosool registration")
  }
})

test("new regional and international dates are discoverable and postponed FII dates are withdrawn", () => {
  const entries = ecosystemCalendarEntries()
  for (const [id, start, end] of [
    ['saif-riyadh-2026', '2026-11-24', '2026-11-26'],
    ['mwc-doha-2026', '2026-11-08', '2026-11-10'],
    ['aspa-kaust-2026', '2026-11-29', '2026-12-02'],
    ['comex-oman-2027', '2027-02-01', '2027-02-04'],
    ['south-summit-madrid-2027', '2027-06-02', '2027-06-04'],
  ]) {
    const entry = entries.find(item => item.id === `ecosystem-${id}`)
    assert.equal(entry?.date, start)
    assert.equal(entry?.endDate, end)
    assert.ok(entriesOnDate(entries, end).includes(entry!))
  }
  assert.equal(entries.some(entry => /fii10/.test(entry.id)), false, 'The organizer has postponed FII10 without replacement dates')
})

test("multi-day conferences appear on their actual calendar dates and organizer-only meetings are identified", () => {
  const entries = ecosystemCalendarEntries()
  const leap = entries.find(entry => entry.id === "ecosystem-leap-2027")!
  assert.equal(leap.date, "2027-04-12")
  assert.equal(leap.endDate, "2027-04-15")
  for (const date of ["2027-04-12", "2027-04-13", "2027-04-14", "2027-04-15"]) {
    assert(entriesOnDate(entries, date).some(row => row.id === leap.id))
  }
  assert.equal(entriesOnDate(entries, "2027-04-16").some(row => row.id === leap.id), false)
  const closed = entries.find(row => row.id === "ecosystem-superreturn-lp-boardroom-2027")!
  assert.equal(closed.ecosystem?.access, "invitation")
  assert.equal(closed.ecosystem?.region, "riyadh")
  assert.ok(entries.some(row => row.date.startsWith("2029") && row.endDate?.startsWith("2029")))
  assert.equal(plannedFounderSessions().length, 91, "existing cohort activity categories remain unchanged")
})
