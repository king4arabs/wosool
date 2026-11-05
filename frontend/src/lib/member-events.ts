import type { DashboardLocale } from "@/lib/dashboard-i18n"
import { dateLocale } from "@/lib/date-locale"

export type MemberEvent = {
  id: number
  title: string
  slug: string
  description?: string | null
  starts_at: string
  ends_at?: string | null
  location?: string | null
  type?: string | null
  format?: string | null
  mode?: string | null
  max_attendees?: number | null
  is_public?: boolean
  status?: string
  tags?: string[] | null
  is_saved?: boolean
}

export type MemberRsvpRecord = {
  event: MemberEvent
  registration: { status: string }
}

export const memberEventsCopy = {
  ar: {
    badge: "الفعاليات",
    title: "فعاليات الشبكة",
    loading: "جارٍ تحميل الفعاليات…",
    loadFailed: "تعذر تحميل الفعاليات.",
    tabUpcoming: "القادمة",
    tabRegistered: "تسجيلاتي",
    tabsLabel: "عرض الفعاليات",
    periodLabel: "الفترة",
    periodAll: "الكل",
    periodToday: "اليوم",
    periodWeek: "هذا الأسبوع",
    periodMonth: "هذا الشهر",
    emptyUpcoming: "لا توجد فعاليات قادمة في هذه الفترة.",
    emptyRegistered: "لم تسجل في أي فعالية قادمة بعد.",
    statusRegistered: "مسجّل",
    statusPending: "بانتظار التأكيد",
    statusWaitlisted: "قائمة الانتظار",
    statusCheckedIn: "تم الحضور",
    online: "عن بُعد",
    inPerson: "حضوري",
    hybrid: "حضوري وعن بُعد",
    wosoolEvent: "تنظيم وصول",
    partnerEvent: "فعالية شريك",
    membersOnly: "للأعضاء فقط",
    riyadhTime: "بتوقيت الرياض",
    seats: "{count} مقعدًا كحد أقصى",
    rsvp: "سجّل الآن",
    rsvping: "جارٍ الإرسال…",
    cancel: "إلغاء التسجيل",
    cancelling: "جارٍ الإلغاء…",
    save: "حفظ",
    saved: "محفوظ",
    share: "نسخ الرابط",
    registeredToast: "تم تسجيلك.",
    notAccepted: "لم يُؤكَّد لك مقعد في هذه الفعالية. تواصل مع المنظّم إن احتجت إلى توضيح.",
    cancelledToast: "أُلغي تسجيلك.",
    rsvpFailed: "تعذر إتمام التسجيل.",
    cancelFailed: "تعذر إلغاء التسجيل.",
    saveFailed: "تعذر تحديث الحفظ.",
    linkCopied: "نُسخ رابط الفعالية.",
    linkFailed: "تعذر نسخ الرابط.",
    summary: "{upcoming} فعالية قادمة · {registered} مسجّل فيها",
  },
  en: {
    badge: "Events",
    title: "Network events",
    loading: "Loading events…",
    loadFailed: "Events could not be loaded.",
    tabUpcoming: "Upcoming",
    tabRegistered: "My registrations",
    tabsLabel: "Show events",
    periodLabel: "Period",
    periodAll: "All",
    periodToday: "Today",
    periodWeek: "This week",
    periodMonth: "This month",
    emptyUpcoming: "No upcoming events in this period.",
    emptyRegistered: "You have not registered for an upcoming event yet.",
    statusRegistered: "Registered",
    statusPending: "Awaiting confirmation",
    statusWaitlisted: "Waiting list",
    statusCheckedIn: "Checked in",
    online: "Online",
    inPerson: "In person",
    hybrid: "In person and online",
    wosoolEvent: "Hosted by Wosool",
    partnerEvent: "Partner event",
    membersOnly: "Members only",
    riyadhTime: "Riyadh time",
    seats: "Up to {count} seats",
    rsvp: "Register",
    rsvping: "Sending…",
    cancel: "Cancel registration",
    cancelling: "Cancelling…",
    save: "Save",
    saved: "Saved",
    share: "Copy link",
    registeredToast: "You are registered.",
    notAccepted: "You do not have a confirmed place at this event. Contact the organiser if you need details.",
    cancelledToast: "Your registration is cancelled.",
    rsvpFailed: "Registration did not go through.",
    cancelFailed: "Your registration could not be cancelled.",
    saveFailed: "Saving did not go through.",
    linkCopied: "Event link copied.",
    linkFailed: "The link could not be copied.",
    summary: "{upcoming} upcoming · {registered} registered",
  },
} as const

export type MemberEventsCopy = { [K in keyof typeof memberEventsCopy.en]: string }

