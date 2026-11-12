import type { AdminSettingsResponse } from "./admin"
import type { Locale } from "./locale"

/**
 * Copy and helpers for the administrator settings page (`/admin/settings`).
 *
 * `Admin\SettingsController` stores these values in the `settings` table and logs each change,
 * but nothing else in the application reads them: sessions, rate limits, password rules and
 * outgoing mail come from the server configuration. The page says so instead of implying that a
 * change here takes effect.
 */

export const settingsFields = [
  "general.site_name",
  "general.site_url",
  "general.site_description",
  "email.from_name",
  "email.from_email",
  "email.reply_to",
  "email.smtp_host",
  "security.session_timeout_minutes",
  "security.api_rate_limit",
  "security.password_policy",
] as const
export type SettingsField = (typeof settingsFields)[number]
export type SettingsForm = Record<SettingsField, string>
export type SettingsFormErrors = Partial<Record<SettingsField, string>>

export const settingsLimits = {
  textMax: 255,
  sessionTimeout: { min: 5, max: 1440 },
  apiRateLimit: { min: 1, max: 100000 },
} as const

const ar = {
  title: "الإعدادات",
  intro: "بيانات الموقع والبريد والقيم الأمنية المرجعية للمنصة.",
  notice: "تُحفظ هذه القيم ويُسجَّل كل تعديل عليها، لكنها لا تغيّر عمل المنصة بعد: مدة الجلسة وحدّ الطلبات وقواعد كلمة المرور وإرسال البريد تُضبط في إعدادات الخادم.",
  loading: "جارٍ تحميل الإعدادات…",
  loadFailed: "تعذر تحميل الإعدادات. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  save: "حفظ التغييرات",
  saving: "جارٍ الحفظ…",
  saved: "حُفظت الإعدادات.",
  saveFailed: "تعذر حفظ الإعدادات. حاول مرة أخرى.",
  saveInvalid: "راجع الحقول المحددة ثم احفظ مرة أخرى.",
  required: "(مطلوب)",
  general: "عام",
  email: "البريد الإلكتروني",
  security: "الأمان",
  siteName: "اسم الموقع",
  siteUrl: "رابط الموقع",
  siteDescription: "وصف الموقع",
  fromName: "اسم المرسل",
  fromEmail: "بريد المرسل",
  replyTo: "بريد الرد",
  smtpHost: "خادم SMTP",
  sessionTimeout: "مدة الجلسة (بالدقائق)",
  sessionTimeoutHint: "من 5 إلى 1440 دقيقة.",
  apiRateLimit: "حد طلبات الواجهة البرمجية",
  apiRateLimitHint: "عدد صحيح من 1 إلى 100000.",
  passwordPolicy: "سياسة كلمة المرور",
  fieldRequired: "هذا الحقل مطلوب.",
  tooLong: "النص أطول من 255 حرفًا.",
  urlInvalid: "أدخل رابطًا كاملًا يبدأ بـ https://",
  emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا.",
  wholeNumber: "أدخل عددًا صحيحًا من {min} إلى {max}.",
  serverRejected: "لم يقبل الخادم هذه القيمة.",
}

type AdminSettingsCopy = typeof ar

const en: AdminSettingsCopy = {
  title: "Settings",
  intro: "Site details, mail sender and security reference values for the platform.",
  notice: "These values are saved and every change is logged, but they do not change how the platform works yet: session length, rate limits, password rules and mail delivery are set in the server configuration.",
  loading: "Loading settings…",
  loadFailed: "Settings could not be loaded. Try again.",
  retry: "Try again",
  save: "Save changes",
  saving: "Saving…",
  saved: "Settings saved.",
  saveFailed: "Settings could not be saved. Try again.",
  saveInvalid: "Check the marked fields and save again.",
  required: "(required)",
  general: "General",
  email: "Email",
  security: "Security",
  siteName: "Site name",
  siteUrl: "Site URL",
  siteDescription: "Site description",
  fromName: "Sender name",
  fromEmail: "Sender email",
  replyTo: "Reply-to email",
  smtpHost: "SMTP host",
  sessionTimeout: "Session timeout (minutes)",
  sessionTimeoutHint: "5 to 1440 minutes.",
  apiRateLimit: "API rate limit",
  apiRateLimitHint: "A whole number from 1 to 100000.",
  passwordPolicy: "Password policy",
  fieldRequired: "This field is required.",
  tooLong: "Use 255 characters or fewer.",
  urlInvalid: "Enter a full URL starting with https://",
  emailInvalid: "Enter a valid email address.",
  wholeNumber: "Enter a whole number from {min} to {max}.",
  serverRejected: "The server did not accept this value.",
}

