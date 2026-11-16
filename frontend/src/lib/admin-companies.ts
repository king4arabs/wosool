import type { AdminCompany } from "./admin"
import type { Locale } from "./locale"

/**
 * Copy and helpers for the administrator companies page (`/admin/companies`).
 *
 * A company keeps its English text in its own columns and its Arabic text in `translations.ar`;
 * the public pages show whichever matches the reader's language. The editor shows and saves both
 * side by side, so saving from the Arabic admin never writes Arabic text into the English fields.
 */

export const companyStatuses = ["active", "pending", "suspended", "archived"] as const
export type CompanyStatus = (typeof companyStatuses)[number]

export const companyFlags = ["is_public", "is_featured", "is_hiring", "is_fundraising", "is_collaborating"] as const
export type CompanyFlag = (typeof companyFlags)[number]

/** Text fields in the order they appear in the editor; the first invalid one receives focus. */
export const companyFields = [
  "name",
  "name_ar",
  "website",
  "status",
  "sector",
  "sector_ar",
  "stage",
  "location",
  "location_ar",
  "country_code",
  "founded_year",
  "team_size",
  "description",
  "description_ar",
] as const
export type CompanyField = (typeof companyFields)[number]

export type CompanyForm = Record<CompanyField, string> & Record<CompanyFlag, boolean>
export type CompanyFormErrors = Partial<Record<CompanyField, string>>

/** The limits in `Admin\CompanyController::validated`. */
export const companyLimits = {
  name: 255,
  website: 255,
  sector: 100,
  stage: 100,
  location: 255,
  foundedYear: { min: 1900, max: 2100 },
  teamSize: { min: 1, max: 100000 },
} as const

export type CompanyPayload = {
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  website: string | null
  sector: string | null
  sector_ar: string | null
  stage: string | null
  location: string | null
  location_ar: string | null
  country_code: string | null
  founded_year: number | null
  team_size: number | null
  status: string
} & Record<CompanyFlag, boolean>

const ar = {
  title: "الشركات",
  intro: "شركات شبكة وصول كما تظهر في دليل الشركات العام.",
  publicNote: "تظهر الشركة في الدليل العام عندما تكون حالتها «نشطة» وخيار «تظهر في الدليل العام» مفعّلًا. يرى القارئ العربي النص العربي، ويرى القارئ الإنجليزي النص الإنجليزي.",
  add: "إضافة شركة",
  total: "كل الشركات",
  listed: "تظهر في الدليل",
  notListed: "لا تظهر في الدليل",
  hiringCount: "توظّف",
  fundraisingCount: "تجمع تمويلًا",
  searchLabel: "البحث في الشركات",
  searchPlaceholder: "ابحث بالاسم أو القطاع أو الموقع",
  search: "بحث",
  records: "سجلات الشركات",
  loading: "جارٍ تحميل الشركات…",
  loadFailed: "تعذر تحميل الشركات. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا توجد شركات بعد.",
  emptySearch: "لا توجد شركات تطابق هذا البحث.",
  founders: "المؤسسون: {names}",
  listSeparator: "، ",
  missingArabic: "بلا اسم عربي",
  website: "الموقع الإلكتروني",
  openWebsite: "موقع {name} (يفتح في نافذة جديدة)",
  edit: "تعديل {name}",
  remove: "حذف {name}",
  confirmDelete: "حذف {name}؟ ستختفي من دليل الشركات العام.",
  deleted: "حُذفت الشركة.",
  deleteFailed: "تعذر حذف الشركة. حاول مرة أخرى.",
  addTitle: "إضافة شركة",
  editTitle: "تعديل الشركة",
  dialogIntro: "اكتب كل نص باللغة المحددة له. اترك الحقل العربي فارغًا إن لم يتوفر نص عربي؛ عندها يرى القارئ العربي النص الإنجليزي.",
  required: "(مطلوب)",
  englishGroup: "بالإنجليزية",
  arabicGroup: "بالعربية",
  name: "الاسم بالإنجليزية",
  nameAr: "الاسم بالعربية",
  sector: "القطاع بالإنجليزية",
  sectorAr: "القطاع بالعربية",
  location: "الموقع بالإنجليزية",
  locationAr: "الموقع بالعربية",
  description: "الوصف بالإنجليزية",
  descriptionAr: "الوصف بالعربية",
  stage: "المرحلة",
  stageHint: "مثل: seed أو series-a",
  status: "الحالة",
  countryCode: "رمز الدولة",
  countryCodeHint: "حرفان، مثل SA",
  foundedYear: "سنة التأسيس",
  teamSize: "حجم الفريق",
  flagsLegend: "الظهور والإشارات",
  flags: {
    is_public: "تظهر في الدليل العام",
    is_featured: "مميّزة في الدليل",
    is_hiring: "توظّف",
    is_fundraising: "تجمع تمويلًا",
    is_collaborating: "منفتحة على التعاون",
  } as Record<CompanyFlag, string>,
  statuses: { active: "نشطة", pending: "قيد المراجعة", suspended: "معلّقة", archived: "مؤرشفة" } as Record<CompanyStatus, string>,
  cancel: "إلغاء",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  created: "أُضيفت الشركة.",
  updated: "حُفظت الشركة.",
  saveFailed: "تعذر حفظ الشركة. حاول مرة أخرى.",
  saveInvalid: "راجع الحقول المحددة ثم احفظ مرة أخرى.",
  fieldRequired: "هذا الحقل مطلوب.",
  tooLong: "النص أطول من {max} حرفًا.",
  urlInvalid: "أدخل رابطًا كاملًا يبدأ بـ https://",
  countryInvalid: "أدخل رمزًا من حرفين لاتينيين، مثل SA.",
  wholeNumber: "أدخل عددًا صحيحًا من {min} إلى {max}.",
  statusInvalid: "اختر حالة من القائمة.",
  serverRejected: "لم يقبل الخادم هذه القيمة.",
}

