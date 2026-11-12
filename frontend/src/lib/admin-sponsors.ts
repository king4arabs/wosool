import type { AdminSponsor } from "./admin"
import type { Locale } from "./locale"

/**
 * Copy and helpers for the administrator sponsors page (`/admin/sponsors`).
 *
 * Active sponsors are listed on the public `/sponsors` page in display order, so the editor lets
 * an administrator hide a sponsor or change its position instead of only creating it live.
 */

export const sponsorTiers = ["platinum", "gold", "silver", "bronze", "community"] as const
export type SponsorTier = (typeof sponsorTiers)[number]

export const sponsorFields = [
  "name",
  "tier",
  "display_order",
  "website",
  "logo_url",
  "contact_name",
  "contact_email",
  "contract_start",
  "contract_end",
  "description",
] as const
export type SponsorField = (typeof sponsorFields)[number]

export type SponsorForm = Record<Exclude<SponsorField, "tier">, string> & { tier: string; is_active: boolean }
export type SponsorFormErrors = Partial<Record<SponsorField, string>>

export const sponsorLimits = { textMax: 255, displayOrder: { min: 0, max: 100000 } } as const

export type SponsorPayload = {
  name: string
  tier: string
  is_active: boolean
  display_order: number
  website: string | null
  logo_url: string | null
  contact_name: string | null
  contact_email: string | null
  contract_start: string | null
  contract_end: string | null
  description: string | null
}

const ar = {
  title: "الرعاة",
  intro: "علاقات الرعاية ومستوياتها وفترات عقودها.",
  publicNote: "يظهر الرعاة النشطون في صفحة الرعاة العامة بحسب ترتيب العرض. أوقف «نشط» لإخفاء راعٍ دون حذفه.",
  add: "إضافة راعٍ",
  total: "كل الرعاة",
  active: "نشط",
  hidden: "مخفي",
  searchLabel: "البحث في الرعاة",
  searchPlaceholder: "ابحث باسم الراعي",
  search: "بحث",
  records: "سجلات الرعاة",
  loading: "جارٍ تحميل الرعاة…",
  loadFailed: "تعذر تحميل الرعاة. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا يوجد رعاة بعد.",
  emptySearch: "لا يوجد رعاة يطابقون هذا البحث.",
  edit: "تعديل {name}",
  remove: "حذف {name}",
  confirmDelete: "حذف {name}؟ سيختفي من صفحة الرعاة العامة ولا يمكن التراجع عن ذلك.",
  deleted: "حُذف الراعي.",
  deleteFailed: "تعذر حذف الراعي. حاول مرة أخرى.",
  addTitle: "إضافة راعٍ",
  editTitle: "تعديل الراعي",
  dialogIntro: "تُنشر بيانات الراعي النشط في صفحة الرعاة العامة. بيانات التواصل تظهر للمشرفين فقط.",
  required: "(مطلوب)",
  name: "الاسم",
  tier: "المستوى",
  isActive: "نشط (يظهر في صفحة الرعاة العامة)",
  displayOrder: "ترتيب العرض",
  displayOrderHint: "الأصغر يظهر أولًا. عدد صحيح من 0 إلى 100000.",
  website: "الموقع الإلكتروني",
  logoUrl: "رابط الشعار",
  contactName: "اسم جهة التواصل",
  contactEmail: "بريد جهة التواصل",
  contractStart: "بداية العقد",
  contractEnd: "نهاية العقد",
  contract: "العقد: {start} – {end}",
  openEnded: "مفتوح",
  description: "الوصف",
  cancel: "إلغاء",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  created: "أُضيف الراعي.",
  updated: "حُفظ الراعي.",
  saveFailed: "تعذر حفظ الراعي. حاول مرة أخرى.",
  saveInvalid: "راجع الحقول المحددة ثم احفظ مرة أخرى.",
  fieldRequired: "هذا الحقل مطلوب.",
  tooLong: "النص أطول من 255 حرفًا.",
  urlInvalid: "أدخل رابطًا كاملًا يبدأ بـ https://",
  emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا.",
  wholeNumber: "أدخل عددًا صحيحًا من {min} إلى {max}.",
  tierInvalid: "اختر مستوى من القائمة.",
  endBeforeStart: "يجب ألا تسبق نهاية العقد بدايته.",
  serverRejected: "لم يقبل الخادم هذه القيمة.",
  tiers: { platinum: "بلاتيني", gold: "ذهبي", silver: "فضي", bronze: "برونزي", community: "مجتمعي" } as Record<SponsorTier, string>,
}

