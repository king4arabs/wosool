import type { AdminNewsItem } from "./admin"
import { dateLocale } from "./date-locale"
import type { Locale } from "./locale"

/**
 * Copy and helpers for the administrator news page (`/admin/news`).
 *
 * The public newsroom lists an article only when it is published, marked public and its publish
 * time has passed (`Api\NewsController::index`). Publish times are entered and shown in Riyadh
 * time (UTC+3, no daylight saving) and sent to the API in UTC. The Arabic title and summary live
 * in the article's `translations`, which this form does not send, so saving keeps them.
 */

export const newsStatuses = ["draft", "published", "archived"] as const
export type NewsStatus = (typeof newsStatuses)[number]
export const newsRegions = ["saudi", "gcc", "mena", "global"] as const
export type NewsRegion = (typeof newsRegions)[number]

export const newsFields = [
  "title",
  "category",
  "author_name",
  "status",
  "published_at",
  "source_url",
  "source_name",
  "image_url",
  "image_credit",
  "region",
  "companies",
  "tags",
  "key_facts",
  "excerpt",
  "content",
] as const
export type NewsField = (typeof newsFields)[number]

export type NewsForm = Record<NewsField, string> & { is_featured: boolean; is_public: boolean }
export type NewsFormErrors = Partial<Record<NewsField, string>>

/** The limits in `Admin\NewsController::validated`. */
export const newsLimits = {
  title: 255,
  excerpt: 1000,
  category: 100,
  author_name: 255,
  image_url: 255,
  source_url: 255,
  source_name: 255,
  image_credit: 255,
  companies: { count: 50, each: 255 },
  tags: { each: 50 },
  key_facts: { count: 8, each: 300 },
} as const

export type NewsPayload = {
  title: string
  excerpt: string
  content: string | null
  category: string
  author_name: string
  image_url: string | null
  source_url: string | null
  source_name: string | null
  image_credit: string | null
  companies: string[]
  tags: string[]
  key_facts: string[]
  region: NewsRegion | null
  status: string
  published_at: string | null
  is_featured: boolean
  is_public: boolean
}

const ar = {
  title: "الأخبار",
  intro: "أخبار غرفة الأخبار ومصادرها وحالة نشرها.",
  publicNote: "يظهر الخبر في غرفة الأخبار العامة فقط إذا كانت حالته «منشور» وكان «عام» محددًا وحلّ وقت نشره. العنوان والملخص العربيان محفوظان مع الخبر ولا يتغيران عند الحفظ من هنا.",
  add: "خبر جديد",
  total: "كل الأخبار",
  featured: "مميز",
  searchLabel: "البحث في الأخبار",
  searchPlaceholder: "ابحث بالعنوان أو التصنيف أو الكاتب",
  search: "بحث",
  records: "الأخبار",
  loading: "جارٍ تحميل الأخبار…",
  loadFailed: "تعذر تحميل الأخبار. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا توجد أخبار بعد.",
  emptySearch: "لا توجد أخبار تطابق هذا البحث.",
  by: "بقلم {name}",
  publishedOn: "النشر: {date}",
  notScheduled: "بلا وقت نشر",
  source: "المصدر: {name}",
  edit: "تعديل {name}",
  remove: "حذف {name}",
  confirmDelete: "حذف «{name}»؟ سيختفي من غرفة الأخبار ولا يمكن التراجع عن ذلك.",
  deleted: "حُذف الخبر.",
  deleteFailed: "تعذر حذف الخبر. حاول مرة أخرى.",
  addTitle: "خبر جديد",
  editTitle: "تعديل الخبر",
  dialogIntro: "اكتب الخبر بالإنجليزية واذكر مصدره. الحقول المطلوبة معلّمة.",
  required: "(مطلوب)",
  titleField: "العنوان",
  category: "التصنيف",
  authorName: "اسم الكاتب",
  status: "الحالة",
  publishedAt: "وقت النشر (بتوقيت الرياض)",
  publishedAtHint: "اتركه فارغًا ليظهر الخبر المنشور فورًا. الوقت المستقبلي يؤجل ظهوره.",
  sourceUrl: "رابط المصدر",
  sourceUrlHint: "رابط كامل يبدأ بـ https://، ولا يتكرر بين الأخبار.",
  sourceName: "اسم المصدر",
  imageUrl: "رابط الصورة",
  imageCredit: "حقوق الصورة",
  region: "المنطقة",
  regionUnset: "غير محددة",
  companies: "الشركات في الخبر",
  companiesHint: "افصل بين الأسماء بفاصلة. حتى 50 شركة.",
  tags: "الوسوم",
  tagsHint: "افصل بين الوسوم بفاصلة. حتى 50 حرفًا لكل وسم.",
  keyFacts: "أبرز الحقائق",
  keyFactsHint: "حقيقة في كل سطر، حتى 8 أسطر. تظهر في «باختصار».",
  excerpt: "الملخص",
  content: "النص الكامل",
  isFeatured: "مميز",
  isPublic: "عام (يمكن عرضه في غرفة الأخبار)",
  cancel: "إلغاء",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  created: "أُضيف الخبر.",
  updated: "حُفظ الخبر.",
  saveFailed: "تعذر حفظ الخبر. حاول مرة أخرى.",
  saveInvalid: "راجع الحقول المحددة ثم احفظ مرة أخرى.",
  fieldRequired: "هذا الحقل مطلوب.",
  tooLong: "النص أطول من {max} حرف.",
  urlInvalid: "أدخل رابطًا كاملًا يبدأ بـ https://",
  httpsRequired: "يجب أن يبدأ رابط المصدر بـ https://",
  dateInvalid: "أدخل تاريخًا ووقتًا صحيحين.",
  optionInvalid: "اختر قيمة من القائمة.",
  tooManyItems: "الحد الأقصى {max}.",
  itemTooLong: "كل عنصر حتى {max} حرف.",
  duplicateItem: "«{name}» مكرر.",
  serverRejected: "لم يقبل الخادم هذه القيمة.",
  sourceTaken: "يوجد خبر آخر بهذا الرابط.",
  scheduled: "مجدول",
  notPublic: "غير عام",
  statuses: { draft: "مسودة", published: "منشور", archived: "مؤرشف" } as Record<NewsStatus, string>,
  regions: { saudi: "السعودية", gcc: "الخليج", mena: "الشرق الأوسط وشمال أفريقيا", global: "عالمي" } as Record<NewsRegion, string>,
}

