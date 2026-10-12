"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { NewsItem } from "@/types"
import { useLocale } from "@/lib/locale"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { newsDate, newsFounders } from "@/lib/news-feed"
import { NewsImage } from "./NewsImage"

export function NewsCard({ item }: { item: NewsItem }) {
  const { locale } = useLocale()
  const story = getLocalizedNewsContent(item, locale)
  const contentLanguage = item.slug.startsWith("rss-") ? "en" : locale
  const founders = newsFounders(item)
  return <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
    <Link href={`/news/${encodeURIComponent(item.slug)}`} tabIndex={-1} aria-hidden="true">
      <NewsImage src={item.imageUrl} alt="" />
    </Link>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="rounded-full bg-[var(--info-bg)] px-3 py-1 font-bold text-[var(--info-text)]">{item.category}</span>
        <time dateTime={item.publishedAt || undefined}>{newsDate(item.publishedAt, locale)}</time>
      </div>
      <h3 lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="mt-4 text-lg font-bold leading-7 text-[var(--text-strong)]">
        <Link className="hover:text-[var(--link)]" href={`/news/${encodeURIComponent(item.slug)}`}>{story.title}</Link>
      </h3>
      <p lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--text-muted)]">{story.excerpt}</p>
      <p className="mt-4 text-xs text-[var(--text-muted)]">{item.sourceName || item.author}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
        {founders.map(founder => <Link key={founder.slug} href={`/founders/${founder.slug}`} className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--link)]">{locale === "ar" ? founder.founder_name_ar : founder.founder_name_en}</Link>)}
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--link)]" href={`/news/${encodeURIComponent(item.slug)}`}>{locale === "ar" ? "اقرأ الخبر" : "Read brief"}<ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </div>
  </article>
}
