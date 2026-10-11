'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe2, Handshake, UserRound } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { filterMentors, mentorExpertise, mentorExternalUrl, mentorPortraitUrl, mentorText, publicMentors, type EoaMentor } from '@/lib/eoa-mentors'
import { Field, Notice } from './Shared'
import styles from './Mentors.module.css'

function MentorCard({ mentor, ar, index, total }: { mentor: EoaMentor; ar: boolean; index: number; total: number }) {
  const name = mentorText(ar, mentor.name_ar, mentor.name_en)
  const portrait = mentorPortraitUrl(mentor.portrait_path)
  const [failedPortrait, setFailedPortrait] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const bio = mentorText(ar, mentor.bio_ar, mentor.bio_en)
  const excerpt = bio.length > 240 ? `${bio.slice(0, bio.lastIndexOf(' ', 240) > 120 ? bio.lastIndexOf(' ', 240) : 240)}…` : bio
  const company = mentorText(ar, mentor.company_name_ar, mentor.company_name_en)
  const companyRole = mentorText(ar, mentor.company_role_ar, mentor.company_role_en)
  const expertise = mentorExpertise(mentor, ar)
  const links = [
    [mentorExternalUrl(mentor.company_url), ar ? 'الشركة' : 'Company'],
    [mentorExternalUrl(mentor.linkedin_url), 'LinkedIn'],
    [mentorExternalUrl(mentor.twitter_url), 'X'],
  ]

  return <article className={styles.card} dir={ar ? 'rtl' : 'ltr'} aria-roledescription={ar ? 'بطاقة مرشد' : 'slide'} aria-label={`${name} · ${index + 1} / ${total}`}>
    <div className={styles.portrait}>
      {portrait && failedPortrait !== portrait
        ? <Image src={portrait} alt={mentorText(ar, mentor.portrait_alt_ar, mentor.portrait_alt_en) || name} width={640} height={470} sizes="(max-width: 600px) 285px, 320px" unoptimized={!portrait.startsWith('/')} style={{ objectPosition: mentor.portrait_position || '50% 35%' }} onError={() => setFailedPortrait(portrait)} />
        : <span className={styles.fallback} aria-hidden="true"><UserRound size={60} strokeWidth={1.2} /></span>}
    </div>
    <div className={styles.body}>
      <h3>{name}</h3>
      <p className={styles.position}>{mentorText(ar, mentor.position_ar, mentor.position_en)}</p>
      {(company || companyRole) && <div className={styles.company}>{company && <strong>{company}</strong>}{companyRole && <span>{companyRole}</span>}</div>}
      <p className={styles.bio}>{expanded ? bio : excerpt}</p>
      {bio.length > 240 && <button className={styles.readMore} type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? ar ? 'عرض أقل' : 'Read less' : ar ? 'اقرأ النبذة كاملة' : 'Read full bio'}</button>}
      {expertise.length > 0 && <ul className={styles.tags} aria-label={ar ? 'مجالات الخبرة' : 'Areas of expertise'}>{expertise.map(subject => <li key={subject}>{subject}</li>)}</ul>}
      {links.some(([url]) => url) && <div className={styles.links} aria-label={ar ? `روابط ${name}` : `${name} links`}>
        {links.map(([url, label], position) => url && <a className={styles.profileLink} key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={ar ? `${name} — ${label} (نافذة جديدة)` : `${name} — ${label} (opens in a new tab)`}>{position === 0 ? <Globe2 size={15} aria-hidden="true" /> : <ArrowUpRight size={15} aria-hidden="true" />}{label}</a>)}
      </div>}
    </div>
  </article>
}

