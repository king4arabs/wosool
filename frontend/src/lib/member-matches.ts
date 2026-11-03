import type { DashboardLocale } from "@/lib/dashboard-i18n"
import { programStageLabel } from "@/lib/program-labels"

export type MatchFounder = {
  id: number
  slug?: string | null
  user?: { id?: number | null } | null
  name?: string | null
  location?: string | null
  sector?: string | null
  stage?: string | null
  tagline?: string | null
  needs?: string[] | null
  offers?: string[] | null
  is_public?: boolean | null
  companies?: Array<{ name: string }>
}

export type MemberMatch = {
  id: number
  match_score: number
  match_reasons: string[]
  status: string
  founder_a?: MatchFounder
  founder_b?: MatchFounder
  created_at?: string
}

export const memberMatchesCopy = {
  ar: {
    title: "مؤسسون مقترحون لك",
    subtitle: "مؤسسون قد تفيدك خبرتهم أو تفيدهم خبرتك. اطلب تعارفًا مع من يناسبك، أو تجاوز الاقتراح.",
    creditsLabel: "طلبات التعارف المتبقية هذا الشهر",
    loadFailed: "تعذر تحميل الاقتراحات. حاول مرة أخرى.",
    actionFailed: "تعذر إتمام الإجراء. حاول مرة أخرى.",
    retry: "إعادة المحاولة",
    profileRequired: "أكمل ملفك كمؤسس لتظهر لك الاقتراحات.",
    profileCta: "إكمال الملف",
    activeTitle: "تعارفات طلبتها",
    activeEmpty: "لم تطلب أي تعارف بعد. اختر من الاقتراحات أدناه.",
    statusAccepted: "بانتظار رد الطرف الآخر",
    statusConnected: "تم التعارف",
    suggestedTitle: "الاقتراحات",
    suggestedEmpty: "لا توجد اقتراحات جديدة الآن. حدّث احتياجاتك وما تقدمه في ملفك لتحصل على اقتراحات أدق.",
    loading: "جارٍ التحميل…",
    reasonsTitle: "سبب الاقتراح",
    canHelp: "يقدّم",
    looksFor: "يحتاج إلى",
    viewProfile: "عرض الملف",
    requestIntro: "اطلب تعارفًا",
    requesting: "جارٍ الإرسال…",
    decline: "ليس الآن",
    declining: "جارٍ التجاوز…",
    founderFallback: "مؤسس",
  },
  en: {
    title: "Founders suggested for you",
    subtitle: "Founders whose experience could help you, or who could use yours. Request an introduction to the ones that fit, or skip a suggestion.",
    creditsLabel: "Introduction requests left this month",
    loadFailed: "Suggestions could not be loaded. Please try again.",
    actionFailed: "That did not go through. Please try again.",
    retry: "Try again",
    profileRequired: "Complete your founder profile to see suggestions.",
    profileCta: "Complete profile",
    activeTitle: "Introductions you requested",
    activeEmpty: "You have not requested an introduction yet. Pick one from the suggestions below.",
    statusAccepted: "Waiting for their reply",
    statusConnected: "Introduced",
    suggestedTitle: "Suggestions",
    suggestedEmpty: "No new suggestions right now. Update what you need and what you offer in your profile to get closer matches.",
    loading: "Loading…",
    reasonsTitle: "Why this suggestion",
    canHelp: "Offers",
    looksFor: "Needs",
    viewProfile: "View profile",
    requestIntro: "Request introduction",
    requesting: "Sending…",
    decline: "Not now",
    declining: "Skipping…",
    founderFallback: "Founder",
  },
} as const

export type MemberMatchesCopy = { [K in keyof typeof memberMatchesCopy.en]: string }

export function memberMatches(locale: DashboardLocale): MemberMatchesCopy {
  return memberMatchesCopy[locale]
}

/** The counterpart in a match is whichever side is not the signed-in member. */
export function matchCounterpart(match: MemberMatch, userId?: number | null): MatchFounder | undefined {
  if (userId && match.founder_a?.user?.id === userId) return match.founder_b
  if (userId && match.founder_b?.user?.id === userId) return match.founder_a
  return match.founder_b || match.founder_a
}

export function splitMatches(matches: MemberMatch[]) {
  return {
    active: matches.filter((match) => match.status === "accepted" || match.status === "connected"),
    suggested: matches.filter((match) => match.status === "suggested"),
  }
}

export function matchStatusLabel(locale: DashboardLocale, status: string): string {
  const copy = memberMatches(locale)
  return status === "connected" ? copy.statusConnected : copy.statusAccepted
}

/** Clean, non-empty list items only; nothing is invented when a founder left the field empty. */
export function listItems(values?: string[] | null): string[] {
  return (values ?? []).map((value) => (typeof value === "string" ? value.trim() : "")).filter(Boolean)
}

/**
 * ["Fintech", "Seed", "Riyadh"] from the fields the founder actually filled in.
 * Kept as separate parts so the page can isolate each one: mixed Arabic and Latin
 * values joined into one string are reordered by the browser's bidi algorithm.
 */
export function founderMeta(locale: DashboardLocale, founder?: MatchFounder): string[] {
  const text = (value?: string | null) => (typeof value === "string" ? value.trim() : "")
  const stage = text(founder?.stage)
  return [text(founder?.sector), stage ? programStageLabel(stage, locale) : "", text(founder?.location)].filter(Boolean)
}

export function joinList(locale: DashboardLocale, values?: string[] | null): string {
  return listItems(values).join(locale === "ar" ? "، " : ", ")
}

export function matchReasons(locale: DashboardLocale, reasons?: string[] | null): string {
  return listItems(reasons).join(locale === "ar" ? "، " : "; ")
}

/** Only link profiles that the public founder page will actually serve. */
export function profileHref(founder?: MatchFounder): string | null {
  return founder?.slug && founder.is_public !== false ? `/founders/${founder.slug}` : null
}
