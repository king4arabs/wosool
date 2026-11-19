import type { Locale } from "./locale"

/**
 * Copy, rules and helpers for the administrator partners page (`/admin/partners`).
 *
 * The rules mirror `Api\Admin\PartnerController::validated` (including its publishing gate for a
 * confirmed, public partner) and the visibility rule mirrors the public
 * `Api\PartnerController::index` query, so the page says exactly whether a partner is listed.
 */

export const partnerTypes = ["strategic", "ecosystem", "knowledge", "community", "program", "government"] as const
export type PartnerType = (typeof partnerTypes)[number]

export const partnerStatuses = ["prospective", "confirmed", "ecosystem-aligned", "past-collaborator"] as const
export type PartnerStatus = (typeof partnerStatuses)[number]

/** Form fields in the order they appear, so focus goes to the first problem on the page. */
export const partnerFields = [
  "name_ar",
  "name_en",
  "type",
  "status",
  "website",
  "logo_url",
  "logo_source_url",
  "slug",
  "display_order",
  "identity_status",
  "asset_status",
  "designation_status",
  "approval_note",
  "is_public",
] as const
export type PartnerField = (typeof partnerFields)[number]
export type PartnerFormErrors = Partial<Record<PartnerField, string>>

export const partnerChecks = ["identity_status", "asset_status", "designation_status"] as const
export type PartnerCheck = (typeof partnerChecks)[number]
/** The stored value each check takes when it is ticked; unticked is always `needs_review`. */
export const partnerCheckValue: Record<PartnerCheck, "verified" | "approved"> = {
  identity_status: "verified",
  asset_status: "verified",
  designation_status: "approved",
}

export const partnerLimits = { textMax: 255, typeMax: 100, sourceMax: 2048, noteMax: 2000, displayOrder: { min: 0, max: 100000 } } as const

/** Same pattern as the API: an https link, or a file in `public/partners` (svg or png). */
export const partnerLogoPattern = /^(https:\/\/[^\s]+|\/partners\/[a-zA-Z0-9._-]+\.(svg|png))$/

export type AdminPartner = {
  id: number
  name: string
  name_ar: string | null
  name_en: string | null
  slug: string
  type: string
  status: string
  logo_url: string | null
  website: string | null
  display_order: number | null
  is_public: boolean
  identity_status: string
  asset_status: string
  designation_status: string
  logo_source_url: string | null
  approval_note?: string | null
}

export type PartnerForm = {
  name_ar: string
  name_en: string
  type: string
  status: string
  website: string
  logo_url: string
  logo_source_url: string
  slug: string
  display_order: string
  identity_status: boolean
  asset_status: boolean
  designation_status: boolean
  approval_note: string
  is_public: boolean
  /** The stored base name, used only when both language names are left blank. */
  stored_name: string
}

export type PartnerPayload = {
  name: string
  name_ar: string | null
  name_en: string | null
  type: string
  status: string
  website: string | null
  logo_url: string | null
  logo_source_url: string | null
  slug: string | null
  display_order: number
  identity_status: "verified" | "needs_review"
  asset_status: "verified" | "needs_review"
  designation_status: "approved" | "needs_review"
  approval_note: string | null
  is_public: boolean
}

/** Why a partner is not on the public partners page, in the order they are listed. */
export const partnerVisibilityGaps = ["hidden", "not_confirmed", "identity", "asset", "designation", "logo"] as const
export type PartnerVisibilityGap = (typeof partnerVisibilityGaps)[number]

