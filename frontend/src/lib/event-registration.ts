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
  rejected: { ar: "لم يُقبل طلبك لهذه الفعالية", en: "Your request was not accepted" },
  checked_in: { ar: "سُجّل حضورك", en: "You attended this event" },
  no_show: { ar: "سُجّل غيابك عن الفعالية", en: "Marked as not attended" },
}

/** Every state the registration-status API can return (EventRsvpController::REGISTRATION_STATES). */
export const REGISTRATION_STATES = [
  "open", "requires_approval", "registered", "pending_approval", "approved", "rejected", "waitlisted",
  "cancelled_by_user", "registration_closed", "full_capacity", "invite_only", "checked_in", "no_show",
] as const

const SUCCESS_MESSAGES: Record<string, { ar: string; en: string }> = {
  pending_approval: { ar: "أُرسل طلبك وسيراجعه الفريق.", en: "Request sent. The team will review it." },
  waitlisted: { ar: "الفعالية مكتملة، وأُضفت إلى قائمة الانتظار.", en: "The event is full, so you are on the waitlist." },
}

/** The RSVP API answers in English, so the confirmation is chosen from the resulting state instead. */
export function rsvpSuccessMessage(state: string | undefined, locale: EventLocale): string {
  return SUCCESS_MESSAGES[state ?? ""]?.[locale] ?? (locale === "ar" ? "تم تسجيلك في الفعالية." : "You are registered for this event.")
}

/** Allowed admin event types (Admin\EventController::EVENT_TYPES) plus the legacy seed codes. */
const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  wosool: { ar: "فعالية وصول", en: "Wosool event" },
  partner: { ar: "فعالية شريك", en: "Partner event" },
  "Wosool Event": { ar: "فعالية وصول", en: "Wosool event" },
  "Founder Circle": { ar: "حلقة مؤسسين", en: "Founder circle" },
  "Founder Dinner": { ar: "عشاء المؤسسين", en: "Founder dinner" },
  "Founder-led Session": { ar: "جلسة يقودها مؤسس", en: "Founder-led session" },
  "Office Hours": { ar: "ساعات مكتبية", en: "Office hours" },
  Workshop: { ar: "ورشة عمل", en: "Workshop" },
  "Demo Day": { ar: "يوم العرض", en: "Demo day" },
  "Partner Event": { ar: "فعالية شريك", en: "Partner event" },
  "Sponsor Event": { ar: "فعالية راعٍ", en: "Sponsor event" },
  "Public Ecosystem Event": { ar: "فعالية عامة للمنظومة", en: "Public ecosystem event" },
  Webinar: { ar: "ندوة عبر الإنترنت", en: "Webinar" },
  "Networking Event": { ar: "لقاء تعارف", en: "Networking event" },
  "Wellness Session": { ar: "جلسة عافية", en: "Wellness session" },
  "Private Roundtable": { ar: "طاولة مستديرة خاصة", en: "Private roundtable" },
  "Investor Session": { ar: "جلسة مستثمرين", en: "Investor session" },
}

export const EVENT_TYPE_CODES = Object.keys(TYPE_LABELS)

export function eventTypeLabel(type: string | null | undefined, locale: EventLocale): string {
  if (!type) return locale === "ar" ? "فعالية" : "Event"
  return TYPE_LABELS[type]?.[locale] ?? type
}

/** Accounts that only use the EO Accelerator workspace are not Wosool members (EnsureUserHasMemberAccess). */
export function isAcceleratorOnlyAccount(user: { is_accelerator_applicant?: boolean; roles?: string[]; isAdmin?: boolean } | null | undefined): boolean {
  if (!user) return false
  const roles = user.roles ?? []
  if (user.isAdmin || roles.includes("member") || roles.includes("admin")) return false
  return Boolean(user.is_accelerator_applicant || roles.includes("eoa_applicant"))
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
  const formatted = formatDateTimeOnly(instant, locale)
  const end = parseEventDate(endValue)
  const validEnd = Number.isFinite(end) && end > instant
  // Same day: "… 13:00 – 16:00"; multi-day: the full end date and time.
  const range = !validEnd ? "" : riyadhDay(end) === riyadhDay(instant)
    ? ` – ${formatEventTime(endValue, locale)}`
    : ` – ${formatDateTimeOnly(end, locale)}`
  return `${formatted}${range} ${locale === "ar" ? "بتوقيت الرياض" : "Riyadh time"}`
}

function formatDateTimeOnly(instant: number, locale: EventLocale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(locale === "en" ? { hourCycle: "h23" as const } : {}),
  }).format(instant)
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
