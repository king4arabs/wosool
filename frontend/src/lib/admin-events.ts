import { fromCsvLines, toCsvLines, type AdminEvent } from "./admin"
import { dateLocale } from "./date-locale"
import { eventLocalInput, parseEventDate } from "./event-time"
import type { Locale } from "./locale"

/**
 * Copy and form helpers for the administrator events page (`/admin/events`).
 *
 * Start, end and registration-deadline times are wall-clock times in the event's own time
 * zone (Riyadh by default). The page sends them as typed with that time zone, and
 * `Admin\EventController::validated` converts them to UTC, so nothing here shifts them.
 */

export const DEFAULT_EVENT_TIMEZONE = "Asia/Riyadh"

/** Same list and order as `Admin\EventController::EVENT_TYPES`. */
export const eventTypes = [
  "Wosool Event",
  "Founder Circle",
  "Founder Dinner",
  "Founder-led Session",
  "Office Hours",
  "Workshop",
  "Demo Day",
  "Partner Event",
  "Sponsor Event",
  "Public Ecosystem Event",
  "Webinar",
  "Networking Event",
  "Wellness Session",
  "Private Roundtable",
  "Investor Session",
] as const

/**
 * Early events were stored with short type codes (see the `create_events_table` migration) that
 * the API no longer accepts. The editor opens them on the matching current type so they can be
 * saved; any other unknown code is shown as stored and the API reports it on the type field.
 */
const legacyEventTypes: Record<string, (typeof eventTypes)[number]> = {
  wosool: "Wosool Event",
  partner: "Partner Event",
  sponsor: "Sponsor Event",
  public: "Public Ecosystem Event",
}

export function currentEventType(type: string | null | undefined): string {
  if (!type) return "Wosool Event"
  return legacyEventTypes[type] ?? type
}

export const eventFormats = ["in-person", "virtual"] as const
export const eventModes = ["in-person", "online", "hybrid"] as const
export const eventStatuses = ["draft", "pending_approval", "upcoming", "live", "completed", "cancelled", "hidden"] as const
export const eventStatusFlows = ["draft", "pending_review", "published", "registration_closed", "live_now", "completed", "cancelled", "archived"] as const
export const eventOrganizerTypes = ["wosool", "founder", "partner", "sponsor", "external_ecosystem"] as const
export const eventVisibilities = ["public", "members_only", "founder_only", "invite_only", "circle_only"] as const

export type EventForm = {
  title: string
  slug: string
  description: string
  short_description: string
  full_description: string
  starts_at: string
  ends_at: string
  registration_deadline: string
  timezone: string
  location: string
  venue_name: string
  city: string
  country: string
  google_maps_url: string
  type: string
  category: string
  format: string
  mode: string
  virtual_link: string
  online_meeting_url: string
  cover_image_url: string
  gallery_images: string
  max_attendees: string
  capacity_limit: string
  organizer_type: string
  organizer_name: string
  visibility: string
  status: string
  status_flow: string
  is_public: boolean
  requires_rsvp: boolean
  waitlist_enabled: boolean
  rsvp_required: boolean
  allow_public_registration: boolean
  allow_guest_registration: boolean
  requires_approval: boolean
  auto_approve_trusted_members: boolean
  targeting_rules: string
  ai_settings: string
  rsvp_settings: string
  tags: string
}

export type EventFormField = keyof EventForm
export type EventFormErrors = Partial<Record<EventFormField, string>>

