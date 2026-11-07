import { fromCsvLines, toCsvLines, type AdminProgram } from "./admin"
import type { Locale } from "./locale"

/**
 * Copy and form helpers for the administrator programs page (`/admin/programs`).
 *
 * Program start and end times are entered and shown in Riyadh time (UTC+3, no daylight
 * saving), the time members see on `/dashboard/programs`, and sent to the API in UTC.
 */

export const programVisibilities = ["public", "members_only", "founder_only", "invite_only", "application_required"] as const
export const programStatusFlows = ["draft", "pending_review", "published", "applications_open", "applications_closed", "active", "completed", "cancelled", "archived"] as const
export const programFormats = ["online", "in-person", "hybrid", "self-paced", "cohort-based"] as const

export type ProgramForm = {
  name: string
  title: string
  slug: string
  short_description: string
  full_description: string
  program_type: string
  category: string
  tags: string
  visibility: string
  status_flow: string
  objective: string
  who_it_is_for: string
  expected_outcomes: string
  duration: string
  format: string
  language: string
  city_region: string
  capacity: string
  application_deadline: string
  starts_at: string
  ends_at: string
  is_open: boolean
}

export type ProgramFormField = keyof ProgramForm
export type ProgramFormErrors = Partial<Record<ProgramFormField, string>>

const ar = {
  title: "البرامج",
  intro: "أنشئ البرامج وعدّلها، ثم افتح صفحة البرنامج لإدارة الطلبات والدفعات والجلسات.",
  refresh: "تحديث",
  create: "إنشاء برنامج",
  totalPrograms: "إجمالي البرامج",
  openPrograms: "التقديم مفتوح",
  applicants: "إجمالي المتقدمين",
  cohorts: "الدفعات",
  searchLabel: "ابحث باسم البرنامج أو الفئة",
  search: "بحث",
  loading: "جارٍ تحميل البرامج…",
  loadFailed: "تعذر تحميل البرامج. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا توجد برامج بعد. أنشئ أول برنامج.",
  emptySearch: "لا توجد برامج تطابق البحث.",
  open: "مفتوح",
  closed: "مغلق",
  applications: "طلبات",
  cohortsShort: "دفعات",
  manage: "إدارة",
  edit: "تعديل {name}",
  editShort: "تعديل",
  remove: "حذف {name}",
  removeShort: "حذف",
  confirmDelete: "حذف برنامج «{name}»؟ لا يمكن التراجع عن الحذف.",
  deleted: "حُذف البرنامج.",
  deleteFailed: "تعذر حذف البرنامج.",
  created: "أُنشئ البرنامج.",
  updated: "حُدّث البرنامج.",
  saveFailed: "تعذر حفظ البرنامج. راجع الحقول المحددة.",
  dialogCreate: "إنشاء برنامج",
  dialogEdit: "تعديل برنامج",
  dialogDescription: "تظهر هذه البيانات في صفحة البرنامج ولوحات الأعضاء بعد الحفظ.",
  required: "مطلوب",
  name: "اسم البرنامج",
  displayTitle: "عنوان العرض",
  slug: "المعرّف في الرابط",
  slugHint: "اتركه فارغًا ليُنشأ من الاسم.",
  programType: "نوع البرنامج",
  category: "الفئة",
  duration: "المدة",
  visibility: "من يرى البرنامج",
  status: "حالة البرنامج",
  format: "طريقة التقديم",
  cityRegion: "المنطقة أو المدينة",
  capacity: "عدد المقاعد",
  deadline: "آخر موعد للتقديم",
  startsAt: "يبدأ (بتوقيت الرياض)",
  endsAt: "ينتهي (بتوقيت الرياض)",
  tags: "الوسوم",
  tagsHint: "افصل بين الوسوم بفاصلة.",
  shortDescription: "وصف مختصر",
  fullDescription: "وصف تفصيلي",
  objective: "هدف البرنامج",
  whoItIsFor: "لمن هذا البرنامج",
  expectedOutcomes: "المخرجات المتوقعة",
  isOpen: "التقديم مفتوح",
  cancel: "إلغاء",
  save: "حفظ",
  nameRequired: "اكتب اسم البرنامج.",
  categoryRequired: "اكتب فئة البرنامج.",
  capacityInvalid: "اكتب عددًا صحيحًا من 1 فأكثر.",
  endsBeforeStart: "يجب أن يكون الانتهاء بعد البداية أو في نفس الوقت.",
}

