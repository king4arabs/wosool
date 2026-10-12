import type { NewsItem } from "../types"
import profiles from "../data/founder-spotlight.json"
import curated from "../data/startup-news.json"

export const curatedNews: NewsItem[] = curated

export function newsDate(value: string, locale: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? (locale === "ar" ? "التاريخ غير متاح" : "Date unavailable") :
    date.toLocaleDateString(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
}

export function mergeNews(items: NewsItem[], snapshot: NewsItem[] = curatedNews) {
  const unique = new Map<string, NewsItem>()
  for (const item of [...snapshot, ...items]) {
    unique.set(item.sourceUrl || item.slug, item)
  }
  return [...unique.values()].sort((a, b) =>
    (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
}

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\s_-]+/g, " ").trim()
}

export function companyMatches(item: Pick<NewsItem, "companies">, names: string[]) {
  const keys = names.filter(Boolean).map(normalize)
  return (item.companies ?? []).some(company => keys.includes(normalize(company)))
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