const ar = {
  title: "الفعاليات",
  intro: "أنشئ الفعاليات وعدّلها، ثم افتح صفحة الفعالية لإدارة التسجيلات والبرنامج والمتحدثين.",
  refresh: "تحديث",
  create: "إنشاء فعالية",
  totalEvents: "إجمالي الفعاليات",
  upcomingEvents: "الفعاليات القادمة",
  inPersonEvents: "الفعاليات الحضورية",
  totalRsvps: "إجمالي التسجيلات",
  searchLabel: "ابحث بعنوان الفعالية أو موقعها",
  search: "بحث",
  loading: "جارٍ تحميل الفعاليات…",
  loadFailed: "تعذر تحميل الفعاليات. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا توجد فعاليات بعد. أنشئ أول فعالية.",
  emptySearch: "لا توجد فعاليات تطابق البحث.",
  allEvents: "كل الفعاليات ({count})",
  upcomingCount: "{count} قادمة",
  columnEvent: "الفعالية",
  columnDate: "الموعد",
  columnFormat: "الشكل",
  columnRsvps: "التسجيلات",
  columnActions: "الإجراءات",
  manage: "إدارة",
  edit: "تعديل {name}",
  editShort: "تعديل",
  remove: "حذف {name}",
  removeShort: "حذف",
  confirmDelete: "حذف فعالية «{name}»؟ ستختفي من صفحة الفعاليات ومن هذه القائمة.",
  deleted: "حُذفت الفعالية.",
  deleteFailed: "تعذر حذف الفعالية.",
  created: "أُنشئت الفعالية.",
  updated: "حُدّثت الفعالية.",
  saveFailed: "تعذر حفظ الفعالية. حاول مرة أخرى.",
  saveInvalid: "تعذر حفظ الفعالية. راجع الحقول المحددة.",
  dialogCreate: "إنشاء فعالية",
  dialogEdit: "تعديل فعالية",
  dialogDescription: "تظهر الفعالية في صفحة الفعاليات حسب حالتها ومن يمكنه رؤيتها بعد الحفظ.",
  sectionBasics: "الأساسيات",
  sectionSchedule: "الموعد",
  sectionPlace: "المكان والرابط",
  sectionAudience: "الحالة ومن يراها",
  sectionRegistration: "التسجيل",
  sectionDescriptions: "الوصف",
  sectionAdvanced: "إعدادات متقدمة (JSON)",
  required: "مطلوب",
  eventTitle: "عنوان الفعالية",
  slug: "المعرّف في الرابط",
  slugHint: "اتركه فارغًا ليُنشأ من العنوان.",
  type: "نوع الفعالية",
  category: "الفئة",
  startsAt: "تبدأ",
  endsAt: "تنتهي",
  registrationDeadline: "آخر موعد للتسجيل",
  timezone: "المنطقة الزمنية",
  timezoneHint: "تُفهم الأوقات بهذه المنطقة. الافتراضي Asia/Riyadh (توقيت الرياض).",
  location: "الموقع كما يظهر للزوار",
  venueName: "اسم المكان",
  city: "المدينة",
  country: "الدولة",
  googleMapsUrl: "رابط خرائط Google",
  format: "الشكل",
  mode: "طريقة الحضور",
  virtualLink: "رابط البث",
  onlineMeetingUrl: "رابط الاجتماع",
  coverImageUrl: "رابط صورة الغلاف",
  galleryImages: "روابط صور المعرض",
  listHint: "افصل بين القيم بفاصلة.",
  maxAttendees: "الحد الأقصى للحضور",
  capacityLimit: "سعة المكان",
  status: "حالة الفعالية",
  statusFlow: "مرحلة النشر",
  organizerType: "الجهة المنظمة",
  organizerName: "اسم المنظم",
  visibility: "من يرى الفعالية",
  tags: "الوسوم",
  shortDescription: "وصف مختصر",
  shortDescriptionHint: "حتى 500 حرف، يظهر في بطاقة الفعالية.",
  description: "وصف الفعالية",
  fullDescription: "وصف تفصيلي",
  targetingRules: "قواعد الاستهداف",
  aiSettings: "إعدادات اقتراحات التواصل",
  rsvpSettings: "إعدادات التسجيل",
  jsonHint: "كائن JSON، مثل {\"key\": \"value\"}. اتركه فارغًا إن لم تحتجه.",
  isPublic: "فعالية عامة",
  requiresRsvp: "يتطلب التسجيل",
  waitlistEnabled: "تفعيل قائمة الانتظار",
  requiresApproval: "يتطلب موافقة على كل تسجيل",
  cancel: "إلغاء",
  save: "حفظ",
  titleRequired: "اكتب عنوان الفعالية.",
  locationRequired: "اكتب موقع الفعالية، أو «عن بُعد» للفعاليات الافتراضية.",
  startsRequired: "اختر موعد البداية.",
  dateInvalid: "اكتب التاريخ والوقت كاملين.",
  endsBeforeStart: "يجب أن يكون الانتهاء بعد البداية أو في نفس الوقت.",
  deadlineAfterStart: "يجب أن يكون آخر موعد للتسجيل قبل البداية أو عندها.",
  timezoneInvalid: "اكتب منطقة زمنية صحيحة مثل Asia/Riyadh.",
  urlInvalid: "اكتب رابطًا كاملًا يبدأ بـ https://.",
  numberInvalid: "اكتب عددًا صحيحًا من 1 إلى 100000.",
  shortDescriptionTooLong: "الوصف المختصر أطول من 500 حرف.",
  jsonInvalid: "اكتب JSON صحيحًا بين { } أو [ ]، أو اترك الحقل فارغًا.",
}