export function EoaMentors({ mentors, ar, loading = false, failed = false, retry, compact = false }: { mentors: EoaMentor[]; ar: boolean; loading?: boolean; failed?: boolean; retry?: () => void; compact?: boolean }) {
  const id = useId()
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const roster = useMemo(() => publicMentors(mentors), [mentors])
  const [query, setQuery] = useState('')
  const [expertise, setExpertise] = useState('')
  const [range, setRange] = useState({ previous: false, next: false })
  const availableExpertise = useMemo(() => [...new Set(roster.flatMap(mentor => mentorExpertise(mentor, ar)))].sort((a, b) => a.localeCompare(b, ar ? 'ar' : 'en')), [roster, ar])
  const activeExpertise = availableExpertise.includes(expertise) ? expertise : ''
  const visible = useMemo(() => filterMentors(roster, query, activeExpertise), [roster, query, activeExpertise])

  useEffect(() => {
    const element = viewport.current
    const content = track.current
    if (!element || !content) return
    const measure = () => {
      const maximum = Math.max(0, element.scrollWidth - element.clientWidth)
      setRange({ previous: ar ? element.scrollLeft < maximum - 2 : element.scrollLeft > 2, next: ar ? element.scrollLeft > 2 : element.scrollLeft < maximum - 2 })
    }
    element.scrollLeft = ar ? element.scrollWidth - element.clientWidth : 0
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(content)
    element.addEventListener('scroll', measure, { passive: true })
    return () => { observer.disconnect(); element.removeEventListener('scroll', measure) }
  }, [visible, ar])

  function scroll(left: number) {
    const element = viewport.current
    if (!element) return
    element.scrollTo({ left: Math.max(0, Math.min(element.scrollWidth - element.clientWidth, left)), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  function move(next: boolean) {
    const element = viewport.current
    if (!element) return
    const distance = (track.current?.firstElementChild?.getBoundingClientRect().width || 320) + 22
    scroll(element.scrollLeft + distance * (next ? 1 : -1) * (ar ? -1 : 1))
  }
  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !viewport.current) return
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') move(ar ? event.key === 'ArrowLeft' : event.key === 'ArrowRight')
    else scroll((event.key === 'Home') === ar ? viewport.current.scrollWidth : 0)
  }

  return <section className={`eoa-section ${styles.section}`} id="mentors" aria-labelledby={`${id}-title`}>
    <div className="eoa-container">
      <div className={styles.heading}>
        <div><span className="eoa-eyebrow">{ar ? 'خبرة تدعم قراراتك' : 'EXPERIENCE TO INFORM YOUR NEXT MOVE'}</span><h2 id={`${id}-title`}>{ar ? 'المرشدون والمستشارون' : 'Mentors & advisors'}</h2><p>{ar ? 'رؤى عملية تساعد المؤسسين على ترتيب أولويات النمو، ومناقشة القرارات، وتحويل التعلم إلى خطوات داخل الشركة.' : 'Practical perspectives to help founders prioritize growth, work through decisions and turn learning into action inside their businesses.'}</p></div>
        {(range.previous || range.next) && <div className={styles.controls} aria-label={ar ? 'التنقل بين المرشدين' : 'Mentor carousel controls'}>
          <button type="button" disabled={!range.previous} onClick={() => move(false)} aria-controls={`${id}-cards`} aria-label={ar ? 'المرشد السابق' : 'Previous mentor'}>{ar ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}</button>
          <button type="button" disabled={!range.next} onClick={() => move(true)} aria-controls={`${id}-cards`} aria-label={ar ? 'المرشد التالي' : 'Next mentor'}>{ar ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}</button>
        </div>}
      </div>
      {!loading && failed && <Notice error>{ar ? 'تعذر تحديث ملفات المرشدين.' : 'Mentor profiles could not be refreshed.'}{retry && <> <button type="button" className="eoa-text-link" onClick={retry}>{ar ? 'إعادة المحاولة' : 'Try again'}</button></>}</Notice>}
      {loading ? <Notice>{ar ? 'جارٍ تحميل ملفات المرشدين…' : 'Loading mentor profiles…'}</Notice> : !roster.length ? <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true"><Handshake size={28} /></span><div><h3>{ar ? 'تعرّف على دعم الإرشاد لدفعتك' : 'Explore mentoring for your cohort'}</h3><p>{failed ? (ar ? 'تواصل مع فريق البرنامج لمعرفة مسارات الإرشاد ومجموعات المساءلة المناسبة لرحلتك.' : 'Contact the program team to learn about mentoring and accountability groups for your journey.') : (ar ? 'ستظهر هنا ملفات المرشدين والمستشارين عند اكتمال تعيينهم. تواصل مع فريق البرنامج لمعرفة مسارات الإرشاد ومجموعات المساءلة المناسبة لرحلتك.' : 'Mentor and advisor profiles will appear here as appointments are completed. Contact the program team to learn about mentoring and accountability groups for your journey.')}</p><div className="eoa-actions"><Link href="/eoa/contact" className="eoa-btn">{ar ? 'تواصل مع فريق البرنامج' : 'Contact the program team'}</Link><Link href="/eoa/leadership" className="eoa-text-link">{ar ? 'تعرّف على قيادة البرنامج' : 'Meet program leadership'}</Link></div></div>
      </div> : <>
        {(!compact || roster.length > 4) && <div className={styles.filters} role="search" aria-label={ar ? 'البحث عن مرشد' : 'Find a mentor'}>
          <Field label={ar ? 'ابحث بالاسم أو الشركة أو مجال الخبرة' : 'Search name, company or expertise'}><input type="search" value={query} onChange={event => setQuery(event.target.value)} maxLength={120} /></Field>
          <Field label={ar ? 'مجال الخبرة' : 'Area of expertise'}><select value={activeExpertise} onChange={event => setExpertise(event.target.value)}><option value="">{ar ? 'جميع المجالات' : 'All areas'}</option>{availableExpertise.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></Field>
        </div>}
        {!visible.length ? <div className="eoa-card"><p role="status">{ar ? 'لا توجد ملفات تطابق هذا البحث.' : 'No profiles match this search.'}</p><button type="button" className="eoa-text-link" onClick={() => { setQuery(''); setExpertise('') }}>{ar ? 'إظهار جميع المرشدين' : 'Show all mentors'}</button></div> : <div ref={viewport} id={`${id}-cards`} className={styles.viewport} dir="ltr" tabIndex={0} role="region" aria-roledescription={ar ? 'عارض المرشدين' : 'carousel'} aria-label={ar ? 'ملفات المرشدين. استخدم السهمين للتنقل.' : 'Mentor profiles. Use arrow keys to browse.'} onKeyDown={handleKey}>
          <div ref={track} className={`${styles.track} ${ar ? styles.reverse : ''}`}>{visible.map((mentor, index) => <MentorCard key={mentor.id} mentor={mentor} ar={ar} index={index} total={visible.length} />)}</div>
        </div>}
        <div className={styles.caption}><span role="status">{ar ? `${visible.length} من ${roster.length} ملفات` : `${visible.length} of ${roster.length} profiles`}</span>{compact && <Link href="/eoa/mentors" className="eoa-text-link">{ar ? 'استكشف المرشدين' : 'Explore mentors'} ↗</Link>}</div>
      </>}
    </div>
  </section>
}
