"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { NewsCard } from "@/components/sections/NewsCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { newsItems } from "@/data/seed"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

const pageCopy = {
  ar: {
    badge: "الأخبار والرؤى",
    title: "قصص من داخل المنظومة",
    description: "تحديثات الأعضاء، أخبار السوق، وإشارات مختارة تشرح ما يتحرك فعلًا داخل شبكة وصول.",
    latest: "الأحدث",
    latestTitle: "مواد منتقاة للمؤسسين",
    read: "اقرأ المقال كاملًا",
  },
  en: {
    badge: "News & Insights",
    title: "Stories from inside the network",
    description: "Member milestones, market signals, and selected editorial context from across the Wosool ecosystem.",
    latest: "Latest",
    latestTitle: "Selected reads for founders",
    read: "Read full story",
  },
  fr: {
    badge: "Actualités & Insights",
    title: "Histoires au cœur du réseau",
    description: "Temps forts membres, signaux de marché et lectures éditoriales sélectionnées dans l’écosystème Wosool.",
    latest: "Dernières parutions",
    latestTitle: "Lectures choisies pour les fondateurs",
    read: "Lire l’article",
  },
} as const

export default function NewsPage() {
  const { locale, direction } = useLocale()
  const copy = pageCopy[locale]
  const featured = getLocalizedNewsContent(newsItems[0], locale)
  const rest = newsItems.slice(1)
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight

  return (
    <PublicLayout>
      <section className="section-veil relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-24" dir={direction}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,138,112,0.08),transparent_26%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-5 px-4 py-1.5 text-xs tracking-[0.24em]">
              {copy.badge}
            </Badge>
            <h1 className="text-balance text-4xl font-semibold text-[#121826] sm:text-5xl">{copy.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#5b6472]">{copy.description}</p>
          </div>
        </div>
      </section>

      <section className="section-veil relative px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          <article className="overflow-hidden rounded-[2.5rem] border border-[#d7d0c2] bg-[linear-gradient(145deg,#0b1420_0%,#142132_68%,#1b2b3b_100%)] shadow-[0_32px_90px_-34px_rgba(8,16,24,0.52)]">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(31,138,112,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8">
                <div className="text-xs font-semibold tracking-[0.24em] text-[#a6dfd1]">{featured.readTime}</div>
                <div className="mt-16 text-[11px] font-semibold tracking-[0.22em] text-white/50">
                  {new Date(featured.publishedAt).toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="mt-4 text-5xl font-semibold text-white/94">01</div>
                <div className="mt-10 rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5 text-sm leading-7 text-white/72">
                  {featured.pullQuote}
                </div>
              </div>

              <div>
                <Badge variant="gold" className="mb-5">
                  {featured.category}
                </Badge>
                <h2 className="text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">{featured.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/50">
                  <span>{featured.author}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>{featured.authorRole}</span>
                </div>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href={`/news/${featured.slug}`} className="flex items-center gap-2">
                      {copy.read}
                      <ArrowIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section-veil px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="text-xs font-semibold tracking-[0.2em] text-[#1f8a70]">{copy.latest}</div>
            <h2 className="mt-3 text-3xl font-semibold text-[#121826]">{copy.latestTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
