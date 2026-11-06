import type { DashboardLocale } from "@/lib/dashboard-i18n"
import { dateLocale } from "@/lib/date-locale"
import { programCategoryLabel, programName } from "@/lib/program-labels"

export type MemberProgram = {
  id: number
  name: string
  slug: string
  category?: string | null
}

export type AppliedProgram = { id: number; status?: string | null; submitted_at?: string | null; program: MemberProgram }

export type EnrolledProgram = {
  participant_id: number
  status?: string | null
  progress?: number | null
  at_risk?: boolean
  next_session?: { title?: string | null; starts_at?: string | null } | null
  cohort?: { id: number; name: string } | null
  program: MemberProgram
}

export type CompletedProgram = { participant_id: number; completed_at?: string | null; program: MemberProgram }

export type MyPrograms = {
  applied_programs: AppliedProgram[]
  enrolled_programs: EnrolledProgram[]
  completed_programs: CompletedProgram[]
  recommended_programs: MemberProgram[]
}

export const memberProgramsCopy = {
  ar: {
    title: "برامجي",
    intro: "طلباتك، والبرامج التي التحقت بها، والجلسة القادمة لكل برنامج.",
    loading: "جارٍ تحميل برامجي…",
    loadFailed: "تعذر تحميل برامجك.",
    retry: "إعادة المحاولة",
    tabsLabel: "عرض البرامج",
    tabEnrolled: "الملتحق بها ({count})",
    tabApplied: "طلبات الانضمام ({count})",
    tabCompleted: "المكتملة ({count})",
    tabRecommended: "برامج مفتوحة ({count})",
    emptyEnrolled: "لم تلتحق بأي برنامج حاليًا.",
    emptyApplied: "لم تقدّم على أي برنامج بعد.",
    emptyCompleted: "لا توجد برامج مكتملة بعد.",
    emptyRecommended: "لا توجد برامج أخرى مفتوحة للتقديم حاليًا.",
    browsePrograms: "تصفّح البرامج",
    programFallback: "برنامج",
    progress: "نسبة الإنجاز",
    cohort: "الدفعة: {name}",
    nextSession: "الجلسة القادمة: {title}",
    nextSessionAt: "الجلسة القادمة: {title} — {date} بتوقيت الرياض",
    noSession: "لا توجد جلسة مجدولة",
    submittedOn: "تاريخ التقديم: {date}",
    completedOn: "اكتمل في {date}",
    completedNoDate: "برنامج مكتمل",
    needsFollowUp: "بحاجة إلى متابعة",
    viewProgram: "عرض البرنامج",
    status: {
      submitted: "تم الإرسال",
      pending_review: "قيد المراجعة",
      accepted: "مقبول",
      rejected: "غير مقبول",
      waitlisted: "قائمة الانتظار",
      withdrawn: "تم السحب",
      enrolled: "ملتحق",
      onboarding: "التهيئة",
      not_started: "لم يبدأ",
      in_progress: "قيد التنفيذ",
      at_risk: "بحاجة إلى متابعة",
      completed: "مكتمل",
      dropped: "منسحب",
    } as Record<string, string>,
    statusUnknown: "غير محدد",
  },
  en: {
    title: "My programs",
    intro: "Your applications, the programs you joined and the next session of each.",
    loading: "Loading your programs…",
    loadFailed: "Your programs could not be loaded.",
    retry: "Try again",
    tabsLabel: "Program lists",
    tabEnrolled: "Enrolled ({count})",
    tabApplied: "Applications ({count})",
    tabCompleted: "Completed ({count})",
    tabRecommended: "Open programs ({count})",
    emptyEnrolled: "You are not enrolled in a program right now.",
    emptyApplied: "You have not applied to a program yet.",
    emptyCompleted: "No completed programs yet.",
    emptyRecommended: "No other programs are open for applications right now.",
    browsePrograms: "Browse programs",
    programFallback: "Program",
    progress: "Progress",
    cohort: "Cohort: {name}",
    nextSession: "Next session: {title}",
    nextSessionAt: "Next session: {title} — {date} Riyadh time",
    noSession: "No session scheduled",
    submittedOn: "Applied on {date}",
    completedOn: "Completed on {date}",
    completedNoDate: "Completed program",
    needsFollowUp: "Needs follow-up",
    viewProgram: "View program",
    status: {
      submitted: "Submitted",
      pending_review: "Under review",
      accepted: "Accepted",
      rejected: "Not accepted",
      waitlisted: "Waiting list",
      withdrawn: "Withdrawn",
      enrolled: "Enrolled",
      onboarding: "Onboarding",
      not_started: "Not started",
      in_progress: "In progress",
      at_risk: "Needs follow-up",
      completed: "Completed",
      dropped: "Left the program",
    } as Record<string, string>,
    statusUnknown: "Not set",
  },
} as const

export type MemberProgramsCopy = (typeof memberProgramsCopy)[DashboardLocale]

export function memberPrograms(locale: DashboardLocale): MemberProgramsCopy {
  return memberProgramsCopy[locale]
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

/** Known status codes in the member's language; an unknown code is never shown raw. */
export function programStatusLabel(locale: DashboardLocale, status: string | null | undefined): string {
  const copy = memberProgramsCopy[locale]
  return (status && copy.status[status]) || copy.statusUnknown
}

export type BadgeTone = "success" | "warning" | "destructive" | "secondary"

export function applicationTone(status: string | null | undefined): BadgeTone {
  if (status === "accepted" || status === "enrolled") return "success"
  if (status === "rejected") return "destructive"
  if (status === "withdrawn") return "secondary"
  return "warning"
}

function validDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Calendar day in Riyadh, in the member's language; null for a missing or invalid date. */
export function programDate(locale: DashboardLocale, iso: string | null | undefined): string | null {
  const date = validDate(iso)
  return date ? date.toLocaleDateString(dateLocale(locale === "ar"), { timeZone: "Asia/Riyadh", day: "numeric", month: "long", year: "numeric" }) : null
}

export function nextSessionLine(locale: DashboardLocale, session: EnrolledProgram["next_session"]): string {
  const copy = memberProgramsCopy[locale]
  const title = session?.title?.trim()
  if (!title) return copy.noSession
  const date = validDate(session?.starts_at)
  if (!date) return fill(copy.nextSession, { title })
  const when = date.toLocaleString(dateLocale(locale === "ar"), { timeZone: "Asia/Riyadh", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  return fill(copy.nextSessionAt, { title, date: when })
}

/** 0–100, whole numbers; missing or invalid progress reads as 0. */
export function progressValue(progress: number | null | undefined): number {
  const value = Number(progress)
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function programTitle(locale: DashboardLocale, program: MemberProgram): string {
  return programName(program.slug, program.name, locale)
}

export function programCategory(locale: DashboardLocale, program: MemberProgram): string {
  const category = program.category?.trim()
  return category ? programCategoryLabel(category, locale) : memberProgramsCopy[locale].programFallback
}
