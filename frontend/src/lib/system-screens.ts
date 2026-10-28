import type { Locale } from "@/lib/locale"

/** Copy for the app-wide screens: 404, unexpected error, loading and toast notifications. */
export const systemScreensCopy = {
  ar: {
    notFoundTitle: "الصفحة غير موجودة",
    notFoundBody: "قد يكون الرابط قديمًا أو أن الصفحة نُقلت. ارجع إلى الرئيسية أو اختر أحد الأقسام أدناه.",
    notFoundHome: "العودة إلى الرئيسية",
    notFoundFounders: "استكشف المؤسسين",
    linkAbout: "عن وصول",
    linkPrograms: "البرامج",
    linkEvents: "الفعاليات",
    linkContact: "تواصل معنا",
    errorTitle: "تعذّر عرض هذه الصفحة",
    errorBody: "حدث خطأ غير متوقع أثناء تحميل الصفحة. أعد المحاولة، وإن تكرر الخطأ فتواصل معنا وأرسل رمز الخطأ.",
    errorRetry: "إعادة المحاولة",
    errorHome: "العودة إلى الرئيسية",
    errorContact: "تواصل معنا",
    errorId: "رمز الخطأ:",
    loading: "جارٍ التحميل…",
    toastRegion: "الإشعارات",
    toastDismiss: "إغلاق الإشعار",
  },
  en: {
    notFoundTitle: "Page not found",
    notFoundBody: "The link may be out of date or the page may have moved. Go back to the home page or pick a section below.",
    notFoundHome: "Back to home",
    notFoundFounders: "Explore founders",
    linkAbout: "About Wosool",
    linkPrograms: "Programs",
    linkEvents: "Events",
    linkContact: "Contact us",
    errorTitle: "This page could not be shown",
    errorBody: "Something unexpected went wrong while loading the page. Try again, and if it keeps happening, contact us with the error ID.",
    errorRetry: "Try again",
    errorHome: "Back to home",
    errorContact: "Contact us",
    errorId: "Error ID:",
    loading: "Loading…",
    toastRegion: "Notifications",
    toastDismiss: "Dismiss notification",
  },
} satisfies Record<Locale, Record<string, string>>

export type SystemScreensCopy = (typeof systemScreensCopy)["en"]

export function systemScreens(locale: Locale): SystemScreensCopy {
  return systemScreensCopy[locale] ?? systemScreensCopy.ar
}

/** Server-component errors carry a digest that matches the server log; client errors may be any value. */
export function errorDigest(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("digest" in error)) return null
  const digest = (error as { digest?: unknown }).digest
  return typeof digest === "string" && digest.trim() ? digest.trim() : null
}