type AdminSponsorsCopy = typeof ar

const en: AdminSponsorsCopy = {
  title: "Sponsors",
  intro: "Sponsor relationships, tiers and contract dates.",
  publicNote: "Active sponsors are listed on the public sponsors page in display order. Turn off “Active” to hide a sponsor without deleting it.",
  add: "Add sponsor",
  total: "All sponsors",
  active: "Active",
  hidden: "Hidden",
  searchLabel: "Search sponsors",
  searchPlaceholder: "Search by sponsor name",
  search: "Search",
  records: "Sponsor records",
  loading: "Loading sponsors…",
  loadFailed: "Sponsors could not be loaded. Try again.",
  retry: "Try again",
  empty: "No sponsors yet.",
  emptySearch: "No sponsors match this search.",
  edit: "Edit {name}",
  remove: "Delete {name}",
  confirmDelete: "Delete {name}? It will be removed from the public sponsors page and this cannot be undone.",
  deleted: "Sponsor deleted.",
  deleteFailed: "The sponsor could not be deleted. Try again.",
  addTitle: "Add sponsor",
  editTitle: "Edit sponsor",
  dialogIntro: "An active sponsor's details are published on the public sponsors page. Contact details are visible to administrators only.",
  required: "(required)",
  name: "Name",
  tier: "Tier",
  isActive: "Active (listed on the public sponsors page)",
  displayOrder: "Display order",
  displayOrderHint: "Lower numbers appear first. A whole number from 0 to 100000.",
  website: "Website",
  logoUrl: "Logo URL",
  contactName: "Contact name",
  contactEmail: "Contact email",
  contractStart: "Contract start",
  contractEnd: "Contract end",
  contract: "Contract: {start} – {end}",
  openEnded: "open",
  description: "Description",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
  created: "Sponsor added.",
  updated: "Sponsor saved.",
  saveFailed: "The sponsor could not be saved. Try again.",
  saveInvalid: "Check the marked fields and save again.",
  fieldRequired: "This field is required.",
  tooLong: "Use 255 characters or fewer.",
  urlInvalid: "Enter a full URL starting with https://",
  emailInvalid: "Enter a valid email address.",
  wholeNumber: "Enter a whole number from {min} to {max}.",
  tierInvalid: "Choose a tier from the list.",
  endBeforeStart: "The contract end cannot be before its start.",
  serverRejected: "The server did not accept this value.",
  tiers: { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze", community: "Community" },
}

export const adminSponsorsCopy = { ar, en }

export function adminSponsors(locale: Locale): AdminSponsorsCopy {
  return locale === "en" ? en : ar
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export function isSponsorTier(value: string): value is SponsorTier {
  return (sponsorTiers as readonly string[]).includes(value)
}

/** The tier in the administrator's language; an unknown stored code is shown as-is. */
export function sponsorTierLabel(locale: Locale, tier: string): string {
  return isSponsorTier(tier) ? adminSponsors(locale).tiers[tier] : tier
}

export const emptySponsorForm: SponsorForm = {
  name: "",
  tier: "community",
  is_active: true,
  display_order: "0",
  website: "",
  logo_url: "",
  contact_name: "",
  contact_email: "",
  contract_start: "",
  contract_end: "",
  description: "",
}

export function toSponsorForm(sponsor?: AdminSponsor | null): SponsorForm {
  if (!sponsor) return { ...emptySponsorForm }
  return {
    name: sponsor.name ?? "",
    tier: sponsor.tier ?? "community",
    is_active: Boolean(sponsor.is_active),
    display_order: String(sponsor.display_order ?? 0),
    website: sponsor.website ?? "",
    logo_url: sponsor.logo_url ?? "",
    contact_name: sponsor.contact_name ?? "",
    contact_email: sponsor.contact_email ?? "",
    contract_start: sponsor.contract_start ?? "",
    contract_end: sponsor.contract_end ?? "",
    description: sponsor.description ?? "",
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname)
  } catch {
    return false
  }
}

/** Mirrors the rules in `Admin\SponsorController::validated`, so a bad value is caught before sending. */
export function validateSponsorForm(locale: Locale, form: SponsorForm): SponsorFormErrors {
  const copy = adminSponsors(locale)
  const errors: SponsorFormErrors = {}
  const value = (field: Exclude<SponsorField, "tier">) => form[field].trim()

  if (!value("name")) errors.name = copy.fieldRequired
  if (!isSponsorTier(form.tier)) errors.tier = copy.tierInvalid
  for (const field of ["name", "website", "logo_url", "contact_name", "contact_email"] as const) {
    if (!errors[field] && value(field).length > sponsorLimits.textMax) errors[field] = copy.tooLong
  }
  for (const field of ["website", "logo_url"] as const) {
    if (!errors[field] && value(field) && !isHttpUrl(value(field))) errors[field] = copy.urlInvalid
  }
  if (!errors.contact_email && value("contact_email") && !emailPattern.test(value("contact_email"))) {
    errors.contact_email = copy.emailInvalid
  }
  const { min, max } = sponsorLimits.displayOrder
  const order = value("display_order")
  if (order && (!/^\d+$/.test(order) || Number(order) < min || Number(order) > max)) {
    errors.display_order = fill(copy.wholeNumber, { min, max })
  }
  const start = value("contract_start")
  const end = value("contract_end")
  if (start && end && datePattern.test(start) && datePattern.test(end) && end < start) {
    errors.contract_end = copy.endBeforeStart
  }
  return errors
}

export function sponsorPayload(form: SponsorForm): SponsorPayload {
  const optional = (field: Exclude<SponsorField, "tier" | "name" | "display_order">) => form[field].trim() || null
  return {
    name: form.name.trim(),
    tier: form.tier,
    is_active: form.is_active,
    display_order: Number(form.display_order.trim() || 0),
    website: optional("website"),
    logo_url: optional("logo_url"),
    contact_name: optional("contact_name"),
    contact_email: optional("contact_email"),
    contract_start: optional("contract_start"),
    contract_end: optional("contract_end"),
    description: optional("description"),
  }
}

/**
 * Laravel 422 errors keyed by field. The API's messages are English only, so each known field gets
 * the page's own message in the administrator's language.
 */
export function sponsorFieldErrors(errors: unknown, message: string): SponsorFormErrors {
  const result: SponsorFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    if ((sponsorFields as readonly string[]).includes(key)) result[key as SponsorField] = message
  }
  return result
}

export function sponsorFieldId(field: SponsorField | "is_active"): string {
  return `sponsor-${field.replace(/_/g, "-")}`
}

// First-strong isolates keep an ISO date (2026-01-01) in order inside an Arabic sentence.
const isolate = (value: string) => `\u2068${value}\u2069`

/** "Contract: 2026-01-01 – open", or null when no contract dates are recorded. */
export function sponsorContract(locale: Locale, sponsor: Pick<AdminSponsor, "contract_start" | "contract_end">): string | null {
  if (!sponsor.contract_start && !sponsor.contract_end) return null
  const copy = adminSponsors(locale)
  return fill(copy.contract, {
    start: sponsor.contract_start ? isolate(sponsor.contract_start) : "—",
    end: sponsor.contract_end ? isolate(sponsor.contract_end) : copy.openEnded,
  })
}