type AdminEventsCopy = typeof ar

const en: AdminEventsCopy = {
  title: "Events",
  intro: "Create and edit events, then open an event to manage its registrations, agenda and speakers.",
  refresh: "Refresh",
  create: "Create event",
  totalEvents: "Total events",
  upcomingEvents: "Upcoming events",
  inPersonEvents: "In-person events",
  totalRsvps: "Total registrations",
  searchLabel: "Search by event title or location",
  search: "Search",
  loading: "Loading events…",
  loadFailed: "Events could not be loaded. Try again.",
  retry: "Try again",
  empty: "No events yet. Create the first one.",
  emptySearch: "No events match this search.",
  allEvents: "All events ({count})",
  upcomingCount: "{count} upcoming",
  columnEvent: "Event",
  columnDate: "When",
  columnFormat: "Format",
  columnRsvps: "Registrations",
  columnActions: "Actions",
  manage: "Manage",
  edit: "Edit {name}",
  editShort: "Edit",
  remove: "Delete {name}",
  removeShort: "Delete",
  confirmDelete: "Delete the event “{name}”? It will disappear from the events page and from this list.",
  deleted: "Event deleted.",
  deleteFailed: "The event could not be deleted.",
  created: "Event created.",
  updated: "Event updated.",
  saveFailed: "The event could not be saved. Try again.",
  saveInvalid: "The event could not be saved. Check the marked fields.",
  dialogCreate: "Create event",
  dialogEdit: "Edit event",
  dialogDescription: "Once saved, the event appears on the events page according to its status and who can see it.",
  sectionBasics: "Basics",
  sectionSchedule: "Date and time",
  sectionPlace: "Place and links",
  sectionAudience: "Status and audience",
  sectionRegistration: "Registration",
  sectionDescriptions: "Description",
  sectionAdvanced: "Advanced settings (JSON)",
  required: "required",
  eventTitle: "Event title",
  slug: "URL slug",
  slugHint: "Leave empty to generate it from the title.",
  type: "Event type",
  category: "Category",
  startsAt: "Starts",
  endsAt: "Ends",
  registrationDeadline: "Registration deadline",
  timezone: "Time zone",
  timezoneHint: "Times are read in this zone. The default is Asia/Riyadh (Riyadh time).",
  location: "Location shown to visitors",
  venueName: "Venue name",
  city: "City",
  country: "Country",
  googleMapsUrl: "Google Maps link",
  format: "Format",
  mode: "Attendance",
  virtualLink: "Stream link",
  onlineMeetingUrl: "Meeting link",
  coverImageUrl: "Cover image link",
  galleryImages: "Gallery image links",
  listHint: "Separate values with commas.",
  maxAttendees: "Maximum attendees",
  capacityLimit: "Venue capacity",
  status: "Event status",
  statusFlow: "Publishing stage",
  organizerType: "Organizer",
  organizerName: "Organizer name",
  visibility: "Who can see it",
  tags: "Tags",
  shortDescription: "Short description",
  shortDescriptionHint: "Up to 500 characters, shown on the event card.",
  description: "Event description",
  fullDescription: "Full description",
  targetingRules: "Targeting rules",
  aiSettings: "Introduction suggestion settings",
  rsvpSettings: "Registration settings",
  jsonHint: "A JSON object, such as {\"key\": \"value\"}. Leave empty if not needed.",
  isPublic: "Public event",
  requiresRsvp: "Registration required",
  waitlistEnabled: "Waitlist on",
  requiresApproval: "Each registration needs approval",
  cancel: "Cancel",
  save: "Save",
  titleRequired: "Enter the event title.",
  locationRequired: "Enter the event location, or “Online” for a virtual event.",
  startsRequired: "Choose the start date and time.",
  dateInvalid: "Enter the full date and time.",
  endsBeforeStart: "The end must be at or after the start.",
  deadlineAfterStart: "The registration deadline must be at or before the start.",
  timezoneInvalid: "Enter a valid time zone, such as Asia/Riyadh.",
  urlInvalid: "Enter a full link starting with https://.",
  numberInvalid: "Enter a whole number from 1 to 100000.",
  shortDescriptionTooLong: "The short description is longer than 500 characters.",
  jsonInvalid: "Enter valid JSON inside { } or [ ], or leave the field empty.",
}

