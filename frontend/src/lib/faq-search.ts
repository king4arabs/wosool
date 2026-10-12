import type { FaqItem } from "@/data/faq"

/** Folds Arabic diacritics and letter variants so "اسال" finds "أسأل" and "الاعضاء" finds "الأعضاء". */
export function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
}

export function matchesFaq(item: FaqItem, locale: "ar" | "en", query: string) {
  const terms = normalizeSearch(query).split(" ").filter(Boolean)
  if (!terms.length) return true
  // Search both languages so a mixed-language query ("رسوم fees") still finds the answer.
  const haystack = normalizeSearch([item.q[locale], ...item.a[locale], item.q.ar, item.q.en].join(" "))
  return terms.every(term => haystack.includes(term))
}
