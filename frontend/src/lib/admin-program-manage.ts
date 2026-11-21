import { dateLocale } from "./date-locale"
import type { Locale } from "./locale"

/**
 * Copy, rules and helpers for the program management page (`/admin/programs/[id]`): the
 * applications, cohorts and sessions tabs. Rules mirror `Admin\ProgramManagementController`
 * (`updateApplication`, `createCohort`, `createSession`).
 *
 * Session times: the API parses `starts_at` with Carbon and stores it in UTC; the application
 * time zone is UTC, so a bare `2026-12-01T10:00` from a `datetime-local` input was saved as
 * 10:00 UTC and then shown as 13:00 Riyadh time. The page now treats the typed time as Riyadh
 * time and sends it with Riyadh's fixed +03:00 offset (Saudi Arabia has no daylight saving).
 */

export const RIYADH_OFFSET = "+03:00"
export const RIYADH_TIME_ZONE = "Asia/Riyadh"

export const applicationStatuses = ["submitted", "reviewing", "pending_review", "accepted", "rejected", "waitlisted", "withdrawn", "enrolled"] as const
export const applicationActions = ["accept", "reject", "waitlist", "request_more_info", "enroll"] as const
export const cohortStatuses = ["draft", "open", "full", "active", "completed", "cancelled"] as const
export const sessionTypes = ["workshop", "office_hour", "mentorship", "lecture", "roundtable", "demo", "review", "check_in"] as const

export type ApplicationAction = (typeof applicationActions)[number]
export type CohortStatus = (typeof cohortStatuses)[number]
export type SessionType = (typeof sessionTypes)[number]

export const cohortLimits = { name: 255, code: 80 } as const
export const sessionLimits = { title: 255, minDuration: 15 } as const

export type CohortField = "name" | "code" | "capacity" | "status" | "starts_at"
export type SessionField = "title" | "session_type" | "starts_at" | "duration_minutes" | "description"
export const cohortFieldOrder: CohortField[] = ["name", "code", "status", "capacity", "starts_at"]
export const sessionFieldOrder: SessionField[] = ["title", "session_type", "starts_at", "duration_minutes", "description"]

export type CohortForm = { name: string; code: string; status: string; capacity: string; starts_at: string }
export type SessionForm = { title: string; session_type: string; starts_at: string; duration_minutes: string; description: string }
export const emptyCohortForm: CohortForm = { name: "", code: "", status: "draft", capacity: "", starts_at: "" }
export const emptySessionForm: SessionForm = { title: "", session_type: "workshop", starts_at: "", duration_minutes: "60", description: "" }

