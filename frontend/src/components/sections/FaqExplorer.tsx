"use client"

import Link from "next/link"
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ArrowUpRight, Check, ChevronDown, Link2, MessageCircleQuestion, Search, X } from "lucide-react"
import { FAQ_CATEGORIES, type FaqCategory, type FaqItem } from "@/data/faq"
import { matchesFaq } from "@/lib/faq-search"
import { useLocale } from "@/lib/locale"

function highlight(text: string, query: string): ReactNode {
  const terms = query.trim().split(/\s+/).filter(term => term.length > 1)
  if (!terms.length) return text
  const pattern = new RegExp(`(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi")
  return text.split(pattern).map((part, index) => index % 2 ? <mark key={index} className="rounded bg-[var(--brand-blue-soft,#e8ecff)] px-0.5 text-inherit">{part}</mark> : <Fragment key={index}>{part}</Fragment>)
}

export function FaqExplorer({
  items,
  categories = FAQ_CATEGORIES.map(category => category.id),
  searchable = true,
  grouped = true,
  jsonLd = true,
  footer = true,
  placeholder,
}: {
  items: FaqItem[]
  categories?: FaqCategory[]
  searchable?: boolean
  grouped?: boolean
  jsonLd?: boolean
  footer?: boolean
  placeholder?: string
}) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<FaqCategory | "">("")
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const categoryKey = categories.join(",")
  const scoped = useMemo(() => items.filter(item => categoryKey.split(",").includes(item.category)), [items, categoryKey])
  // Callers often pass fresh arrays; read the latest list from a ref so the hash listener is attached once.
  const scopedRef = useRef(scoped)
  useEffect(() => { scopedRef.current = scoped }, [scoped])
  const visible = useMemo(() => scoped.filter(item => (!category || item.category === category) && matchesFaq(item, locale, query)), [scoped, category, query, locale])
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const item of scoped) if (matchesFaq(item, locale, query)) result[item.category] = (result[item.category] ?? 0) + 1
    return result
  }, [scoped, query, locale])
  const shownCategories = FAQ_CATEGORIES.filter(entry => categories.includes(entry.id))

  // Deep links: /faq#reset-password opens and scrolls to that answer.
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id || !scopedRef.current.some(item => item.id === id)) return
      setCategory("")
      setQuery("")
      setOpen(previous => new Set(previous).add(id))
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }))
    }
    openFromHash()
    window.addEventListener("hashchange", openFromHash)
    return () => window.removeEventListener("hashchange", openFromHash)
  }, [])

  const toggle = (id: string) => setOpen(previous => {
    const next = new Set(previous)
    if (next.has(id)) next.delete(id)
    else {
      next.add(id)
      try { window.history.replaceState(null, "", `#${id}`) } catch {}
    }
    return next
  })

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(id)
      window.setTimeout(() => setCopied(current => current === id ? null : current), 2000)
    } catch {
      window.location.hash = id
    }
  }

  const allOpen = visible.length > 0 && visible.every(item => open.has(item.id))
  const searching = query.trim().length > 0
  const sections = grouped && !searching && !category
    ? shownCategories.map(entry => ({ entry, rows: visible.filter(item => item.category === entry.id) })).filter(section => section.rows.length)
    : [{ entry: null, rows: visible }]
  const categoryOf = (id: FaqCategory) => FAQ_CATEGORIES.find(entry => entry.id === id)!
  const contactCategory = category ? categoryOf(category).contact : "general"
  const contactHref = `/contact?category=${contactCategory}${searching ? `&subject=${encodeURIComponent(query.trim().slice(0, 120))}` : ""}`

  const structured = jsonLd ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: scoped.map(item => ({
      "@type": "Question",
      name: item.q[locale],
      acceptedAnswer: { "@type": "Answer", text: item.a[locale].join(" ") },
    })),
  } : null

  return <div className="min-w-0">
    {structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />}

    {searchable && <div className="space-y-4">
      <label className="block">
        <span className="sr-only">{ar ? "ابحث في الأسئلة" : "Search the questions"}</span>
        <span className="relative block">
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={placeholder ?? (ar ? "ابحث: الرسوم، كلمة المرور، التعارف…" : "Search: fees, password, introductions…")}
            className="min-h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] pe-12 ps-12 text-base shadow-sm outline-none transition focus:border-[var(--action-bg)] focus:ring-4 focus:ring-[var(--action-bg)]/15"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={ar ? "مسح البحث" : "Clear search"} className="absolute end-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"><X size={18} aria-hidden="true" /></button>}
        </span>
      </label>

      {shownCategories.length > 1 && <div role="group" aria-label={ar ? "تصفية حسب الموضوع" : "Filter by topic"} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {[{ id: "" as const, ar: "الكل", en: "All" }, ...shownCategories].map(entry => {
          const active = category === entry.id
          const count = entry.id ? counts[entry.id] ?? 0 : Object.values(counts).reduce((sum, value) => sum + value, 0)
          return <button key={entry.id || "all"} type="button" aria-pressed={active} onClick={() => setCategory(entry.id)} disabled={!active && count === 0}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors disabled:opacity-40 ${active ? "border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--action-bg)]"}`}>
            {ar ? entry.ar : entry.en}
            <span className={`rounded-full px-2 text-xs ${active ? "bg-white/20" : "bg-[var(--surface-soft)]"}`}>{count}</span>
          </button>
        })}
      </div>}
    </div>}

    <div className={`flex flex-wrap items-center justify-between gap-3 ${searchable ? "mt-6" : ""}`}>
      <p role="status" aria-live="polite" className="flex min-h-11 items-center text-sm text-[var(--text-muted)]">
        {ar ? `${visible.length} ${visible.length === 1 ? "سؤال" : "أسئلة"}` : `${visible.length} ${visible.length === 1 ? "question" : "questions"}`}
      </p>
      {visible.length > 1 && <button type="button" onClick={() => setOpen(allOpen ? new Set() : new Set(visible.map(item => item.id)))} className="inline-flex min-h-11 items-center text-sm font-bold text-[var(--link)] hover:underline">
        {allOpen ? (ar ? "طيّ الكل" : "Collapse all") : (ar ? "توسيع الكل" : "Expand all")}
      </button>}
    </div>

    {visible.length === 0 && <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <MessageCircleQuestion size={32} aria-hidden="true" className="mx-auto text-[var(--action-bg)]" />
      <p className="mt-3 font-bold text-[var(--text-strong)]">{ar ? "لم نجد إجابة لهذا السؤال بعد." : "We don't have an answer for that yet."}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{ar ? "أرسله إلى الفريق وسنرد عليك مباشرة." : "Send it to the team and we'll reply to you directly."}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href={contactHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-5 text-sm font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">{ar ? "اسأل الفريق" : "Ask the team"}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button type="button" onClick={() => { setQuery(""); setCategory("") }} className="min-h-11 px-3 text-sm font-bold text-[var(--link)]">{ar ? "عرض كل الأسئلة" : "Show all questions"}</button>
      </div>
    </div>}

    <div className="mt-4 space-y-10">
      {sections.map(({ entry, rows }) => <section key={entry?.id ?? "results"} aria-labelledby={entry ? `faq-group-${entry.id}` : undefined}>
        {entry && <h2 id={`faq-group-${entry.id}`} className="mb-4 text-xl font-bold text-[var(--text-strong)]">{ar ? entry.ar : entry.en}</h2>}
        <ul className="divide-y divide-[var(--border-soft)] overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]">
          {rows.map(item => {
            const expanded = open.has(item.id)
            return <li key={item.id} id={item.id} className="scroll-mt-28">
              <h3>
                <button type="button" onClick={() => toggle(item.id)} aria-expanded={expanded} aria-controls={`${item.id}-answer`}
                  className="group flex min-h-16 w-full items-start justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--action-bg)] sm:px-6">
                  <span className="min-w-0">
                    {shownCategories.length > 1 && (searching || category === "") && !entry && <span className="mb-1 block text-xs font-bold text-[var(--action-bg)]">{ar ? categoryOf(item.category).ar : categoryOf(item.category).en}</span>}
                    <span className="block text-base font-bold leading-7 text-[var(--text-strong)] sm:text-[1.0625rem]">{highlight(item.q[locale], query)}</span>
                  </span>
                  <ChevronDown size={20} aria-hidden="true" className={`mt-1 shrink-0 text-[var(--text-muted)] transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180 text-[var(--action-bg)]" : ""}`} />
                </button>
              </h3>
              <div id={`${item.id}-answer`} role="region" aria-label={item.q[locale]} hidden={!expanded} className="px-5 pb-5 sm:px-6">
                <div className="max-w-3xl space-y-3 text-[0.9375rem] leading-8 text-[var(--text-muted)]">
                  {item.a[locale].map((paragraph, index) => <p key={index} className="whitespace-pre-line">{highlight(paragraph, query)}</p>)}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {item.link && <Link href={item.link.href} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[var(--link)] hover:underline">{ar ? item.link.ar : item.link.en}<ArrowUpRight size={15} aria-hidden="true" className="rtl:-scale-x-100" /></Link>}
                  <button type="button" onClick={() => void copyLink(item.id)} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
                    {copied === item.id ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
                    <span aria-live="polite">{copied === item.id ? (ar ? "تم نسخ الرابط" : "Link copied") : (ar ? "نسخ رابط الإجابة" : "Copy link")}</span>
                  </button>
                </div>
              </div>
            </li>
          })}
        </ul>
      </section>)}
    </div>

    {footer && visible.length > 0 && <aside className="mt-12 grid gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-strong)]">{ar ? "لم تجد إجابتك؟" : "Didn't find your answer?"}</h2>
        <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">{ar ? "اسأل فريق وصول، أو إن كنت عضوًا فاطرح سؤالك على المؤسسين في «اسأل المجتمع»." : "Ask the Wosool team — or, if you're a member, put your question to other founders in Ask the community."}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={contactHref} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-5 text-sm font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">{ar ? "اسأل الفريق" : "Ask the team"}</Link>
        <Link href="/dashboard/help-requests" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--text)] hover:border-[var(--action-bg)]">{ar ? "اسأل المجتمع" : "Ask the community"}</Link>
      </div>
    </aside>}
  </div>
}
