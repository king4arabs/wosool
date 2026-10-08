"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock, User, Tag, BookOpen } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { newsItems as sampleNewsItems } from "@/data/seed"
import { demoContentEnabled } from "@/lib/demo-content"
import { fetchJson, mapNewsItem, type ApiNewsItem } from "@/lib/content-api"
import { getLocalizedNewsBySlug, getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"

// ── i18n ──────────────────────────────────────────────────────────────────────
const newsItems = demoContentEnabled ? sampleNewsItems : []

const detailCopy = {
  ar: {
    back: "العودة إلى الأخبار",
    notFound: "لم نعثر على هذه المادة",
    notFoundBody: "قد تكون القصة غير متاحة حاليًا أو تم نقلها.",
    more: "قراءات أخرى",
    read: "اقرأ المقال",
    minRead: "دقائق قراءة",
  },
  en: {
    back: "Back to news",
    notFound: "We couldn't find this story",
    notFoundBody: "This article may be unavailable or may have moved.",
    more: "More from the network",
    read: "Read story",
    minRead: "min read",
  },
} as const

// ── Category color mapping ─────────────────────────────────────────────────────
function getCategoryStyle(category: string) {
  const map: Record<string, { accent: string; bg: string; text: string; strip: string }> = {
    "إنجاز عضو":       { accent: "#3B52D4", bg: "#EEF1FF", text: "#3B52D4", strip: "linear-gradient(180deg,#3B52D4,#7B8FF8)" },
    "Member milestone": { accent: "#3B52D4", bg: "#EEF1FF", text: "#3B52D4", strip: "linear-gradient(180deg,#3B52D4,#7B8FF8)" },
    "أخبار المنظومة":  { accent: "#059669", bg: "#ecfdf5", text: "#059669", strip: "linear-gradient(180deg,#059669,#34d399)" },
    "Ecosystem news":   { accent: "#059669", bg: "#ecfdf5", text: "#059669", strip: "linear-gradient(180deg,#059669,#34d399)" },
    "فعاليات":          { accent: "#d97706", bg: "#fffbeb", text: "#d97706", strip: "linear-gradient(180deg,#d97706,#fbbf24)" },
    "Events":           { accent: "#d97706", bg: "#fffbeb", text: "#d97706", strip: "linear-gradient(180deg,#d97706,#fbbf24)" },
  }
  return map[category] ?? {
    accent: "#3B52D4",
    bg: "#EEF1FF",
    text: "#3B52D4",
    strip: "linear-gradient(180deg,#3B52D4,#7B8FF8)",
  }
}

// ── Reading progress bar ───────────────────────────────────────────────────────
function ReadingProgress({ color }: { color: string }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div className="fixed top-0 start-0 end-0 h-0.5 bg-slate-200 z-[60]">
      <div
        className="h-full transition-none"
        style={{ width: `${progress}%`, background: color }}
      />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NewsArticlePage() {
  const { locale, direction } = useLocale()
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : ""
  const [apiArticle, setApiArticle] = useState<ReturnType<typeof mapNewsItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const article = useMemo(
    () => apiArticle ?? getLocalizedNewsBySlug(newsItems, slug, locale),
    [apiArticle, slug, locale]
  )
  const copy = detailCopy[locale]
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!slug) return
      setIsLoading(true)
      try {
        const res = await fetchJson<{ data: ApiNewsItem }>(`/api/v1/news/${slug}`)
        if (cancelled) return
        const mapped = mapNewsItem(res.data)
        setApiArticle({
          ...mapped,
          body: (mapped.content || mapped.excerpt || "")
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean),
          readTime: locale === "ar" ? "قراءة 4 دقائق" : "4 min read",
          authorRole: locale === "ar" ? "فريق التحرير" : "Editorial Team",
          pullQuote: mapped.excerpt || "",
        } as ReturnType<typeof getLocalizedNewsContent>)
      } catch {
        if (!cancelled) setApiArticle(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug, locale])

  if (!article && !isLoading) {
    return (
      <PublicLayout>
        <section className="px-4 py-24 sm:px-6 lg:px-8" dir={direction}>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-slate-900">{copy.notFound}</h1>
            <p className="mt-4 text-lg text-slate-500">{copy.notFoundBody}</p>
            <div className="mt-8">
              <Button asChild><Link href="/news">{copy.back}</Link></Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }
  if (!article) return null

  const articleView = article as typeof article & {
    readTime?: string
    authorRole?: string
    pullQuote?: string | null
    body?: string[]
  }

  const related = newsItems
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3)
    .map((item) => getLocalizedNewsContent(item, locale))

  const style = getCategoryStyle(articleView.category)
  const publishDate = new Date(articleView.publishedAt).toLocaleDateString(
    locale === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  return (
    <PublicLayout>
      <ReadingProgress color={style.accent} />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .art-fade { animation: fadeSlideUp 0.6s ease both; }
      `}</style>

      <div dir={direction} className="min-h-screen bg-white">

        {/* ── HERO — no image, pure typography + geometry ── */}
        <div className="relative overflow-hidden bg-slate-950">

          {/* Grid lines background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
            }}
          />

          {/* Radial glow accent */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-20%",
              insetInlineEnd: "-10%",
              width: "60%",
              height: "160%",
              background: `radial-gradient(ellipse at center, ${style.accent}22 0%, transparent 65%)`,
            }}
          />

          {/* Giant decorative category — behind content */}
          <div
            className="absolute bottom-0 pointer-events-none select-none leading-none font-black tracking-tighter"
            style={{
              insetInlineEnd: "-2%",
              fontSize: "clamp(80px, 14vw, 180px)",
              color: "rgba(255,255,255,0.025)",
              lineHeight: 0.85,
            }}
          >
            {articleView.category}
          </div>

          {/* Left color strip */}
          <div
            className="absolute top-0 bottom-0 w-1"
            style={{ insetInlineStart: 0, background: style.strip }}
          />

          <div className="relative z-10 mx-auto max-w-5xl px-6 pt-10 pb-12 sm:px-10 sm:pt-14 sm:pb-16">

            {/* Back link */}
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-white transition-colors mb-8 group"
            >
              <BackIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              {copy.back}
            </Link>

            {/* Category pill */}
            <div className="mb-5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest border"
                style={{ color: style.accent, background: `${style.accent}18`, borderColor: `${style.accent}30` }}
              >
                <Tag className="h-3 w-3" />
                {articleView.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="art-fade text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl max-w-3xl">
              {articleView.title}
            </h1>

            {/* Excerpt */}
            <p
              className="art-fade mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
              style={{ animationDelay: "80ms", color: "rgba(255,255,255,0.55)" }}
            >
              {articleView.excerpt}
            </p>

            {/* Meta row */}
            <div
              className="art-fade mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
              style={{ animationDelay: "140ms" }}
            >
              {[
                { icon: User, text: `${articleView.author}${articleView.authorRole ? ` · ${articleView.authorRole}` : ""}` },
                { icon: Clock, text: articleView.readTime ?? "4 min read" },
                { icon: BookOpen, text: publishDate },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Icon className="h-3.5 w-3.5" style={{ color: style.accent }} />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="mx-auto max-w-5xl px-6 sm:px-10 py-12">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">

            {/* Article body */}
            <article>
              {/* Pull quote */}
              {articleView.pullQuote && (
                <div className="relative mb-10 ms-0 ps-6 border-s-2" style={{ borderColor: style.accent }}>
                  {/* Opening quote mark */}
                  <div
                    className="absolute -top-4 -start-2 text-6xl font-black leading-none select-none pointer-events-none"
                    style={{ color: `${style.accent}25` }}
                  >
                    &ldquo;
                  </div>
                  <blockquote
                    className="relative text-lg font-semibold leading-8 text-slate-700 italic"
                    style={{ animationDelay: "200ms" }}
                  >
                    {articleView.pullQuote}
                  </blockquote>
                </div>
              )}

              {/* Body paragraphs */}
              <div className="space-y-6">
                {(articleView.body ?? []).map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-[15px] leading-8 text-slate-600 font-[450]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags footer */}
              {articleView.tags && articleView.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                  {(Array.isArray(articleView.tags) ? articleView.tags : []).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1 text-[11px] font-bold border"
                      style={{ color: style.text, background: style.bg, borderColor: `${style.accent}25` }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">

              {/* About the author card */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                  {locale === "ar" ? "الكاتب" : "Author"}
                </p>
                <div className="flex items-center gap-3">
                  {/* Avatar — initials, no image */}
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: style.strip }}
                  >
                    {articleView.author?.charAt(0)?.toUpperCase() ?? "W"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{articleView.author}</p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {articleView.authorRole ?? (locale === "ar" ? "فريق التحرير" : "Editorial Team")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related articles */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
                  {copy.more}
                </p>
                <div className="space-y-0 divide-y divide-slate-100">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/news/${item.slug}`}
                      className="block py-4 group"
                    >
                      {/* Category dot */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: getCategoryStyle(item.category).accent }}
                        />
                        <span
                          className="text-[10px] font-extrabold uppercase tracking-wider"
                          style={{ color: getCategoryStyle(item.category).accent }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-950 leading-snug transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                        {copy.read}
                        <ArrowIcon className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Back to all news */}
              <div className="pt-2">
                <Link
                  href="/news"
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <BackIcon className="h-3.5 w-3.5" />
                  {copy.back}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
