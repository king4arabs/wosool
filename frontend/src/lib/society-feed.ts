import type { Locale } from "@/lib/locale"

export type SocietyTab = "all" | "asks" | "offers"
export type SocietyCounts = { all: number; asks: number; offers: number }

export const SOCIETY_SECTORS = ["fintech", "saas", "ai"] as const
export type SocietySector = (typeof SOCIETY_SECTORS)[number]

export const societyFeedCopy = {
  ar: {
    badge: "مجتمع وصول",
    title: "طلبات الدعم وعروض الخبرة",
    subtitle: "اطلب المساعدة في تحدٍّ تواجهه، أو اعرض خبرة يحتاجها مؤسسون آخرون.",
    newPost: "+ منشور جديد",
    tabsLabel: "نوع المنشورات",
    tabAll: "كل المنشورات",
    tabAsks: "طلبات الدعم",
    tabOffers: "عروض الخبرة",
    sectorLabel: "القطاع",
    allSectors: "كل القطاعات",
    sectorFintech: "التقنية المالية",
    sectorSaas: "البرمجيات كخدمة",
    sectorAi: "الذكاء الاصطناعي",
    viewAll: "عرض جميع المنشورات",
    loading: "جارٍ تحميل المنشورات…",
    loadFailed: "تعذر تحميل المنشورات. حاول مرة أخرى.",
    retry: "إعادة المحاولة",
    empty: "لا توجد منشورات بعد. ابدأ أول منشور في المجتمع.",
    emptyFiltered: "لا توجد منشورات تطابق هذا الاختيار.",
    previous: "الصفحة السابقة",
    next: "الصفحة التالية",
    actionFailed: "تعذر إتمام الإجراء.",
    linkCopied: "تم نسخ الرابط.",
    shareTitle: "منشور في مجتمع وصول",
    commentPrompt: "اكتب تعليقك",
    helpMessage: "أستطيع المساعدة",
    deleteTitle: "حذف المنشور؟",
    deleteBody: "سيُؤرشف المنشور ولن يظهر للأعضاء بعد الحذف.",
    cancel: "إلغاء",
    confirmDelete: "حذف المنشور",
    deleting: "جارٍ الحذف…",
    composerTitle: "منشور جديد",
    composerSubtitle: "اكتب طلبك أو خبرتك بوضوح ليعرف الأعضاء كيف يساعدونك أو يستفيدون منك.",
    close: "إغلاق",
    postType: "نوع المنشور",
    ask: "طلب دعم",
    offer: "عرض خبرة",
    postTitle: "العنوان",
    postContent: "التفاصيل",
    priority: "الأولوية",
    normal: "عادية",
    urgent: "عاجلة",
    publishing: "جارٍ النشر…",
    publish: "نشر",
    publishFailed: "تعذر نشر المنشور. حاول مرة أخرى.",
    founder: "مؤسس",
    reactions: "التفاعلات",
    comments: "التعليقات",
  },
  en: {
    badge: "Wosool community",
    title: "Asks and offers",
    subtitle: "Ask for help with a challenge, or offer experience other founders need.",
    newPost: "+ New post",
    tabsLabel: "Post type",
    tabAll: "All posts",
    tabAsks: "Asks",
    tabOffers: "Offers",
    sectorLabel: "Sector",
    allSectors: "All sectors",
    sectorFintech: "Fintech",
    sectorSaas: "SaaS",
    sectorAi: "AI",
    viewAll: "View all posts",
    loading: "Loading posts…",
    loadFailed: "Posts could not be loaded. Please try again.",
    retry: "Try again",
    empty: "No posts yet. Start the first one.",
    emptyFiltered: "No posts match this filter.",
    previous: "Previous page",
    next: "Next page",
    actionFailed: "Unable to complete the action.",
    linkCopied: "Link copied.",
    shareTitle: "Wosool community post",
    commentPrompt: "Write your comment",
    helpMessage: "I can help",
    deleteTitle: "Delete this post?",
    deleteBody: "The post will be archived and members will no longer see it.",
    cancel: "Cancel",
    confirmDelete: "Delete post",
    deleting: "Deleting…",
    composerTitle: "New post",
    composerSubtitle: "Describe your ask or your experience clearly so members know how to help or learn from you.",
    close: "Close",
    postType: "Post type",
    ask: "Ask",
    offer: "Offer",
    postTitle: "Title",
    postContent: "Details",
    priority: "Priority",
    normal: "Normal",
    urgent: "Urgent",
    publishing: "Publishing…",
    publish: "Publish",
    publishFailed: "The post could not be published. Please try again.",
    founder: "Founder",
    reactions: "Reactions",
    comments: "Comments",
  },
} as const

export type SocietyFeedCopy = { [K in keyof typeof societyFeedCopy.en]: string }

export function societyFeed(locale: Locale): SocietyFeedCopy {
  return societyFeedCopy[locale === "en" ? "en" : "ar"]
}

/** "Showing 3 of 12 posts" in the visitor's language. */
export function societyShowing(locale: Locale, shown: number, total: number): string {
  return locale === "en" ? `Showing ${shown} of ${total} ${total === 1 ? "post" : "posts"}` : `عرض ${shown} من أصل ${total} منشور`
}

/** Readable sector name for the three composer sectors; other stored values are shown as written. */
export function societySectorLabel(locale: Locale, sector?: string | null): string | null {
  const value = sector?.trim()
  if (!value) return null
  const copy = societyFeed(locale)
  const known: Record<SocietySector, string> = { fintech: copy.sectorFintech, saas: copy.sectorSaas, ai: copy.sectorAi }
  const key = value.toLowerCase()
  // Own keys only: a stored sector such as "__proto__" or "constructor" must stay plain text.
  return Object.hasOwn(known, key) ? known[key as SocietySector] : value
}

const count = (value: unknown) => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null)

/**
 * Tab badges come from the API's feed-wide totals. An older API without
 * `meta.counts` only tells us the selected tab's total, so the other badges
 * are left empty rather than showing the current page's partial count.
 */
export function societyTabCounts(tab: SocietyTab, meta: { total?: unknown; counts?: Partial<Record<SocietyTab, unknown>> | null } | null | undefined): Partial<SocietyCounts> {
  const counts = meta?.counts
  if (counts) {
    const all = count(counts.all), asks = count(counts.asks), offers = count(counts.offers)
    if (all !== null && asks !== null && offers !== null) return { all, asks, offers }
  }
  const total = count(meta?.total)
  return total === null ? {} : { [tab]: total }
}
