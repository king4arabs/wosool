'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe2, UserRound, MapPin, Pause, Play, Search, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { eoNetworkProfiles, filterEoNetwork, NETWORK_INTERVAL_MS, type EoNetworkProfile } from '@/lib/eo-global-network'
import styles from './GlobalNetwork.module.css'

const motionQuery = '(prefers-reduced-motion: reduce)'
const subscribeMotion = (callback: () => void) => {
  const media = window.matchMedia(motionQuery)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}
const getMotion = () => window.matchMedia(motionQuery).matches
const serverMotion = () => true

function ProfileCard({ profile: p, ar }: { profile: EoNetworkProfile; ar: boolean }) {
  return <article className={styles.card} dir={ar ? 'rtl' : 'ltr'} data-profile={p.id}>
    <div className={styles.portrait}>
      <span className={styles.badge}>{p.group === 'leaders' ? (ar ? 'قيادة EO العالمية' : 'EO global leadership') : (ar ? 'شبكة متحدثي EO' : 'EO speaker network')}</span>
      <Image src={p.image} alt={p.name} width={160} height={160} sizes="160px" />
      <span className={styles.chapter}><MapPin size={13} aria-hidden="true" /><bdi>EO {p.chapter}</bdi></span>
    </div>
    <div className={styles.body}>
      <span className={styles.topic}>{ar ? p.topic_ar : p.topic}</span>
      <h3 dir="auto">{p.name}</h3>
      <p className={styles.position}>{ar ? p.position_ar : p.position}</p>
      <div className={styles.company}><span>{ar ? 'الشركة / المؤسسة' : 'COMPANY / ORGANIZATION'}</span><strong dir="auto">{p.company}</strong></div>
      <p className={styles.bio}>{ar ? p.bio_ar : p.bio}</p>
      <div className={styles.links}>
        {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} — LinkedIn (${ar ? 'نافذة جديدة' : 'new tab'})`}><UserRound size={16} aria-hidden="true" />LinkedIn<ArrowUpRight size={14} aria-hidden="true" /></a>}
        <a href={p.source} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} — ${ar ? 'ملف EO، نافذة جديدة' : 'EO profile, new tab'}`}>{ar ? 'ملف EO' : 'EO profile'}<ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
    </div>
  </article>
}

function ProfileCarousel({ profiles, ar, grid }: { profiles: EoNetworkProfile[]; ar: boolean; grid: boolean }) {
  const viewport = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, serverMotion)
  const move = useCallback((right: boolean) => {
    const el = viewport.current
    const card = el?.querySelector('article')
    if (!el || !card) return
    const step = card.getBoundingClientRect().width + 24
    const max = el.scrollWidth - el.clientWidth
    // The viewport stays LTR in both locales: decreasing scrollLeft moves cards physically right.
    if (right && el.scrollLeft <= 2) el.scrollTo({ left: max, behavior: 'instant' })
    else if (!right && el.scrollLeft >= max - 2) el.scrollTo({ left: 0, behavior: 'instant' })
    else el.scrollBy({ left: right ? -step : step, behavior: reduced ? 'instant' : 'smooth' })
  }, [reduced])
  useEffect(() => {
    if (grid) return
    const el = viewport.current
    if (el) el.scrollLeft = el.scrollWidth - el.clientWidth
  }, [grid])
  useEffect(() => {
    if (grid || paused || hovered || focused || reduced || profiles.length < 2) return
    const timer = window.setInterval(() => { if (!document.hidden) move(true) }, NETWORK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [grid, paused, hovered, focused, reduced, profiles.length, move])
  const stopped = paused || reduced
  return <div className={styles.carousel}>
    {!grid && <div className={styles.toolbar}>
      <span>{ar ? 'حركة نحو اليمين كل ٣ ثوانٍ' : 'Moves right every 3 seconds'}</span>
      <div className={styles.controls} dir="ltr">
        <button type="button" onClick={() => { setPaused(true); move(false) }} aria-label={ar ? 'تحريك البطاقات لليسار' : 'Move cards left'}><ArrowLeft size={18} /></button>
        <button type="button" disabled={reduced} onClick={() => setPaused(!paused)} aria-label={reduced ? (ar ? 'تقليل الحركة مفعّل' : 'Reduced motion enabled') : stopped ? (ar ? 'تشغيل الحركة' : 'Play carousel') : (ar ? 'إيقاف الحركة' : 'Pause carousel')} aria-pressed={stopped}>{stopped ? <Play size={17} /> : <Pause size={17} />}</button>
        <button type="button" onClick={() => { setPaused(true); move(true) }} aria-label={ar ? 'تحريك البطاقات لليمين' : 'Move cards right'}><ArrowRight size={18} /></button>
      </div>
    </div>}
    <div ref={viewport} className={grid ? styles.grid : styles.viewport} dir={grid ? (ar ? 'rtl' : 'ltr') : 'ltr'}
      role="region" aria-label={ar ? 'ملفات شبكة EO' : 'EO network profiles'} tabIndex={grid ? undefined : 0}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
      onPointerDown={() => setPaused(true)}
      onKeyDown={event => { if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setPaused(true); move(event.key === 'ArrowRight') } }}>
      <div className={grid ? styles.gridTrack : styles.track}>
        {(grid ? profiles : [...profiles].reverse()).map(p => <ProfileCard key={p.id} profile={p} ar={ar} />)}
      </div>
    </div>
  </div>
}

