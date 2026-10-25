import { applicationStatus } from "./dashboard-home"
import { programCategoryLabel } from "./program-labels"
import { dateLocale } from "./date-locale"

type Locale = "ar" | "en"
type Label = { ar: string; en: string }

/** Page text for /programs/[slug]. Program content itself comes from the admin and is shown as entered. */
export const programDetailCopy = {
  ar: {
    loading: "جارٍ تحميل تفاصيل البرنامج…",
    notFound: "لم نجد هذا البرنامج. ربما أُغلق أو تغيّر رابطه.",
    backToPrograms: "كل البرامج",
    program: "برنامج",
    overview: "نظرة عامة",
    whoFor: "لمن هذا البرنامج",
    outcomes: "ما ستخرج به",
    notAdded: "لم تُضف التفاصيل بعد.",
    sessions: "الجلسات",
    noSessions: "لا توجد جلسات منشورة بعد.",
    session: "جلسة",
    resources: "الموارد",
    noResources: "لا توجد موارد منشورة بعد.",
    join: "الانضمام",
    deadline: "آخر موعد للتقديم",
    notSet: "غير محدد",
    yourStatus: "حالة طلبك",
    signInHint: "سجّل الدخول بحساب عضو لتقديم طلبك.",
    acceleratorHint: "التقديم على المسرّعة يتم من صفحة EO الرياض.",
    dialogTitle: "طلب الانضمام إلى البرنامج",
    whyJoin: "لماذا تريد الانضمام؟ (20 حرفًا على الأقل)",
    challenge: "ما أكبر تحدٍّ تواجهه شركتك الآن؟",
    outcome: "ماذا تريد أن تحقق بنهاية البرنامج؟",
    stage: "مرحلة الشركة",
    sector: "القطاع",
    teamSize: "حجم الفريق",
    fundraising: "وضع التمويل",
    traction: "أين وصلت الشركة؟ (عملاء، مستخدمون، شراكات)",
    availability: "أستطيع الالتزام بمواعيد البرنامج",
    consent: "أوافق على مشاركة ملفي مع فريق البرنامج",
    cancel: "إلغاء",
    submit: "إرسال الطلب",
    submitting: "جارٍ الإرسال…",
    sent: "تم إرسال طلبك",
    sendFailed: "تعذّر إرسال الطلب. حاول مرة أخرى.",
  },
  en: {
    loading: "Loading program details…",
    notFound: "We couldn't find this program. It may have closed or moved.",
    backToPrograms: "All programs",
    program: "Program",
    overview: "Overview",
    whoFor: "Who it's for",
    outcomes: "What you'll leave with",
    notAdded: "Details haven't been added yet.",
    sessions: "Sessions",
    noSessions: "No sessions published yet.",
    session: "Session",
    resources: "Resources",
    noResources: "No resources published yet.",
    join: "Join",
    deadline: "Application deadline",
    notSet: "Not set",
    yourStatus: "Your application",
    signInHint: "Sign in with a member account to apply.",
    acceleratorHint: "Applications for the accelerator go through the EO Riyadh page.",
    dialogTitle: "Apply to this program",
    whyJoin: "Why do you want to join? (at least 20 characters)",
    challenge: "What is the biggest challenge your company faces right now?",
    outcome: "What do you want to have achieved by the end?",
    stage: "Company stage",
    sector: "Sector",
    teamSize: "Team size",
    fundraising: "Fundraising status",
    traction: "Where is the company today? (customers, users, partnerships)",
    availability: "I can commit to the program schedule",
    consent: "I agree to share my profile with the program team",
    cancel: "Cancel",
    submit: "Send application",
    submitting: "Sending…",
    sent: "Your application was sent",
    sendFailed: "We couldn't send your application. Please try again.",
  },
} satisfies Record<Locale, Record<string, string>>

/** Program lifecycle (`status_flow`) values the admin can set. */
const STATUS_FLOW: Record<string, Label> = {
  draft: { ar: "لم يُفتح بعد", en: "Not open yet" },
  pending_review: { ar: "قيد المراجعة", en: "Under review" },
  published: { ar: "منشور", en: "Published" },
  applications_open: { ar: "التقديم مفتوح", en: "Applications open" },
  applications_closed: { ar: "التقديم مغلق", en: "Applications closed" },
  active: { ar: "جارٍ الآن", en: "In progress" },
  completed: { ar: "انتهى", en: "Finished" },
  cancelled: { ar: "أُلغي", en: "Cancelled" },
  archived: { ar: "مؤرشف", en: "Archived" },
}

/** `format` values accepted by the admin program form. */
const FORMATS: Record<string, Label> = {
  online: { ar: "عن بُعد", en: "Online" },
  "in-person": { ar: "حضوري", en: "In person" },
  hybrid: { ar: "حضوري وعن بُعد", en: "Hybrid" },
  "self-paced": { ar: "بالسرعة التي تناسبك", en: "Self-paced" },
  "cohort-based": { ar: "ضمن دفعة", en: "Cohort-based" },
}