export const adminEventsCopy = { ar, en }

export function adminEvents(locale: Locale): AdminEventsCopy {
  return adminEventsCopy[locale] ?? ar
}

const optionLabels = {
  ar: {
    type: {
      "Wosool Event": "فعالية وصول",
      "Founder Circle": "دائرة مؤسسين",
      "Founder Dinner": "عشاء مؤسسين",
      "Founder-led Session": "جلسة يقودها مؤسس",
      "Office Hours": "ساعات مكتبية",
      Workshop: "ورشة عمل",
      "Demo Day": "يوم العروض",
      "Partner Event": "فعالية شريك",
      "Sponsor Event": "فعالية راعٍ",
      "Public Ecosystem Event": "فعالية عامة في المنظومة",
      Webinar: "ندوة عبر الإنترنت",
      "Networking Event": "فعالية تعارف",
      "Wellness Session": "جلسة عافية",
      "Private Roundtable": "طاولة مستديرة خاصة",
      "Investor Session": "جلسة مستثمرين",
    },
    format: { "in-person": "حضوري", virtual: "افتراضي" },
    mode: { "in-person": "حضوري", online: "عن بُعد", hybrid: "حضوري وعن بُعد" },
    status: { draft: "مسودة", pending_approval: "بانتظار الموافقة", upcoming: "قادمة", live: "جارية الآن", completed: "انتهت", cancelled: "ملغاة", hidden: "مخفية" },
    status_flow: { draft: "مسودة", pending_review: "بانتظار المراجعة", published: "منشورة", registration_closed: "التسجيل مغلق", live_now: "جارية الآن", completed: "انتهت", cancelled: "ملغاة", archived: "مؤرشفة" },
    organizer_type: { wosool: "وصول", founder: "مؤسس", partner: "شريك", sponsor: "راعٍ", external_ecosystem: "جهة خارجية" },
    visibility: { public: "الجميع", members_only: "الأعضاء فقط", founder_only: "المؤسسون فقط", invite_only: "بدعوة فقط", circle_only: "دائرة محددة" },
  },
  en: {
    type: Object.fromEntries(eventTypes.map((value) => [value, value])) as Record<(typeof eventTypes)[number], string>,
    format: { "in-person": "In person", virtual: "Virtual" },
    mode: { "in-person": "In person", online: "Online", hybrid: "Hybrid" },
    status: { draft: "Draft", pending_approval: "Pending approval", upcoming: "Upcoming", live: "Live now", completed: "Completed", cancelled: "Cancelled", hidden: "Hidden" },
    status_flow: { draft: "Draft", pending_review: "Pending review", published: "Published", registration_closed: "Registration closed", live_now: "Live now", completed: "Completed", cancelled: "Cancelled", archived: "Archived" },
    organizer_type: { wosool: "Wosool", founder: "Founder", partner: "Partner", sponsor: "Sponsor", external_ecosystem: "External organization" },
    visibility: { public: "Everyone", members_only: "Members only", founder_only: "Founders only", invite_only: "Invitation only", circle_only: "A specific circle" },
  },
} as const

export type EventOptionGroup = keyof (typeof optionLabels)["en"]

