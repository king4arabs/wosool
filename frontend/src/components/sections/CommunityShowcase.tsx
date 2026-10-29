"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, LayoutGrid, Pause, Play, Search, Shuffle } from "lucide-react"
import { PartnerCarousel } from "@/components/eoa/PartnerCarousel"
import { communityPartnerLogos, partnersToDisplay } from "@/lib/partner-logos"
import { useLocale } from "@/lib/locale"
import { FounderCard, type FounderCardProfile } from "./FounderCard"
import { filterFounders, regionOptions, sectorOptions, type FounderRegionFilter } from "@/lib/founder-filters"
import { createFounderMixStore, founderDiscoveryOrder } from "@/lib/founder-discovery"
import type { Partner } from "@/types"
import styles from "./community.module.css"
import { isDirectoryRecordVisible } from '@/lib/directory-geography'

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
function motionSnapshot() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches }

function FounderRow({ founders, suspended, onShuffle }: { founders: FounderCardProfile[]; suspended: boolean; onShuffle?: () => void }) {
  const { locale, direction } = useLocale()
  const ar = locale === 'ar'
  const id = useId()
  const rail = useRef<HTMLDivElement>(null)
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const [inView, setInView] = useState(false)
  const collectionKey = JSON.stringify(founders.map(founder => founder.id))

  useEffect(() => {
    const element = rail.current
    if (!element) return
    // Use a positive LTR offset and reversed visual order in both languages.
    // Reducing this offset moves the visible cards physically to the right.
    element.scrollLeft = element.scrollWidth - element.clientWidth
    const measure = () => setOverflow(element.scrollWidth > element.clientWidth + 2)
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(element)
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .1 })
    visibility.observe(element)
    return () => { resize.disconnect(); visibility.disconnect() }
  }, [collectionKey])

  const move = useCallback((towards: 'left' | 'right') => {
    const element = rail.current
    if (!element) return
    const maximum = Math.max(0, element.scrollWidth - element.clientWidth)
    const track = element.firstElementChild
    const gap = track ? Number.parseFloat(getComputedStyle(track).columnGap) || 20 : 20
    const step = (track?.firstElementChild?.getBoundingClientRect().width || 320) + gap
    // Snap alignment can settle 3px short of the end because of viewport padding.
    const wrap = towards === 'right' ? element.scrollLeft <= 4 : element.scrollLeft >= maximum - 4
    const target = wrap ? towards === 'right' ? maximum : 0 : element.scrollLeft + (towards === 'right' ? -step : step)
    element.scrollTo({ left: Math.max(0, Math.min(maximum, target)), behavior: reducedMotion || wrap ? 'instant' : 'smooth' })
  }, [reducedMotion])

  useEffect(() => {
    if (!overflow || !inView || paused || hovered || suspended || reducedMotion) return
    const timer = window.setInterval(() => { if (!document.hidden) move('right') }, 3000)
    return () => window.clearInterval(timer)
  }, [overflow, inView, paused, hovered, suspended, reducedMotion, move])

  function manualMove(towards: 'left' | 'right') { setPaused(true); move(towards) }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    setPaused(true)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') move(event.key === 'ArrowRight' ? 'right' : 'left')
    else if (rail.current) rail.current.scrollTo({ left: event.key === 'Home' ? rail.current.scrollWidth : 0, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  return <div className={styles.founderRow}>
    <div className={styles.founderRowHead}>
      <span>{ar ? 'تعرّف على المؤسسين' : 'Meet the founders'}<small>{ar ? 'اسحب أو استخدم الأسهم للاستكشاف' : 'Swipe or use the arrows to explore'}</small></span>
      <div role="group" className={styles.controls} dir="ltr" aria-label={ar ? 'التحكم ببطاقات المؤسسين' : 'Founder carousel controls'}>
        {onShuffle && <button type="button" onClick={onShuffle} aria-label={ar ? 'اعرض مجموعة أخرى من المؤسسين' : 'Show another founder mix'} title={ar ? 'اعرض مجموعة أخرى' : 'Show another mix'}><Shuffle size={18} aria-hidden="true" /></button>}
        <button type="button" aria-controls={id} aria-label={ar ? 'تحريك بطاقات المؤسسين إلى اليسار' : 'Move founder cards left'} disabled={!overflow} onClick={() => manualMove('left')}><ArrowLeft size={19} aria-hidden="true" /></button>
        {!reducedMotion && <button type="button" aria-controls={id} aria-label={paused ? ar ? 'تشغيل حركة بطاقات المؤسسين' : 'Resume founder movement' : ar ? 'إيقاف حركة بطاقات المؤسسين' : 'Pause founder movement'} disabled={!overflow || suspended} onClick={() => setPaused(value => !value)}>{paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}</button>}
        <button type="button" aria-controls={id} aria-label={ar ? 'تحريك بطاقات المؤسسين إلى اليمين' : 'Move founder cards right'} disabled={!overflow} onClick={() => manualMove('right')}><ArrowRight size={19} aria-hidden="true" /></button>
      </div>
    </div>
    <div id={id} ref={rail} className={styles.founderRail} dir="ltr" role="region" aria-roledescription={ar ? 'عارض بطاقات' : 'carousel'} tabIndex={overflow ? 0 : undefined} onKeyDown={keyboard} aria-label={ar ? 'صف بطاقات المؤسسين. استخدم الأسهم للتنقل.' : 'Founder card row. Use arrow keys to browse.'} onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true) }} onPointerLeave={() => setHovered(false)} onPointerDown={() => setPaused(true)} onWheel={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
      <ul className={styles.founderTrack}>{founders.map(founder => <li key={founder.id} dir={direction}><FounderCard founder={founder} /></li>)}</ul>
    </div>
  </div>
}

