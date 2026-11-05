import type { FaqItem } from "@/data/faq"

/** Folds Arabic diacritics and letter variants so "اسال" finds "أسأل" and "الاعضاء" finds "الأعضاء". */
export function normalizeSearch(value: string, locale?: 'ar' | 'en') {
  return value
    .toLocaleLowerCase(locale)
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
/** A malformed pasted URL must not break the help page. */
export function faqIdFromHash(hash: string): string | null {
  try { return decodeURIComponent(hash.replace(/^#/, "")) || null } catch { return null }
}

/** WAI accordion keyboard navigation; Arrow keys wrap through visible questions. */
export function nextFaqIndex(key: string, index: number, length: number): number | null {
  if (length < 1) return null
  if (key === "Home") return 0
  if (key === "End") return length - 1
  if (key === "ArrowDown") return (index + 1) % length
  if (key === "ArrowUp") return (index - 1 + length) % length
  return null
}