/** Label for an option code; an unknown code is shown as-is so it is never hidden. */
export function eventOptionLabel(locale: Locale, group: EventOptionGroup, value: string): string {
  const labels = (optionLabels[locale] ?? optionLabels.ar)[group] as Record<string, string>
  return labels[value] ?? value
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export const emptyEventForm: EventForm = {
  title: "",
  slug: "",
  description: "",
  short_description: "",
  full_description: "",
  starts_at: "",
  ends_at: "",
  registration_deadline: "",
  timezone: DEFAULT_EVENT_TIMEZONE,
  location: "",
  venue_name: "",
  city: "",
  country: "",
  google_maps_url: "",
  type: "Wosool Event",
  category: "",
  format: "in-person",
  mode: "in-person",
  virtual_link: "",
  online_meeting_url: "",
  cover_image_url: "",
  gallery_images: "",
  max_attendees: "",
  capacity_limit: "",
  organizer_type: "wosool",
  organizer_name: "",
  visibility: "public",
  status: "draft",
  status_flow: "draft",
  is_public: true,
  requires_rsvp: true,
  waitlist_enabled: true,
  rsvp_required: true,
  allow_public_registration: true,
  allow_guest_registration: false,
  requires_approval: false,
  auto_approve_trusted_members: true,
  targeting_rules: "",
  ai_settings: "",
  rsvp_settings: "",
  tags: "",
}

const json = (value: unknown) => (value && typeof value === "object" && Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : "")

export function toEventForm(event?: AdminEvent | null): EventForm {
  if (!event) return emptyEventForm
  const timezone = validTimezone(event.timezone || "") ? event.timezone! : DEFAULT_EVENT_TIMEZONE
  return {
    ...emptyEventForm,
    title: event.title || "",
    slug: event.slug || "",
    description: event.description || "",
    short_description: event.short_description || "",
    full_description: event.full_description || event.description || "",
    starts_at: eventLocalInput(event.starts_at, timezone),
    ends_at: eventLocalInput(event.ends_at, timezone),
    registration_deadline: eventLocalInput(event.registration_deadline, timezone),
    timezone,
    location: event.location || "",
    venue_name: event.venue_name || "",
    city: event.city || "",
    country: event.country || "",
    google_maps_url: event.google_maps_url || "",
    type: currentEventType(event.type),
    category: event.category || "",
    format: event.format || emptyEventForm.format,
    mode: event.mode || (event.format === "virtual" ? "online" : "in-person"),
    virtual_link: event.virtual_link || "",
    online_meeting_url: event.online_meeting_url || "",
    cover_image_url: event.cover_image_url || event.image_url || "",
    gallery_images: toCsvLines(event.gallery_images),
    max_attendees: event.max_attendees ? String(event.max_attendees) : "",
    capacity_limit: event.capacity_limit ? String(event.capacity_limit) : "",
    organizer_type: event.organizer_type || emptyEventForm.organizer_type,
    organizer_name: event.organizer_name || "",
    visibility: event.visibility || emptyEventForm.visibility,
    status: event.status || emptyEventForm.status,
    status_flow: event.status_flow || emptyEventForm.status_flow,
    is_public: Boolean(event.is_public),
    requires_rsvp: Boolean(event.requires_rsvp),
    waitlist_enabled: event.waitlist_enabled ?? true,
    rsvp_required: event.rsvp_required ?? true,
    allow_public_registration: event.allow_public_registration ?? true,
    allow_guest_registration: event.allow_guest_registration ?? false,
    requires_approval: event.requires_approval ?? false,
    auto_approve_trusted_members: event.auto_approve_trusted_members ?? true,
    targeting_rules: json(event.targeting_rules),
    ai_settings: json(event.ai_settings),
    rsvp_settings: json(event.rsvp_settings),
    tags: toCsvLines(event.tags),
  }
}

export function validTimezone(value: string): boolean {
  if (!value.trim()) return false
  try {
    new Intl.DateTimeFormat("en", { timeZone: value.trim() })
    return true
  } catch {
    return false
  }
}

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const jsonFields = ["targeting_rules", "ai_settings", "rsvp_settings"] as const
const urlFields = ["google_maps_url", "virtual_link", "online_meeting_url", "cover_image_url"] as const
const countFields = ["max_attendees", "capacity_limit"] as const

/** A JSON object or list (the API accepts either); null for empty text, undefined when invalid. */
export function parseJsonObject(text: string): Record<string, unknown> | unknown[] | null | undefined {
  if (!text.trim()) return null
  try {
    const value: unknown = JSON.parse(text)
    return value && typeof value === "object" ? (value as Record<string, unknown> | unknown[]) : undefined
  } catch {
    return undefined
  }
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname)
  } catch {
    return false
  }
}