const ar = {
  title: "الشركاء والشعارات",
  intro: "اعتمد هوية الجهة، ومصدر الشعار، وصفة الشراكة قبل إظهارها. يُحفظ ترتيب العرض كما تحدده هنا.",
  publicNote: "تظهر الجهة في صفحة الشركاء العامة فقط إذا كانت ظاهرة، وعلاقتها «مؤكدة»، وتم التحقق من هويتها وشعارها وصفة الشراكة، ولها شعار.",
  add: "إضافة شريك",
  records: "سجلات الشركاء",
  loading: "جارٍ تحميل الشركاء…",
  loadFailed: "تعذر تحميل الشركاء. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا يوجد شركاء بعد.",
  addTitle: "إضافة شريك",
  editTitle: "مراجعة الشريك: {name}",
  formIntro: "الاسم بالعربية أو بالإنجليزية مطلوب. يلزم استكمال التحقق والشعار والمصدر والموقع وأساس الاعتماد قبل إظهار شريك علاقته مؤكدة.",
  required: "(مطلوب)",
  optional: "(اختياري)",
  nameAr: "الاسم بالعربية",
  nameEn: "الاسم بالإنجليزية",
  nameHint: "اكتب الاسم بلغة واحدة على الأقل.",
  type: "نوع الجهة",
  status: "حالة العلاقة",
  website: "الموقع الرسمي",
  logoUrl: "الشعار",
  logoHint: "رابط يبدأ بـ https:// أو ملف في مجلد الشركاء مثل /partners/name.svg (svg أو png).",
  logoSource: "مصدر الشعار الرسمي",
  logoSourceHint: "صفحة الجهة التي أُخذ منها الشعار، وتبدأ بـ https://",
  slug: "المعرّف في الرابط",
  slugHint: "اتركه فارغًا ليُنشأ من الاسم، أو ليبقى المعرّف الحالي عند التعديل.",
  displayOrder: "ترتيب العرض",
  displayOrderHint: "الأصغر يظهر أولًا. عدد صحيح من 0 إلى 100000.",
  checksLegend: "التحقق قبل النشر",
  checks: {
    identity_status: "تم التحقق من هوية الجهة",
    asset_status: "الشعار أصلي ومعتمد للاستخدام",
    designation_status: "صفة الشراكة مؤكدة",
  } as Record<PartnerCheck, string>,
  approvalNote: "أساس الاعتماد وملاحظة المراجعة",
  approvalNoteHint: "مثل: من وافق على ذكر الشراكة ومتى. حتى 2000 حرف. تظهر للمشرفين فقط.",
  isPublic: "إظهار في صفحة الشركاء العامة",
  cancel: "إلغاء",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  created: "أُضيف الشريك.",
  updated: "حُفظ الشريك.",
  saveFailed: "تعذر حفظ الشريك. حاول مرة أخرى.",
  saveInvalid: "راجع الحقول المحددة ثم احفظ مرة أخرى.",
  review: "مراجعة وتعديل",
  edit: "مراجعة وتعديل {name}",
  order: "ترتيب العرض: {order}",
  listed: "ظاهر في صفحة الشركاء",
  notListed: "غير ظاهر في صفحة الشركاء",
  missing: "الناقص: {items}",
  listSeparator: "، ",
  gaps: {
    hidden: "مخفي",
    not_confirmed: "العلاقة غير مؤكدة",
    identity: "هوية الجهة",
    asset: "اعتماد الشعار",
    designation: "صفة الشراكة",
    logo: "الشعار",
  } as Record<PartnerVisibilityGap, string>,
  types: {
    strategic: "استراتيجي",
    ecosystem: "منظومة ريادة الأعمال",
    knowledge: "معرفي وأكاديمي",
    community: "مجتمعي",
    program: "برامج",
    government: "حكومي",
  } as Record<PartnerType, string>,
  statuses: {
    prospective: "قيد المراجعة",
    confirmed: "مؤكدة",
    "ecosystem-aligned": "ضمن المنظومة",
    "past-collaborator": "تعاون سابق",
  } as Record<PartnerStatus, string>,
  nameRequired: "اكتب اسم الجهة بالعربية أو بالإنجليزية.",
  tooLong: "النص أطول من {max} حرفًا.",
  choose: "اختر قيمة من القائمة.",
  websiteInvalid: "أدخل رابطًا كاملًا يبدأ بـ https://",
  logoInvalid: "استخدم رابطًا يبدأ بـ https:// أو مسارًا مثل /partners/name.svg (svg أو png).",
  httpsInvalid: "أدخل رابطًا كاملًا يبدأ بـ https://",
  wholeNumber: "أدخل عددًا صحيحًا من {min} إلى {max}.",
  publishRequired: "مطلوب قبل إظهار شريك علاقته مؤكدة.",
  checkRequired: "يجب تأكيد هذا قبل إظهار شريك علاقته مؤكدة.",
  serverRejected: "لم يقبل الخادم هذه القيمة.",
}

