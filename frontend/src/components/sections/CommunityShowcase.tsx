"use client"

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Search } from "lucide-react"
import { PartnerCarousel } from "@/components/eoa/PartnerCarousel"
import { useLocale } from "@/lib/locale"
import { FounderCard, type FounderCardProfile } from "./FounderCard"
import type { Partner } from "@/types"
import styles from "./community.module.css"

function FounderRow({ founders, row }: { founders: FounderCardProfile[]; row: number }) {
  const { locale, direction } = useLocale()
  const ar = locale === 'ar'
  const id = useId()
  const rail = useRef<HTMLUListElement>(null)
  const firstVisible = useRef(0)
  const [boundaries, setBoundaries] = useState({ start: true, end: true })

  useEffect(() => {
    const element = rail.current
    if (!element) return
    const update = () => {
      const rect = element.getBoundingClientRect()
      const cards = Array.from(element.children) as HTMLElement[]
      const first = cards[0]?.getBoundingClientRect()
      const last = cards.at(-1)?.getBoundingClientRect()
      if (!first || !last) return
      const rtl = direction === 'rtl'
      setBoundaries({ start: rtl ? first.right <= rect.right + 5 : first.left >= rect.left - 5, end: rtl ? last.left >= rect.left - 5 : last.right <= rect.right + 5 })
      let closest = Infinity
      cards.forEach((card, index) => {
        const bounds = card.getBoundingClientRect()
        const distance = Math.abs(rtl ? bounds.right - rect.right : bounds.left - rect.left)
        if (distance < closest) { closest = distance; firstVisible.current = index }
      })
    }
    const observer = new ResizeObserver(update)
    observer.observe(element)
    element.addEventListener('scroll', update, { passive: true })
    update()
    return () => { observer.disconnect(); element.removeEventListener('scroll', update) }
  }, [direction, founders.length])

  function go(index: number) {
    const element = rail.current
    if (!element) return
    const target = Math.min(founders.length - 1, Math.max(0, index))
    element.children[target]?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest', inline: 'start' })
  }
  function keyboard(event: KeyboardEvent<HTMLUListElement>) {
    if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'Home') go(0)
    else if (event.key === 'End') go(founders.length - 1)
    else go(firstVisible.current + ((event.key === 'ArrowRight') === (direction === 'ltr') ? 1 : -1))
  }
  const Previous = ar ? ArrowRight : ArrowLeft
  const Next = ar ? ArrowLeft : ArrowRight
  return <div className={styles.founderRow}>
    <div className={styles.founderRowHead}>
      <span>{ar ? `مجموعة المؤسسين ${row}` : `Founder collection ${row}`}<small>{ar ? 'اسحب لاستكشاف الملفات' : 'Swipe to discover'}</small></span>
      <div className={styles.controls}>
        <button type="button" aria-controls={id} aria-label={ar ? `المؤسس السابق في الصف ${row}` : `Previous founder in row ${row}`} disabled={boundaries.start} onClick={() => go(firstVisible.current - 1)}><Previous size={19} aria-hidden="true" /></button>
        <button type="button" aria-controls={id} aria-label={ar ? `المؤسس التالي في الصف ${row}` : `Next founder in row ${row}`} disabled={boundaries.end} onClick={() => go(firstVisible.current + 1)}><Next size={19} aria-hidden="true" /></button>
      </div>
    </div>
    <ul id={id} ref={rail} className={styles.founderRail} dir={direction} tabIndex={0} onKeyDown={keyboard} aria-label={ar ? `ملفات المؤسسين، الصف ${row}` : `Founder profiles, row ${row}`}>
      {founders.map(founder => <li key={founder.id}><FounderCard founder={founder} /></li>)}
    </ul>
  </div>
}