const ar = {
  title: "إدارة البرنامج",
  settingsLink: "بيانات البرامج وإعداداتها",
  tabsLabel: "أقسام البرنامج",
  required: "مطلوب",
  optional: "اختياري",
  loading: "جارٍ التحميل…",
  retry: "إعادة المحاولة",
  saveInvalid: "راجع الحقول المشار إليها.",
  // Applications
  applicationsTitle: "طلبات البرنامج",
  exportCsv: "تصدير الطلبات (CSV)",
  applicationsFailed: "تعذر تحميل الطلبات.",
  applicationsEmpty: "لا توجد طلبات لهذا البرنامج بعد.",
  submittedOn: "قُدّم في {date}",
  actionsFor: "إجراءات طلب {name}",
  applicationUpdated: "حُدّث طلب {name}.",
  applicationFailed: "تعذر تحديث الطلب. حاول مرة أخرى.",
  workspaceOnly: "طلبات هذا البرنامج تُراجع من مساحة المسرّعة المخصصة للحفاظ على سجل المراجعة، لا من هذه الصفحة.",
  unnamed: "متقدم بلا اسم",
  // Cohorts
  cohortsTitle: "الدفعات",
  newCohort: "دفعة جديدة",
  cohortName: "اسم الدفعة",
  cohortNameHint: "حتى {max} حرف، مثل: الدفعة الأولى 2027.",
  cohortCode: "رمز الدفعة",
  cohortCodeHint: "حتى {max} حرف، مثل: C1-2027.",
  cohortStatus: "حالة الدفعة",
  capacity: "السعة",
  capacityHint: "عدد صحيح من 1 فأكثر. اتركه فارغًا إن لم تُحدد السعة.",
  cohortStart: "تاريخ البداية",
  addCohort: "إضافة الدفعة",
  addingCohort: "جارٍ الإضافة…",
  cohortCreated: "أُضيفت الدفعة «{name}».",
  cohortFailed: "تعذر إضافة الدفعة. حاول مرة أخرى.",
  cohortsFailed: "تعذر تحميل الدفعات.",
  cohortsEmpty: "لا توجد دفعات بعد.",
  capacityValue: "السعة: {value}",
  noCapacity: "السعة غير محددة",
  startsOn: "تبدأ في {date}",
  applicationsCount: "الطلبات: {count}",
  // Sessions
  sessionsTitle: "جلسات البرنامج",
  newSession: "جلسة جديدة",
  sessionTitle: "عنوان الجلسة",
  sessionTitleHint: "حتى {max} حرف.",
  sessionType: "نوع الجلسة",
  sessionStart: "موعد البداية (بتوقيت الرياض)",
  sessionStartHint: "يُحفظ الموعد بتوقيت الرياض كما كتبته.",
  duration: "المدة بالدقائق",
  durationHint: "عدد صحيح من {min} دقيقة فأكثر.",
  sessionDescription: "وصف الجلسة",
  addSession: "إضافة الجلسة",
  addingSession: "جارٍ الإضافة…",
  sessionCreated: "أُضيفت الجلسة «{title}».",
  sessionFailed: "تعذر إضافة الجلسة. حاول مرة أخرى.",
  sessionsFailed: "تعذر تحميل الجلسات.",
  sessionsEmpty: "لا توجد جلسات بعد.",
  minutes: "{count} دقيقة",
  riyadhTime: "بتوقيت الرياض",
  noTime: "بلا موعد",
  // Errors
  errorNameRequired: "اكتب اسم الدفعة.",
  errorNameLong: "الاسم أطول من {max} حرف.",
  errorCodeLong: "الرمز أطول من {max} حرف.",
  errorCapacity: "اكتب عددًا صحيحًا من 1 فأكثر.",
  errorStatus: "اختر حالة من القائمة.",
  errorDate: "اكتب تاريخًا صحيحًا.",
  errorTitleRequired: "اكتب عنوان الجلسة.",
  errorTitleLong: "العنوان أطول من {max} حرف.",
  errorType: "اختر نوعًا من القائمة.",
  errorStartRequired: "اختر موعد بداية الجلسة.",
  errorStartInvalid: "اختر تاريخًا ووقتًا صحيحين.",
  errorDuration: "اكتب عددًا صحيحًا من {min} دقيقة فأكثر.",
  errorRejected: "رفض الخادم هذه القيمة. راجعها.",
}

type ProgramManageCopy = typeof ar

const en: ProgramManageCopy = {
  title: "Manage program",
  settingsLink: "Program details and settings",
  tabsLabel: "Program sections",
  required: "required",
  optional: "optional",
  loading: "Loading…",
  retry: "Try again",
  saveInvalid: "Check the highlighted fields.",
  applicationsTitle: "Program applications",
  exportCsv: "Export applications (CSV)",
  applicationsFailed: "Applications could not be loaded.",
  applicationsEmpty: "No applications for this program yet.",
  submittedOn: "Submitted {date}",
  actionsFor: "Actions for {name}'s application",
  applicationUpdated: "{name}'s application updated.",
  applicationFailed: "The application could not be updated. Try again.",
  workspaceOnly: "Applications to this program are reviewed in its accelerator workspace, which keeps the review record, not on this page.",
  unnamed: "Unnamed applicant",
  cohortsTitle: "Cohorts",
  newCohort: "New cohort",
  cohortName: "Cohort name",
  cohortNameHint: "Up to {max} characters, e.g. Cohort 1 2027.",
  cohortCode: "Cohort code",
  cohortCodeHint: "Up to {max} characters, e.g. C1-2027.",
  cohortStatus: "Cohort status",
  capacity: "Capacity",
  capacityHint: "A whole number, 1 or more. Leave empty if there is no set capacity.",
  cohortStart: "Start date",
  addCohort: "Add cohort",
  addingCohort: "Adding…",
  cohortCreated: "Cohort “{name}” added.",
  cohortFailed: "The cohort could not be added. Try again.",
  cohortsFailed: "Cohorts could not be loaded.",
  cohortsEmpty: "No cohorts yet.",
  capacityValue: "Capacity: {value}",
  noCapacity: "No set capacity",
  startsOn: "Starts {date}",
  applicationsCount: "Applications: {count}",
  sessionsTitle: "Program sessions",
  newSession: "New session",
  sessionTitle: "Session title",
  sessionTitleHint: "Up to {max} characters.",
  sessionType: "Session type",
  sessionStart: "Start time (Riyadh time)",
  sessionStartHint: "Saved in Riyadh time exactly as typed.",
  duration: "Duration in minutes",
  durationHint: "A whole number, {min} minutes or more.",
  sessionDescription: "Session description",
  addSession: "Add session",
  addingSession: "Adding…",
  sessionCreated: "Session “{title}” added.",
  sessionFailed: "The session could not be added. Try again.",
  sessionsFailed: "Sessions could not be loaded.",
  sessionsEmpty: "No sessions yet.",
  minutes: "{count} min",
  riyadhTime: "Riyadh time",
  noTime: "No time set",
  errorNameRequired: "Enter the cohort name.",
  errorNameLong: "The name is longer than {max} characters.",
  errorCodeLong: "The code is longer than {max} characters.",
  errorCapacity: "Enter a whole number, 1 or more.",
  errorStatus: "Choose a status from the list.",
  errorDate: "Enter a valid date.",
  errorTitleRequired: "Enter the session title.",
  errorTitleLong: "The title is longer than {max} characters.",
  errorType: "Choose a type from the list.",
  errorStartRequired: "Choose when the session starts.",
  errorStartInvalid: "Choose a valid date and time.",
  errorDuration: "Enter a whole number, {min} minutes or more.",
  errorRejected: "The server rejected this value. Check it.",
}

