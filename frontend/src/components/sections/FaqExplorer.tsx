"use client"

import Link from "next/link"
import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { ArrowUpRight, Check, ChevronDown, Link2, MessageCircleQuestion, Search, X } from "lucide-react"
import { FAQ_CATEGORIES, type FaqCategory, type FaqItem } from "@/data/faq"
import { faqIdFromHash, matchesFaq, nextFaqIndex } from "@/lib/faq-search"
import { useLocale } from "@/lib/locale"
import styles from "./FaqExplorer.module.css"

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
  contactPath = "/contact",
}: {
  items: FaqItem[]
  categories?: FaqCategory[]
  searchable?: boolean
  grouped?: boolean
  jsonLd?: boolean
  footer?: boolean
  placeholder?: string
  contactPath?: "/contact" | "/eoa/contact"
}) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<FaqCategory | "">("")
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [searchClosed, setSearchClosed] = useState<Set<string>>(() => new Set())
  const root = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const instance = useId()
  const searching = query.trim().length > 0
  const isExpanded = (id: string) => searching ? !searchClosed.has(id) : open.has(id)
  const changeQuery = (value: string) => { setQuery(value); setSearchClosed(new Set()) }

  const categoryKey = categories.join(",")
  const scoped = useMemo(() => items.filter(item => categoryKey.split(",").includes(item.category)), [items, categoryKey])
  // Callers often pass fresh arrays; read the latest list from a ref so the hash listener is attached once.
  const scopedRef = useRef(scoped)
  useEffect(() => { scopedRef.current = scoped }, [scoped])
  const visible = useMemo(() => scoped.filter(item => (!category || item.category === category) && matchesFaq(item, query)), [scoped, category, query])
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const item of scoped) if (matchesFaq(item, query)) result[item.category] = (result[item.category] ?? 0) + 1
    return result
  }, [scoped, query])
  const shownCategories = FAQ_CATEGORIES.filter(entry => categories.includes(entry.id))

  // Deep links: /faq#reset-password opens and scrolls to that answer.
  useEffect(() => {
    const openFromHash = () => {
      const id = faqIdFromHash(window.location.hash)
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

  const toggle = (id: string) => {
    if (searching) {
      setSearchClosed(previous => {
        const next = new Set(previous)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      return
    }
    setOpen(previous => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        try { window.history.replaceState(null, "", `#${id}`) } catch {}
      }
      return next
    })
  }

  const navigateQuestions = (event: KeyboardEvent<HTMLButtonElement>) => {
    const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("[data-faq-question]") ?? [])
    const next = nextFaqIndex(event.key, buttons.indexOf(event.currentTarget), buttons.length)
    if (next === null) return
    event.preventDefault()
    buttons[next]?.focus()
  }

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

  const allOpen = visible.length > 0 && visible.every(item => isExpanded(item.id))
  const toggleAll = () => {
    if (searching) setSearchClosed(allOpen ? new Set(visible.map(item => item.id)) : new Set())
    else setOpen(previous => {
      const next = new Set(previous)
      for (const item of visible) { if (allOpen) next.delete(item.id); else next.add(item.id) }
      return next
    })
  }
  const sections = grouped && !searching && !category
    ? shownCategories.map(entry => ({ entry, rows: visible.filter(item => item.category === entry.id) })).filter(section => section.rows.length)
    : [{ entry: null, rows: visible }]
  const resetFilters = () => {
    changeQuery("")
    setCategory("")
    searchInput.current?.focus()
  }
  const openAnswer = (id: string) => {
    changeQuery("")
    setCategory("")
    setOpen(previous => new Set(previous).add(id))
    try { window.history.replaceState(null, "", `#${id}`) } catch {}
    requestAnimationFrame(() => {
      const question = document.getElementById(`${instance}-${id}-question`)
      question?.scrollIntoView({ block: "center", behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      question?.focus({ preventScroll: true })
    })
  }
  const categoryOf = (id: FaqCategory) => FAQ_CATEGORIES.find(entry => entry.id === id)!
  const contactCategory = category ? categoryOf(category).contact : "general"
  const helpHref = (subject?: string, topic = contactCategory) => `${contactPath}?category=${topic}${subject ? `&subject=${encodeURIComponent(subject.slice(0, 120))}` : ""}`
  const contactHref = helpHref(searching ? query.trim() : undefined)

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

  return <div ref={root} className={`${styles.root} min-w-0 text-start`} data-faq-explorer>
    {structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />}

    {searchable && <div className={`${styles.searchPanel} space-y-5 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:p-6`}>
      <div className="text-center">
        <span className={styles.helpIcon}><MessageCircleQuestion size={25} aria-hidden="true" /></span>
        <p className="font-bold text-[var(--text-strong)]">{ar ? "كيف يمكننا مساعدتك؟" : "How can we help?"}</p>
        <p id={`${instance}-search-help`} className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{ar ? "ابحث بكلمة أو اختر موضوعًا للوصول إلى إجابتك." : "Search a keyword or choose a topic to find your answer."}</p>
      </div>
      <label className="block">
        <span className="sr-only">{ar ? "ابحث في الأسئلة" : "Search the questions"}</span>
        <span className="relative block">
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            ref={searchInput}
            type="search"
            value={query}
            onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); resetFilters() } }}
            onChange={event => changeQuery(event.target.value)}
            aria-describedby={`${instance}-search-help`}
            placeholder={placeholder ?? (ar ? "ابحث: الرسوم، كلمة المرور، التعارف…" : "Search: fees, password, introductions…")}
            className="min-h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] pe-12 ps-12 text-base shadow-sm outline-none transition focus:border-[var(--action-bg)] focus:ring-4 focus:ring-[var(--action-bg)]/15"
          />
          {query && <button type="button" onClick={() => { changeQuery(""); searchInput.current?.focus() }} aria-label={ar ? "مسح البحث" : "Clear search"} className="absolute end-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"><X size={18} aria-hidden="true" /></button>}
        </span>
      </label>

      {shownCategories.length > 1 && <>
        <label className="block sm:hidden">
          <span className="mb-2 block text-sm font-bold text-[var(--text-strong)]">{ar ? "اختر موضوعًا" : "Choose a topic"}</span>
          <select aria-label={ar ? "تصفية حسب الموضوع" : "Filter by topic"} value={category} onChange={event => setCategory(event.target.value as FaqCategory | "")} className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]">
            <option value="">{ar ? "كل المواضيع" : "All topics"} ({Object.values(counts).reduce((sum, value) => sum + value, 0)})</option>
            {shownCategories.map(entry => <option key={entry.id} value={entry.id} disabled={!counts[entry.id]}>{ar ? entry.ar : entry.en} ({counts[entry.id] ?? 0})</option>)}
          </select>
        </label>
        <div role="group" aria-label={ar ? "تصفية حسب الموضوع" : "Filter by topic"} className={`${styles.topics} hidden flex-wrap justify-center gap-2 sm:flex`}>
        {[{ id: "" as const, ar: "الكل", en: "All" }, ...shownCategories].map(entry => {
          const active = category === entry.id
          const count = entry.id ? counts[entry.id] ?? 0 : Object.values(counts).reduce((sum, value) => sum + value, 0)
          return <button key={entry.id || "all"} type="button" aria-pressed={active} onClick={() => setCategory(entry.id)} disabled={!active && count === 0}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors disabled:opacity-40 ${active ? "border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--action-bg)]"}`}>
            {ar ? entry.ar : entry.en}
            <span className={`rounded-full px-2 text-xs ${active ? "bg-white/20" : "bg-[var(--surface-soft)]"}`}>{count}</span>
          </button>
        })}
        </div>
      </>}
    </div>}

    {searchable && !searching && !category && <nav aria-label={ar ? "إجابات سريعة" : "Quick answers"} className={styles.quickAnswers}>
      <span>{ar ? "ابدأ من هنا" : "Start here"}</span>
      {scoped.slice(0, 3).map(item => <button type="button" key={item.id} onClick={() => openAnswer(item.id)}>{item.q[locale]}<ArrowUpRight size={14} aria-hidden="true" className="rtl:-scale-x-100" /></button>)}
    </nav>}

    <div className={`${styles.toolbar} flex flex-wrap items-center justify-between gap-3 ${searchable ? "mt-6" : ""}`}>
      <p role="status" aria-live="polite" className="flex min-h-11 items-center text-sm text-[var(--text-muted)]">
        {ar ? `${visible.length} من ${scoped.length} سؤال` : `${visible.length} of ${scoped.length} questions`}
      </p>
      <div className={styles.toolbarActions}>
      {(searching || category) && <button type="button" onClick={resetFilters} className={styles.reset}><X size={15} aria-hidden="true" />{ar ? "مسح التصفية" : "Clear filters"}</button>}
      {visible.length > 1 && <button type="button" onClick={toggleAll} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[var(--link)] hover:bg-[var(--surface-soft)]">
        <ChevronDown size={16} aria-hidden="true" className={allOpen ? "rotate-180" : ""} />
        {allOpen ? (ar ? "طيّ الكل" : "Collapse all") : (ar ? "توسيع الكل" : "Expand all")}
      </button>}
      </div>
    </div>

    {visible.length === 0 && <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <MessageCircleQuestion size={32} aria-hidden="true" className="mx-auto text-[var(--action-bg)]" />
      <p className="mt-3 font-bold text-[var(--text-strong)]">{ar ? "لم نجد إجابة لهذا السؤال بعد." : "We don't have an answer for that yet."}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{ar ? "أرسله إلى الفريق وسنرد عليك مباشرة." : "Send it to the team and we'll reply to you directly."}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href={contactHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-5 text-sm font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">{ar ? "اسأل الفريق" : "Ask the team"}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button type="button" onClick={resetFilters} className="min-h-11 px-3 text-sm font-bold text-[var(--link)]">{ar ? "عرض كل الأسئلة" : "Show all questions"}</button>
      </div>
    </div>}

    <div className="mt-4 space-y-10">
      {sections.map(({ entry, rows }) => <section key={entry?.id ?? "results"} aria-labelledby={entry ? `${instance}-faq-group-${entry.id}` : undefined}>
        {entry && <h2 id={`${instance}-faq-group-${entry.id}`} className={`${styles.groupTitle} mb-5 text-center text-xl font-bold text-[var(--text-strong)]`}>{ar ? entry.ar : entry.en}<span>{rows.length}</span></h2>}
        <ul className="space-y-3">
          {rows.map(item => {
            const expanded = isExpanded(item.id)
            return <li key={item.id} id={item.id} data-expanded={expanded} className={`${styles.card} scroll-mt-28 overflow-hidden rounded-2xl border bg-[var(--surface)] transition-colors motion-reduce:transition-none ${expanded ? "border-[var(--action-bg)] shadow-sm" : "border-[var(--border)]"}`}>
              <h3>
                <button id={`${instance}-${item.id}-question`} data-faq-question type="button" onClick={() => toggle(item.id)} onKeyDown={navigateQuestions} aria-expanded={expanded} aria-controls={`${instance}-${item.id}-answer`}
                  className={`${styles.question} group flex min-h-16 w-full items-start justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--action-bg)] sm:px-6`}>
                  <span aria-hidden="true" className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${expanded ? "bg-[var(--action-bg)] text-[var(--action-fg)]" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}>{ar ? "س" : "Q"}</span>
                  <span className="min-w-0 flex-1">
                    {shownCategories.length > 1 && (searching || category === "") && !entry && <span className="mb-1 block text-xs font-bold text-[var(--action-bg)]">{ar ? categoryOf(item.category).ar : categoryOf(item.category).en}</span>}
                    <span className="block text-base font-bold leading-7 text-[var(--text-strong)] sm:text-[1.0625rem]">{highlight(item.q[locale], query)}</span>
                  </span>
                  <ChevronDown size={20} aria-hidden="true" className={`mt-1 shrink-0 text-[var(--text-muted)] transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180 text-[var(--action-bg)]" : ""}`} />
                </button>
              </h3>
              <div id={`${instance}-${item.id}-answer`} role="region" aria-labelledby={`${instance}-${item.id}-question`} hidden={!expanded} className={`${styles.answer} border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5 sm:px-6 sm:ps-[4.5rem]`}>
                <p className="mb-2 text-xs font-extrabold text-[var(--action-bg)]">{ar ? "الإجابة" : "Answer"}</p>
                <div className={`${styles.answerText} max-w-3xl space-y-3 text-[0.9375rem] leading-8 text-[var(--text-muted)]`}>
                  {item.a[locale].map((paragraph, index) => <p key={index} className="whitespace-pre-line">{highlight(paragraph, query)}</p>)}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {item.link && <Link href={item.link.href} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[var(--link)] hover:underline">{ar ? item.link.ar : item.link.en}<ArrowUpRight size={15} aria-hidden="true" className="rtl:-scale-x-100" /></Link>}
                  <button type="button" onClick={() => void copyLink(item.id)} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
                    {copied === item.id ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
                    <span aria-live="polite">{copied === item.id ? (ar ? "تم نسخ الرابط" : "Link copied") : (ar ? "نسخ رابط الإجابة" : "Copy link")}</span>
                  </button>
                  <Link href={helpHref(item.q[locale], categoryOf(item.category).contact)} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--link)] hover:underline"><MessageCircleQuestion size={15} aria-hidden="true" />{ar ? "اسأل عن هذا الموضوع" : "Ask a follow-up"}</Link>
                </div>
              </div>
            </li>
          })}
        </ul>
      </section>)}
    </div>

    {footer && visible.length > 0 && <aside className="mt-12 space-y-5 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-6 text-center sm:p-8">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-strong)]">{ar ? "لم تجد إجابتك؟" : "Didn't find your answer?"}</h2>
        <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">{ar ? "اسأل فريق وصول، أو إن كنت عضوًا فاطرح سؤالك على المؤسسين في «اسأل المجتمع»." : "Ask the Wosool team — or, if you're a member, put your question to other founders in Ask the community."}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={contactHref} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-5 text-sm font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">{ar ? "اسأل الفريق" : "Ask the team"}</Link>
        <Link href="/dashboard/help-requests" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--text)] hover:border-[var(--action-bg)]">{ar ? "اسأل المجتمع" : "Ask the community"}</Link>
      </div>
    </aside>}
  </div>
}
