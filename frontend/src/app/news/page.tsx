"use client"

import { Suspense, useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, ShieldCheck } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { NewsCard } from "@/components/sections/NewsCard"
import { PageHero } from "@/components/sections/PageHero"
import { usePublicCollection } from "@/lib/use-public-collection"
import { mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { NEWS_REGIONS, categoryLabel, mergeNews, curatedNews, newsDate, newsRegion, regionLabel, type NewsRegion } from "@/lib/news-feed"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

const PAGE_SIZE = 12

type SearchParamsLike = Pick<URLSearchParams, "get" | "toString">

/** Filter state lives in the URL so a filtered view can be shared or bookmarked. */
function Newsroom({ params }: { params: SearchParamsLike }) {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const router = useRouter()
  const pathname = usePathname()
  const collection = usePublicCollection<ApiNewsItem>("/news")

  const query = params.get("q") ?? ""
  const region = (NEWS_REGIONS as readonly string[]).includes(params.get("region") ?? "") ? params.get("region") as NewsRegion : ""
  const category = params.get("topic") ?? ""
  const sort = params.get("sort") === "oldest" ? "oldest" : "newest"
  const visible = Math.max(PAGE_SIZE, Number(params.get("show")) || PAGE_SIZE)

  const setParams = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!("show" in changes)) next.delete("show")
    const search = next.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }, [params, pathname, router])

  const items = useMemo(() => mergeNews(collection.items.map(mapNewsItem), collection.snapshotAllowed ? curatedNews : []), [collection.items, collection.snapshotAllowed])
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { "": items.length }
    for (const item of items) counts[newsRegion(item)] = (counts[newsRegion(item)] ?? 0) + 1
    return counts
  }, [items])
  const inRegion = useMemo(() => items.filter(item => !region || newsRegion(item) === region), [items, region])
  const categories = useMemo(() => [...new Set(inRegion.map(item => item.category))].sort(), [inRegion])
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    const rows = inRegion.filter(item => {
      if (category && item.category !== category) return false
      if (!needle) return true
      const localized = getLocalizedNewsContent(item, locale)
      return [localized.title, localized.excerpt, item.sourceName, ...(item.companies ?? []), ...(item.tags ?? [])]
        .join(" ").toLocaleLowerCase().includes(needle)
    })
    return sort === "oldest" ? [...rows].reverse() : rows
  }, [inRegion, category, query, locale, sort])

  const showLead = !query && sort === "newest" && filtered.length > 0
  const lead = showLead ? filtered[0] : undefined
  const rest = showLead ? filtered.slice(1) : filtered
  const shown = rest.slice(0, visible)
  const saudiLatest = items.find(item => newsRegion(item) === "saudi")
  const filtersActive = Boolean(query || region || category || sort !== "newest")
  // Until the first response arrives, show a placeholder rather than "0 stories".
  const counting = collection.loading && items.length === 0
  const count = (value: number) => counting ? "—" : value

  const chip = (active: boolean) => `inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-bold transition-colors ${active ? "border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--action-bg)]"}`

  return <div dir={direction} lang={locale} className="min-h-screen bg-[var(--page-bg)]">
    <PageHero
      tone="dark"
      eyebrow={ar ? "غرفة أخبار وصول" : "The Wosool newsroom"}
      title={ar ? "أخبار الشركات الناشئة، السعودية أولاً" : "Startup news, Saudi first"}
      description={ar ? "ملخصات قصيرة لأخبار التمويل والاستحواذ والتقارير من السعودية والخليج والعالم، مع أبرز الأرقام ورابط المصدر لكل خبر." : "Short briefs on funding, acquisitions and reports from Saudi Arabia, the Gulf and the world, with the key figures and a source link for every story."}
    >
      <dl className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/15 p-4"><dt className="text-xs text-[var(--on-dark-muted)]">{ar ? "أخبار موثّقة المصدر" : "Sourced stories"}</dt><dd className="mt-1 text-2xl font-extrabold">{count(items.length)}</dd></div>
        <div className="rounded-2xl border border-white/15 p-4"><dt className="text-xs text-[var(--on-dark-muted)]">{ar ? "من السعودية" : "From Saudi Arabia"}</dt><dd className="mt-1 text-2xl font-extrabold">{count(regionCounts.saudi ?? 0)}</dd></div>
        <div className="col-span-2 rounded-2xl border border-white/15 p-4 sm:col-span-1"><dt className="text-xs text-[var(--on-dark-muted)]">{ar ? "آخر خبر سعودي" : "Latest Saudi story"}</dt><dd className="mt-1 text-base font-bold">{saudiLatest ? newsDate(saudiLatest.publishedAt, locale) : "—"}</dd></div>
      </dl>
      <p className="mt-6 flex items-center gap-2 text-sm text-[var(--on-dark-muted)]"><ShieldCheck size={18} aria-hidden="true" />{ar ? "مصادر مسمّاة · تواريخ نشر حقيقية · ملخصات وليست إعادة نشر" : "Named sources · Real publication dates · Briefs, not republications"}</p>
    </PageHero>

    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="stories-title">
      <h2 id="stories-title" className="text-2xl font-bold text-[var(--text-strong)]">{ar ? "اكتشف آخر الأخبار" : "Explore the latest"}</h2>

      <div role="group" aria-label={ar ? "المنطقة" : "Region"} className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {(["", ...NEWS_REGIONS] as const).map(value => <button key={value || "all"} type="button" aria-pressed={region === value} onClick={() => setParams({ region: value || null, topic: null })} className={chip(region === value)}>
          {value ? regionLabel(value, locale) : ar ? "الكل" : "All"}<span className="rounded-full bg-black/10 px-2 text-xs">{count(regionCounts[value] ?? 0)}</span>
        </button>)}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_200px]">
        <label className="block text-sm font-semibold text-[var(--text)]">{ar ? "ابحث عن خبر أو شركة أو مستثمر" : "Search stories, companies or investors"}<div className="relative mt-2"><Search size={18} className="absolute start-4 top-4 text-[var(--text-muted)]" aria-hidden="true" /><input type="search" value={query} onChange={event => setParams({ q: event.target.value || null })} className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pe-4 ps-11" placeholder={ar ? "تابي، تمويل، ماغنيت…" : "Tabby, funding, MAGNiTT…"} /></div></label>
        <label className="block text-sm font-semibold text-[var(--text)]">{ar ? "الترتيب" : "Sort"}<select value={sort} onChange={event => setParams({ sort: event.target.value === "oldest" ? "oldest" : null })} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4"><option value="newest">{ar ? "الأحدث أولاً" : "Newest first"}</option><option value="oldest">{ar ? "الأقدم أولاً" : "Oldest first"}</option></select></label>
      </div>

      {categories.length > 1 && <div role="group" aria-label={ar ? "الموضوع" : "Topic"} className="mt-4 flex flex-wrap gap-2">
        <button type="button" aria-pressed={!category} onClick={() => setParams({ topic: null })} className={chip(!category)}>{ar ? "كل المواضيع" : "All topics"}</button>
        {categories.map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setParams({ topic: category === value ? null : value })} className={chip(category === value)}>{categoryLabel(value, locale)}</button>)}
      </div>}

      <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-[var(--text-muted)]">{count(filtered.length)} {ar ? "نتيجة • ملخصات ومقتطفات، وليست مقالات كاملة" : "results • Briefs and excerpts, not full article reproductions"}</p>
        {filtersActive && <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="min-h-11 text-sm font-bold text-[var(--link)]">{ar ? "مسح الفلاتر" : "Clear filters"}</button>}
      </div>

      {collection.error && <div role="status" className="mb-6 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]"><p>{collection.snapshotAllowed ? ar ? "التحديث المباشر غير متاح. الأخبار المحفوظة تبقى متاحة للقراءة." : "Live updates are temporarily unavailable. Saved, sourced stories remain readable." : ar ? "تعذر تحميل الأخبار. لم تُضف أخبار من النسخة المحفوظة." : "Stories could not be loaded. No saved stories have been added."}</p><button onClick={collection.retry} className="mt-2 min-h-11 font-bold text-[var(--link)]">{ar ? "إعادة المحاولة" : "Retry live updates"}</button></div>}

      {lead && <div className="mb-8"><NewsCard item={lead} variant="lead" /></div>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map(item => <NewsCard key={item.sourceUrl || item.slug} item={item} />)}</div>
      {rest.length > shown.length && <div className="mt-8 text-center"><button type="button" onClick={() => setParams({ show: String(visible + PAGE_SIZE) })} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-bold text-[var(--text)] hover:border-[var(--action-bg)]">{ar ? `عرض المزيد (${rest.length - shown.length})` : `Show more (${rest.length - shown.length})`}</button></div>}
      {!collection.loading && !collection.error && !filtered.length && <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-10 text-center"><p>{ar ? "لا توجد أخبار مطابقة. جرّب بحثاً آخر." : "No matching stories. Try a different search."}</p><button onClick={() => router.replace(pathname, { scroll: false })} className="mt-4 min-h-11 font-bold text-[var(--link)]">{ar ? "مسح الفلاتر" : "Clear filters"}</button></div>}
      {!collection.error && <CollectionStatus {...collection} empty={false} />}
    </section>
  </div>
}

function NewsroomFromUrl() {
  return <Newsroom params={useSearchParams()} />
}

// Search params are unknown while prerendering, so the fallback is the unfiltered newsroom:
// the heading, introduction and filters are in the initial HTML instead of an empty block.
const NO_FILTERS = new URLSearchParams()

export default function NewsPage() {
  return <PublicLayout><Suspense fallback={<Newsroom params={NO_FILTERS} />}><NewsroomFromUrl /></Suspense></PublicLayout>
}