export function FounderShowcase({ founders: suppliedFounders, showFilters = true, region: controlledRegion, onRegionChange, randomize = false, allRegions = false, loading = false }: {
  founders: FounderCardProfile[]
  allRegions?: boolean
  loading?: boolean
  showFilters?: boolean
  /** Homepage discovery only; directory/grid order remains stable. */
  randomize?: boolean
  /** Lets a parent keep the region selection when it remounts this showcase for its own filters. */
  region?: FounderRegionFilter
  onRegionChange?: (region: FounderRegionFilter) => void
}) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const founders = useMemo(() => suppliedFounders.filter(isDirectoryRecordVisible), [suppliedFounders])
  const searchId = useId()
  const gridId = useId()
  const grid = useRef<HTMLElement>(null)
  const gridToggle = useRef<HTMLButtonElement>(null)
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [ownRegion, setOwnRegion] = useState<FounderRegionFilter>('all')
  const region = controlledRegion ?? ownRegion
  const [gridOpen, setGridOpen] = useState(false)
  const [pageSize, setPageSize] = useState(6)
  const [page, setPage] = useState(1)
  const [filterLocale, setFilterLocale] = useState(locale)
  // Sector values are translated strings; reset them without remounting the visit's mix store.
  if (filterLocale !== locale) {
    setFilterLocale(locale)
    setSector('')
    setPage(1)
  }
  const sectors = sectorOptions(founders, region, locale)
  const regions = regionOptions(founders, region, locale, allRegions)
  const filtered = useMemo(() => filterFounders(founders, { search, sector, region }, locale), [founders, locale, search, sector, region])
  const [mixStore] = useState(createFounderMixStore)
  const mixSeed = useSyncExternalStore(mixStore.subscribe, mixStore.getSnapshot, mixStore.getServerSnapshot)
  const carouselFounders = useMemo(() => randomize ? founderDiscoveryOrder(filtered, mixSeed).slice(0, 36) : filtered.slice(0, 18), [filtered, randomize, mixSeed])
  const hasFilters = Boolean(search || sector || region !== 'all')
  function changeRegion(value: FounderRegionFilter) {
    setOwnRegion(value)
    onRegionChange?.(value)
    // A sector that does not exist in the new region would leave an empty list with no visible reason.
    if (sector && !sectorOptions(founders, value, locale).includes(sector)) setSector('')
    setPage(1)
  }
  function clearFilters() {
    setSearch('')
    setSector('')
    changeRegion('all')
  }
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize)
  const pageNumbers = [...new Set([1, current - 1, current, current + 1, pages])].filter(value => value >= 1 && value <= pages).sort((a, b) => a - b)

  function revealGrid() {
    requestAnimationFrame(() => {
      grid.current?.focus({ preventScroll: true })
      grid.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    })
  }
  function toggleGrid() {
    setGridOpen(value => !value)
    if (!gridOpen) revealGrid()
    else gridToggle.current?.focus({ preventScroll: true })
  }
  function changePage(value: number) { setPage(value); revealGrid() }

  return <div className={styles.showcase}>
    {showFilters && <div className={styles.founderFilters}>
      <label className={styles.search} htmlFor={searchId}><span>{ar ? 'ابحث عن مؤسس أو شركة' : 'Find a founder or company'}</span><div><Search size={18} aria-hidden="true" /><input id={searchId} type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder={ar ? 'الاسم، الشركة أو الخبرة' : 'Name, company or expertise'} /></div></label>
      <label className={styles.sectorFilter}><span>{ar ? 'القطاع' : 'Sector'}</span><select value={sector} onChange={event => { setSector(event.target.value); setPage(1) }}><option value="">{ar ? 'جميع القطاعات' : 'All sectors'}</option>{sectors.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      {hasFilters && <button type="button" className={styles.clearFilters} onClick={clearFilters}>{ar ? 'مسح الفلاتر' : 'Clear filters'}</button>}
    </div>}
    {regions.length > 1 && <>
    <div className={styles.regionFilters} role="group" aria-label={ar ? "تصفية المؤسسين حسب المنطقة" : "Filter founders by region"}>
      <button type="button" aria-pressed={region === 'all'} onClick={() => changeRegion('all')}>{ar ? 'الكل' : 'All'}</button>
      {regions.map(item => <button type="button" key={item.key} aria-pressed={region === item.key} onClick={() => changeRegion(item.key)}>{item.label}</button>)}
    </div>
    </>}
    {!loading && !filtered.length && <div className={styles.founderResults}><p role="status" aria-live="polite">{ar ? 'لا توجد ملفات مطابقة. جرّب اسمًا أو قطاعًا أو منطقة أخرى.' : 'No matching profiles. Try another name, sector or region.'}</p></div>}
    {!!filtered.length && <>
      <FounderRow key={`${locale}-${search}-${sector}-${region}`} founders={carouselFounders} suspended={gridOpen} onShuffle={randomize ? mixStore.shuffle : undefined} />
      <div className={styles.gridInvitation}><button ref={gridToggle} type="button" className={styles.gridToggle} aria-expanded={gridOpen} aria-controls={gridId} onClick={toggleGrid}><LayoutGrid size={18} aria-hidden="true" />{gridOpen ? ar ? 'إخفاء شبكة المؤسسين' : 'Hide founder grid' : ar ? 'عرض جميع المؤسسين' : 'View all founders'}{gridOpen ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}</button><span>{ar ? 'استكشف الملفات في شبكة مرتّبة مع صفحات' : 'Browse the full collection in a paginated grid'}</span></div>
    </>}
    <section ref={grid} id={gridId} className={styles.founderGridSection} hidden={!gridOpen || !filtered.length} tabIndex={-1} aria-labelledby={`${gridId}-title`}>
      <div className={styles.gridHead}><div><h3 id={`${gridId}-title`}>{ar ? 'جميع ملفات المؤسسين' : 'All founder profiles'}</h3><p>{ar ? 'تصفّح المؤسسين حسب الصفحة' : 'Browse founders by page'}</p></div><button type="button" className={styles.clearFilters} onClick={toggleGrid}>{ar ? 'إغلاق الشبكة' : 'Close grid'}<ChevronUp size={16} aria-hidden="true" /></button></div>
      {gridOpen && <ul className={styles.founderGrid}>{visible.map(founder => <li key={founder.id}><FounderCard founder={founder} /></li>)}</ul>}
      <div className={styles.founderPagination}>
        <label>{ar ? 'ملفات في الصفحة' : 'Profiles per page'}<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); revealGrid() }}>{[6, 12, 24].map(value => <option value={value} key={value}>{value}</option>)}</select></label>
        <nav aria-label={ar ? 'صفحات شبكة المؤسسين' : 'Founder grid pages'}>
          <button type="button" disabled={current === 1} onClick={() => changePage(current - 1)}>{ar ? 'السابق' : 'Previous'}</button>
          {pageNumbers.map((value, index) => <span className={styles.pageNumber} key={value}>{index > 0 && value - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}<button type="button" aria-label={ar ? `الصفحة ${value}` : `Page ${value}`} aria-current={current === value ? 'page' : undefined} onClick={() => changePage(value)}>{value}</button></span>)}
          <button type="button" disabled={current === pages} onClick={() => changePage(current + 1)}>{ar ? 'التالي' : 'Next'}</button>
        </nav>
      </div>
    </section>
  </div>
}

