import { dateLocale } from "./date-locale"
import type { Locale } from "./locale"

/**
 * Copy and helpers for the administrator scorecards page (`/admin/scorecards`).
 *
 * The override form mirrors `Admin\ScorecardController::override`, and the activation invitation
 * mirrors `Admin\FounderController::invite`, so a bad value is caught before anything is sent.
 * A score that is not a whole number used to be sent as `null`, which the API ignores while still
 * recording the override note in the audit log, so the change looked applied when it was not.
 */

export type AdminScorecard = {
  id: number
  founder_name?: string | null
  founder_profile_id: number
  founder_uid?: string | null
  founder_slug?: string | null
  founder_status?: string | null
  founder_is_public: boolean
  user_email?: string | null
  email_verified: boolean
  invitation_email?: string | null
  aggregate_score: number
  momentum: number
  growth: number
  readiness: number
  support_delta: number
  updated_at?: string | null
}

export const scoreFields = ["aggregate_score", "momentum", "growth", "readiness", "support_delta"] as const
export type ScoreField = (typeof scoreFields)[number]

/** Allowed range for each score, matching the API's `between` rules. */
export const scoreRanges: Record<ScoreField, { min: number; max: number }> = {
  aggregate_score: { min: 1, max: 100 },
  momentum: { min: 1, max: 100 },
  growth: { min: 1, max: 100 },
  readiness: { min: 1, max: 100 },
  support_delta: { min: 0, max: 100 },
}

export const overrideNoteMax = 1200
export const inviteLimits = { emailMax: 255, evidenceMin: 10, evidenceMax: 2000 } as const

export type OverrideField = ScoreField | "override_note"
export type OverrideForm = Record<OverrideField, string>
export type OverrideErrors = Partial<Record<OverrideField | "form", string>>
export type OverridePayload = Partial<Record<ScoreField, number>> & { override_note: string }

export type InviteForm = { email: string; recipient_evidence: string; recipient_verified: boolean }
export type InviteField = keyof InviteForm
export type InviteErrors = Partial<Record<InviteField, string>>

export const emptyOverrideForm: OverrideForm = {
  aggregate_score: "",
  momentum: "",
  growth: "",
  readiness: "",
  support_delta: "",
  override_note: "",
}

const ar = {
  title: "بطاقات التقييم",
  intro: "راجع درجات المؤسسين، وعدّلها يدويًا مع سبب يُسجَّل في سجل التدقيق، وأرسل دعوات التفعيل.",
  listTitle: "بطاقات المؤسسين",
  loading: "جارٍ تحميل بطاقات التقييم…",
  loadFailed: "تعذر تحميل بطاقات التقييم. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا توجد بطاقات تقييم بعد.",
  founderFallback: "مؤسس رقم {id}",
  founderId: "معرّف المؤسس",
  selected: "محدد",
  viewProfile: "عرض الملف",
  viewInAdmin: "عرض في إدارة المؤسسين",
  updated: "آخر تحديث: {date}",
  previous: "السابق",
  next: "التالي",
  pageSummary: "صفحة {page} من {pages} · {total} بطاقة",
  panelTitle: "تعديل البطاقة",
  noSelection: "اختر بطاقة من القائمة لعرض درجاتها وتعديلها.",
  currentScores: "الدرجات الحالية",
  overrideTitle: "تعديل يدوي",
  overrideHint: "اترك الحقل فارغًا للإبقاء على قيمته. يُحفظ السبب مع القيم الجديدة في سجل التدقيق.",
  overrideNote: "سبب التعديل",
  overrideNoteHint: "يظهر في سجل التدقيق. حتى 1200 حرف.",
  required: "(مطلوب)",
  apply: "تطبيق التعديل",
  applying: "جارٍ التطبيق…",
  applied: "طُبّق التعديل وسُجّل في سجل التدقيق.",
  applyFailed: "تعذر تطبيق التعديل. حاول مرة أخرى.",
  checkFields: "راجع الحقول المحددة ثم حاول مرة أخرى.",
  noScoreGiven: "أدخل درجة جديدة واحدة على الأقل.",
  wholeNumber: "أدخل عددًا صحيحًا من {min} إلى {max}.",
  fieldRequired: "هذا الحقل مطلوب.",
  noteTooLong: "السبب أطول من 1200 حرف.",
  serverRejected: "لم يقبل الخادم هذه القيمة.",
  accountTitle: "الحساب والبريد",
  emailVerified: "البريد موثّق",
  emailUnverified: "البريد غير موثّق",
  sendVerification: "إرسال رسالة التوثيق",
  sending: "جارٍ الإرسال…",
  verificationSent: "قبل خادم البريد رسالة التوثيق. لا يؤكد ذلك وصولها إلى صندوق الوارد؛ تحقق من مزود البريد.",
  unclaimed: "ملف غير مُفعّل. أرسل دعوة التفعيل إلى المؤسس بعد التحقق من بريده.",
  inactiveProfile: "لا يمكن إرسال بريد إلا لملف نشط.",
  inviteEmail: "بريد المؤسس",
  inviteEvidence: "كيف تحققت من صاحب هذا البريد؟",
  inviteEvidenceHint: "من 10 إلى 2000 حرف. يُحفظ مع الدعوة.",
  inviteConfirm: "تحققت أن هذا البريد يخص المؤسس أو من يدير حسابه بتفويض منه.",
  sendInvite: "إرسال دعوة التفعيل",
  inviteSent: "قبل خادم البريد دعوة التفعيل. لا يؤكد ذلك وصولها إلى صندوق الوارد؛ تحقق من مزود البريد.",
  emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا.",
  emailTooLong: "البريد أطول من 255 حرفًا.",
  evidenceLength: "اكتب من 10 إلى 2000 حرف.",
  confirmRequired: "أكّد أنك تحققت من البريد قبل الإرسال.",
  sendFailed: "تعذر إرسال البريد. حاول مرة أخرى.",
  mailUnavailable: "خادم البريد غير مهيأ أو لم يقبل الرسالة. راجع إعدادات البريد ثم أعد المحاولة.",
  sendConflict: "لم يُرسل البريد: الحساب موثّق مسبقًا أو الملف غير نشط. حدّث القائمة.",
  scores: {
    aggregate_score: "الدرجة الإجمالية",
    momentum: "الزخم",
    growth: "النمو",
    readiness: "الجاهزية",
    support_delta: "فجوة الدعم",
  } as Record<ScoreField, string>,
}

