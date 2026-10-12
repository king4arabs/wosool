"use client"

import { useMemo, useState } from "react"
import { Newspaper, Search, ShieldCheck } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { NewsCard } from "@/components/sections/NewsCard"
import { usePublicCollection } from "@/lib/use-public-collection"
import { mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { mergeNews, newsDate } from "@/lib/news-feed"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

export default function NewsPage() {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const collection = usePublicCollection<ApiNewsItem>("/news")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const items = useMemo(() => mergeNews(collection.items.map(mapNewsItem)), [collection.items])
  const categories = [...new Set(items.map(item => item.category))]
  const filtered = items.filter(item => {
    const localized = getLocalizedNewsContent(item, locale)
    return (!category || item.category === category) && [localized.title, localized.excerpt, item.sourceName, ...(item.companies ?? [])].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  })
  return <PublicLayout><div dir={direction} lang={locale} className="min-h-screen bg-[var(--page-bg)]">
    <header className="bg-[var(--surface-inverse)] px-4 py-12 text-[var(--on-dark)] sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--on-dark-muted)]"><Newspaper size={18} />{ar ? "غرفة أخبار وصول" : "THE WOSOOL NEWSROOM"}</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">{ar ? "أخبار تصنع قرارات أفضل." : "Big moves. Better founder decisions."}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--on-dark-muted)]">{ar ? "أخبار الشركات الناشئة ورواد الأعمال، بملخصات مستقلة ومقتطفات من المصادر وروابط مباشرة للتغطية. لا حاجة لتسجيل الدخول." : "Startup and entrepreneur news, with independent briefs, publisher excerpts and direct links to the reporting. No sign-in required."}</p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm text-[var(--on-dark-muted)]"><span className="flex items-center gap-2"><ShieldCheck size={18} />{ar ? "مصادر واضحة · تواريخ حقيقية" : "Named sources · Real publication dates"}</span><span>{items.length} {ar ? "خبر متاح" : "stories available"}</span>{items[0] && <span>{ar ? "أحدث خبر:" : "Latest story:"} {newsDate(items[0].publishedAt, locale)}</span>}</div>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="stories-title">
      <h2 id="stories-title" className="text-2xl font-bold text-[var(--text-strong)]">{ar ? "اكتشف آخر الأخبار" : "Explore the latest"}</h2>
      <div className="my-6 grid gap-4 sm:grid-cols-[1fr_240px]">
        <label className="block text-sm font-semibold text-[var(--text)]">{ar ? "ابحث عن خبر أو شركة" : "Search stories or companies"}<div className="relative mt-2"><Search size={18} className="absolute start-4 top-4 text-[var(--text-muted)]" aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pe-4 ps-11" placeholder={ar ? "شركة، تمويل، تقنية…" : "Company, funding, technology…"} /></div></label>
        <label className="block text-sm font-semibold text-[var(--text)]">{ar ? "التصنيف" : "Category"}<select value={category} onChange={event => setCategory(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4"><option value="">{ar ? "جميع الأخبار" : "All stories"}</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      </div>
      <p role="status" className="mb-6 text-sm text-[var(--text-muted)]">{filtered.length} {ar ? "نتيجة • ملخصات ومقتطفات، وليست مقالات كاملة" : "results • Briefs and excerpts, not full article reproductions"}</p>
      {collection.error && <div className="mb-6 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]"><p>{ar ? "التحديث المباشر غير متاح. الأخبار المحفوظة تبقى متاحة للقراءة." : "Live updates are temporarily unavailable. Saved, sourced stories remain readable."}</p><button onClick={collection.retry} className="mt-2 min-h-11 font-bold text-[var(--link)]">{ar ? "إعادة المحاولة" : "Retry live updates"}</button></div>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(item => <NewsCard key={item.sourceUrl || item.slug} item={item} />)}</div>
      {!filtered.length && <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-10 text-center"><p>{ar ? "لا توجد أخبار مطابقة. جرّب بحثاً آخر." : "No matching stories. Try a different search."}</p><button onClick={() => { setQuery(""); setCategory("") }} className="mt-4 min-h-11 font-bold text-[var(--link)]">{ar ? "مسح الفلاتر" : "Clear filters"}</button></div>}
      {!collection.error && <CollectionStatus {...collection} empty={false} />}
    </section>
  </div></PublicLayout>
}
