"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import type { NewsItem } from "@/types"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { NewsImage } from "@/components/sections/NewsImage"
import { NewsCard } from "@/components/sections/NewsCard"
import { fetchJson, mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { curatedNews, newsDate, newsFounders, companyMatches, safeNewsUrl } from "@/lib/news-feed"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

export default function NewsArticlePage() {
  const { locale, direction } = useLocale()
  const { slug } = useParams<{ slug: string }>()
  const ar = locale === "ar"
  const saved = curatedNews.find(item => item.slug === slug)
  const [result, setResult] = useState<{ slug: string; item: NewsItem | null; failed?: boolean }>()
  useEffect(() => {
    const controller = new AbortController()
    fetchJson<{ data: ApiNewsItem }>(`/api/v1/news/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setResult({ slug, item: mapNewsItem(response.data) }) })
      .catch(() => { if (!controller.signal.aborted) setResult({ slug, item: null, failed: true }) })
    return () => controller.abort()
  }, [slug])
  const item = (result?.slug === slug ? result.item : null) || saved
  const loading = result?.slug !== slug
  const Back = ar ? ChevronRight : ChevronLeft
  if (!item) return <PublicLayout><section dir={direction} className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 role={loading ? "status" : undefined} className="text-2xl font-bold">{loading ? ar ? "جارٍ تحميل الخبر…" : "Loading story…" : ar ? "الخبر غير متاح حالياً" : "This story is currently unavailable"}</h1><Link href="/news" className="mt-6 inline-flex min-h-11 items-center text-[var(--link)]">{ar ? "العودة للأخبار" : "Back to news"}</Link></section></PublicLayout>
  const story = getLocalizedNewsContent(item, locale)
  const founders = newsFounders(item)
  const source = safeNewsUrl(item.sourceUrl)
  const publisherExcerpt = item.slug.startsWith("rss-")
  const contentLanguage = publisherExcerpt ? "en" : locale
  const related = curatedNews.filter(other => other.slug !== item.slug && companyMatches(other, item.companies ?? [])).slice(0, 3)
  return <PublicLayout><div dir={direction} lang={locale} className="bg-[var(--page-bg)] text-[var(--text)]">
    <header className="bg-[var(--surface-inverse)] px-4 py-10 text-[var(--on-dark)] sm:px-6 sm:py-16"><div className="mx-auto max-w-5xl">
      <Link href="/news" className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--on-dark-muted)]"><Back size={16} />{ar ? "العودة للأخبار" : "Back to news"}</Link>
      <p className="mt-6 text-sm font-bold text-[var(--on-dark-muted)]">{item.category} · {item.sourceName || item.author}</p>
      <h1 lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">{story.title}</h1>
      <p lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="mt-6 max-w-3xl text-lg leading-8 text-[var(--on-dark-muted)]">{story.excerpt}</p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--on-dark-muted)]"><time dateTime={item.publishedAt || undefined}>{newsDate(item.publishedAt, locale)}</time><span>{story.readTime}</span>{source && <span>{story.authorRole}</span>}</div>
    </div></header>
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <figure className="overflow-hidden rounded-[var(--radius-panel)] bg-[var(--surface)]"><NewsImage src={item.imageUrl} alt={story.title} eager />{item.imageCredit && <figcaption className="p-4 text-xs text-[var(--text-muted)]">{ar ? "الصورة:" : "Image:"} {item.imageCredit}</figcaption>}</figure>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0 rounded-[var(--radius-card)] bg-[var(--surface)] p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-bold">{ar ? "تفاصيل الخبر" : "The story in brief"}</h2>
          <div lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="space-y-6">{story.body.map((paragraph, index) => <p key={index} className="whitespace-pre-wrap text-base leading-8 text-[var(--text-muted)]">{paragraph}</p>)}</div>
          {source && <div className="mt-8 border-t border-[var(--border-soft)] pt-6"><p className="text-sm leading-7 text-[var(--text-muted)]">{publisherExcerpt ? ar ? "مقتطف قصير من موجز الناشر. اقرأ الخبر الكامل والصور الإضافية لدى المصدر." : "A short excerpt from the publisher’s feed. Read the complete reporting and additional photographs at the source." : ar ? "هذا ملخص مستقل، وليس إعادة نشر للمقال الأصلي. اقرأ التغطية الكاملة والصور الإضافية لدى المصدر." : "This is an independent brief, not a republication. Read the complete reporting and additional photographs at the source."}</p><a href={source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-5 py-3 font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">{ar ? "اقرأ الخبر الكامل" : "Read full source story"}<ArrowUpRight size={18} /></a></div>}
        </article>
        <aside className="space-y-5">
          {source && <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"><h2 className="font-bold">{ar ? "المصدر" : "Source & attribution"}</h2><p className="mt-3 text-sm">{item.sourceName}</p><a className="mt-2 inline-flex min-h-11 items-center gap-2 break-all text-sm text-[var(--link)] underline" href={source} target="_blank" rel="noopener noreferrer">{new URL(source).hostname}<ArrowUpRight size={16} /></a></section>}
          {founders.length > 0 && <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"><h2 className="font-bold">{ar ? "تعرّف على المؤسس" : "Meet the founder"}</h2>{founders.map(founder => <Link key={founder.slug} href={`/founders/${founder.slug}`} className="mt-3 flex min-h-12 items-center justify-between gap-2 text-sm font-semibold text-[var(--link)]">{ar ? founder.founder_name_ar : founder.founder_name_en}<ArrowUpRight size={16} /></Link>)}<p className="mt-3 text-xs leading-6 text-[var(--text-muted)]">{ar ? "التغطية الإخبارية لا تعني العضوية أو التأييد." : "News coverage does not imply membership or endorsement."}</p></section>}
        </aside>
      </div>
      {related.length > 0 && <section className="mt-12"><h2 className="mb-6 text-2xl font-bold">{ar ? "أخبار ذات صلة" : "More on this company"}</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map(other => <NewsCard key={other.slug} item={other} />)}</div></section>}
    </div>
  </div></PublicLayout>
}
