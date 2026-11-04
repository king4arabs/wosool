import { normalizeSearch } from "./faq-search"
import type { Opportunity } from "./opportunity-catalog"

type SearchableOpportunity = Pick<Opportunity, "brand" | "title_ar" | "title_en" | "description_ar" | "description_en">

/** Apostrophes vary between ' and ’ in names such as "Wa’ed", so they are ignored on both sides. */
const fold = (value: string, locale?: "ar" | "en") => normalizeSearch(value.replace(/['’‘`]/g, ""), locale)

/**
 * Every search word must appear in the provider name, either title, either description or the
 * group name. Words need not be adjacent ("stv ai"), and Arabic shadda, hamza and ta marbuta
 * variants are folded, so "مول" finds "موّل".
 */
export function matchesOpportunitySearch(
  row: SearchableOpportunity,
  query: string,
  locale?: "ar" | "en",
  groupNames: string[] = [],
) {
  const terms = fold(query, locale).split(" ").filter(Boolean)
  if (!terms.length) return true
  const text = fold(
    [row.brand, row.title_ar, row.title_en, row.description_ar, row.description_en, ...groupNames].join(" "),
    locale,
  )
  return terms.every(term => text.includes(term))
}

/**
 * One step of the rail's slow auto-scroll, in reading direction. Browsers report scrollLeft
 * from 0 towards -end in a right-to-left container and towards +end in a left-to-right one.
 * At the end it returns to the start and reports `wrapped` so the caller can pause there.
 */
export function nextRailPosition(scrollLeft: number, end: number, step: number, rtl: boolean) {
  if (end <= 0) return { left: scrollLeft, wrapped: false }
  const travelled = rtl ? -scrollLeft : scrollLeft
  if (travelled >= end - 1) return { left: 0, wrapped: true }
  return { left: rtl ? scrollLeft - step : scrollLeft + step, wrapped: false }
}
