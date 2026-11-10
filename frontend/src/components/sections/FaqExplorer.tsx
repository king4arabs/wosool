"use client"

import Link from "next/link"
import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { ArrowUpRight, Check, ChevronDown, Link2, MessageCircleQuestion, Plus, Search, X } from "lucide-react"
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

export type FaqTopic = { id: string; ar: string; en: string; contact: string; items: string[] }

export function FaqExplorer({
  items,
  categories = FAQ_CATEGORIES.map(category => category.id),
  searchable = true,
  grouped = true,
  jsonLd = true,
  footer = true,
  placeholder,
  contactPath = "/contact",
  topics,
}: {
  items: FaqItem[]
  categories?: FaqCategory[]
  searchable?: boolean
  grouped?: boolean
  jsonLd?: boolean
  footer?: boolean
  placeholder?: string
  contactPath?: "/contact" | "/eoa/contact"
  topics?: FaqTopic[]
}) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
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
  const shownTopics = topics ?? FAQ_CATEGORIES.filter(entry => categories.includes(entry.id)).map(entry => ({
    ...entry, items: scoped.filter(item => item.category === entry.id).map(item => item.id),
  }))
  const selectedTopic = shownTopics.find(entry => entry.id === category)
  const visible = scoped.filter(item => (!selectedTopic || selectedTopic.items.includes(item.id)) && matchesFaq(item, query))
  const counts = Object.fromEntries(shownTopics.map(entry => [entry.id, scoped.filter(item => entry.items.includes(item.id) && matchesFaq(item, query)).length]))
  const totalMatches = scoped.filter(item => matchesFaq(item, query)).length

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
    ? shownTopics.map(entry => ({ entry, rows: visible.filter(item => entry.items.includes(item.id)) })).filter(section => section.rows.length)
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
  const topicOf = (item: FaqItem) => shownTopics.find(topic => topic.items.includes(item.id))
  const contactCategory = selectedTopic?.contact ?? "general"
  const helpHref = (subject?: string, topic = contactCategory) => `${contactPath}?category=${topic}${subject ? `&subject=${encodeURIComponent(subject.slice(0, 120))}` : ""}`
  const contactHref = helpHref(searching ? query.trim() : undefined)
  const selectTopic = (value: string) => {
    setCategory(value)
    requestAnimationFrame(() => document.getElementById(`${instance}-results`)?.scrollIntoView({ block: "nearest", behavior: "instant" }))
  }

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

  return <div ref={root} className={styles.root} data-faq-explorer>
    {structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />}
    {searchable && <div className={styles.searchPanel}>
      <label className={styles.searchField}>
        <span className="sr-only">{ar ? "ابحث في الأسئلة" : "Search the questions"}</span>
        <Search size={22} aria-hidden="true" />
        <input ref={searchInput} type="search" value={query}
          onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); resetFilters() } }}
          onChange={event => changeQuery(event.target.value)}
          aria-describedby={`${instance}-search-help`}
          placeholder={placeholder ?? (ar ? "ما الذي تود معرفته؟" : "What would you like to know?")} />
      </label>
      {query && <button type="button" onClick={() => { changeQuery(""); searchInput.current?.focus() }} aria-label={ar ? "مسح البحث" : "Clear search"} className={styles.clearSearch}><X size={19} aria-hidden="true" /></button>}
      <p id={`${instance}-search-help`} className={styles.searchHint}>{ar ? "ابحث بالعربية أو الإنجليزية، أو تصفّح المواضيع أدناه." : "Search in Arabic or English, or browse the topics below."}</p>
    </div>}

    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        {shownTopics.length > 1 && <>
          <p className={styles.sidebarTitle}>{ar ? "تصفّح المواضيع" : "Browse topics"}</p>
          <label className={styles.mobileTopics}>
            <span className="sr-only">{ar ? "اختر موضوعًا" : "Choose a topic"}</span>
            <select aria-label={ar ? "تصفية حسب الموضوع" : "Filter by topic"} value={category} onChange={event => selectTopic(event.target.value)}>
              <option value="">{ar ? "كل المواضيع" : "All topics"} ({totalMatches})</option>
              {shownTopics.map(entry => <option key={entry.id} value={entry.id} disabled={!counts[entry.id]}>{ar ? entry.ar : entry.en} ({counts[entry.id] ?? 0})</option>)}
            </select>
          </label>
          <div role="group" aria-label={ar ? "تصفية حسب الموضوع" : "Filter by topic"} className={styles.topics}>
            {[{ id: "", ar: "كل المواضيع", en: "All topics" }, ...shownTopics].map(entry => {
              const active = category === entry.id
              const count = entry.id ? counts[entry.id] ?? 0 : totalMatches
              return <button key={entry.id || "all"} type="button" aria-pressed={active} onClick={() => selectTopic(entry.id)} disabled={!active && count === 0}>
                <span>{ar ? entry.ar : entry.en}</span><span className={styles.topicCount}>{count}</span>
              </button>
            })}
          </div>
        </>}
        {searchable && !searching && !category && <details className={styles.shortcuts}>
          <summary>{ar ? "إجابات سريعة" : "Quick answers"}<ChevronDown size={16} aria-hidden="true" /></summary>
          <nav aria-label={ar ? "إجابات سريعة" : "Quick answers"}>
            {scoped.slice(0, 3).map(item => <button type="button" key={item.id} onClick={() => openAnswer(item.id)}>{item.q[locale]}<ArrowUpRight size={15} aria-hidden="true" className="rtl:-scale-x-100" /></button>)}
          </nav>
        </details>}
        <div className={styles.sidebarHelp}>
          <MessageCircleQuestion size={24} aria-hidden="true" />
          <strong>{ar ? "تحتاج مساعدة إضافية؟" : "Need a little more help?"}</strong>
          <p>{ar ? "فريقنا هنا للإجابة عن أسئلتك." : "Our team is here to answer your questions."}</p>
          <Link href={contactHref}>{ar ? "تواصل مع الفريق" : "Contact the team"}<ArrowUpRight size={16} aria-hidden="true" className="rtl:-scale-x-100" /></Link>
        </div>
      </aside>

      <div className={styles.results} id={`${instance}-results`}>
        <div className={styles.toolbar}>
          <div>
            <h2>{searching ? (ar ? "نتائج البحث" : "Search results") : selectedTopic ? (ar ? selectedTopic.ar : selectedTopic.en) : (ar ? "كل الأسئلة" : "All questions")}</h2>
            <p role="status" aria-live="polite">{ar ? `${visible.length} من ${scoped.length} سؤال` : `${visible.length} of ${scoped.length} questions`}</p>
          </div>
          <div className={styles.toolbarActions}>
            {(searching || category) && <button type="button" onClick={resetFilters}><X size={14} aria-hidden="true" />{ar ? "مسح التصفية" : "Clear filters"}</button>}
            {visible.length > 1 && <button type="button" onClick={toggleAll}><ChevronDown size={15} aria-hidden="true" className={allOpen ? styles.rotated : ""} />{allOpen ? (ar ? "طيّ الكل" : "Collapse all") : (ar ? "توسيع الكل" : "Expand all")}</button>}
          </div>
        </div>

        {visible.length === 0 && <div className={styles.empty}>
          <Search size={28} aria-hidden="true" />
          <h3>{ar ? "لم نجد إجابة مطابقة" : "No matching answers"}</h3>
          <p>{ar ? "جرّب كلمة أخرى أو ابحث في جميع المواضيع." : "Try a different keyword or search across all topics."}</p>
          <div><button type="button" onClick={resetFilters}>{ar ? "عرض كل الأسئلة" : "Show all questions"}</button><Link href={contactHref}>{ar ? "اسأل الفريق" : "Ask the team"}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </div>}

        <div className={styles.sections}>
          {sections.map(({ entry, rows }) => <section key={entry?.id ?? "results"} aria-labelledby={entry ? `${instance}-faq-group-${entry.id}` : undefined}>
            {entry && <h3 id={`${instance}-faq-group-${entry.id}`} className={styles.groupTitle}>{ar ? entry.ar : entry.en}<span>{rows.length}</span></h3>}
            <ul className={styles.questionList}>
              {rows.map(item => {
                const expanded = isExpanded(item.id)
                const QuestionHeading = entry ? "h4" : "h3"
                return <li key={item.id} id={item.id} data-expanded={expanded} className={styles.card}>
                  <QuestionHeading>
                    <button id={`${instance}-${item.id}-question`} data-faq-question type="button" onClick={() => toggle(item.id)} onKeyDown={navigateQuestions} aria-expanded={expanded} aria-controls={`${instance}-${item.id}-answer`} className={styles.question}>
                      <span>{searching && topicOf(item) && <span className={styles.resultTopic}>{ar ? topicOf(item)!.ar : topicOf(item)!.en}</span>}{highlight(item.q[locale], query)}</span>
                      <span className={styles.toggleIcon}><Plus size={18} aria-hidden="true" /></span>
                    </button>
                  </QuestionHeading>
                  <div id={`${instance}-${item.id}-answer`} role="region" aria-labelledby={`${instance}-${item.id}-question`} hidden={!expanded} className={styles.answer}>
                    <div className={styles.answerText}>{item.a[locale].map((paragraph, index) => <p key={index}>{highlight(paragraph, query)}</p>)}</div>
                    <div className={styles.answerActions}>
                      {item.link && <Link href={item.link.href}>{ar ? item.link.ar : item.link.en}<ArrowUpRight size={15} aria-hidden="true" className="rtl:-scale-x-100" /></Link>}
                      <button type="button" onClick={() => void copyLink(item.id)}>{copied === item.id ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}<span aria-live="polite">{copied === item.id ? (ar ? "تم نسخ الرابط" : "Link copied") : (ar ? "نسخ رابط الإجابة" : "Copy link")}</span></button>
                      <Link href={helpHref(item.q[locale], topicOf(item)?.contact)}><MessageCircleQuestion size={15} aria-hidden="true" />{ar ? "اسأل عن هذا الموضوع" : "Ask a follow-up"}</Link>
                    </div>
                  </div>
                </li>
              })}
            </ul>
          </section>)}
        </div>
        {footer && visible.length > 0 && <footer className={styles.footer}>
          <div><h2>{ar ? "لم تجد إجابتك؟" : "Still have a question?"}</h2><p>{ar ? "اسأل فريق وصول، أو شارك سؤالك مع مجتمع المؤسسين." : "Ask the Wosool team or put your question to the founder community."}</p></div>
          <div><Link href={contactHref}>{ar ? "اسأل الفريق" : "Ask the team"}<ArrowUpRight size={16} aria-hidden="true" /></Link><Link href="/dashboard/help-requests">{ar ? "اسأل المجتمع" : "Ask the community"}</Link></div>
        </footer>}
      </div>
    </div>
  </div>
}
