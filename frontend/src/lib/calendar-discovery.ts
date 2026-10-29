import type { CalendarEntry } from "./founder-calendar"
import { shiftCalendarMonth } from "./founder-calendar"

/** Keep ongoing multi-day events and show the current month's remaining dates first. */
export function calendarAgendaEntries(entries: CalendarEntry[], month: string, today: string, includePast = false): CalendarEntry[] {
  const start = !includePast && month === today.slice(0, 7) ? today : `${month}-01`
  const nextMonth = `${shiftCalendarMonth(month, 1)}-01`
  return entries.filter((entry) => entry.date < nextMonth && (entry.endDate || entry.date) >= start)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

/** Call with the already-filtered collection so a recovery action respects the selection. */
export function nextCalendarEntry(entries: CalendarEntry[], fromDate: string): CalendarEntry | undefined {
  return entries.filter((entry) => (entry.endDate || entry.date) >= fromDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))[0]
}