export function CommunityPartners({ partners, loaded, loading, failed, retry }: { partners: Partner[]; loaded: boolean; loading: boolean; failed: boolean; retry: () => void }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const approved = useMemo(() => partners.filter(partner => partner.status === "Confirmed" && partner.logoUrl).map(partner => ({
    id: partner.id, name_en: partner.name, name_ar: partner.name, website: partner.website, logo_path: partner.logoUrl,
  })), [partners])
  return <PartnerCarousel partners={partnersToDisplay(loaded ? approved : null, communityPartnerLogos)} ar={ar} includeEo={false} headingId="community-partners-title"
    action={<Link href="/contact?category=partnerships">{ar ? 'انضم كشريك' : 'Become a partner'}</Link>}
    emptyState={<div className={styles.partnerEmpty} role="status"><p>{loading ? ar ? 'جارٍ تحميل الشركاء…' : 'Loading partners…' : failed ? ar ? 'تعذر تحميل الشركاء الآن.' : 'Partners are temporarily unavailable.' : ar ? 'ساهم في دعم مجتمع المؤسسين. تواصل معنا لاستكشاف فرص الشراكة.' : 'Help support the founder community. Get in touch to explore a partnership.'}</p>{failed && <button type="button" onClick={retry} disabled={loading}>{ar ? 'إعادة المحاولة' : 'Try again'}</button>}</div>}
  />
}