type AdminScorecardsCopy = typeof ar

const en: AdminScorecardsCopy = {
  title: "Scorecards",
  intro: "Review founder scores, override them with a reason that is kept in the audit log, and send activation invitations.",
  listTitle: "Founder scorecards",
  loading: "Loading scorecards…",
  loadFailed: "Scorecards could not be loaded. Try again.",
  retry: "Try again",
  empty: "No scorecards yet.",
  founderFallback: "Founder #{id}",
  founderId: "Founder ID",
  selected: "Selected",
  viewProfile: "View profile",
  viewInAdmin: "View in founder admin",
  updated: "Updated {date}",
  previous: "Previous",
  next: "Next",
  pageSummary: "Page {page} of {pages} · {total} scorecards",
  panelTitle: "Edit scorecard",
  noSelection: "Choose a scorecard from the list to see and change its scores.",
  currentScores: "Current scores",
  overrideTitle: "Manual override",
  overrideHint: "Leave a field empty to keep its value. The reason and the new values are kept in the audit log.",
  overrideNote: "Reason for the override",
  overrideNoteHint: "Shown in the audit log. Up to 1200 characters.",
  required: "(required)",
  apply: "Apply override",
  applying: "Applying…",
  applied: "Override applied and recorded in the audit log.",
  applyFailed: "The override could not be applied. Try again.",
  checkFields: "Check the marked fields and try again.",
  noScoreGiven: "Enter at least one new score.",
  wholeNumber: "Enter a whole number from {min} to {max}.",
  fieldRequired: "This field is required.",
  noteTooLong: "Use 1200 characters or fewer.",
  serverRejected: "The server did not accept this value.",
  accountTitle: "Account and email",
  emailVerified: "Email verified",
  emailUnverified: "Email not verified",
  sendVerification: "Send verification email",
  sending: "Sending…",
  verificationSent: "The mail server accepted the verification email. This does not confirm inbox delivery; check your mail provider.",
  unclaimed: "Profile not activated yet. Send the founder an activation invitation once you have verified their email.",
  inactiveProfile: "Email can only be sent for an active profile.",
  inviteEmail: "Founder email",
  inviteEvidence: "How did you verify who owns this address?",
  inviteEvidenceHint: "10 to 2000 characters. Stored with the invitation.",
  inviteConfirm: "I verified this address belongs to the founder or someone they authorized to manage the account.",
  sendInvite: "Send activation invitation",
  inviteSent: "The mail server accepted the activation invitation. This does not confirm inbox delivery; check your mail provider.",
  emailInvalid: "Enter a valid email address.",
  emailTooLong: "Use 255 characters or fewer.",
  evidenceLength: "Write 10 to 2000 characters.",
  confirmRequired: "Confirm that you verified the address before sending.",
  sendFailed: "The email could not be sent. Try again.",
  mailUnavailable: "Mail is not configured or did not accept the message. Check the mail settings and try again.",
  sendConflict: "Not sent: the account is already verified or the profile is not active. Refresh the list.",
  scores: {
    aggregate_score: "Aggregate",
    momentum: "Momentum",
    growth: "Growth",
    readiness: "Readiness",
    support_delta: "Support gap",
  },
}

