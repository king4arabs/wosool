import type { NewsItem } from "../types"
import profiles from "../data/founder-spotlight.json"
import curated from "../data/startup-news.json"
import { dateLocale } from "./date-locale"

export const curatedNews: NewsItem[] = curated

export function newsDate(value: string, locale: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? (locale === "ar" ? "التاريخ غير متاح" : "Date unavailable") :
    date.toLocaleDateString(dateLocale(locale === "ar", "en-US"), { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
}

export function mergeNews(items: NewsItem[], snapshot: NewsItem[] = curatedNews) {
  const unique = new Map<string, NewsItem>()
  for (const item of [...snapshot, ...items]) {
    const key = item.sourceUrl || item.slug
    // Keep an independent brief's stable route instead of replacing it with an RSS hash.
    if (item.slug.startsWith("rss-") && unique.has(key)) continue
    unique.set(key, item)
  }
  return [...unique.values()].sort((a, b) =>
    (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
}

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\s_-]+/g, " ").trim()
}

export function companyMatches(item: Partial<Pick<NewsItem, "companies" | "tags">>, names: string[]) {
  const keys = names.filter(Boolean).map(normalize)
  return [...(item.companies ?? []), ...(item.tags ?? [])].some(company => keys.includes(normalize(company)))
}

export function companyAliases(names: string[]) {
  const aliases = profiles.filter(profile => companyMatches(
    { companies: names },
    [profile.company_key, profile.company_name_en, profile.company_name_ar],
  )).flatMap(profile => [profile.company_key, profile.company_name_en, profile.company_name_ar])
  return [...new Set([...names, ...aliases].filter(Boolean))]
}

export function newsFounders(item: NewsItem) {
  return profiles.filter(profile =>
    companyMatches(item, [profile.company_key, profile.company_name_en, profile.company_name_ar]))
}

export function safeNewsUrl(value?: string) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}

export const NEWS_REGIONS = ["saudi", "gcc", "mena", "global"] as const
export type NewsRegion = (typeof NEWS_REGIONS)[number]

const regionLabels: Record<NewsRegion, { ar: string; en: string }> = {
  saudi: { ar: "السعودية", en: "Saudi Arabia" },
  gcc: { ar: "الخليج", en: "GCC" },
  mena: { ar: "الشرق الأوسط وشمال أفريقيا", en: "MENA" },
  global: { ar: "عالمي", en: "Global" },
}

const categoryLabels: Record<string, { ar: string; en: string }> = {
  funding: { ar: "تمويل", en: "Funding" },
  ecosystem: { ar: "المنظومة والتقارير", en: "Ecosystem & reports" },
  "m&a": { ar: "استحواذات", en: "M&A" },
  product: { ar: "منتجات", en: "Product" },
  regulation: { ar: "تنظيمات", en: "Regulation" },
}

export function newsRegion(item: Pick<NewsItem, "region">): NewsRegion {
  return (NEWS_REGIONS as readonly string[]).includes(item.region ?? "") ? item.region as NewsRegion : "global"
}

export function regionLabel(region: NewsRegion, locale: string) {
  return regionLabels[region][locale === "ar" ? "ar" : "en"]
}

export function categoryLabel(category: string, locale: string) {
  const label = categoryLabels[category.toLocaleLowerCase()]
  return label ? label[locale === "ar" ? "ar" : "en"] : category
}

/** Stories about the same company first, then the same region, newest first. */
export function relatedNews(item: NewsItem, items: NewsItem[], limit = 3) {
  const others = items.filter(other => other.slug !== item.slug)
  const sameCompany = others.filter(other => companyMatches(other, item.companies ?? []))
  const sameRegion = others.filter(other => !sameCompany.includes(other) && newsRegion(other) === newsRegion(item))
  return [...sameCompany, ...sameRegion].slice(0, limit)
}
