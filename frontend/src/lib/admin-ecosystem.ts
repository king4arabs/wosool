import type { EcosystemRecord } from "@/components/accelerator/OpportunityDirectory"
import type { Locale } from "./locale"

/**
 * The admin "ecosystem source review" editor (/admin/opportunities).
 * Rules mirror `Api\Gateway\EcosystemController::adminUpdate`, so a bad value is caught before sending.
 */

export const ecosystemVerificationStatuses = ["verified", "needs_review", "expired", "archived"] as const
export const ecosystemApplicationStatuses = ["open", "closed", "not_announced"] as const

export const ecosystemFields = [
  "name_ar",
  "name_en",
  "description_ar",
  "description_en",
  "website_url",
  "application_url",
  "source_urls",
  "verification_status",
  "application_status",
  "deadline",
  "verified_at",
  "note",
] as const
export type EcosystemField = (typeof ecosystemFields)[number]

export const ecosystemLimits = { name: 255, description: 4000, url: 2048, sources: 15, note: 2000 } as const

export type EcosystemForm = Record<EcosystemField, string>
export type EcosystemFormErrors = Partial<Record<EcosystemField, string>>

export type EcosystemPayload = {
  name_ar: string
  name_en: string
  description_ar: string
  description_en: string
  website_url: string
  application_url: string | null
  source_urls: string[]
  verification_status: string
  application_status: string
  deadline?: string | null
  verified_at: string
  updated_at: string
  note: string
}

const ar = {
  heading: "مراجعة بيانات المنظومة",
  lead: "التعديلات تحفظ سجلًا للمراجعة وتقفل السجل أمام الاستيراد التلقائي. لا يؤثر هذا الدليل على بيانات المتقدمين.",
  loading: "جارٍ تحميل السجلات…",
  loadFailed: "تعذر تحميل السجلات.",
  retry: "أعد المحاولة",
  empty: "لا توجد سجلات للمراجعة بعد.",
  review: "مراجعة المصادر",
  reviewNamed: "مراجعة المصادر: {name}",
  editing: "مراجعة: {name}",
  save: "حفظ المراجعة",
  saving: "جارٍ الحفظ…",
  cancel: "إلغاء",
  saved: "حُفظت المراجعة.",
  required: "مطلوب",
  optional: "اختياري",
  labels: {
    name_ar: "الاسم بالعربية",
    name_en: "الاسم بالإنجليزية",
    description_ar: "الوصف بالعربية",
    description_en: "الوصف بالإنجليزية",
    website_url: "الموقع الرسمي",
    application_url: "رابط التقديم",
    source_urls: "المصادر",
    verification_status: "التحقق",
    application_status: "حالة التقديم",
    deadline: "آخر موعد مؤكد",
    verified_at: "تاريخ التحقق",
    note: "سبب التعديل",
  },
  hints: {
    source_urls: "رابط ‎https‎ واحد في كل سطر، حتى ١٥ رابطًا.",
    application_url: "اتركه فارغًا إن لم يُعلن رابط تقديم.",
    deadline: "يُترك كما هو إن لم يتغير.",
    verified_at: "لا يمكن أن يكون بعد اليوم (بتوقيت UTC).",
    note: "يُحفظ في سجل المراجعة، حتى ٢٠٠٠ حرف.",
  },
  errors: {
    required: "هذا الحقل مطلوب.",
    tooLong: "النص أطول من الحد المسموح ({max} حرفًا).",
    https: "أدخل رابطًا كاملًا يبدأ بـ ‎https://‎.",
    sourceLine: "السطر {line} ليس رابطًا يبدأ بـ ‎https://‎.",
    sourcesMin: "أضف مصدرًا واحدًا على الأقل.",
    sourcesMax: "يُسمح بـ ١٥ مصدرًا كحد أقصى.",
    date: "أدخل تاريخًا صحيحًا.",
    future: "لا يمكن أن يكون تاريخ التحقق بعد اليوم.",
    status: "اختر قيمة من القائمة.",
    server: "رفضت الخدمة هذه القيمة. راجعها وحاول مجددًا.",
    fixFields: "راجع الحقول المحددة قبل الحفظ.",
  },
}

const en: typeof ar = {
  heading: "Ecosystem source review",
  lead: "Reviews keep a revision history and protect edited records from automatic imports. Directory edits do not alter applicant data.",
  loading: "Loading records…",
  loadFailed: "The records could not be loaded.",
  retry: "Try again",
  empty: "There are no records to review yet.",
  review: "Review sources",
  reviewNamed: "Review sources: {name}",
  editing: "Reviewing: {name}",
  save: "Save review",
  saving: "Saving…",
  cancel: "Cancel",
  saved: "Review saved.",
  required: "required",
  optional: "optional",
  labels: {
    name_ar: "Arabic name",
    name_en: "English name",
    description_ar: "Arabic description",
    description_en: "English description",
    website_url: "Official website",
    application_url: "Application link",
    source_urls: "Sources",
    verification_status: "Verification",
    application_status: "Application status",
    deadline: "Confirmed deadline",
    verified_at: "Verification date",
    note: "Reason for review",
  },
  hints: {
    source_urls: "One https link per line, up to 15.",
    application_url: "Leave empty if no application link has been announced.",
    deadline: "Kept as stored unless you change it.",
    verified_at: "Cannot be later than today (UTC).",
    note: "Saved in the revision history, up to 2000 characters.",
  },
  errors: {
    required: "This field is required.",
    tooLong: "Too long (maximum {max} characters).",
    https: "Enter a full link starting with https://.",
    sourceLine: "Line {line} is not a link starting with https://.",
    sourcesMin: "Add at least one source.",
    sourcesMax: "Up to 15 sources are allowed.",
    date: "Enter a valid date.",
    future: "The verification date cannot be later than today.",
    status: "Choose a value from the list.",
    server: "The service rejected this value. Check it and try again.",
    fixFields: "Check the highlighted fields before saving.",
  },
}

