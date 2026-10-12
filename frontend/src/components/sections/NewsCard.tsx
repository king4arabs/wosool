"use client"

import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"
import type { NewsItem } from "@/types"
import { useLocale } from "@/lib/locale"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { categoryLabel, newsDate, newsFounders, newsRegion, regionLabel } from "@/lib/news-feed"
import { NewsImage } from "./NewsImage"

/** Story card. The "lead" variant presents the top story with its key facts. */
export function NewsCard({ item, variant = "default" }: { item: NewsItem; variant?: "default" | "lead" }) {
  const { locale } = useLocale()
  const story = getLocalizedNewsContent(item, locale)
  const contentLanguage = item.slug.startsWith("rss-") ? "en" : locale
  const founders = newsFounders(item)
  const region = newsRegion(item)
  const href = `/news/${encodeURIComponent(item.slug)}`
  const lead = variant === "lead"
  const facts = story.keyFacts.slice(0, lead ? 3 : 1)
  return <article className={`grid h-full min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-card)] ${lead ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : "grid-rows-[auto_1fr]"}`}>
    <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
      <NewsImage src={item.imageUrl} alt="" label={item.sourceName} aspect={lead ? "aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[16/10]"} eager={lead} />
    </Link>
    <div className={`flex min-w-0 flex-col ${lead ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        {lead && <span className="rounded-full bg-[var(--surface-inverse)] px-3 py-1 font-bold text-[var(--on-dark)]">{locale === "ar" ? "أبرز خبر" : "Top story"}</span>}
        <span className="rounded-full bg-[var(--info-bg)] px-3 py-1 font-bold text-[var(--info-text)]">{categoryLabel(item.category, locale)}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-3 py-1 font-semibold"><MapPin size={12} aria-hidden="true" />{regionLabel(region, locale)}</span>
        <time dateTime={item.publishedAt || undefined}>{newsDate(item.publishedAt, locale)}</time>
      </div>
      <h3 lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className={`mt-4 font-bold text-[var(--text-strong)] ${lead ? "text-2xl leading-snug sm:text-3xl" : "text-lg leading-7"}`}>
        <Link className="hover:text-[var(--link)]" href={href}>{story.title}</Link>
      </h3>
      <p lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className={`mt-3 text-sm leading-7 text-[var(--text-muted)] ${lead ? "" : "line-clamp-3"}`}>{story.excerpt}</p>
      {facts.length > 0 && <ul className="mt-4 space-y-2" aria-label={locale === "ar" ? "أبرز الأرقام" : "Key figures"}>
        {facts.map(fact => <li key={fact} className="flex gap-2 text-sm font-semibold leading-6 text-[var(--text)]"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--action-bg)]" />{fact}</li>)}
      </ul>}
      <p className="mt-4 text-xs text-[var(--text-muted)]">{locale === "ar" ? "المصدر: " : "Source: "}<span className="font-semibold">{item.sourceName || item.author}</span></p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
        <div className="flex flex-wrap gap-x-3">{founders.slice(0, 2).map(founder => <Link key={founder.slug} href={`/founders/${founder.slug}`} className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--link)]">{locale === "ar" ? founder.founder_name_ar : founder.founder_name_en}</Link>)}</div>
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--link)]" href={href}>{locale === "ar" ? "اقرأ الخبر" : "Read brief"}<ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </div>
  </article>
}