/** Errors the API would return, checked before sending so each one appears on its field. */
export function validateEventForm(locale: Locale, form: EventForm): EventFormErrors {
  const copy = adminEvents(locale)
  const errors: EventFormErrors = {}
  if (!form.title.trim()) errors.title = copy.titleRequired
  if (!form.location.trim()) errors.location = copy.locationRequired
  if (!form.starts_at) errors.starts_at = copy.startsRequired
  for (const field of ["starts_at", "ends_at", "registration_deadline"] as const) {
    if (form[field] && !LOCAL_DATETIME.test(form[field])) errors[field] = copy.dateInvalid
  }
  // Both values are wall-clock times in the same zone, so they compare as text.
  if (!errors.starts_at && !errors.ends_at && form.starts_at && form.ends_at && form.ends_at < form.starts_at) errors.ends_at = copy.endsBeforeStart
  if (!errors.starts_at && !errors.registration_deadline && form.starts_at && form.registration_deadline && form.registration_deadline > form.starts_at) {
    errors.registration_deadline = copy.deadlineAfterStart
  }
  if (form.timezone.trim() && !validTimezone(form.timezone)) errors.timezone = copy.timezoneInvalid
  for (const field of urlFields) if (form[field].trim() && !validUrl(form[field].trim())) errors[field] = copy.urlInvalid
  for (const field of countFields) {
    const value = form[field].trim()
    if (value && (!/^[1-9]\d*$/.test(value) || Number(value) > 100000)) errors[field] = copy.numberInvalid
  }
  if (form.short_description.trim().length > 500) errors.short_description = copy.shortDescriptionTooLong
  for (const field of jsonFields) if (parseJsonObject(form[field]) === undefined) errors[field] = copy.jsonInvalid
  return errors
}

/** Request body for `POST/PUT /admin/events`; call only after `validateEventForm` passes. */
export function eventPayload(form: EventForm) {
  const text = (value: string) => value.trim() || null
  const count = (value: string) => (value.trim() ? Number(value.trim()) : null)
  return {
    ...form,
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    location: form.location.trim(),
    timezone: form.timezone.trim() || DEFAULT_EVENT_TIMEZONE,
    ends_at: form.ends_at || null,
    registration_deadline: form.registration_deadline || null,
    google_maps_url: text(form.google_maps_url),
    virtual_link: text(form.virtual_link),
    online_meeting_url: text(form.online_meeting_url),
    cover_image_url: text(form.cover_image_url),
    gallery_images: fromCsvLines(form.gallery_images),
    max_attendees: count(form.max_attendees),
    capacity_limit: count(form.capacity_limit),
    targeting_rules: parseJsonObject(form.targeting_rules) ?? {},
    ai_settings: parseJsonObject(form.ai_settings) ?? {},
    rsvp_settings: parseJsonObject(form.rsvp_settings) ?? {},
    tags: fromCsvLines(form.tags),
  }
}

/** Laravel validation errors keyed by form field; list items ("tags.0") fold into their field. */
export function eventFieldErrors(errors: unknown, fallback: string): EventFormErrors {
  const result: EventFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  const fields = new Set<string>(Object.keys(emptyEventForm))
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const field = key === "image_url" ? "cover_image_url" : key.split(".")[0]
    if (!fields.has(field) || result[field as EventFormField]) continue
    const message = Array.isArray(value) ? value.find((item) => typeof item === "string" && item.trim()) : value
    result[field as EventFormField] = typeof message === "string" && message.trim() ? message : fallback
  }
  return result
}

export function eventFieldId(field: EventFormField): string {
  return `event-${field.replace(/_/g, "-")}`
}

/**
 * Start date and time in the event's own time zone and the administrator's language, so the
 * list matches the times entered in the editor whatever the administrator's device zone is.
 * The zone is named when it is not Riyadh time.
 */
export function eventStartLabel(locale: Locale, event: Pick<AdminEvent, "starts_at" | "timezone">): { date: string; time: string } | null {
  const instant = parseEventDate(event.starts_at)
  if (!Number.isFinite(instant)) return null
  const timeZone = validTimezone(event.timezone || "") ? event.timezone! : DEFAULT_EVENT_TIMEZONE
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(dateLocale(locale === "ar"), { timeZone, ...options }).format(instant)
  const time = format({ hour: "2-digit", minute: "2-digit", hour12: false })
  return {
    date: format({ day: "numeric", month: "short", year: "numeric" }),
    time: timeZone === DEFAULT_EVENT_TIMEZONE ? time : `${time} (${timeZone})`,
  }
}