export const adminEcosystemCopy = { ar, en }
export type AdminEcosystemCopy = typeof ar

export function adminEcosystem(locale: Locale): AdminEcosystemCopy {
  return locale === "ar" ? ar : en
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export function ecosystemFieldId(field: EcosystemField): string {
  return `ecosystem-${field.replace(/_/g, "-")}`
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const characterCount = (value: string) => Array.from(value).length

function isValidDate(value: string): boolean {
  if (!datePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

/** Laravel's `url:https` accepts only absolute https URLs with a host. */
export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && Boolean(url.hostname) && !/\s/.test(value)
  } catch {
    return false
  }
}

/** The source list as typed: one link per line, blank lines and surrounding spaces ignored. */
export function sourceLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

/** The API's `before_or_equal:today` runs in the app time zone, which is UTC. */
export function utcToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function toEcosystemForm(record: EcosystemRecord): EcosystemForm {
  return {
    name_ar: record.name_ar ?? "",
    name_en: record.name_en ?? "",
    description_ar: record.description_ar ?? "",
    description_en: record.description_en ?? "",
    website_url: record.website_url ?? "",
    application_url: record.application_url ?? "",
    source_urls: (record.source_urls ?? []).join("\n"),
    verification_status: record.verification_status ?? "",
    application_status: record.application_status ?? "",
    deadline: record.deadline ? record.deadline.slice(0, 10) : "",
    verified_at: record.verified_at ? record.verified_at.slice(0, 10) : "",
    note: "",
  }
}

export function validateEcosystemForm(locale: Locale, form: EcosystemForm, today: string = utcToday()): EcosystemFormErrors {
  const { errors: copy } = adminEcosystem(locale)
  const errors: EcosystemFormErrors = {}
  const value = (field: EcosystemField) => form[field].trim()
  const tooLong = (max: number) => fill(copy.tooLong, { max })

  for (const field of ["name_ar", "name_en"] as const) {
    if (!value(field)) errors[field] = copy.required
    else if (characterCount(value(field)) > ecosystemLimits.name) errors[field] = tooLong(ecosystemLimits.name)
  }
  for (const field of ["description_ar", "description_en"] as const) {
    if (!value(field)) errors[field] = copy.required
    else if (characterCount(value(field)) > ecosystemLimits.description) errors[field] = tooLong(ecosystemLimits.description)
  }

  if (!value("website_url")) errors.website_url = copy.required
  else if (!isHttpsUrl(value("website_url"))) errors.website_url = copy.https
  else if (value("website_url").length > ecosystemLimits.url) errors.website_url = tooLong(ecosystemLimits.url)

  if (value("application_url")) {
    if (!isHttpsUrl(value("application_url"))) errors.application_url = copy.https
    else if (value("application_url").length > ecosystemLimits.url) errors.application_url = tooLong(ecosystemLimits.url)
  }

  const sources = sourceLines(form.source_urls)
  if (sources.length === 0) errors.source_urls = copy.sourcesMin
  else if (sources.length > ecosystemLimits.sources) errors.source_urls = copy.sourcesMax
  else {
    const bad = sources.findIndex((line) => !isHttpsUrl(line) || line.length > ecosystemLimits.url)
    if (bad >= 0) errors.source_urls = fill(copy.sourceLine, { line: bad + 1 })
  }

  if (!(ecosystemVerificationStatuses as readonly string[]).includes(form.verification_status)) {
    errors.verification_status = copy.status
  }
  if (!(ecosystemApplicationStatuses as readonly string[]).includes(form.application_status)) {
    errors.application_status = copy.status
  }
  if (value("deadline") && !isValidDate(value("deadline"))) errors.deadline = copy.date

  if (!value("verified_at")) errors.verified_at = copy.required
  else if (!isValidDate(value("verified_at"))) errors.verified_at = copy.date
  else if (value("verified_at") > today) errors.verified_at = copy.future

  if (!value("note")) errors.note = copy.required
  else if (characterCount(value("note")) > ecosystemLimits.note) errors.note = tooLong(ecosystemLimits.note)

  return errors
}

/**
 * What the API receives. The stored deadline is a date-time; it is sent only when the date was
 * changed or cleared, so an untouched deadline keeps its stored time.
 */
export function ecosystemPayload(record: EcosystemRecord, form: EcosystemForm): EcosystemPayload {
  const payload: EcosystemPayload = {
    name_ar: form.name_ar.trim(),
    name_en: form.name_en.trim(),
    description_ar: form.description_ar.trim(),
    description_en: form.description_en.trim(),
    website_url: form.website_url.trim(),
    application_url: form.application_url.trim() || null,
    source_urls: sourceLines(form.source_urls),
    verification_status: form.verification_status,
    application_status: form.application_status,
    verified_at: form.verified_at.trim(),
    updated_at: record.updated_at,
    note: form.note.trim(),
  }
  const storedDeadline = record.deadline ? record.deadline.slice(0, 10) : ""
  if (form.deadline.trim() !== storedDeadline) payload.deadline = form.deadline.trim() || null
  return payload
}

/** Laravel 422 errors keyed by field (`source_urls.3` belongs to `source_urls`), in the page language. */
export function ecosystemFieldErrors(locale: Locale, errors: unknown): EcosystemFormErrors {
  const result: EcosystemFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    const field = key.split(".")[0]
    if ((ecosystemFields as readonly string[]).includes(field)) {
      result[field as EcosystemField] = adminEcosystem(locale).errors.server
    }
  }
  return result
}