type AdminProgramsCopy = typeof ar

const en: AdminProgramsCopy = {
  title: "Programs",
  intro: "Create and edit programs, then open a program to manage its applications, cohorts and sessions.",
  refresh: "Refresh",
  create: "Create program",
  totalPrograms: "Total programs",
  openPrograms: "Open for applications",
  applicants: "Total applicants",
  cohorts: "Cohorts",
  searchLabel: "Search by program name or category",
  search: "Search",
  loading: "Loading programs…",
  loadFailed: "Programs could not be loaded. Try again.",
  retry: "Try again",
  empty: "No programs yet. Create the first one.",
  emptySearch: "No programs match this search.",
  open: "Open",
  closed: "Closed",
  applications: "Applications",
  cohortsShort: "Cohorts",
  manage: "Manage",
  edit: "Edit {name}",
  editShort: "Edit",
  remove: "Delete {name}",
  removeShort: "Delete",
  confirmDelete: "Delete the program “{name}”? This cannot be undone.",
  deleted: "Program deleted.",
  deleteFailed: "The program could not be deleted.",
  created: "Program created.",
  updated: "Program updated.",
  saveFailed: "The program could not be saved. Check the marked fields.",
  dialogCreate: "Create program",
  dialogEdit: "Edit program",
  dialogDescription: "These details appear on the program page and member dashboards once saved.",
  required: "required",
  name: "Program name",
  displayTitle: "Display title",
  slug: "URL slug",
  slugHint: "Leave empty to generate it from the name.",
  programType: "Program type",
  category: "Category",
  duration: "Duration",
  visibility: "Who can see it",
  status: "Program status",
  format: "Format",
  cityRegion: "Region or city",
  capacity: "Seats",
  deadline: "Application deadline",
  startsAt: "Starts (Riyadh time)",
  endsAt: "Ends (Riyadh time)",
  tags: "Tags",
  tagsHint: "Separate tags with commas.",
  shortDescription: "Short description",
  fullDescription: "Full description",
  objective: "Program objective",
  whoItIsFor: "Who it is for",
  expectedOutcomes: "Expected outcomes",
  isOpen: "Open for applications",
  cancel: "Cancel",
  save: "Save",
  nameRequired: "Enter the program name.",
  categoryRequired: "Enter the program category.",
  capacityInvalid: "Enter a whole number of 1 or more.",
  endsBeforeStart: "The end must be at or after the start.",
}

export const adminProgramsCopy = { ar, en }

export function adminPrograms(locale: Locale): AdminProgramsCopy {
  return adminProgramsCopy[locale] ?? ar
}

const optionLabels = {
  ar: {
    visibility: { public: "عام", members_only: "للأعضاء", founder_only: "للمؤسسين", invite_only: "بدعوة", application_required: "يتطلب تقديم" },
    status_flow: { draft: "مسودة", pending_review: "بانتظار المراجعة", published: "منشور", applications_open: "التقديم مفتوح", applications_closed: "التقديم مغلق", active: "نشط", completed: "مكتمل", cancelled: "ملغى", archived: "مؤرشف" },
    format: { online: "عن بُعد", "in-person": "حضوري", hybrid: "حضوري وعن بُعد", "self-paced": "ذاتي", "cohort-based": "بالدفعات" },
  },
  en: {
    visibility: { public: "Public", members_only: "Members only", founder_only: "Founders only", invite_only: "Invitation only", application_required: "Application required" },
    status_flow: { draft: "Draft", pending_review: "Pending review", published: "Published", applications_open: "Applications open", applications_closed: "Applications closed", active: "Active", completed: "Completed", cancelled: "Cancelled", archived: "Archived" },
    format: { online: "Online", "in-person": "In person", hybrid: "Hybrid", "self-paced": "Self-paced", "cohort-based": "Cohort-based" },
  },
} as const

type OptionGroup = keyof (typeof optionLabels)["en"]

