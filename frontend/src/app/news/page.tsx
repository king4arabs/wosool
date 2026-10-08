"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Clock, User, Sparkles, BookOpen, Zap } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { fetchJson, getCollectionItems, mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"
import type { NewsItem, PaginatedResponse } from "@/types"

// ── i18n ──────────────────────────────────────────────────────────────────────
const pageCopy = {
  ar: {
    badge:       "الرؤى",
    eyebrow:     "محتوى تحليلي من قلب المنظومة",
    title:       "رؤى عملية للمؤسسين",
    highlight:   "المؤسسين",
    description: "قرارات نمو، إشارات سوق، وتحديثات موثوقة تساعد المؤسس على التنفيذ بثقة.",
    latestLabel: "الأحدث من الشبكة",
    read:        "اقرأ المقال",
    featured:    "المقال المختار",
    metrics: [
      { value: "12+", label: "مادة تحليلية" },
      { value: "4",   label: "مسارات نمو"  },
      { value: "100%",label: "محتوى عربي"  },
    ],
  },
  en: {
    badge:       "Insights",
    eyebrow:     "Analytical content from inside the ecosystem",
    title:       "Practical intelligence for founders",
    highlight:   "founders",
    description: "Growth decisions, market signals, and trusted updates for clearer execution.",
    latestLabel: "Latest from the network",
    read:        "Read story",
    featured:    "Featured",
    metrics: [
      { value: "12+", label: "Insight pieces"  },
      { value: "4",   label: "Growth tracks"   },
      { value: "100%",label: "Founder-focused" },
    ],
  },
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(
    locale === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  )
}