export const adminSettingsCopy = { ar, en }

export function adminSettings(locale: Locale): AdminSettingsCopy {
  return locale === "en" ? en : ar
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export function toSettingsForm(settings: AdminSettingsResponse): SettingsForm {
  return {
    "general.site_name": settings.general.site_name ?? "",
    "general.site_url": settings.general.site_url ?? "",
    "general.site_description": settings.general.site_description ?? "",
    "email.from_name": settings.email.from_name ?? "",
    "email.from_email": settings.email.from_email ?? "",
    "email.reply_to": settings.email.reply_to ?? "",
    "email.smtp_host": settings.email.smtp_host ?? "",
    "security.session_timeout_minutes": String(settings.security.session_timeout_minutes ?? ""),
    "security.api_rate_limit": String(settings.security.api_rate_limit ?? ""),
    "security.password_policy": settings.security.password_policy ?? "",
  }
}

// Laravel's `max` rule counts characters (code points), not UTF-16 units, so an emoji counts once.
const characterCount = (value: string) => Array.from(value).length

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname)
  } catch {
    return false
  }
}

function wholeNumberIn(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value)) return false
  const number = Number(value)
  return number >= min && number <= max
}

/** Mirrors the rules in `Admin\SettingsController@update`, so a bad value is caught before sending. */
export function validateSettingsForm(locale: Locale, form: SettingsForm): SettingsFormErrors {
  const copy = adminSettings(locale)
  const errors: SettingsFormErrors = {}
  const value = (field: SettingsField) => form[field].trim()

  for (const field of ["general.site_name", "general.site_url", "email.from_name", "email.from_email", "security.password_policy"] as const) {
    if (!value(field)) errors[field] = copy.fieldRequired
  }
  for (const field of ["general.site_name", "general.site_url", "email.from_name", "email.from_email", "email.reply_to", "email.smtp_host", "security.password_policy"] as const) {
    if (!errors[field] && characterCount(value(field)) > settingsLimits.textMax) errors[field] = copy.tooLong
  }
  if (!errors["general.site_url"] && !isHttpUrl(value("general.site_url"))) errors["general.site_url"] = copy.urlInvalid
  for (const field of ["email.from_email", "email.reply_to"] as const) {
    if (!errors[field] && value(field) && !emailPattern.test(value(field))) errors[field] = copy.emailInvalid
  }
  const { sessionTimeout, apiRateLimit } = settingsLimits
  if (!wholeNumberIn(value("security.session_timeout_minutes"), sessionTimeout.min, sessionTimeout.max)) {
    errors["security.session_timeout_minutes"] = fill(copy.wholeNumber, sessionTimeout)
  }
  if (!wholeNumberIn(value("security.api_rate_limit"), apiRateLimit.min, apiRateLimit.max)) {
    errors["security.api_rate_limit"] = fill(copy.wholeNumber, apiRateLimit)
  }
  return errors
}

/** The full settings object for `PUT /admin/settings`: edited fields replace the loaded ones, the rest are sent back unchanged. */
export function settingsPayload(current: AdminSettingsResponse, form: SettingsForm): AdminSettingsResponse {
  const optional = (field: SettingsField) => form[field].trim() || null
  return {
    general: {
      ...current.general,
      site_name: form["general.site_name"].trim(),
      site_url: form["general.site_url"].trim(),
      site_description: form["general.site_description"].trim(),
    },
    email: {
      ...current.email,
      from_name: form["email.from_name"].trim(),
      from_email: form["email.from_email"].trim(),
      reply_to: optional("email.reply_to"),
      smtp_host: optional("email.smtp_host"),
    },
    security: {
      ...current.security,
      session_timeout_minutes: Number(form["security.session_timeout_minutes"].trim()),
      api_rate_limit: Number(form["security.api_rate_limit"].trim()),
      password_policy: form["security.password_policy"].trim(),
    },
  }
}

/**
 * Laravel 422 errors keyed by field (`general.site_url`). The API's messages are English only, so
 * each known field gets the page's own message in the administrator's language.
 */
export function settingsFieldErrors(errors: unknown, message: string): SettingsFormErrors {
  const result: SettingsFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    if ((settingsFields as readonly string[]).includes(key)) result[key as SettingsField] = message
  }
  return result
}

export function settingsFieldId(field: SettingsField): string {
  return `setting-${field.replace(/[._]/g, "-")}`
}