type AdminNewsCopy = typeof ar

const en: AdminNewsCopy = {
  title: "News",
  intro: "Newsroom stories, their sources and publishing state.",
  publicNote: "A story appears in the public newsroom only when its status is Published, “Public” is checked and its publish time has passed. The Arabic title and summary are stored with the story and are kept when you save here.",
  add: "New story",
  total: "All stories",
  featured: "Featured",
  searchLabel: "Search news",
  searchPlaceholder: "Search by title, category or author",
  search: "Search",
  records: "Stories",
  loading: "Loading stories…",
  loadFailed: "Stories could not be loaded. Try again.",
  retry: "Try again",
  empty: "No stories yet.",
  emptySearch: "No stories match this search.",
  by: "By {name}",
  publishedOn: "Publishes: {date}",
  notScheduled: "No publish time",
  source: "Source: {name}",
  edit: "Edit {name}",
  remove: "Delete {name}",
  confirmDelete: "Delete “{name}”? It will be removed from the newsroom and this cannot be undone.",
  deleted: "Story deleted.",
  deleteFailed: "The story could not be deleted. Try again.",
  addTitle: "New story",
  editTitle: "Edit story",
  dialogIntro: "Write the story in English and name its source. Required fields are marked.",
  required: "(required)",
  titleField: "Title",
  category: "Category",
  authorName: "Author name",
  status: "Status",
  publishedAt: "Publish time (Riyadh time)",
  publishedAtHint: "Leave empty to show a published story straight away. A future time delays it.",
  sourceUrl: "Source URL",
  sourceUrlHint: "A full https:// link, not used by another story.",
  sourceName: "Source name",
  imageUrl: "Image URL",
  imageCredit: "Image credit",
  region: "Region",
  regionUnset: "Not set",
  companies: "Companies in the story",
  companiesHint: "Separate names with commas. Up to 50 companies.",
  tags: "Tags",
  tagsHint: "Separate tags with commas. Up to 50 characters each.",
  keyFacts: "Key facts",
  keyFactsHint: "One fact per line, up to 8. Shown as “At a glance”.",
  excerpt: "Summary",
  content: "Full text",
  isFeatured: "Featured",
  isPublic: "Public (can be shown in the newsroom)",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
  created: "Story added.",
  updated: "Story saved.",
  saveFailed: "The story could not be saved. Try again.",
  saveInvalid: "Check the marked fields and save again.",
  fieldRequired: "This field is required.",
  tooLong: "Use {max} characters or fewer.",
  urlInvalid: "Enter a full URL starting with https://",
  httpsRequired: "The source URL must start with https://",
  dateInvalid: "Enter a valid date and time.",
  optionInvalid: "Choose a value from the list.",
  tooManyItems: "Use at most {max}.",
  itemTooLong: "Keep each item to {max} characters or fewer.",
  duplicateItem: "“{name}” is listed twice.",
  serverRejected: "The server did not accept this value.",
  sourceTaken: "Another story already uses this link.",
  scheduled: "Scheduled",
  notPublic: "Not public",
  statuses: { draft: "Draft", published: "Published", archived: "Archived" },
  regions: { saudi: "Saudi Arabia", gcc: "GCC", mena: "MENA", global: "Global" },
}