type AdminPartnersCopy = typeof ar

const en: AdminPartnersCopy = {
  title: "Partners and logos",
  intro: "Verify identity, official artwork, and the partnership designation before publishing. Display order is controlled here.",
  publicNote: "A partner appears on the public partners page only when it is shown, its relationship is “Confirmed”, its identity, artwork and designation are verified, and it has a logo.",
  add: "Add partner",
  records: "Partner records",
  loading: "Loading partners…",
  loadFailed: "Partners could not be loaded. Try again.",
  retry: "Try again",
  empty: "No partners yet.",
  addTitle: "Add partner",
  editTitle: "Review partner: {name}",
  formIntro: "A name in Arabic or English is required. A confirmed partner can be shown only once the checks, logo, logo source, website and approval basis are complete.",
  required: "(required)",
  optional: "(optional)",
  nameAr: "Arabic name",
  nameEn: "English name",
  nameHint: "Enter the name in at least one language.",
  type: "Organization type",
  status: "Relationship status",
  website: "Official website",
  logoUrl: "Logo",
  logoHint: "A link starting with https:// or a file in the partners folder such as /partners/name.svg (svg or png).",
  logoSource: "Official logo source",
  logoSourceHint: "The organization's page the logo was taken from, starting with https://",
  slug: "URL slug",
  slugHint: "Leave blank to create it from the name, or to keep the current slug when editing.",
  displayOrder: "Display order",
  displayOrderHint: "Lower numbers appear first. A whole number from 0 to 100000.",
  checksLegend: "Checks before publishing",
  checks: {
    identity_status: "Organization identity verified",
    asset_status: "Authentic artwork approved for use",
    designation_status: "Partnership designation approved",
  },
  approvalNote: "Approval basis and review note",
  approvalNoteHint: "For example, who approved naming the partnership and when. Up to 2000 characters. Visible to administrators only.",
  isPublic: "Show on the public partners page",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
  created: "Partner added.",
  updated: "Partner saved.",
  saveFailed: "The partner could not be saved. Try again.",
  saveInvalid: "Check the marked fields and save again.",
  review: "Review and edit",
  edit: "Review and edit {name}",
  order: "Display order: {order}",
  listed: "Listed on the partners page",
  notListed: "Not listed on the partners page",
  missing: "Missing: {items}",
  listSeparator: ", ",
  gaps: {
    hidden: "hidden",
    not_confirmed: "relationship not confirmed",
    identity: "identity check",
    asset: "artwork approval",
    designation: "designation approval",
    logo: "logo",
  },
  types: {
    strategic: "Strategic",
    ecosystem: "Entrepreneurship ecosystem",
    knowledge: "Knowledge and academic",
    community: "Community",
    program: "Programs",
    government: "Government",
  },
  statuses: {
    prospective: "Prospective",
    confirmed: "Confirmed",
    "ecosystem-aligned": "Ecosystem aligned",
    "past-collaborator": "Past collaborator",
  },
  nameRequired: "Enter the organization's name in Arabic or English.",
  tooLong: "Use {max} characters or fewer.",
  choose: "Choose a value from the list.",
  websiteInvalid: "Enter a full URL starting with https://",
  logoInvalid: "Use a link starting with https:// or a path such as /partners/name.svg (svg or png).",
  httpsInvalid: "Enter a full URL starting with https://",
  wholeNumber: "Enter a whole number from {min} to {max}.",
  publishRequired: "Required before a confirmed partner can be shown.",
  checkRequired: "Confirm this before a confirmed partner can be shown.",
  serverRejected: "The server did not accept this value.",
}

