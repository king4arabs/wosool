import { dateLocale } from "./date-locale"
import type { Locale } from "./locale"

/**
 * Copy, rules and helpers for the administrator founder-matches page (`/admin/matches`).
 *
 * An administrator suggests a connection between two founders (`Admin\MatchController@store`);
 * each founder then accepts or declines it from their dashboard (`Member\MatchController`).
 * The API accepts two different active founder profiles and a reason of 10–2000 characters,
 * refuses founders whose community profile is not active yet (422) and refuses a second open
 * match (suggested, accepted or connected) between the same two founders (409).
 */

export const matchStatuses = ["suggested", "accepted", "connected", "declined"] as const
export type MatchStatus = (typeof matchStatuses)[number]

export const matchReasonMin = 10
export const matchReasonMax = 2000

export type MatchField = "founder_a_id" | "founder_b_id" | "reason"
export type MatchFormErrors = Partial<Record<MatchField, string>>
export const matchFieldOrder: MatchField[] = ["founder_a_id", "founder_b_id", "reason"]

export type MatchForm = { founderA: number | null; founderB: number | null; reason: string }

const ar = {
  title: "تعارف المؤسسين",
  intro: "اقترح تعارفًا بين مؤسسَين وتابع ردودهما. يقبل كل مؤسس المقترح أو يعتذر عنه من لوحته.",
  suggest: "اقتراح تعارف",
  searchLabel: "ابحث باسم المؤسس أو سبب الترشيح",
  statusLabel: "الحالة",
  allStatuses: "جميع الحالات",
  loading: "جارٍ تحميل المقترحات…",
  loadFailed: "تعذر تحميل مقترحات التعارف. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا توجد مقترحات تعارف بعد.",
  emptyFilter: "لا توجد مقترحات تطابق البحث أو الحالة.",
  suggestedOn: "اقتُرح في {date}",
  manageIntros: "إدارة طلبات التعارف",
  dialogTitle: "اقتراح تعارف",
  dialogDescription: "اختر مؤسسَين مختلفين واشرح فائدة التعارف لكليهما. يظهر السبب للمؤسسَين في لوحتيهما، ويقرر كل منهما القبول أو الاعتذار.",
  founderA: "المؤسس الأول",
  founderB: "المؤسس الثاني",
  founderSearch: "ابحث بالاسم",
  founderSearchLabel: "{label}: ابحث بالاسم",
  founderSelect: "اختر المؤسس",
  founderHint: "تظهر فقط ملفات المؤسسين النشطة المرتبطة بحساب.",
  foundersLoading: "جارٍ البحث…",
  foundersFailed: "تعذر تحميل قائمة المؤسسين. غيّر البحث أو حاول لاحقًا.",
  foundersEmpty: "لا يوجد مؤسس نشط بهذا الاسم.",
  reason: "سبب الترشيح",
  reasonHint: "من {min} إلى {max} حرف. يراه المؤسسان.",
  reasonCount: "{count} / {max}",
  required: "مطلوب",
  cancel: "إلغاء",
  save: "حفظ المقترح",
  saved: "حُفظ المقترح وأُرسل إلى المؤسسَين.",
  saveFailed: "تعذر حفظ المقترح. حاول مرة أخرى.",
  saveInvalid: "راجع الحقول المشار إليها.",
  errorFounderA: "اختر المؤسس الأول.",
  errorFounderB: "اختر المؤسس الثاني.",
  errorSameFounder: "اختر مؤسسًا مختلفًا عن المؤسس الأول.",
  errorFounderInactive: "هذا الملف غير نشط. اختر مؤسسًا آخر.",
  errorReasonRequired: "اكتب سبب الترشيح.",
  errorReasonShort: "اكتب {min} أحرف على الأقل.",
  errorReasonLong: "السبب أطول من {max} حرف.",
  errorNotActivated: "لم يفعّل أحد المؤسسَين ملفه في المجتمع بعد، فلا يمكن اقتراح التعارف الآن.",
  errorDuplicate: "يوجد مقترح مفتوح بين هذين المؤسسَين بالفعل.",
}

type AdminMatchesCopy = typeof ar

const en: AdminMatchesCopy = {
  title: "Founder matches",
  intro: "Suggest a connection between two founders and follow their replies. Each founder accepts or declines from their dashboard.",
  suggest: "Suggest match",
  searchLabel: "Search founders or match reasons",
  statusLabel: "Status",
  allStatuses: "All statuses",
  loading: "Loading matches…",
  loadFailed: "Founder matches could not be loaded. Try again.",
  retry: "Try again",
  empty: "No matches suggested yet.",
  emptyFilter: "No matches fit this search or status.",
  suggestedOn: "Suggested {date}",
  manageIntros: "Manage introduction requests",
  dialogTitle: "Suggest a match",
  dialogDescription: "Choose two different founders and explain why the connection is useful to both. Both founders see the reason on their dashboards and decide whether to accept.",
  founderA: "First founder",
  founderB: "Second founder",
  founderSearch: "Search by name",
  founderSearchLabel: "{label}: search by name",
  founderSelect: "Select founder",
  founderHint: "Only active founder profiles linked to an account are listed.",
  foundersLoading: "Searching…",
  foundersFailed: "The founder list could not be loaded. Change the search or try later.",
  foundersEmpty: "No active founder with this name.",
  reason: "Reason",
  reasonHint: "{min} to {max} characters. Both founders see it.",
  reasonCount: "{count} / {max}",
  required: "required",
  cancel: "Cancel",
  save: "Save suggestion",
  saved: "Suggestion saved and sent to both founders.",
  saveFailed: "The suggestion could not be saved. Try again.",
  saveInvalid: "Check the highlighted fields.",
  errorFounderA: "Choose the first founder.",
  errorFounderB: "Choose the second founder.",
  errorSameFounder: "Choose a different founder from the first one.",
  errorFounderInactive: "This profile is not active. Choose another founder.",
  errorReasonRequired: "Write the reason for the match.",
  errorReasonShort: "Write at least {min} characters.",
  errorReasonLong: "The reason is longer than {max} characters.",
  errorNotActivated: "One of the founders has not activated their community profile yet, so the match cannot be suggested now.",
  errorDuplicate: "These two founders already have an open match.",
}

