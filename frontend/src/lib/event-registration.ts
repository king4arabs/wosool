import { parseEventDate } from "./event-time"

export type EventLocale = "ar" | "en"

/** States in which the member can open the registration form. */
const OPEN_STATES = ["open", "requires_approval", "full_capacity", "cancelled_by_user"]

/** States that mean the member already holds a place (or a pending request) they can cancel. */
const HELD_STATES = ["registered", "approved", "pending_approval", "waitlisted"]

const CTA_LABELS: Record<string, { ar: string; en: string }> = {
  invite_only: { ar: "بالدعوة فقط", en: "Invitation only" },
  registration_closed: { ar: "أُغلق التسجيل", en: "Registration closed" },
  waitlisted: { ar: "أنت في قائمة الانتظار", en: "You are on the waitlist" },
  pending_approval: { ar: "طلبك قيد المراجعة", en: "Your request is under review" },
  approved: { ar: "تم قبول تسجيلك", en: "Your place is confirmed" },
  registered: { ar: "أنت مسجّل", en: "You are registered" },
  requires_approval: { ar: "اطلب الانضمام", en: "Request to join" },
  full_capacity: { ar: "انضم إلى قائمة الانتظار", en: "Join the waitlist" },
}

export function canOpenRsvp(state: string): boolean {
  return OPEN_STATES.includes(state)
}

export function holdsRegistration(state: string): boolean {
  return HELD_STATES.includes(state)
}

export function registrationCtaLabel(state: string, locale: EventLocale): string {
  return CTA_LABELS[state]?.[locale] ?? (locale === "ar" ? "سجّل الآن" : "Register")
}

/**
 * Events take place in Riyadh, so the time is always shown in Riyadh time
 * (and labelled as such) regardless of the visitor's device timezone.
 */
export function formatEventDateTime(value: string | null | undefined, locale: EventLocale, endValue?: string | null): string {
  const instant = parseEventDate(value)
  if (!Number.isFinite(instant)) return ""
  const formatted = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(locale === "en" ? { hourCycle: "h23" as const } : {}),
  }).format(instant)
  const end = parseEventDate(endValue)
  const sameDay = Number.isFinite(end) && end > instant && riyadhDay(end) === riyadhDay(instant)
  const range = sameDay ? ` – ${formatEventTime(endValue, locale)}` : ""
  return `${formatted}${range} ${locale === "ar" ? "بتوقيت الرياض" : "Riyadh time"}`
}

function riyadhDay(instant: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(instant)
}

export function formatEventTime(value: string | null | undefined, locale: EventLocale): string {
  const instant = parseEventDate(value)
  if (!Number.isFinite(instant)) return ""
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    timeZone: "Asia/Riyadh",
    hour: "numeric",
    minute: "2-digit",
    ...(locale === "en" ? { hourCycle: "h23" as const } : {}),
  }).format(instant)
}

/** Visitors are sent to sign in and brought back to the same event afterwards. */
export function eventSignInHref(slug: string): string {
  return `/login?redirect=${encodeURIComponent(`/events/${slug}`)}`
}
