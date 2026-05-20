"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, User } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { newsItems } from "@/data/seed"
import { getLocalizedNewsBySlug, getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

const detailCopy = {
  ar: {
    back: "العودة إلى الأخبار",
    notFound: "لم نعثر على هذه المادة",
    notFoundBody: "قد تكون القصة غير متاحة حاليًا أو تم نقلها.",
    more: "قراءات أخرى من الشبكة",
    read: "اقرأ المقال",
  },
  en: {
    back: "Back to news",
    notFound: "We couldn't find this story",
    notFoundBody: "This article may be unavailable or may have moved.",
    more: "More from the network",
    read: "Read story",
  },
  fr: {
    back: "Retour aux actualités",
    notFound: "Article introuvable",
    notFoundBody: "Cet article n’est peut-être plus disponible.",
    more: "Autres lectures du réseau",
    read: "Lire l’article",
  },
} as const

export default function NewsArticlePage() {
  const { locale, direction } = useLocale()
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : ""
  const article = getLocalizedNewsBySlug(newsItems, slug, locale)
  const copy = detailCopy[locale]
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft

  if (!article) {
    return (
      <PublicLayout>
        <section className="section-veil px-4 py-24 sm:px-6 lg:px-8" dir={direction}>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-semibold text-[#121826]">{copy.notFound}</h1>
            <p className="mt-4 text-lg text-[#5b6472]">{copy.notFoundBody}</p>
            <div className="mt-8">
              <Button asChild>
                <Link href="/news">{copy.back}</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }

  const related = newsItems
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2)
    .map((item) => getLocalizedNewsContent(item, locale))

  return (
    <PublicLayout>
      <section className="section-veil relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-20" dir={direction}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,138,112,0.08),transparent_24%)]" />
        <div className="mx-auto max-w-5xl">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-medium text-[#1f6f5f] transition-colors hover:text-[#169b76]">
            <BackIcon className="h-4 w-4" />
            {copy.back}
          </Link>

          <div className="mt-8 overflow-hidden rounded-[2.75rem] border border-[#d8d1c4] bg-[linear-gradient(180deg,rgba(253,251,246,0.95),rgba(240,235,225,0.92))] shadow-[0_28px_80px_-36px_rgba(18,24,38,0.28)]">
            <div className="border-b border-[#e1dacc] bg-[radial-gradient(circle_at_top_left,rgba(31,138,112,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.08))] px-8 py-10 sm:px-10 sm:py-12">
              <div className="text-xs font-semibold tracking-[0.22em] text-[#1f8a70]">{article.category}</div>
              <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-tight text-[#121826] sm:text-5xl">
                {article.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5b6472]">{article.excerpt}</p>
              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-[#7b8494]">
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-[#1f8a70]" />
                  {article.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#1f8a70]" />
                  {new Date(article.publishedAt).toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>{article.readTime}</span>
              </div>
            </div>

            <div className="grid gap-10 px-8 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_280px]">
              <article className="max-w-none">
                {article.pullQuote ? (
                  <blockquote className="mb-8 rounded-[2rem] border border-[#d8d1c4] bg-[rgba(255,252,247,0.76)] p-6 text-lg leading-8 text-[#364150] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    {article.pullQuote}
                  </blockquote>
                ) : null}

                <div className="space-y-6 text-base leading-8 text-[#445064]">
                  {article.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>

              <aside className="rounded-[2rem] border border-[#d8d1c4] bg-[rgba(255,252,247,0.72)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="text-xs font-semibold tracking-[0.2em] text-[#1f8a70]">{copy.more}</div>
                <div className="mt-6 space-y-5">
                  {related.map((item) => (
                    <div key={item.slug} className="border-b border-[#e6dfd3] pb-5 last:border-b-0 last:pb-0">
                      <div className="text-xs font-semibold text-[#1f8a70]">{item.category}</div>
                      <h2 className="mt-3 text-lg font-semibold leading-7 text-[#121826]">{item.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-[#5b6472]">{item.excerpt}</p>
                      <div className="mt-4">
                        <Button asChild variant="ghost" className="px-0 text-[#1f6f5f] hover:bg-transparent hover:text-[#169b76]">
                          <Link href={`/news/${item.slug}`} className="flex items-center gap-2">
                            {copy.read}
                            <ArrowIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