export function EoGlobalNetwork({ ar }: { ar: boolean }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [topic, setTopic] = useState('all')
  const [grid, setGrid] = useState(false)
  const profiles = useMemo(() => filterEoNetwork(query, group, topic), [query, group, topic])
  const chapters = new Set(eoNetworkProfiles.map(p => p.chapter.replace('Spain-', ''))).size
  const topics = [...new Map(eoNetworkProfiles.map(p => [p.topic, p.topic_ar])).entries()]
  return <section id="eo-global-network" className={styles.section} aria-labelledby="global-network-title">
    <div className={styles.intro}>
      <div>
        <span className={styles.eyebrow}><Globe2 size={16} aria-hidden="true" />{ar ? 'خبرات تتجاوز الحدود' : 'EXPERIENCE BEYOND BORDERS'}</span>
        <h2 id="global-network-title">{ar ? 'تعرّف على أصحاب الخبرة في شبكة EO' : 'Meet people across the EO network'}</h2>
        <p>{ar ? 'تصفح الملفات العامة لقادة ومتحدثين ومدربين من شبكة EO، وابحث حسب الشركة أو الفرع أو مجال الخبرة.' : 'Browse public profiles of EO leaders, speakers and coaches. Search by company, chapter or area of experience.'}</p>
      </div>
      <div className={styles.stats}>
        <div><strong>{eoNetworkProfiles.length}</strong><span>{ar ? 'ملفاً من شبكة EO' : 'EO network profiles'}</span></div>
        <div><strong>{chapters}</strong><span>{ar ? 'فرعاً حول العالم' : 'chapters represented'}</span></div>
        <div><strong>{topics.length}</strong><span>{ar ? 'مجالات خبرة' : 'areas of experience'}</span></div>
      </div>
    </div>
    <p className={styles.context}>{ar ? 'ملفات عامة من مصادر EO؛ ينسّق فريق البرنامج المشاركة المحلية ومواعيد الإرشاد. يوضّح اسم الفرع مدينة العضوية أو نطاقها الإقليمي وفق المصدر.' : 'Public profiles from EO sources. Local participation and mentoring availability are coordinated by the program team. Chapter labels retain EO’s published city or regional affiliation.'}</p>
    <div className={styles.filters}>
      <label><span>{ar ? 'ابحث في الشبكة' : 'Search the network'}</span><div className={styles.search}><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={ar ? 'الاسم، الشركة أو الفرع…' : 'Name, company or chapter…'} /></div></label>
      <label><span>{ar ? 'الشبكة' : 'Network'}</span><select value={group} onChange={e => setGroup(e.target.value)}><option value="all">{ar ? 'جميع الملفات' : 'All profiles'}</option><option value="speakers">{ar ? 'المتحدثون والمدربون' : 'Speakers & coaches'}</option><option value="leaders">{ar ? 'القيادة العالمية' : 'Global leadership'}</option></select></label>
      <label><span>{ar ? 'مجال الخبرة' : 'Experience'}</span><select value={topic} onChange={e => setTopic(e.target.value)}><option value="all">{ar ? 'جميع المجالات' : 'All areas'}</option>{topics.map(([en, arabic]) => <option key={en} value={en}>{ar ? arabic : en}</option>)}</select></label>
    </div>
    <div className={styles.results}><span role="status">{profiles.length} {ar ? 'ملفاً' : 'profiles'}</span><button type="button" onClick={() => setGrid(!grid)} aria-pressed={grid}><Users size={16} aria-hidden="true" />{grid ? (ar ? 'عرض متحرك' : 'Carousel view') : (ar ? 'عرض جميع البطاقات' : 'View all cards')}</button></div>
    {profiles.length ? <ProfileCarousel key={`${query}|${group}|${topic}`} profiles={profiles} ar={ar} grid={grid} /> : <div className={styles.empty}><h3>{ar ? 'لا توجد نتائج مطابقة' : 'No matching profiles'}</h3><button type="button" onClick={() => { setQuery(''); setGroup('all'); setTopic('all') }}>{ar ? 'مسح عوامل التصفية' : 'Clear filters'}</button></div>}
    <div className={styles.contact}><div><strong>{ar ? 'تبحث عن مساعدة في قرار محدد؟' : 'Need a sounding board for a decision?'}</strong><p>{ar ? 'أخبر فريق المسرّعة بالموضوع الذي تريد مناقشته؛ سيشرح لك فرص الإرشاد المتاحة.' : 'Tell the Accelerator team what you’re working through. They can explain which mentoring opportunities are available.'}</p></div><Link href="/eoa/contact" className="eoa-btn">{ar ? 'تواصل مع الفريق' : 'Talk to the team'}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
  </section>
}