// ── Article card — no image, numbered, platform colors only ───────────────────
function ArticleCard({
  item,
  index,
  direction,
}: {
  item: ReturnType<typeof getLocalizedNewsContent>
  index: number
  locale: string
  direction: "ltr" | "rtl"
}) {
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight
  const num = String(index + 2).padStart(2, "0")

  return (
    <Link href={`/news/${item.slug}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-[#3B52D4]/40 hover:shadow-[0_0_0_1px_#3B52D4]/20 transition-all duration-200">

      {/* Top visual — dark numbered panel */}
      <div className="relative h-36 bg-slate-950 overflow-hidden flex-shrink-0">
        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Blue radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            insetInlineEnd: "-20%",
            bottom: "-20%",
            width: "70%",
            height: "70%",
            background: "radial-gradient(circle, rgba(59,82,212,0.3) 0%, transparent 70%)",
          }}
        />
        {/* Number */}
        <div
          className="absolute bottom-3 font-black text-[#3B52D4] leading-none select-none"
          style={{
            insetInlineStart: "1.25rem",
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
            opacity: 0.18,
          }}
        >
          {num}
        </div>
        {/* Category pill */}
        <div className="absolute top-3 flex items-center" style={{ insetInlineStart: "0.75rem" }}>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3B52D4]/20 border border-[#3B52D4]/30 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[#7B8FF8] uppercase">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#3B52D4] transition-colors mb-2">
          {item.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium flex-1">
          {item.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {item.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.readTime}
            </span>
          </div>
          <ArrowIcon
            className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#3B52D4] group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </Link>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const { locale, direction } = useLocale()
  const copy = pageCopy[locale]
  const [apiItems, setApiItems] = useState<NewsItem[]>([])
  const [isLoadingApi, setIsLoadingApi] = useState(true)
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight

  const normalizedApiItems = useMemo(
    () => apiItems.map((item) => getLocalizedNewsContent(item, locale)),
    [apiItems, locale]
  )

  const sourceItems = normalizedApiItems

  const featured = sourceItems[0]
  const rest = sourceItems.slice(1)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoadingApi(true)
      try {
        const res = await fetchJson<PaginatedResponse<ApiNewsItem> | { data: ApiNewsItem[] }>(
          "/api/v1/news?per_page=12"
        )
        if (cancelled) return
        const items = getCollectionItems<ApiNewsItem>(
          res as PaginatedResponse<ApiNewsItem> | { data: ApiNewsItem[] }
        )
        setApiItems(items.map(mapNewsItem))
      } catch {
        if (!cancelled) setApiItems([])
      } finally {
        if (!cancelled) setIsLoadingApi(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (isLoadingApi && sourceItems.length === 0) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]" dir={direction}>
          <div className="text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF1FF] border border-[#E4E7F0] mx-auto">
              <BookOpen className="h-6 w-6 text-[#3B52D4] animate-pulse" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              {locale === "ar" ? "جاري التحميل…" : "Loading insights…"}
            </p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div dir={direction}>

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-slate-950 pt-20 pb-16 sm:pt-28 sm:pb-20">

          {/* Grid lines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Blue glow — top corner */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-30%",
              insetInlineEnd: "-10%",
              width: "55%",
              height: "200%",
              background: "radial-gradient(ellipse at center, rgba(59,82,212,0.18) 0%, transparent 65%)",
            }}
          />

          {/* Giant background word */}
          <div
            className="absolute inset-inline-end-0 bottom-0 pointer-events-none select-none leading-none font-black text-white"
            style={{
              fontSize: "clamp(5rem, 18vw, 16rem)",
              opacity: 0.025,
              lineHeight: 0.85,
            }}
          >
            {copy.badge}
          </div>

          {/* Left color strip */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#3B52D4] to-[#6B7EF8]"
            style={{ insetInlineStart: 0 }}
          />

          <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">

            {/* Eyebrow */}
            <div className="fade-up flex items-center gap-2.5 mb-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3B52D4]/20 border border-[#3B52D4]/30">
                <Sparkles className="h-3.5 w-3.5 text-[#7B8FF8]" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#7B8FF8]">
                {copy.eyebrow}
              </span>
            </div>

            {/* Title */}
            <h1
              className="fade-up text-balance text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl max-w-3xl"
              style={{ animationDelay: "60ms" }}
            >
              {copy.title.split(copy.highlight).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span
                      className="relative inline-block"
                      style={{
                        color: "#3B52D4",
                        textShadow: "0 0 40px rgba(59,82,212,0.5)",
                      }}
                    >
                      {copy.highlight}
                    </span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </h1>

            {/* Description */}
            <p
              className="fade-up mt-5 max-w-xl text-base leading-7 text-slate-400 font-medium"
              style={{ animationDelay: "120ms" }}
            >
              {copy.description}
            </p>

            {/* Trust metrics row */}
            <div
              className="fade-up mt-10 flex flex-wrap gap-3"
              style={{ animationDelay: "180ms" }}
            >
              {/* CTA */}
              {featured && (
                <Link
                  href={`/news/${featured.slug}`}
                  className="flex items-center gap-2 rounded-xl bg-[#3B52D4] hover:bg-[#2E43C0] px-5 py-3 text-sm font-bold text-white transition-colors"
                >
                  {copy.read}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ══ FEATURED ARTICLE ══════════════════════════════════════════════════ */}
        {featured && (
          <section className="bg-slate-950 border-t border-white/[0.06] px-6 pb-14 sm:px-10">
            <div className="mx-auto max-w-6xl">

              {/* Section label */}
              <div className="flex items-center gap-3 py-8">
                <div className="h-px flex-1 bg-gradient-to-r from-[#3B52D4]/60 to-transparent" />
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#3B52D4]">
                  <Zap className="h-3 w-3" />
                  {copy.featured}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-[#3B52D4]/60 to-transparent" />
              </div>

              {/* Featured card */}
              <Link
                href={`/news/${featured.slug}`}
                className="group block rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] overflow-hidden transition-all duration-300 hover:border-[#3B52D4]/40"
              >
                <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">

                  {/* Left panel — number + meta */}
                  <div className="relative flex flex-col justify-between p-8 border-e border-white/[0.06] overflow-hidden">
                    {/* Dot grid bg */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40"
                      style={{
                        backgroundImage: "radial-gradient(circle, rgba(59,82,212,0.3) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    {/* Blue glow */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        bottom: "-30%",
                        insetInlineEnd: "-30%",
                        width: "80%",
                        height: "80%",
                        background: "radial-gradient(circle, rgba(59,82,212,0.25) 0%, transparent 70%)",
                      }}
                    />

                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3B52D4]/20 border border-[#3B52D4]/30 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7B8FF8]">
                        {featured.category}
                      </span>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <div className="text-[5rem] font-black leading-none text-[#3B52D4] opacity-30 select-none mb-4">
                        01
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-1">
                        <Clock className="h-3 w-3 text-[#3B52D4]" />
                        {featured.readTime}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <User className="h-3 w-3 text-[#3B52D4]" />
                        {featured.author}
                      </div>
                    </div>
                  </div>

                  {/* Right panel — content */}
                  <div className="flex flex-col justify-between p-8 sm:p-10">
                    {/* Pull quote */}
                    {featured.pullQuote && (
                      <div className="mb-6 ps-4 border-s-2 border-[#3B52D4]/50">
                        <p className="text-sm italic leading-7 text-slate-400 line-clamp-2">
                          {featured.pullQuote}
                        </p>
                      </div>
                    )}

                    <h2 className="text-2xl font-black leading-tight text-white group-hover:text-[#7B8FF8] transition-colors sm:text-3xl line-clamp-3">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-400 line-clamp-3">
                      {featured.excerpt}
                    </p>

                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-600">
                        {formatDate(featured.publishedAt, locale)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B52D4] group-hover:gap-2.5 transition-all">
                        {copy.read}
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ══ ARTICLES GRID ═════════════════════════════════════════════════════ */}
        <section className="bg-slate-50 px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">

            {/* Section header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] shrink-0">
                <BookOpen className="h-4 w-4 text-[#3B52D4]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#3B52D4] mb-0.5">
                  {copy.latestLabel}
                </p>
                <div className="h-px w-24 bg-gradient-to-r from-[#3B52D4]/60 to-transparent" />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item, idx) => (
                <ArticleCard
                  key={item.id ?? item.slug}
                  item={item}
                  index={idx}
                  locale={locale}
                  direction={direction}
                />
              ))}
            </div>

          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
