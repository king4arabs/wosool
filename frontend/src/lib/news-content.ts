import type { NewsItem } from "../types"

export type NewsLocale = "ar" | "en" | "fr"

/** Never replace published reporting with legacy demo stories based on an ID. */
export function getLocalizedNewsContent(item: NewsItem, locale: NewsLocale) {
  const translation = locale === "ar" ? item.translations?.ar : undefined
  const body = translation?.body ?? (item.content || item.excerpt).split(/\n{2,}/).filter(Boolean)
  const minutes = Math.max(1, Math.ceil(body.join(" ").split(/\s+/).length / 200))
  return {
    ...item,
    title: translation?.title ?? item.title,
    excerpt: translation?.excerpt ?? item.excerpt,
    body,
    keyFacts: (locale === "ar" ? translation?.keyFacts : undefined) ?? item.keyFacts ?? [],
    authorRole: item.sourceName ? (item.slug.startsWith("rss-") ? (locale === "ar" ? "مقتطف من المصدر" : "Publisher excerpt") : (locale === "ar" ? "ملخص مستقل من وصول" : "Independent Wosool brief")) : "",
    readTime: locale === "ar" ? `${minutes} دقيقة قراءة` : `${minutes} min read`,
  }
}

export function getLocalizedNewsBySlug(items: NewsItem[], slug: string, locale: NewsLocale) {
  const item = items.find((entry) => entry.slug === slug)
  return item ? getLocalizedNewsContent(item, locale) : null
}