export const adminNewsCopy = { ar, en }

export function adminNews(locale: Locale): AdminNewsCopy {
  return locale === "en" ? en : ar
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

export function isNewsStatus(value: string): value is NewsStatus {
  return (newsStatuses as readonly string[]).includes(value)
}

export function isNewsRegion(value: string): value is NewsRegion {
  return (newsRegions as readonly string[]).includes(value)
}

/** The status in the administrator's language; an unknown stored code is shown as-is. */
export function newsStatusLabel(locale: Locale, status: string): string {
  return isNewsStatus(status) ? adminNews(locale).statuses[status] : status
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

/** Splits a comma list typed by the administrator. */
export function splitList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean)
}

type StoredLists = Pick<AdminNewsItem, "companies" | "tags">

/**
 * The list to save for a comma field. A stored list the administrator left untouched is kept
 * exactly as stored, so a name or tag that itself contains a comma (Latin or Arabic) is never
 * split by an unrelated edit; only text that was changed is re-parsed.
 */
export function listValue(text: string, stored?: string[] | null): string[] {
  if (stored && text === stored.join(", ")) return [...stored]
  return splitList(text)
}

export function splitLines(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean)
}

export const emptyNewsForm: NewsForm = {
  title: "",
  category: "",
  author_name: "Wosool Team",
  status: "draft",
  published_at: "",
  source_url: "",
  source_name: "",
  image_url: "",
  image_credit: "",
  region: "",
  companies: "",
  tags: "",
  key_facts: "",
  excerpt: "",
  content: "",
  is_featured: false,
  is_public: true,
}

export function toNewsForm(article?: AdminNewsItem | null): NewsForm {
  if (!article) return { ...emptyNewsForm }
  return {
    title: article.title ?? "",
    category: article.category ?? "",
    author_name: article.author_name ?? "",
    status: article.status ?? "draft",
    published_at: toRiyadhInput(article.published_at),
    source_url: article.source_url ?? "",
    source_name: article.source_name ?? "",
    image_url: article.image_url ?? "",
    image_credit: article.image_credit ?? "",
    region: article.region ?? "",
    companies: (article.companies ?? []).join(", "),
    tags: (article.tags ?? []).join(", "),
    key_facts: (article.key_facts ?? []).join("\n"),
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    is_featured: Boolean(article.is_featured),
    is_public: Boolean(article.is_public),
  }
}

// Laravel's `max` rule counts characters (code points), not UTF-16 units, so an emoji counts once.
const characterCount = (value: string) => Array.from(value).length

function urlProtocol(value: string): string | null {
  try {
    const url = new URL(value)
    return url.hostname ? url.protocol : null
  } catch {
    return null
  }
}

