"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Link2, ListChecks, MapPin, Share2 } from "lucide-react"
import type { NewsItem } from "@/types"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { NewsImage } from "@/components/sections/NewsImage"
import { NewsCard } from "@/components/sections/NewsCard"
import { fetchJson, mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { categoryLabel, curatedNews, newsDate, newsFounders, newsRegion, regionLabel, relatedNews, safeNewsUrl } from "@/lib/news-feed"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

export default function NewsArticlePage() {
  const { locale, direction } = useLocale()
  const { slug } = useParams<{ slug: string }>()
  const ar = locale === "ar"
  const saved = curatedNews.find(item => item.slug === slug)
  const [result, setResult] = useState<{ slug: string; item: NewsItem | null; failed?: boolean }>()
  const [copied, setCopied] = useState(false)
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
  const related = relatedNews(item, curatedNews)
  const region = newsRegion(item)
  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) { await navigator.share({ title: story.title, url }); return }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch { /* The visitor dismissed the share sheet. */ }
  }
  return <PublicLayout><div dir={direction} lang={locale} className="bg-[var(--page-bg)] text-[var(--text)]">
    <header className="bg-[var(--surface-inverse)] px-4 py-10 text-[var(--on-dark)] sm:px-6 sm:py-16"><div className="mx-auto max-w-5xl">
      <Link href="/news" className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--on-dark-muted)]"><Back size={16} />{ar ? "العودة للأخبار" : "Back to news"}</Link>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--on-dark-muted)]"><span className="rounded-full border border-white/20 px-3 py-1">{categoryLabel(item.category, locale)}</span><span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1"><MapPin size={14} aria-hidden="true" />{regionLabel(region, locale)}</span><span>{item.sourceName || item.author}</span></div>
      <h1 lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">{story.title}</h1>
      <p lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="mt-6 max-w-3xl text-lg leading-8 text-[var(--on-dark-muted)]">{story.excerpt}</p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--on-dark-muted)]"><time dateTime={item.publishedAt || undefined}>{newsDate(item.publishedAt, locale)}</time><span>{story.readTime}</span>{source && <span>{story.authorRole}</span>}<button type="button" onClick={() => void share()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 font-semibold text-[var(--on-dark)] hover:bg-white/10">{copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}<span aria-live="polite">{copied ? (ar ? "تم نسخ الرابط" : "Link copied") : (ar ? "مشاركة" : "Share")}</span></button></div>
    </div></header>
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {story.keyFacts.length > 0 && <section aria-labelledby="glance-title" className="mb-8 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-6 sm:p-8"><h2 id="glance-title" className="flex items-center gap-2 text-lg font-bold text-[var(--text-strong)]"><ListChecks size={20} aria-hidden="true" />{ar ? "باختصار" : "At a glance"}</h2><ul lang={contentLanguage} className="mt-4 grid gap-3 sm:grid-cols-2">{story.keyFacts.map(fact => <li key={fact} className="flex gap-3 rounded-xl bg-[var(--surface-soft)] p-4 text-sm font-semibold leading-6 text-[var(--text)]"><span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--action-bg)]" />{fact}</li>)}</ul></section>}
      {item.imageUrl && <figure className="overflow-hidden rounded-[var(--radius-panel)] bg-[var(--surface)]"><NewsImage src={item.imageUrl} alt={story.title} label={item.sourceName} eager />{item.imageCredit && <figcaption className="p-4 text-xs text-[var(--text-muted)]">{ar ? "الصورة:" : "Image:"} {item.imageCredit}</figcaption>}</figure>}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0 rounded-[var(--radius-card)] bg-[var(--surface)] p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-bold">{ar ? "تفاصيل الخبر" : "The story in brief"}</h2>
          <div lang={contentLanguage} dir={contentLanguage === "ar" ? "rtl" : "ltr"} className="space-y-6">{story.body.map((paragraph, index) => <p key={index} className="whitespace-pre-wrap text-base leading-8 text-[var(--text-muted)]">{paragraph}</p>)}</div>
          {source && <div className="mt-8 border-t border-[var(--border-soft)] pt-6"><p className="text-sm leading-7 text-[var(--text-muted)]">{publisherExcerpt ? ar ? "مقتطف قصير من موجز الناشر. اقرأ الخبر الكامل والصور الإضافية لدى المصدر." : "A short excerpt from the publisher’s feed. Read the complete reporting and additional photographs at the source." : ar ? "هذا ملخص مستقل، وليس إعادة نشر للمقال الأصلي. اقرأ التغطية الكاملة والصور الإضافية لدى المصدر." : "This is an independent brief, not a republication. Read the complete reporting and additional photographs at the source."}</p><a href={source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-5 py-3 font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">{ar ? "اقرأ الخبر الكامل" : "Read full source story"}<ArrowUpRight size={18} /></a></div>}
        </article>
        <aside className="space-y-5">
          {source && <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"><h2 className="font-bold">{ar ? "المصدر" : "Source & attribution"}</h2><p className="mt-3 text-sm">{item.sourceName}</p><a className="mt-2 inline-flex min-h-11 items-center gap-2 break-all text-sm text-[var(--link)] underline" href={source} target="_blank" rel="noopener noreferrer">{new URL(source).hostname}<ArrowUpRight size={16} /></a></section>}
          {(item.companies?.length ?? 0) > 0 && <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"><h2 className="font-bold">{ar ? "شركات في الخبر" : "Companies in this story"}</h2><ul className="mt-3 flex flex-wrap gap-2">{item.companies!.map(company => <li key={company}><Link href={`/news?q=${encodeURIComponent(company)}`} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[var(--surface-soft)] px-3 text-sm font-semibold text-[var(--link)]"><Link2 size={14} aria-hidden="true" />{company}</Link></li>)}</ul></section>}
          {founders.length > 0 && <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"><h2 className="font-bold">{ar ? "تعرّف على المؤسس" : "Meet the founder"}</h2>{founders.map(founder => <Link key={founder.slug} href={`/founders/${founder.slug}`} className="mt-3 flex min-h-12 items-center justify-between gap-2 text-sm font-semibold text-[var(--link)]">{ar ? founder.founder_name_ar : founder.founder_name_en}<ArrowUpRight size={16} /></Link>)}<p className="mt-3 text-xs leading-6 text-[var(--text-muted)]">{ar ? "التغطية الإخبارية لا تعني العضوية أو التأييد." : "News coverage does not imply membership or endorsement."}</p></section>}
        </aside>
      </div>
      {related.length > 0 && <section className="mt-12"><h2 className="mb-6 text-2xl font-bold">{ar ? "أخبار ذات صلة" : "Related stories"}</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map(other => <NewsCard key={other.slug} item={other} />)}</div></section>}
    </div>
  </div></PublicLayout>
}