type AdminCompaniesCopy = typeof ar

const en: AdminCompaniesCopy = {
  title: "Companies",
  intro: "Companies in the Wosool network, as listed in the public company directory.",
  publicNote: "A company is listed in the public directory when its status is “Active” and “Listed in the public directory” is on. Arabic readers see the Arabic text; English readers see the English text.",
  add: "Add company",
  total: "All companies",
  listed: "Listed",
  notListed: "Not listed",
  hiringCount: "Hiring",
  fundraisingCount: "Fundraising",
  searchLabel: "Search companies",
  searchPlaceholder: "Search by name, sector or location",
  search: "Search",
  records: "Company records",
  loading: "Loading companies…",
  loadFailed: "Companies could not be loaded. Try again.",
  retry: "Try again",
  empty: "No companies yet.",
  emptySearch: "No companies match this search.",
  founders: "Founders: {names}",
  listSeparator: ", ",
  missingArabic: "No Arabic name",
  website: "Website",
  openWebsite: "{name} website (opens in a new tab)",
  edit: "Edit {name}",
  remove: "Delete {name}",
  confirmDelete: "Delete {name}? It will be removed from the public company directory.",
  deleted: "Company deleted.",
  deleteFailed: "The company could not be deleted. Try again.",
  addTitle: "Add company",
  editTitle: "Edit company",
  dialogIntro: "Write each field in the language named on it. Leave an Arabic field empty if there is no Arabic text; Arabic readers then see the English text.",
  required: "(required)",
  englishGroup: "English",
  arabicGroup: "Arabic",
  name: "Name (English)",
  nameAr: "Name (Arabic)",
  sector: "Sector (English)",
  sectorAr: "Sector (Arabic)",
  location: "Location (English)",
  locationAr: "Location (Arabic)",
  description: "Description (English)",
  descriptionAr: "Description (Arabic)",
  stage: "Stage",
  stageHint: "For example: seed or series-a",
  status: "Status",
  countryCode: "Country code",
  countryCodeHint: "Two letters, such as SA",
  foundedYear: "Founded year",
  teamSize: "Team size",
  flagsLegend: "Visibility and signals",
  flags: {
    is_public: "Listed in the public directory",
    is_featured: "Featured in the directory",
    is_hiring: "Hiring",
    is_fundraising: "Fundraising",
    is_collaborating: "Open to collaboration",
  },
  statuses: { active: "Active", pending: "Pending review", suspended: "Suspended", archived: "Archived" },
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
  created: "Company added.",
  updated: "Company saved.",
  saveFailed: "The company could not be saved. Try again.",
  saveInvalid: "Check the marked fields and save again.",
  fieldRequired: "This field is required.",
  tooLong: "Use {max} characters or fewer.",
  urlInvalid: "Enter a full URL starting with https://",
  countryInvalid: "Enter a two-letter code, such as SA.",
  wholeNumber: "Enter a whole number from {min} to {max}.",
  statusInvalid: "Choose a status from the list.",
  serverRejected: "The server did not accept this value.",
}

export const adminCompaniesCopy = { ar, en }

