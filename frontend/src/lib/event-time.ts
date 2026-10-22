import type { Event } from "@/types"

type EventTiming = Pick<Event, "date" | "endDate" | "status" | "statusFlow" | "registrationDeadline">
export type EventPeriod = "upcoming" | "past"

/** Public API dates must identify an instant, independently of the visitor's timezone. */
export function parseEventDate(value: string | null | undefined): number {
  if (typeof value !== "string") return NaN
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/.exec(value)
  if (!parts) return NaN
  const [, year, month, day, hour, minute, second = "0", offset] = parts
  const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate()
  if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > days ||
      Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59 ||
      (offset !== "Z" && (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4)) > 59))) return NaN
  return Date.parse(value)
}

function eventTimes(event: EventTiming) {
  const start = parseEventDate(event.date)
  const end = event.endDate == null ? start : parseEventDate(event.endDate)
  return Number.isFinite(start) && Number.isFinite(end) && end >= start ? { start, end } : null
}

export function eventPeriod(event: EventTiming, now = Date.now()): EventPeriod | null {
  const times = eventTimes(event)
  const status = event.statusFlow || event.status
  if (!times || !Number.isFinite(now) || !status) return null
  if (!["published", "registration_closed", "live_now", "upcoming", "live", "completed"].includes(status)) return null
  if (times.end <= now) return "past"
  return status === "completed" ? null : "upcoming"
}

/** Invalid dates fail closed for callers that use this as a registration guard. */
export function isPastEvent(event: EventTiming, now = Date.now()): boolean {
  const times = eventTimes(event)
  return !times || times.end <= now
}

export function eventsForPeriod(events: Event[], period: EventPeriod, now = Date.now()): Event[] {
  return events.filter((event) => eventPeriod(event, now) === period)
    .sort((a, b) => (parseEventDate(a.date) - parseEventDate(b.date)) * (period === "past" ? -1 : 1))
}

export function upcomingEvents(events: Event[], now = Date.now()): Event[] {
  return eventsForPeriod(events, "upcoming", now)
}

export function canRegisterForEvent(event: EventTiming, now = Date.now()): boolean {
  if (eventPeriod(event, now) !== "upcoming" || (event.statusFlow || event.status) === "registration_closed") return false
  return event.registrationDeadline == null || parseEventDate(event.registrationDeadline) > now
}

/** Preserve the event timezone when editing an existing instant in a datetime-local input. */
export function eventLocalInput(value: string | null | undefined, timeZone = "Asia/Riyadh"): string {
  const instant = parseEventDate(value)
  if (!Number.isFinite(instant)) return ""
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(instant)
  const part = (type: string) => parts.find((item) => item.type === type)?.value
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`
}
