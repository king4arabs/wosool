import { dateLocale } from "./date-locale"
import type { Locale } from "./locale"

/**
 * Copy and helpers for the administrator introductions page (`/admin/intros`).
 *
 * A founder asks for an introduction, the target founder accepts or declines it from their
 * dashboard, and an unanswered request expires. Accepting there also opens the message thread
 * and uses the requester's monthly credit. An administrator status change only records the new
 * status (`Admin\IntroductionController@update`), so the page says so next to "Mark approved".
 */

export const introStatuses = ["INTRO_PENDING", "INTRO_APPROVED", "ROUTE_EXPIRED", "DECLINED"] as const
export type IntroStatus = (typeof introStatuses)[number]
export type IntroFilter = "all" | IntroStatus

export type AdminIntro = {
  id: number
  routing_status: IntroStatus | string
  payload_context_brief?: string | null
  tracking_notes?: string | null
  source_founder?: { legal_name?: string | null } | null
  target_founder?: { legal_name?: string | null } | null
  created_at?: string | null
  expires_at?: string | null
}

export type AdminIntroMeta = {
  total: number
  current_page?: number
  pending: number
  approved: number
  expired: number
  declined: number
}

export type AdminIntroResponse = {
  data: AdminIntro[]
  meta: AdminIntroMeta
  links?: { next?: string | null; prev?: string | null }
}

const ar = {
  title: "طلبات التعارف",
  intro: "طلبات التعارف بين المؤسسين وحالة كل طلب. يقبل المؤسس المطلوب الطلب أو يعتذر عنه من لوحته.",
  filterLabel: "عرض الطلبات حسب الحالة",
  all: "الكل",
  loading: "جارٍ تحميل الطلبات…",
  loadFailed: "تعذر تحميل طلبات التعارف. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  empty: "لا توجد طلبات تعارف بعد.",
  emptyFilter: "لا توجد طلبات بهذه الحالة.",
  founder: "مؤسس",
  requestedBy: "من",
  requestedOf: "إلى",
  requestedOn: "أُرسل في {date}",
  expiresOn: "ينتهي في {date}",
  message: "رسالة الطلب",
  noMessage: "لم يكتب مقدم الطلب رسالة.",
  note: "ملاحظة الإدارة",
  approve: "تعليم كمقبول",
  approveHint: "لا يفتح هذا محادثة بين المؤسسين ولا يحتسب رصيد الطلب؛ يحدث ذلك فقط عندما يقبل المؤسس المطلوب من لوحته.",
  decline: "رفض الطلب",
  expire: "إنهاء الطلب",
  confirmApprove: "تعليم طلب التعارف من {source} إلى {target} كمقبول؟",
  confirmDecline: "رفض طلب التعارف من {source} إلى {target}؟",
  confirmExpire: "إنهاء طلب التعارف من {source} إلى {target}؟",
  updated: "حُدّثت حالة الطلب.",
  updateFailed: "تعذر تحديث حالة الطلب. حاول مرة أخرى.",
  loadMore: "عرض المزيد",
  shown: "يُعرض {shown} من {total}",
}

type AdminIntrosCopy = typeof ar

const en: AdminIntrosCopy = {
  title: "Introductions",
  intro: "Introduction requests between founders and where each one stands. The requested founder accepts or declines from their dashboard.",
  filterLabel: "Show requests by status",
  all: "All",
  loading: "Loading requests…",
  loadFailed: "Introduction requests could not be loaded. Try again.",
  retry: "Try again",
  empty: "No introduction requests yet.",
  emptyFilter: "No requests with this status.",
  founder: "Founder",
  requestedBy: "From",
  requestedOf: "To",
  requestedOn: "Sent {date}",
  expiresOn: "Expires {date}",
  message: "Request message",
  noMessage: "The requester did not write a message.",
  note: "Admin note",
  approve: "Mark approved",
  approveHint: "This does not open a conversation between the founders or use the request credit; that happens only when the requested founder accepts from their dashboard.",
  decline: "Decline request",
  expire: "Close request",
  confirmApprove: "Mark the introduction from {source} to {target} as approved?",
  confirmDecline: "Decline the introduction from {source} to {target}?",
  confirmExpire: "Close the introduction from {source} to {target}?",
  updated: "Request status updated.",
  updateFailed: "The request status could not be updated. Try again.",
  loadMore: "Show more",
  shown: "Showing {shown} of {total}",
}

export const adminIntrosCopy = { ar, en }

export function adminIntros(locale: Locale): AdminIntrosCopy {
  return adminIntrosCopy[locale]
}

const statusLabels: Record<Locale, Record<IntroStatus, string>> = {
  ar: { INTRO_PENDING: "بانتظار الرد", INTRO_APPROVED: "مقبول", ROUTE_EXPIRED: "منتهٍ", DECLINED: "مرفوض" },
  en: { INTRO_PENDING: "Awaiting reply", INTRO_APPROVED: "Approved", ROUTE_EXPIRED: "Expired", DECLINED: "Declined" },
}

function isStatus(value: string): value is IntroStatus {
  return (introStatuses as readonly string[]).includes(value)
}

/** Label for a status code; an unknown code is shown as-is so it is never hidden. */
export function introStatusLabel(locale: Locale, status: string): string {
  return isStatus(status) ? statusLabels[locale][status] : status
}

export function introStatusVariant(status: string): "warning" | "success" | "destructive" | "outline" {
  if (status === "INTRO_PENDING") return "warning"
  if (status === "INTRO_APPROVED") return "success"
  if (status === "DECLINED") return "destructive"
  return "outline"
}

/**
 * Status changes offered for a request. A pending request can be approved, declined or closed;
 * an approved one can only be closed. Declined and expired requests are final here: approving
 * one would mark an introduction accepted that the requested founder never agreed to.
 */
export function introActions(status: string): IntroStatus[] {
  if (status === "INTRO_PENDING") return ["INTRO_APPROVED", "DECLINED", "ROUTE_EXPIRED"]
  if (status === "INTRO_APPROVED") return ["ROUTE_EXPIRED"]
  return []
}

/** Count shown on each filter. The API's `total` counts the current filter, so "all" adds the four. */
export function introFilterCount(meta: AdminIntroMeta | null, filter: IntroFilter): number | null {
  if (!meta) return null
  const counts: Record<IntroStatus, number> = {
    INTRO_PENDING: meta.pending,
    INTRO_APPROVED: meta.approved,
    ROUTE_EXPIRED: meta.expired,
    DECLINED: meta.declined,
  }
  if (filter === "all") return introStatuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0)
  return counts[filter] ?? 0
}

export function introQuery(filter: IntroFilter, page: number): string {
  const params = new URLSearchParams({ page: String(page) })
  if (filter !== "all") params.set("status", filter)
  return `/admin/intros?${params.toString()}`
}

export function introDate(locale: Locale, iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(dateLocale(locale === "ar"), { timeZone: "Asia/Riyadh", day: "numeric", month: "short", year: "numeric" })
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
