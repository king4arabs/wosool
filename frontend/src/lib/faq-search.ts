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

export function matchesFaq(item: FaqItem, query: string) {
  const terms = normalizeSearch(query).split(" ").filter(Boolean)
  if (!terms.length) return true
  // Index both languages so an English term finds an answer from the Arabic view, and vice versa.
  const haystack = normalizeSearch([item.q.ar, item.q.en, ...item.a.ar, ...item.a.en].join(" "))
  return terms.every(term => haystack.includes(term))
}
