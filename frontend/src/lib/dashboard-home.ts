/**
 * Member dashboard home: the member's own event places and program applications.
 *
 * `/member/dashboard` returns the member's RSVPs (`upcoming_rsvps`, each with `rsvp_status`)
 * and applications (`program_applications`) next to general suggestions (`upcoming_events`,
 * `recommended_programs`). The home page shows the member's own items first, labelled with
 * their status, and only suggests events and programs they have not already joined.
 */

export type HomeLocale = "ar" | "en"

export interface HomeEvent {
  id: number
  title: string
  slug: string
  starts_at: string
  rsvp_status?: string
}

export interface HomeProgram {
  id: number
  name: string
  slug: string
  category?: string | null
}

export interface HomeApplication {
  id: number
  status: string
  program?: HomeProgram | null
}

export type StatusTone = "confirmed" | "pending" | "waiting" | "closed" | "draft"

interface StatusLabel { ar: string; en: string; tone: StatusTone }

/** RSVP pivot states the dashboard API can return (EventRsvpController stores these). */
const RSVP_LABELS: Record<string, StatusLabel> = {
  approved: { ar: "مقعدك مؤكد", en: "Place confirmed", tone: "confirmed" },
  confirmed: { ar: "مقعدك مؤكد", en: "Place confirmed", tone: "confirmed" },
  registered: { ar: "أنت مسجّل", en: "Registered", tone: "confirmed" },
  checked_in: { ar: "سُجّل حضورك", en: "Checked in", tone: "confirmed" },
  pending_approval: { ar: "طلبك قيد المراجعة", en: "Awaiting approval", tone: "pending" },
  waitlisted: { ar: "في قائمة الانتظار", en: "On the waitlist", tone: "waiting" },
}

/** Program application states used by member, admin and EO Accelerator reviews. */
const APPLICATION_LABELS: Record<string, StatusLabel> = {
  draft: { ar: "مسودة لم تُرسل", en: "Draft, not sent", tone: "draft" },
  submitted: { ar: "تم الإرسال", en: "Submitted", tone: "pending" },
  pending_review: { ar: "قيد المراجعة", en: "Under review", tone: "pending" },
  reviewing: { ar: "قيد المراجعة", en: "Under review", tone: "pending" },
  under_review: { ar: "قيد المراجعة", en: "Under review", tone: "pending" },
  shortlisted: { ar: "في القائمة المختصرة", en: "Shortlisted", tone: "pending" },
  interview: { ar: "مرحلة المقابلة", en: "Interview stage", tone: "pending" },
  information_requested: { ar: "مطلوب منك معلومات إضافية", en: "More information needed", tone: "waiting" },
  request_more_info: { ar: "مطلوب منك معلومات إضافية", en: "More information needed", tone: "waiting" },
  waitlisted: { ar: "في قائمة الانتظار", en: "On the waitlist", tone: "waiting" },
  accepted: { ar: "مقبول", en: "Accepted", tone: "confirmed" },
  approved: { ar: "مقبول", en: "Accepted", tone: "confirmed" },
  enrolled: { ar: "ملتحق", en: "Enrolled", tone: "confirmed" },
  rejected: { ar: "لم يُقبل", en: "Not accepted", tone: "closed" },
  declined: { ar: "لم يُقبل", en: "Not accepted", tone: "closed" },
  withdrawn: { ar: "سحبت الطلب", en: "Withdrawn", tone: "closed" },
}

function humanize(status: string): string {
  return status.replace(/_/g, " ").replace(/^./, c => c.toUpperCase())
}

export function rsvpStatus(status: string | undefined, locale: HomeLocale): { label: string; tone: StatusTone } {
  const entry = RSVP_LABELS[status ?? ""] ?? RSVP_LABELS.registered
  return { label: entry[locale], tone: entry.tone }
}

export function applicationStatus(status: string | undefined, locale: HomeLocale): { label: string; tone: StatusTone } {
  const entry = APPLICATION_LABELS[status ?? ""]
  if (entry) return { label: entry[locale], tone: entry.tone }
  return { label: status ? (locale === "ar" ? "قيد المتابعة" : humanize(status)) : "—", tone: "pending" }
}

function dated<T extends { slug?: string; starts_at: string }>(items: T[] | undefined): T[] {
  return (items ?? []).filter(item => Boolean(item.slug) && Number.isFinite(Date.parse(item.starts_at)))
}

/**
 * The member's own events and community events they could join, without repeating an event
 * they already registered for. The API keeps a held place until the event ends, so an event in
 * progress stays in `mine`; suggestions must not have started yet.
 */
export function homeSchedule(rsvps: HomeEvent[] | undefined, events: HomeEvent[] | undefined, now: number) {
  const mine = dated(rsvps).map(item => ({ ...item, rsvp_status: item.rsvp_status ?? "registered" }))
  const joined = new Set(mine.map(item => item.slug))
  const suggested = dated(events).filter(item => Date.parse(item.starts_at) > now && !joined.has(item.slug))
  return { mine, suggested }
}

/** Applications with a linkable program, and recommendations the member has not applied to. */
export function homePrograms(applications: HomeApplication[] | undefined, recommended: HomeProgram[] | undefined) {
  const mine = (applications ?? []).filter((item): item is HomeApplication & { program: HomeProgram } => Boolean(item.program?.slug))
  const applied = new Set(mine.map(item => item.program.slug))
  const suggested = (recommended ?? []).filter(item => item.slug && !applied.has(item.slug))
  return { mine, suggested }
}

/** EO Riyadh Accelerator applications are followed in their own workspace, not the program page. */
export const ACCELERATOR_PROGRAM_SLUG = "eo-riyadh-accelerator"

export function applicationHref(slug: string): string {
  return slug === ACCELERATOR_PROGRAM_SLUG ? "/dashboard/eoa" : `/programs/${encodeURIComponent(slug)}`
}