export const adminScorecardsCopy = { ar, en }

export function adminScorecards(locale: Locale): AdminScorecardsCopy {
  return locale === "en" ? en : ar
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export function founderLabel(locale: Locale, scorecard: Pick<AdminScorecard, "founder_name" | "founder_profile_id">): string {
  return scorecard.founder_name?.trim() || fill(adminScorecards(locale).founderFallback, { id: scorecard.founder_profile_id })
}

/** Public profile for an active public founder; otherwise the founder admin search. */
export function founderProfileLink(
  scorecard: Pick<AdminScorecard, "founder_slug" | "founder_is_public" | "founder_status">,
): { href: string; isPublic: boolean } | null {
  if (!scorecard.founder_slug) return null
  const isPublic = scorecard.founder_is_public && scorecard.founder_status === "active"
  return {
    href: isPublic ? `/founders/${scorecard.founder_slug}` : `/admin/founders?search=${encodeURIComponent(scorecard.founder_slug)}`,
    isPublic,
  }
}

/** Which email action, if any, the panel offers for this scorecard. */
export function emailAction(scorecard: Pick<AdminScorecard, "user_email" | "email_verified" | "founder_slug" | "founder_status">): "verify" | "invite" | "inactive" | "none" {
  const active = scorecard.founder_status === "active"
  if (scorecard.user_email) {
    if (scorecard.email_verified) return "none"
    return active ? "verify" : "inactive"
  }
  if (!scorecard.founder_slug) return "none"
  return active ? "invite" : "inactive"
}

export function pageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, perPage)))
}

export function formatUpdated(locale: Locale, value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(dateLocale(locale === "ar"), { timeZone: "Asia/Riyadh", day: "numeric", month: "short", year: "numeric" })
}

// Laravel's `max` rule counts characters (code points), not UTF-16 units.
const characterCount = (value: string) => Array.from(value).length
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Mirrors `Admin\ScorecardController::override` validation, plus at least one new score. */
export function validateOverride(locale: Locale, form: OverrideForm): OverrideErrors {
  const copy = adminScorecards(locale)
  const errors: OverrideErrors = {}
  let given = 0
  for (const field of scoreFields) {
    const value = form[field].trim()
    if (!value) continue
    given += 1
    const { min, max } = scoreRanges[field]
    if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) {
      errors[field] = fill(copy.wholeNumber, { min, max })
    }
  }
  const note = form.override_note.trim()
  if (!note) errors.override_note = copy.fieldRequired
  else if (characterCount(note) > overrideNoteMax) errors.override_note = copy.noteTooLong
  if (given === 0) errors.form = copy.noScoreGiven
  return errors
}

/** Only the scores that were entered are sent, as integers; empty fields keep their stored value. */
export function overridePayload(form: OverrideForm): OverridePayload {
  const payload: OverridePayload = { override_note: form.override_note.trim() }
  for (const field of scoreFields) {
    const value = form[field].trim()
    if (value) payload[field] = Number(value)
  }
  return payload
}

/** Mirrors `Admin\FounderController::invite` validation. */
export function validateInvite(locale: Locale, form: InviteForm): InviteErrors {
  const copy = adminScorecards(locale)
  const errors: InviteErrors = {}
  const email = form.email.trim()
  if (!email) errors.email = copy.fieldRequired
  else if (characterCount(email) > inviteLimits.emailMax) errors.email = copy.emailTooLong
  else if (!emailPattern.test(email)) errors.email = copy.emailInvalid
  const evidence = characterCount(form.recipient_evidence.trim())
  if (evidence < inviteLimits.evidenceMin || evidence > inviteLimits.evidenceMax) errors.recipient_evidence = copy.evidenceLength
  if (!form.recipient_verified) errors.recipient_verified = copy.confirmRequired
  return errors
}

/**
 * Laravel 422 errors keyed by field. The API's messages are English only, so each known field gets
 * the page's own message in the administrator's language.
 */
export function fieldErrors<F extends string>(fields: readonly F[], errors: unknown, message: string): Partial<Record<F, string>> {
  const result: Partial<Record<F, string>> = {}
  if (!errors || typeof errors !== "object") return result
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    if ((fields as readonly string[]).includes(key)) result[key as F] = message
  }
  return result
}

/** A failed email send, in the administrator's language instead of the API's English message. */
export function sendErrorMessage(locale: Locale, status: number | null): string {
  const copy = adminScorecards(locale)
  if (status === 503) return copy.mailUnavailable
  if (status === 409) return copy.sendConflict
  return copy.sendFailed
}

export function scorecardFieldId(field: OverrideField | InviteField): string {
  return `scorecard-${field.replace(/_/g, "-")}`
}