export const programManageCopy = { ar, en }

export function programManage(locale: Locale): ProgramManageCopy {
  return programManageCopy[locale]
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

/** Tab keys stay Arabic because `ProgramOperationsPanel` takes the Arabic name as its panel key. */
export const programTabs = [
  { key: "نظرة عامة", en: "Overview" },
  { key: "الطلبات", en: "Applications" },
  { key: "المشاركون", en: "Participants" },
  { key: "الدفعات", en: "Cohorts" },
  { key: "الجلسات", en: "Sessions" },
  { key: "الحضور", en: "Attendance" },
  { key: "التقدم", en: "Progress" },
] as const

const labels = {
  ar: {
    application: { submitted: "مُقدَّم", reviewing: "قيد المراجعة", pending_review: "بانتظار معلومات", accepted: "مقبول", rejected: "مرفوض", waitlisted: "قائمة الانتظار", withdrawn: "مسحوب", enrolled: "ملتحق" },
    action: { accept: "قبول", reject: "رفض", waitlist: "قائمة الانتظار", request_more_info: "طلب معلومات", enroll: "إلحاق" },
    cohort: { draft: "مسودة", open: "مفتوحة", full: "مكتملة العدد", active: "نشطة", completed: "منتهية", cancelled: "ملغاة" },
    session: { workshop: "ورشة", office_hour: "ساعات مكتبية", mentorship: "إرشاد", lecture: "محاضرة", roundtable: "طاولة مستديرة", demo: "عرض", review: "مراجعة", check_in: "متابعة" },
  },
  en: {
    application: { submitted: "Submitted", reviewing: "In review", pending_review: "Info requested", accepted: "Accepted", rejected: "Rejected", waitlisted: "Waitlisted", withdrawn: "Withdrawn", enrolled: "Enrolled" },
    action: { accept: "Accept", reject: "Reject", waitlist: "Waitlist", request_more_info: "Request info", enroll: "Enroll" },
    cohort: { draft: "Draft", open: "Open", full: "Full", active: "Active", completed: "Completed", cancelled: "Cancelled" },
    session: { workshop: "Workshop", office_hour: "Office hours", mentorship: "Mentorship", lecture: "Lecture", roundtable: "Roundtable", demo: "Demo", review: "Review", check_in: "Check-in" },
  },
} as const

type LabelKind = keyof (typeof labels)["en"]

/** Label for a stored code; an unknown code is shown as-is so it is never hidden. */
export function codeLabel(locale: Locale, kind: LabelKind, code: string | null | undefined): string {
  if (!code) return "—"
  const table = labels[locale][kind] as Record<string, string>
  return table[code] ?? code
}

export function applicationStatusVariant(status: string): "warning" | "success" | "destructive" | "secondary" {
  if (status === "submitted" || status === "reviewing" || status === "pending_review") return "warning"
  if (status === "accepted" || status === "enrolled") return "success"
  if (status === "rejected" || status === "withdrawn") return "destructive"
  return "secondary"
}

/** Laravel's string `max` counts characters (mb_strlen), not UTF-16 code units. */
function length(value: string): number {
  return Array.from(value).length
}

const wholeNumber = /^\d+$/
const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/
const localDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

function realDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isDateOnly(value: string): boolean {
  const match = dateOnly.exec(value)
  return Boolean(match && realDate(Number(match[1]), Number(match[2]), Number(match[3])))
}

export function isLocalDateTime(value: string): boolean {
  const match = localDateTime.exec(value)
  if (!match) return false
  const [hour, minute, second] = [Number(match[4]), Number(match[5]), Number(match[6] ?? 0)]
  return realDate(Number(match[1]), Number(match[2]), Number(match[3])) && hour < 24 && minute < 60 && second < 60
}

/** A `datetime-local` value typed as Riyadh time, as an ISO 8601 string the API cannot misread. */
export function riyadhDateTime(value: string): string {
  const withSeconds = value.length === 16 ? `${value}:00` : value
  return `${withSeconds}${RIYADH_OFFSET}`
}

export type CohortErrors = Partial<Record<CohortField, string>>
export type SessionErrors = Partial<Record<SessionField, string>>

export function validateCohort(locale: Locale, form: CohortForm): CohortErrors {
  const copy = programManage(locale)
  const errors: CohortErrors = {}
  const name = form.name.trim()
  if (!name) errors.name = copy.errorNameRequired
  else if (length(name) > cohortLimits.name) errors.name = fill(copy.errorNameLong, { max: cohortLimits.name })
  if (length(form.code.trim()) > cohortLimits.code) errors.code = fill(copy.errorCodeLong, { max: cohortLimits.code })
  if (!(cohortStatuses as readonly string[]).includes(form.status)) errors.status = copy.errorStatus
  const capacity = form.capacity.trim()
  if (capacity && (!wholeNumber.test(capacity) || Number(capacity) < 1)) errors.capacity = copy.errorCapacity
  if (form.starts_at && !isDateOnly(form.starts_at)) errors.starts_at = copy.errorDate
  return errors
}

export function cohortPayload(form: CohortForm) {
  const capacity = form.capacity.trim()
  return {
    name: form.name.trim(),
    code: form.code.trim() || null,
    status: form.status,
    capacity: capacity ? Number(capacity) : null,
    starts_at: form.starts_at || null,
  }
}

export function validateSession(locale: Locale, form: SessionForm): SessionErrors {
  const copy = programManage(locale)
  const errors: SessionErrors = {}
  const title = form.title.trim()
  if (!title) errors.title = copy.errorTitleRequired
  else if (length(title) > sessionLimits.title) errors.title = fill(copy.errorTitleLong, { max: sessionLimits.title })
  if (!(sessionTypes as readonly string[]).includes(form.session_type)) errors.session_type = copy.errorType
  if (!form.starts_at) errors.starts_at = copy.errorStartRequired
  else if (!isLocalDateTime(form.starts_at)) errors.starts_at = copy.errorStartInvalid
  const duration = form.duration_minutes.trim()
  if (duration && (!wholeNumber.test(duration) || Number(duration) < sessionLimits.minDuration)) {
    errors.duration_minutes = fill(copy.errorDuration, { min: sessionLimits.minDuration })
  }
  return errors
}

export function sessionPayload(form: SessionForm) {
  const duration = form.duration_minutes.trim()
  return {
    title: form.title.trim(),
    session_type: form.session_type,
    starts_at: riyadhDateTime(form.starts_at),
    duration_minutes: duration ? Number(duration) : null,
    description: form.description.trim() || null,
  }
}

/**
 * Turns a refused save into messages in the page language. Field errors from a 422 land on
 * their field (the API answers in English, so its text is not shown); anything else gets the
 * page's own failure message.
 */
export function saveErrors<F extends string>(
  locale: Locale,
  status: number,
  data: unknown,
  fields: readonly F[],
  failed: string,
): { fields: Partial<Record<F, string>>; message: string } {
  const copy = programManage(locale)
  const errors = (data as { errors?: unknown } | undefined)?.errors
  const mapped: Partial<Record<F, string>> = {}
  if (status === 422 && errors && typeof errors === "object") {
    for (const key of Object.keys(errors as Record<string, unknown>)) {
      if ((fields as readonly string[]).includes(key)) mapped[key as F] = copy.errorRejected
    }
    if (Object.keys(mapped).length > 0) return { fields: mapped, message: copy.saveInvalid }
  }
  return { fields: {}, message: failed }
}

/** The API refuses status changes for the accelerator and EOA programs with 409. */
export function applicationUpdateError(locale: Locale, status: number): string {
  const copy = programManage(locale)
  return status === 409 ? copy.workspaceOnly : copy.applicationFailed
}

function validDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Calendar date in the page language and Riyadh time. */
export function riyadhDate(locale: Locale, iso: string | null | undefined): string | null {
  const date = validDate(iso)
  return date ? date.toLocaleDateString(dateLocale(locale === "ar"), { timeZone: RIYADH_TIME_ZONE, day: "numeric", month: "short", year: "numeric" }) : null
}

/** Date and time in the page language and Riyadh time. */
export function riyadhDateTimeLabel(locale: Locale, iso: string | null | undefined): string | null {
  const date = validDate(iso)
  return date
    ? date.toLocaleString(dateLocale(locale === "ar"), { timeZone: RIYADH_TIME_ZONE, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : null
}