/** Label for a visibility, status or format code; an unknown code is shown as-is so it is never hidden. */
export function programOptionLabel(locale: Locale, group: OptionGroup, value: string): string {
  const labels = (optionLabels[locale] ?? optionLabels.ar)[group] as Record<string, string>
  return labels[value] ?? value
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000

/** `datetime-local` value in Riyadh time for an API timestamp; empty for a missing or invalid date. */
export function toRiyadhInput(iso: string | null | undefined): string {
  if (!iso) return ""
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ""
  return new Date(time + RIYADH_OFFSET_MS).toISOString().slice(0, 16)
}

/** UTC ISO timestamp for a `datetime-local` value entered in Riyadh time; null when empty or invalid. */
export function fromRiyadhInput(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const time = new Date(`${value}:00+03:00`).getTime()
  return Number.isNaN(time) ? null : new Date(time).toISOString()
}

export const emptyProgramForm: ProgramForm = {
  name: "",
  title: "",
  slug: "",
  short_description: "",
  full_description: "",
  program_type: "Founder Onboarding Track",
  category: "onboarding",
  tags: "",
  visibility: "members_only",
  status_flow: "draft",
  objective: "",
  who_it_is_for: "",
  expected_outcomes: "",
  duration: "",
  format: "cohort-based",
  language: "ar",
  city_region: "",
  capacity: "",
  application_deadline: "",
  starts_at: "",
  ends_at: "",
  is_open: true,
}

export function toProgramForm(program?: AdminProgram | null): ProgramForm {
  if (!program) return emptyProgramForm
  return {
    ...emptyProgramForm,
    name: program.name || "",
    title: program.title || program.name || "",
    slug: program.slug || "",
    short_description: program.short_description || program.description || "",
    full_description: program.full_description || program.description || "",
    program_type: program.program_type || emptyProgramForm.program_type,
    category: program.category || "",
    tags: toCsvLines(program.tags),
    visibility: program.visibility || emptyProgramForm.visibility,
    status_flow: program.status_flow || emptyProgramForm.status_flow,
    objective: program.objective || "",
    who_it_is_for: program.who_it_is_for || "",
    expected_outcomes: program.expected_outcomes || "",
    duration: program.duration || "",
    format: program.format || emptyProgramForm.format,
    language: program.language || emptyProgramForm.language,
    city_region: program.city_region || "",
    capacity: program.capacity ? String(program.capacity) : "",
    application_deadline: toRiyadhInput(program.application_deadline).slice(0, 10),
    starts_at: toRiyadhInput(program.starts_at),
    ends_at: toRiyadhInput(program.ends_at),
    is_open: Boolean(program.is_open),
  }
}

/** Errors the API would return, checked before sending so each one appears on its field. */
export function validateProgramForm(locale: Locale, form: ProgramForm): ProgramFormErrors {
  const copy = adminPrograms(locale)
  const errors: ProgramFormErrors = {}
  if (!form.name.trim()) errors.name = copy.nameRequired
  if (!form.category.trim()) errors.category = copy.categoryRequired
  if (form.capacity.trim() && !/^[1-9]\d*$/.test(form.capacity.trim())) errors.capacity = copy.capacityInvalid
  const starts = fromRiyadhInput(form.starts_at)
  const ends = fromRiyadhInput(form.ends_at)
  if (starts && ends && ends < starts) errors.ends_at = copy.endsBeforeStart
  return errors
}

export function programPayload(form: ProgramForm) {
  return {
    ...form,
    name: form.name.trim(),
    category: form.category.trim(),
    tags: fromCsvLines(form.tags),
    capacity: form.capacity.trim() ? Number(form.capacity.trim()) : null,
    application_deadline: form.application_deadline || null,
    starts_at: fromRiyadhInput(form.starts_at),
    ends_at: fromRiyadhInput(form.ends_at),
    description: form.short_description,
  }
}

/** Laravel validation errors keyed by form field; list items ("tags.0") fold into their field. */
export function programFieldErrors(errors: unknown, fallback: string): ProgramFormErrors {
  const result: ProgramFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  const fields = new Set<string>(Object.keys(emptyProgramForm))
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const field = key === "description" ? "short_description" : key.split(".")[0]
    if (!fields.has(field) || result[field as ProgramFormField]) continue
    const message = Array.isArray(value) ? value.find((item) => typeof item === "string" && item.trim()) : value
    result[field as ProgramFormField] = typeof message === "string" && message.trim() ? message : fallback
  }
  return result
}

export function programFieldId(field: ProgramFormField): string {
  return `program-${field.replace(/_/g, "-")}`
}
