"use client"

import { Suspense, useCallback, useMemo, useState, useSyncExternalStore } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { NewsCard } from "@/components/sections/NewsCard"
import { PageHero } from "@/components/sections/PageHero"
import { usePublicCollection } from "@/lib/use-public-collection"
import { mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { mergeNews, curatedNews } from "@/lib/news-feed"
import { createNewsVisitStore, newsVisitOrder } from "@/lib/news-discovery"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

const PAGE_SIZE = 12

type SearchParamsLike = Pick<URLSearchParams, "get" | "toString">

/** Search stays shareable; discovery order belongs to this page visit. */
function Newsroom({ params }: { params: SearchParamsLike }) {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const router = useRouter()
  const pathname = usePathname()
  const collection = usePublicCollection<ApiNewsItem>("/news")

  const [visitStore] = useState(createNewsVisitStore)
  const visitSeed = useSyncExternalStore(visitStore.subscribe, visitStore.getSnapshot, visitStore.getServerSnapshot)

  const query = params.get("q") ?? ""
  const visible = Math.max(PAGE_SIZE, Number(params.get("show")) || PAGE_SIZE)

  const setParams = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    // Old bookmarks must not silently hide regions or topics after the controls are removed.
    for (const key of ["region", "topic", "sort"]) next.delete(key)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!("show" in changes)) next.delete("show")
    const search = next.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }, [params, pathname, router])

  const items = useMemo(() => mergeNews(collection.items.map(mapNewsItem), collection.snapshotAllowed ? curatedNews : []), [collection.items, collection.snapshotAllowed])
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    const rows = items.filter(item => {
      if (!needle) return true
      const localized = getLocalizedNewsContent(item, locale)
      return [localized.title, localized.excerpt, item.title, item.excerpt, item.translations?.ar.title, item.translations?.ar.excerpt, item.sourceName, ...(item.companies ?? []), ...(item.tags ?? [])]
        .join(" ").toLocaleLowerCase().includes(needle)
    })
    return newsVisitOrder(rows, visitSeed)
  }, [items, query, locale, visitSeed])

  const showLead = !query && filtered.length > 0
  const lead = showLead ? filtered[0] : undefined
  const rest = showLead ? filtered.slice(1) : filtered
  const shown = rest.slice(0, visible)

  return <div dir={direction} lang={locale} className="min-h-screen bg-[var(--page-bg)]">
    <PageHero
      tone="dark"
      eyebrow={ar ? "غرفة أخبار وصول" : "The Wosool newsroom"}
      title={ar ? "أخبار الشركات الناشئة" : "Startup news"}
    />

    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="stories-title" data-visit-ready={Boolean(visitSeed)}>
      <h2 id="stories-title" className="text-2xl font-bold text-[var(--text-strong)]">{ar ? "اكتشف آخر الأخبار" : "Explore the latest"}</h2>

      <div className="mb-8 mt-6 max-w-2xl">
        <label className="block text-sm font-semibold text-[var(--text)]">{ar ? "ابحث عن خبر أو شركة أو مستثمر" : "Search stories, companies or investors"}<div className="relative mt-2"><Search size={18} className="absolute start-4 top-4 text-[var(--text-muted)]" aria-hidden="true" /><input type="search" value={query} onChange={event => setParams({ q: event.target.value || null })} className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pe-4 ps-11" placeholder={ar ? "تابي، تمويل، ماغنيت…" : "Tabby, funding, MAGNiTT…"} /></div></label>
      </div>

      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {collection.loading ? "" : filtered.length ? (ar ? "تتوفر أخبار مطابقة للبحث." : "Matching news stories are available.") : (ar ? "لا توجد أخبار مطابقة. جرّب بحثًا آخر." : "No matching stories. Try a different search.")}
      </p>
      {query && <div className="mb-6 mt-6 flex justify-end">
        <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="min-h-11 text-sm font-bold text-[var(--link)]">{ar ? "مسح البحث" : "Clear search"}</button>
      </div>}

      {collection.error && <div role="status" className="mb-6 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]"><p>{collection.snapshotAllowed ? ar ? "التحديث المباشر غير متاح. الأخبار المحفوظة تبقى متاحة للقراءة." : "Live updates are temporarily unavailable. Saved, sourced stories remain readable." : ar ? "تعذر تحميل الأخبار. لم تُضف أخبار من النسخة المحفوظة." : "Stories could not be loaded. No saved stories have been added."}</p><button onClick={collection.retry} className="mt-2 min-h-11 font-bold text-[var(--link)]">{ar ? "إعادة المحاولة" : "Retry live updates"}</button></div>}

      {lead && <div className="mb-8"><NewsCard item={lead} variant="lead" /></div>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map(item => <NewsCard key={item.sourceUrl || item.slug} item={item} />)}</div>
      {rest.length > shown.length && <div className="mt-8 text-center"><button type="button" onClick={() => setParams({ show: String(visible + PAGE_SIZE) })} className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-bold text-[var(--text)] hover:border-[var(--action-bg)]">{ar ? "عرض المزيد" : "Show more"}</button></div>}
      {!collection.loading && !collection.error && !filtered.length && <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-10 text-center"><p>{ar ? "لا توجد أخبار مطابقة. جرّب بحثاً آخر." : "No matching stories. Try a different search."}</p><button onClick={() => router.replace(pathname, { scroll: false })} className="mt-4 min-h-11 font-bold text-[var(--link)]">{ar ? "مسح البحث" : "Clear search"}</button></div>}
      {!collection.error && <CollectionStatus {...collection} empty={false} />}
    </section>
  </div>
}

function NewsroomFromUrl() {
  return <Newsroom params={useSearchParams()} />
}

// Search params are unknown while prerendering, so the fallback is the unfiltered newsroom:
// the heading and search are in the initial HTML instead of an empty block.
const NO_FILTERS = new URLSearchParams()

export default function NewsPage() {
  return <PublicLayout><Suspense fallback={<Newsroom params={NO_FILTERS} />}><NewsroomFromUrl /></Suspense></PublicLayout>
}