export const adminMatchesCopy = { ar, en }

export function adminMatches(locale: Locale): AdminMatchesCopy {
  return adminMatchesCopy[locale]
}

const statusLabels: Record<Locale, Record<MatchStatus, string>> = {
  ar: { suggested: "مقترح", accepted: "مقبول", connected: "متصل", declined: "مرفوض" },
  en: { suggested: "Suggested", accepted: "Accepted", connected: "Connected", declined: "Declined" },
}

function isStatus(value: string): value is MatchStatus {
  return (matchStatuses as readonly string[]).includes(value)
}

/** Label for a status code; an unknown code is shown as-is so it is never hidden. */
export function matchStatusLabel(locale: Locale, status: string): string {
  return isStatus(status) ? statusLabels[locale][status] : status
}

export function matchStatusVariant(status: string): "warning" | "success" | "destructive" | "secondary" {
  if (status === "suggested") return "warning"
  if (status === "accepted" || status === "connected") return "success"
  if (status === "declined") return "destructive"
  return "secondary"
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

/** Laravel's string `min`/`max` count characters (mb_strlen), not UTF-16 code units. */
export function characterCount(value: string): number {
  return Array.from(value).length
}

export function validateMatchForm(locale: Locale, form: MatchForm): MatchFormErrors {
  const copy = adminMatches(locale)
  const errors: MatchFormErrors = {}
  if (form.founderA === null) errors.founder_a_id = copy.errorFounderA
  if (form.founderB === null) errors.founder_b_id = copy.errorFounderB
  else if (form.founderA !== null && form.founderA === form.founderB) errors.founder_b_id = copy.errorSameFounder
  const length = characterCount(form.reason.trim())
  if (length === 0) errors.reason = copy.errorReasonRequired
  else if (length < matchReasonMin) errors.reason = fill(copy.errorReasonShort, { min: matchReasonMin })
  else if (length > matchReasonMax) errors.reason = fill(copy.errorReasonLong, { max: matchReasonMax })
  return errors
}

export function matchPayload(form: MatchForm) {
  return { founder_a_id: form.founderA, founder_b_id: form.founderB, reason: form.reason.trim() }
}

/**
 * Turns an API refusal into messages in the page language. Field errors (422 with `errors`) are
 * placed under their field; the two business refusals without field errors get a page message.
 * Raw API text is never shown, because the API answers in English.
 */
export function matchSaveErrors(
  locale: Locale,
  status: number,
  data: unknown,
): { fields: MatchFormErrors; message: string } {
  const copy = adminMatches(locale)
  if (status === 409) return { fields: {}, message: copy.errorDuplicate }
  const errors = (data as { errors?: unknown } | undefined)?.errors
  const fields: MatchFormErrors = {}
  if (status === 422 && errors && typeof errors === "object") {
    for (const key of Object.keys(errors as Record<string, unknown>)) {
      if (key === "founder_a_id") fields.founder_a_id = copy.errorFounderInactive
      // The page never sends the same founder twice, so a refusal here means the profile is not
      // (or no longer) an active founder. The API's message text depends on its language files.
      if (key === "founder_b_id") fields.founder_b_id = copy.errorFounderInactive
      if (key === "reason") fields.reason = fill(copy.errorReasonShort, { min: matchReasonMin })
    }
    if (Object.keys(fields).length > 0) return { fields, message: copy.saveInvalid }
  }
  if (status === 422) return { fields: {}, message: copy.errorNotActivated }
  return { fields: {}, message: copy.saveFailed }
}

/** Date a match was suggested, in the page language and Riyadh time. */
export function matchDate(locale: Locale, iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(dateLocale(locale === "ar"), { timeZone: "Asia/Riyadh", day: "numeric", month: "short", year: "numeric" })
}

export type MatchListItem = { status: string; names: string[]; reasons: string[] }

/** Client-side filter over the loaded list: status, then every search word in names or reasons. */
export function matchVisible(item: MatchListItem, search: string, status: string): boolean {
  if (status && item.status !== status) return false
  const haystack = [...item.names, ...item.reasons].join(" ").toLocaleLowerCase()
  return search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean).every((word) => haystack.includes(word))
}