export function adminCompanies(locale: Locale): AdminCompaniesCopy {
  return locale === "en" ? en : ar
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export function isCompanyStatus(value: string): value is CompanyStatus {
  return (companyStatuses as readonly string[]).includes(value)
}

/** The status in the administrator's language; an unknown stored code is shown as-is. */
export function companyStatusLabel(locale: Locale, status: string): string {
  return isCompanyStatus(status) ? adminCompanies(locale).statuses[status] : status
}

/** Mirrors the public directory query: active and public. */
export function isListedPublicly(company: Pick<AdminCompany, "status" | "is_public">): boolean {
  return company.status === "active" && Boolean(company.is_public)
}

/** The name to show in the list: the Arabic name for the Arabic admin when one exists. */
export function companyDisplayName(locale: Locale, company: Pick<AdminCompany, "name" | "ar">): string {
  return (locale === "ar" && company.ar?.name) || company.name
}

export function companyDisplayText(locale: Locale, company: AdminCompany, field: "sector" | "location"): string | null {
  return (locale === "ar" && company.ar?.[field]) || company[field] || null
}

export const emptyCompanyForm: CompanyForm = {
  name: "",
  name_ar: "",
  website: "",
  status: "active",
  sector: "",
  sector_ar: "",
  stage: "",
  location: "",
  location_ar: "",
  country_code: "",
  founded_year: "",
  team_size: "",
  description: "",
  description_ar: "",
  is_public: true,
  is_featured: false,
  is_hiring: false,
  is_fundraising: false,
  is_collaborating: false,
}

export function toCompanyForm(company?: AdminCompany | null): CompanyForm {
  if (!company) return { ...emptyCompanyForm }
  const text = (value: string | number | null | undefined) => (value === null || value === undefined ? "" : String(value))
  return {
    name: text(company.name),
    name_ar: text(company.ar?.name),
    website: text(company.website),
    status: company.status || "active",
    sector: text(company.sector),
    sector_ar: text(company.ar?.sector),
    stage: text(company.stage),
    location: text(company.location),
    location_ar: text(company.ar?.location),
    country_code: text(company.country_code),
    founded_year: text(company.founded_year),
    team_size: text(company.team_size),
    description: text(company.description),
    description_ar: text(company.ar?.description),
    is_public: Boolean(company.is_public),
    is_featured: Boolean(company.is_featured),
    is_hiring: Boolean(company.is_hiring),
    is_fundraising: Boolean(company.is_fundraising),
    is_collaborating: Boolean(company.is_collaborating),
  }
}

// Laravel's `max` rule counts characters (code points), not UTF-16 units, so an emoji counts once.
const characterCount = (value: string) => Array.from(value).length

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname)
  } catch {
    return false
  }
}

/** Mirrors the rules in `Admin\CompanyController::validated`, so a bad value is caught before sending. */
export function validateCompanyForm(locale: Locale, form: CompanyForm): CompanyFormErrors {
  const copy = adminCompanies(locale)
  const errors: CompanyFormErrors = {}
  const value = (field: CompanyField) => form[field].trim()

  if (!value("name")) errors.name = copy.fieldRequired
  const maxima: Array<[CompanyField, number]> = [
    ["name", companyLimits.name],
    ["name_ar", companyLimits.name],
    ["website", companyLimits.website],
    ["sector", companyLimits.sector],
    ["sector_ar", companyLimits.sector],
    ["stage", companyLimits.stage],
    ["location", companyLimits.location],
    ["location_ar", companyLimits.location],
  ]
  for (const [field, max] of maxima) {
    if (!errors[field] && characterCount(value(field)) > max) errors[field] = fill(copy.tooLong, { max })
  }
  if (!errors.website && value("website") && !isHttpUrl(value("website"))) errors.website = copy.urlInvalid
  if (value("country_code") && !/^[A-Za-z]{2}$/.test(value("country_code"))) errors.country_code = copy.countryInvalid
  const whole = (field: "founded_year" | "team_size", { min, max }: { min: number; max: number }) => {
    const raw = value(field)
    if (raw && (!/^\d+$/.test(raw) || Number(raw) < min || Number(raw) > max)) errors[field] = fill(copy.wholeNumber, { min, max })
  }
  whole("founded_year", companyLimits.foundedYear)
  whole("team_size", companyLimits.teamSize)
  if (!isCompanyStatus(form.status)) errors.status = copy.statusInvalid
  return errors
}

/** Blank text is sent as null; blank Arabic fields remove that Arabic text. */
export function companyPayload(form: CompanyForm): CompanyPayload {
  const optional = (field: CompanyField) => form[field].trim() || null
  const number = (field: "founded_year" | "team_size") => (form[field].trim() ? Number(form[field].trim()) : null)
  return {
    name: form.name.trim(),
    name_ar: optional("name_ar"),
    description: optional("description"),
    description_ar: optional("description_ar"),
    website: optional("website"),
    sector: optional("sector"),
    sector_ar: optional("sector_ar"),
    stage: optional("stage"),
    location: optional("location"),
    location_ar: optional("location_ar"),
    country_code: optional("country_code")?.toUpperCase() ?? null,
    founded_year: number("founded_year"),
    team_size: number("team_size"),
    status: form.status,
    is_public: form.is_public,
    is_featured: form.is_featured,
    is_hiring: form.is_hiring,
    is_fundraising: form.is_fundraising,
    is_collaborating: form.is_collaborating,
  }
}

/**
 * Laravel 422 errors keyed by field. The API's messages are English only, so each known field gets
 * the page's own message in the administrator's language. A taken slug is reported on the name.
 */
export function companyFieldErrors(errors: unknown, message: string): CompanyFormErrors {
  const result: CompanyFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    if ((companyFields as readonly string[]).includes(key)) result[key as CompanyField] = message
    else if (key === "slug") result.name = message
  }
  return result
}

export function companyFieldId(field: CompanyField | CompanyFlag): string {
  return `company-${field.replace(/_/g, "-")}`
}