/** Mirrors the rules in `Admin\NewsController::validated`, so a bad value is caught before sending. */
export function validateNewsForm(locale: Locale, form: NewsForm, stored?: StoredLists | null): NewsFormErrors {
  const copy = adminNews(locale)
  const errors: NewsFormErrors = {}
  const value = (field: NewsField) => form[field].trim()

  for (const field of ["title", "excerpt", "category", "author_name"] as const) {
    if (!value(field)) errors[field] = copy.fieldRequired
  }
  for (const field of ["title", "excerpt", "category", "author_name", "image_url", "source_url", "source_name", "image_credit"] as const) {
    if (!errors[field] && characterCount(value(field)) > newsLimits[field]) errors[field] = fill(copy.tooLong, { max: newsLimits[field] })
  }
  if (!errors.image_url && value("image_url") && !["https:", "http:"].includes(urlProtocol(value("image_url")) ?? "")) {
    errors.image_url = copy.urlInvalid
  }
  if (!errors.source_url && value("source_url")) {
    const protocol = urlProtocol(value("source_url"))
    if (protocol !== "https:") errors.source_url = protocol === "http:" ? copy.httpsRequired : copy.urlInvalid
  }
  if (!isNewsStatus(form.status)) errors.status = copy.optionInvalid
  if (form.region && !isNewsRegion(form.region)) errors.region = copy.optionInvalid
  if (value("published_at") && !fromRiyadhInput(value("published_at"))) errors.published_at = copy.dateInvalid

  const companies = listValue(form.companies, stored?.companies)
  const duplicate = companies.find((name, index) => companies.indexOf(name) !== index)
  if (companies.length > newsLimits.companies.count) errors.companies = fill(copy.tooManyItems, { max: newsLimits.companies.count })
  else if (companies.some((name) => characterCount(name) > newsLimits.companies.each)) errors.companies = fill(copy.itemTooLong, { max: newsLimits.companies.each })
  else if (duplicate) errors.companies = fill(copy.duplicateItem, { name: duplicate })

  if (listValue(form.tags, stored?.tags).some((tag) => characterCount(tag) > newsLimits.tags.each)) errors.tags = fill(copy.itemTooLong, { max: newsLimits.tags.each })

  const facts = splitLines(form.key_facts)
  if (facts.length > newsLimits.key_facts.count) errors.key_facts = fill(copy.tooManyItems, { max: newsLimits.key_facts.count })
  else if (facts.some((fact) => characterCount(fact) > newsLimits.key_facts.each)) errors.key_facts = fill(copy.itemTooLong, { max: newsLimits.key_facts.each })
  return errors
}

export function newsPayload(form: NewsForm, stored?: StoredLists | null): NewsPayload {
  const optional = (field: NewsField) => form[field].trim() || null
  return {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    content: optional("content"),
    category: form.category.trim(),
    author_name: form.author_name.trim(),
    image_url: optional("image_url"),
    source_url: optional("source_url"),
    source_name: optional("source_name"),
    image_credit: optional("image_credit"),
    companies: listValue(form.companies, stored?.companies),
    tags: listValue(form.tags, stored?.tags),
    key_facts: splitLines(form.key_facts),
    region: isNewsRegion(form.region) ? form.region : null,
    status: form.status,
    published_at: fromRiyadhInput(form.published_at.trim()),
    is_featured: form.is_featured,
    is_public: form.is_public,
  }
}

/**
 * Laravel 422 errors keyed by field (array items such as `companies.2` land on their list). The
 * API's messages are English only, so each known field gets the page's own message.
 */
export function newsFieldErrors(locale: Locale, errors: unknown): NewsFormErrors {
  const copy = adminNews(locale)
  const result: NewsFormErrors = {}
  if (!errors || typeof errors !== "object") return result
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    const field = key.split(".")[0]
    if (!(newsFields as readonly string[]).includes(field)) continue
    const messages = (errors as Record<string, unknown>)[key]
    const taken = field === "source_url" && Array.isArray(messages) && messages.some((message) => /already been taken/i.test(String(message)))
    result[field as NewsField] = taken ? copy.sourceTaken : copy.serverRejected
  }
  return result
}

export function newsFieldId(field: NewsField | "is_featured" | "is_public"): string {
  return `news-${field.replace(/_/g, "-")}`
}

/** True when a published story's publish time is still in the future, so the newsroom hides it. */
export function isScheduled(article: Pick<AdminNewsItem, "status" | "published_at">, now = Date.now()): boolean {
  if (article.status !== "published" || !article.published_at) return false
  const time = new Date(article.published_at).getTime()
  return !Number.isNaN(time) && time > now
}

/** Publish time in Riyadh time in the administrator's language, e.g. "14 Nov 2026, 09:00". */
export function newsPublishTime(locale: Locale, iso: string | null | undefined): string | null {
  if (!iso) return null
  const time = new Date(iso)
  if (Number.isNaN(time.getTime())) return null
  return new Intl.DateTimeFormat(dateLocale(locale === "ar"), {
    timeZone: "Asia/Riyadh",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(time)
}
