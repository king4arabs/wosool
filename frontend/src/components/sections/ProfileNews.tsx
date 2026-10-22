"use client"

import { useMemo } from "react"
import Link from "next/link"
import { companyAliases, companyMatches, mergeNews, curatedNews } from "@/lib/news-feed"
import { mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { usePublicCollection } from "@/lib/use-public-collection"
import { useLocale } from "@/lib/locale"
import { NewsCard } from "./NewsCard"

export function ProfileNews({ companyNames }: { companyNames: string[] }) {
  const { locale } = useLocale()
  const aliases = companyAliases(companyNames)
  const primary = aliases.find(Boolean)
  const collection = usePublicCollection<ApiNewsItem>(`/news?companies=${encodeURIComponent(aliases.slice(0, 10).join(","))}`)
  const items = useMemo(() => mergeNews(collection.items.map(mapNewsItem), collection.snapshotAllowed ? curatedNews : []), [collection.items, collection.snapshotAllowed])
    .filter(item => companyMatches(item, aliases))
  if (!primary || !items.length) return null
  return <section id="profile-news" className="scroll-mt-24">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-[var(--text-strong)]">{locale === "ar" ? "في الأخبار" : "In the news"}</h2><Link href="/news" className="inline-flex min-h-11 items-center text-sm font-bold text-[var(--link)]">{locale === "ar" ? "غرفة الأخبار" : "Newsroom"}</Link></div>
    <div className="grid gap-5 sm:grid-cols-2">{items.slice(0, 4).map(item => <NewsCard key={item.slug} item={item} />)}</div>
    {items.length > 4 && <Link href="/news" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[var(--link)]">{locale === "ar" ? "عرض الأخبار الإضافية" : "See more stories"}</Link>}
    <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">{locale === "ar" ? "مصادر عامة مستقلة. التغطية ليست تأييداً ولا دليلاً على العضوية." : "Independent public sources. Coverage is not an endorsement or evidence of membership."}</p>
  </section>
}