export function FounderShowcase({ founders, showFilters = true }: { founders: FounderCardProfile[]; showFilters?: boolean }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [rows, setRows] = useState(2)
  const [page, setPage] = useState(1)
  const sectors = [...new Set(founders.map(founder => founder.primaryCompany?.sector || founder.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale))
  const filtered = useMemo(() => founders.filter(founder => {
    const company = founder.primaryCompany
    const matchesSector = !sector || (company?.sector || founder.sector) === sector
    const haystack = [founder.name, founder.companyName, company?.name, founder.position, founder.bio, founder.location, founder.sector, company?.sector].filter(Boolean).join(' ').toLocaleLowerCase(locale)
    return matchesSector && haystack.includes(search.trim().toLocaleLowerCase(locale))
  }), [founders, locale, search, sector])
  const pageSize = rows * 6
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize)
  const actualRows = Math.min(rows, Math.ceil(visible.length / 3))
  const from = filtered.length ? (current - 1) * pageSize + 1 : 0
  const to = Math.min(current * pageSize, filtered.length)
  return <div className={styles.showcase}>
    {showFilters && <div className={styles.founderFilters}>
      <label className={styles.search} htmlFor={searchId}><span>{ar ? 'ابحث عن مؤسس أو شركة' : 'Find a founder or company'}</span><div><Search size={18} aria-hidden="true" /><input id={searchId} type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder={ar ? 'الاسم، الشركة أو الخبرة' : 'Name, company or expertise'} /></div></label>
      <label className={styles.sectorFilter}><span>{ar ? 'القطاع' : 'Sector'}</span><select value={sector} onChange={event => { setSector(event.target.value); setPage(1) }}><option value="">{ar ? 'جميع القطاعات' : 'All sectors'}</option>{sectors.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      {(search || sector) && <button type="button" className={styles.clearFilters} onClick={() => { setSearch(''); setSector(''); setPage(1) }}>{ar ? 'مسح البحث' : 'Clear filters'}</button>}
    </div>}
    <div className={styles.founderResults}><p role="status" aria-live="polite">{filtered.length ? ar ? `عرض ${from}–${to} من ${filtered.length} ملفًا` : `Showing ${from}–${to} of ${filtered.length} profiles` : ar ? 'لا توجد ملفات مطابقة. جرّب اسمًا أو قطاعًا آخر.' : 'No matching profiles. Try another name or sector.'}</p><span>{ar ? 'تصفّح على مهل' : 'Explore at your own pace'}</span></div>
    {Array.from({ length: actualRows }, (_, index) => <FounderRow key={`${current}-${rows}-${search}-${sector}-${locale}-${index}`} row={index + 1} founders={visible.slice(Math.floor(index * visible.length / actualRows), Math.floor((index + 1) * visible.length / actualRows))} />)}
    {!!filtered.length && <div className={styles.founderPagination}>
      <label>{ar ? 'عدد الصفوف' : 'Rows'}<select value={rows} onChange={event => { setRows(Number(event.target.value)); setPage(1) }}>{[2, 4, 6].map(value => <option value={value} key={value}>{value}</option>)}</select></label>
      {pages > 1 && <nav aria-label={ar ? 'صفحات المؤسسين' : 'Founder pages'}><button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>{ar ? 'السابق' : 'Previous'}</button><span>{ar ? `الصفحة ${current} من ${pages}` : `Page ${current} of ${pages}`}</span><button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>{ar ? 'التالي' : 'Next'}</button></nav>}
    </div>}
  </div>
}

export function CommunityPartners({ partners, loading, failed, retry }: { partners: Partner[]; loading: boolean; failed: boolean; retry: () => void }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const approved = useMemo(() => partners.filter(partner => partner.status === "Confirmed" && partner.logoUrl).map(partner => ({
    id: partner.id, name_en: partner.name, name_ar: partner.name, website: partner.website, logo_path: partner.logoUrl,
  })), [partners])
  return <PartnerCarousel partners={approved} ar={ar} includeEo={false} headingId="community-partners-title"
    action={<Link href="/contact?category=partnerships">{ar ? 'انضم كشريك' : 'Become a partner'}</Link>}
    emptyState={<div className={styles.partnerEmpty} role="status"><p>{loading ? ar ? 'جارٍ تحميل الشركاء…' : 'Loading partners…' : failed ? ar ? 'تعذر تحميل الشركاء الآن.' : 'Partners are temporarily unavailable.' : ar ? 'ساهم في دعم مجتمع المؤسسين. تواصل معنا لاستكشاف فرص الشراكة.' : 'Help support the founder community. Get in touch to explore a partnership.'}</p>{failed && <button type="button" onClick={retry} disabled={loading}>{ar ? 'إعادة المحاولة' : 'Try again'}</button>}</div>}
  />
}