export const adminPartnersCopy = { ar, en }

export function adminPartners(locale: Locale): AdminPartnersCopy {
  return locale === "en" ? en : ar
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export const isPartnerType = (value: string): value is PartnerType => (partnerTypes as readonly string[]).includes(value)
export const isPartnerStatus = (value: string): value is PartnerStatus => (partnerStatuses as readonly string[]).includes(value)

/** Labels in the administrator's language; an unknown stored code is shown as-is. */
export function partnerTypeLabel(locale: Locale, type: string): string {
  return isPartnerType(type) ? adminPartners(locale).types[type] : type
}

export function partnerStatusLabel(locale: Locale, status: string): string {
  return isPartnerStatus(status) ? adminPartners(locale).statuses[status] : status
}

/** The partner's name in the administrator's language, falling back to the other language. */
export function partnerName(locale: Locale, partner: Pick<AdminPartner, "name" | "name_ar" | "name_en">): string {
  const first = locale === "ar" ? partner.name_ar : partner.name_en
  const second = locale === "ar" ? partner.name_en : partner.name_ar
  return first?.trim() || second?.trim() || partner.name
}

/** What keeps a partner off the public page; empty when `Api\PartnerController::index` lists it. */
export function partnerVisibility(partner: Pick<AdminPartner, "is_public" | "status" | "identity_status" | "asset_status" | "designation_status" | "logo_url">): PartnerVisibilityGap[] {
  const gaps: PartnerVisibilityGap[] = []
  if (!partner.is_public) gaps.push("hidden")
  if (partner.status !== "confirmed") gaps.push("not_confirmed")
  if (partner.identity_status !== "verified") gaps.push("identity")
  if (partner.asset_status !== "verified") gaps.push("asset")
  if (partner.designation_status !== "approved") gaps.push("designation")
  if (!partner.logo_url) gaps.push("logo")
  return gaps
}

export const emptyPartnerForm: PartnerForm = {
  name_ar: "",
  name_en: "",
  type: "ecosystem",
  status: "prospective",
  website: "",
  logo_url: "",
  logo_source_url: "",
  slug: "",
  display_order: "10",
  identity_status: false,
  asset_status: false,
  designation_status: false,
  approval_note: "",
  is_public: false,
  stored_name: "",
}

/**
 * `name` in the API response is already localized (Arabic name for an Arabic admin), so it is kept
 * only as the fallback for a record whose language names are both empty, never written over them.
 */
export function toPartnerForm(partner?: AdminPartner | null): PartnerForm {
  if (!partner) return { ...emptyPartnerForm }
  return {
    name_ar: partner.name_ar ?? "",
    name_en: partner.name_en ?? "",
    type: partner.type ?? "ecosystem",
    status: partner.status ?? "prospective",
    website: partner.website ?? "",
    logo_url: partner.logo_url ?? "",
    logo_source_url: partner.logo_source_url ?? "",
    slug: partner.slug ?? "",
    display_order: String(partner.display_order ?? 0),
    identity_status: partner.identity_status === partnerCheckValue.identity_status,
    asset_status: partner.asset_status === partnerCheckValue.asset_status,
    designation_status: partner.designation_status === partnerCheckValue.designation_status,
    approval_note: partner.approval_note ?? "",
    is_public: Boolean(partner.is_public),
    stored_name: partner.name_ar || partner.name_en ? "" : partner.name ?? "",
  }
}

// Laravel's `max` rule counts characters (code points), not UTF-16 units, so an emoji counts once.
const characterCount = (value: string) => Array.from(value).length

function isUrl(value: string, protocols: string[]): boolean {
  if (/\s/.test(value)) return false
  try {
    const url = new URL(value)
    return protocols.includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}

/** Mirrors `Api\Admin\PartnerController::validated`, so a bad value is caught before sending. */
export function validatePartnerForm(locale: Locale, form: PartnerForm): PartnerFormErrors {
  const copy = adminPartners(locale)
  const errors: PartnerFormErrors = {}
  const text = (field: "name_ar" | "name_en" | "website" | "logo_url" | "logo_source_url" | "slug" | "display_order" | "approval_note") => form[field].trim()
  const tooLong = (max: number) => fill(copy.tooLong, { max })

  if (!text("name_ar") && !text("name_en") && !form.stored_name.trim()) errors.name_en = copy.nameRequired
  for (const field of ["name_ar", "name_en", "slug"] as const) {
    if (!errors[field] && characterCount(text(field)) > partnerLimits.textMax) errors[field] = tooLong(partnerLimits.textMax)
  }
  if (!isPartnerType(form.type) && (!form.type.trim() || characterCount(form.type) > partnerLimits.typeMax)) errors.type = copy.choose
  if (!isPartnerStatus(form.status)) errors.status = copy.choose

  const website = text("website")
  if (website && characterCount(website) > partnerLimits.textMax) errors.website = tooLong(partnerLimits.textMax)
  else if (website && !isUrl(website, ["https:", "http:"])) errors.website = copy.websiteInvalid

  const logo = text("logo_url")
  if (logo && characterCount(logo) > partnerLimits.textMax) errors.logo_url = tooLong(partnerLimits.textMax)
  else if (logo && !partnerLogoPattern.test(logo)) errors.logo_url = copy.logoInvalid

  const source = text("logo_source_url")
  if (source && characterCount(source) > partnerLimits.sourceMax) errors.logo_source_url = tooLong(partnerLimits.sourceMax)
  else if (source && !isUrl(source, ["https:"])) errors.logo_source_url = copy.httpsInvalid

  const { min, max } = partnerLimits.displayOrder
  const order = text("display_order")
  if (order && (!/^\d+$/.test(order) || Number(order) < min || Number(order) > max)) {
    errors.display_order = fill(copy.wholeNumber, { min, max })
  }
  if (characterCount(text("approval_note")) > partnerLimits.noteMax) errors.approval_note = tooLong(partnerLimits.noteMax)

  // The API's publishing gate for a confirmed partner that is (or stays) public.
  if (form.is_public && form.status === "confirmed") {
    for (const check of partnerChecks) if (!form[check]) errors[check] = copy.checkRequired
    for (const field of ["website", "logo_url", "logo_source_url", "approval_note"] as const) {
      if (!errors[field] && !text(field)) errors[field] = copy.publishRequired
    }
  }
  return errors
}

export function partnerPayload(form: PartnerForm): PartnerPayload {
  const optional = (value: string) => value.trim() || null
  const nameAr = optional(form.name_ar)
  const nameEn = optional(form.name_en)
  const check = <K extends PartnerCheck>(key: K) => (form[key] ? partnerCheckValue[key] : "needs_review") as PartnerPayload[K]
  return {
    name: nameEn ?? nameAr ?? form.stored_name.trim(),
    name_ar: nameAr,
    name_en: nameEn,
    type: form.type,
    status: form.status,
    website: optional(form.website),
    logo_url: optional(form.logo_url),
    logo_source_url: optional(form.logo_source_url),
    slug: optional(form.slug),
    display_order: Number(form.display_order.trim() || 0),
    identity_status: check("identity_status"),
    asset_status: check("asset_status"),
    designation_status: check("designation_status"),
    approval_note: optional(form.approval_note),
    is_public: form.is_public,
  }
}

/**
 * Laravel 422 errors keyed by field. The API's messages are English only, so each known field gets
 * the page's own message in the administrator's language; `name` belongs to the name fields.
 */
export function partnerFieldErrors(errors: unknown, message: string): PartnerFormErrors {
  const result: PartnerFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    if (key === "name") result.name_en = message
    else if ((partnerFields as readonly string[]).includes(key)) result[key as PartnerField] = message
  }
  return result
}

export function partnerFieldId(field: PartnerField): string {
  return `partner-${field.replace(/_/g, "-")}`
}