export function memberEvents(locale: DashboardLocale): MemberEventsCopy {
  return memberEventsCopy[locale]
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export const EVENT_PERIODS = ["all", "today", "this_week", "this_month"] as const
export type EventPeriod = (typeof EVENT_PERIODS)[number]

export function periodLabel(locale: DashboardLocale, period: EventPeriod): string {
  const copy = memberEvents(locale)
  return { all: copy.periodAll, today: copy.periodToday, this_week: copy.periodWeek, this_month: copy.periodMonth }[period]
}

export type RegistrationState = "registered" | "pending" | "waitlisted" | "checked_in"

/**
 * The RSVP list keeps every registration a member ever made, including cancelled and rejected ones.
 * Only these statuses mean the member still holds (or is waiting for) a place.
 */
const ACTIVE_STATUSES: Record<string, RegistrationState> = {
  approved: "registered",
  confirmed: "registered",
  registered: "registered",
  vip: "registered",
  pending_approval: "pending",
  waitlisted: "waitlisted",
  checked_in: "checked_in",
}

export function registrationState(status?: string | null): RegistrationState | null {
  return (status && ACTIVE_STATUSES[status]) || null
}

/** slug → state for registrations that are still active; cancelled, rejected and no-show are left out. */
export function activeRegistrations(records: MemberRsvpRecord[]): Map<string, RegistrationState> {
  const states = new Map<string, RegistrationState>()
  for (const record of records) {
    const state = registrationState(record.registration?.status)
    if (record.event?.slug && state) states.set(record.event.slug, state)
  }
  return states
}

/**
 * After an RSVP the API reports the place the member actually got. A rejected or no-show registration
 * comes back unchanged with HTTP 200, so a reported status that is not active gives no place (null).
 * Only a response without any status falls back to registered.
 */
export function stateAfterRsvp(status?: string | null): RegistrationState | null {
  if (!status) return "registered"
  return registrationState(status)
}

export function registrationLabel(locale: DashboardLocale, state: RegistrationState): string {
  const copy = memberEvents(locale)
  return { registered: copy.statusRegistered, pending: copy.statusPending, waitlisted: copy.statusWaitlisted, checked_in: copy.statusCheckedIn }[state]
}

function normalized(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-")
}

const ONLINE = ["virtual", "online"]

/**
 * `format` is the required field on every event and decides online versus in person. `mode` is
 * optional and was added later (older rows default it to "in-person"), so it is only consulted when
 * `format` is missing, and for "hybrid".
 */
export function isOnline(event: Pick<MemberEvent, "format" | "mode">): boolean {
  const format = normalized(event.format)
  return format ? ONLINE.includes(format) : ONLINE.includes(normalized(event.mode))
}

/** How the member will attend, in the values the RSVP endpoint accepts. */
export function attendanceType(event: Pick<MemberEvent, "format" | "mode">): "in_person" | "online" {
  return isOnline(event) ? "online" : "in_person"
}

/** "Online", "In person" or "In person and online"; never the raw API value. */
export function formatLabel(locale: DashboardLocale, event: Pick<MemberEvent, "format" | "mode">): string {
  const copy = memberEvents(locale)
  if (isOnline(event)) return copy.online
  return normalized(event.mode) === "hybrid" || normalized(event.format) === "hybrid" ? copy.hybrid : copy.inPerson
}

/** Organiser label for the known event types; other values are left out rather than shown as codes. */
export function organiserLabel(locale: DashboardLocale, type?: string | null): string | null {
  const copy = memberEvents(locale)
  const value = normalized(type)
  if (value === "wosool") return copy.wosoolEvent
  if (value === "partner") return copy.partnerEvent
  return null
}

const RIYADH = "Asia/Riyadh"

export function eventDate(locale: DashboardLocale, iso: string): string {
  return new Date(iso).toLocaleDateString(dateLocale(locale === "ar"), { timeZone: RIYADH, weekday: "short", month: "short", day: "numeric" })
}

export function eventTime(locale: DashboardLocale, iso: string): string {
  return new Date(iso).toLocaleTimeString(dateLocale(locale === "ar"), { timeZone: RIYADH, hour: "numeric", minute: "2-digit" })
}

/** Day number and short month for the date tile, both in Riyadh time. */
export function dateTile(locale: DashboardLocale, iso: string): { day: string; month: string } {
  const tag = dateLocale(locale === "ar")
  const date = new Date(iso)
  return {
    day: date.toLocaleDateString(tag, { day: "numeric", timeZone: RIYADH }),
    month: date.toLocaleDateString(tag, { month: "short", timeZone: RIYADH }),
  }
}

export function isUpcoming(event: Pick<MemberEvent, "status">): boolean {
  return !["completed", "cancelled"].includes(event.status ?? "")
}
