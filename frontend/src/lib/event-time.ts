import type { Event } from "@/types"

export function isPastEvent(event: Pick<Event, "date" | "endDate">, now = Date.now()): boolean {
  const end = Date.parse(event.endDate || event.date)
  return !Number.isFinite(end) || end <= now
}

export function upcomingEvents(events: Event[], now = Date.now()): Event[] {
  return events.filter((event) => !isPastEvent(event, now)).sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
}