/** `session_type` values accepted by the admin session form. */
const SESSION_TYPES: Record<string, Label> = {
  workshop: { ar: "ورشة عمل", en: "Workshop" },
  office_hour: { ar: "ساعة مكتبية", en: "Office hour" },
  mentorship: { ar: "جلسة إرشاد", en: "Mentorship" },
  lecture: { ar: "محاضرة", en: "Lecture" },
  roundtable: { ar: "طاولة مستديرة", en: "Roundtable" },
  demo: { ar: "عرض", en: "Demo" },
  review: { ar: "مراجعة", en: "Review" },
  check_in: { ar: "متابعة", en: "Check-in" },
}

const LANGUAGES: Record<string, Label> = {
  ar: { ar: "بالعربية", en: "In Arabic" },
  en: { ar: "بالإنجليزية", en: "In English" },
  "ar-en": { ar: "بالعربية والإنجليزية", en: "Arabic and English" },
  bilingual: { ar: "بالعربية والإنجليزية", en: "Arabic and English" },
}

const CLOSED_FLOWS = ["applications_closed", "completed", "cancelled", "archived"]
const ACCELERATOR_SLUG = "eo-riyadh-accelerator"

function lookup(table: Record<string, Label>, value: string | null | undefined, locale: Locale): string | null {
  if (!value?.trim()) return null
  const code = value.trim().toLowerCase()
  const entry = table[code] ?? table[code.replace(/[\s-]+/g, "_")] ?? table[code.replace(/[\s_]+/g, "-")]
  if (entry) return entry[locale]
  // Unknown values are admin text: show it as written rather than a translated guess.
  return value.trim()
}

export function programStatusFlowLabel(value: string | null | undefined, locale: Locale): string | null {
  return lookup(STATUS_FLOW, value, locale)
}

export function programFormatLabel(value: string | null | undefined, locale: Locale): string | null {
  return lookup(FORMATS, value, locale)
}

export function programSessionTypeLabel(value: string | null | undefined, locale: Locale): string {
  return lookup(SESSION_TYPES, value, locale) ?? programDetailCopy[locale].session
}

export function programLanguageLabel(value: string | null | undefined, locale: Locale): string | null {
  return lookup(LANGUAGES, value, locale)
}

/** Badge for `program_type`/`category`: the same words the /programs filter chips use. */
export function programTypeLabel(value: string | null | undefined, locale: Locale): string {
  return value?.trim() ? programCategoryLabel(value, locale) : programDetailCopy[locale].program
}

export function programDate(value: string | null | undefined, locale: Locale, withTime = false): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const options: Intl.DateTimeFormatOptions = withTime
    ? { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" }
    : { dateStyle: "long", timeZone: "Asia/Riyadh" }
  // Gregorian dates with Western digits, matching the rest of the site.
  return new Intl.DateTimeFormat(dateLocale(locale === "ar", "en-GB"), options).format(date)
}

/** The member's own application status, in the dashboard's wording. */
export function programApplicationStatusLabel(status: string, locale: Locale): string {
  return applicationStatus(status, locale).label
}

export interface ProgramApplyState {
  slug: string
  is_open?: boolean
  status_flow?: string | null
  visibility?: string | null
  application_deadline?: string | null
}

export type ApplyAction =
  | { kind: "apply"; label: string }
  | { kind: "link"; label: string; href: string; hint?: string }
  | { kind: "disabled"; label: string; hint?: string }

/**
 * What the join card offers. Mirrors ProgramApplicationController::store: a member may apply once,
 * only while the program is open, in an open lifecycle state and before the deadline. Visitors are
 * sent to sign in and brought back; the EO Riyadh Accelerator has its own verified journey.
 */
export function programApplyAction(
  program: ProgramApplyState,
  existingStatus: string | null,
  signedIn: boolean,
  locale: Locale,
  now = Date.now(),
): ApplyAction {
  const copy = programDetailCopy[locale]
  const en = locale === "en"

  if (program.slug === ACCELERATOR_SLUG) {
    if (existingStatus) return { kind: "link", label: en ? "Open my accelerator application" : "افتح طلبي في المسرّعة", href: "/dashboard/eoa" }
    return { kind: "link", label: en ? "Apply on the EO Riyadh page" : "قدّم من صفحة EO الرياض", href: "/eoa/apply", hint: copy.acceleratorHint }
  }
  if (existingStatus) {
    return { kind: "disabled", label: applicationStatus(existingStatus, locale).label }
  }

  const deadline = program.application_deadline ? Date.parse(program.application_deadline) : NaN
  if (program.status_flow === "completed") return { kind: "disabled", label: en ? "Program finished" : "انتهى البرنامج" }
  if (program.is_open === false || CLOSED_FLOWS.includes(program.status_flow ?? "") || (Number.isFinite(deadline) && deadline < now)) {
    return { kind: "disabled", label: en ? "Applications closed" : "التقديم مغلق" }
  }

  const label = program.visibility === "invite_only" ? (en ? "Request an invitation" : "اطلب دعوة") : (en ? "Apply now" : "قدّم الآن")
  if (!signedIn) {
    return { kind: "link", label, href: `/login?redirect=${encodeURIComponent(`/programs/${program.slug}`)}`, hint: copy.signInHint }
  }
  return { kind: "apply", label }
}
