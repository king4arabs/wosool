'use client'

import Image from 'next/image'
import { ArrowLeft, ArrowRight, Globe2, Pause, Play, UserRound } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { boardExternalUrl, boardMemberName, boardPortraitUrl, boardScrollOffset, boardText, publishedBoardMembers, type EoaBoardMember } from '@/lib/eoa-board'
import styles from './Board.module.css'

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
function reducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type SocialKind = 'linkedin' | 'twitter' | 'facebook' | 'instagram'
function SocialIcon({ kind }: { kind: SocialKind }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    {kind === 'linkedin' && <path d="M5.3 3a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 5.3 3ZM3.4 9h3.8v12H3.4V9Zm6.2 0h3.6v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.5V21h-3.8v-6c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9.6V9Z" />}
    {kind === 'twitter' && <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.5L2.8 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L8.4 4H6.6l11.2 16Z" />}
    {kind === 'facebook' && <path d="M13.7 22v-9.1h3l.5-3.5h-3.5V7.2c0-1 .3-1.7 1.8-1.7h1.9V2.3C17.1 2.2 15.9 2 14.5 2c-2.8 0-4.7 1.7-4.7 4.9v2.5H6.6v3.5h3.2V22h3.9Z" />}
    {kind === 'instagram' && <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.4" cy="6.6" r="1.1" /></>}
  </svg>
}

function BoardCard({ member, ar, index, count, slide }: { member: EoaBoardMember; ar: boolean; index: number; count: number; slide: boolean }) {
  const name = boardMemberName(ar, member)
  const portrait = boardPortraitUrl(member.portrait_path)
  const [failedPortrait, setFailedPortrait] = useState<string | null>(null)
  const companyUrl = boardExternalUrl(member.company_url)
  const company = boardText(ar, member.company_name_ar, member.company_name_en)
  const companyRole = boardText(ar, member.company_role_ar, member.company_role_en)
  const socials: [SocialKind, string, string | null][] = [
    ['linkedin', 'LinkedIn', member.linkedin_url],
    ['twitter', 'X / Twitter', member.twitter_url],
    ['facebook', 'Facebook', member.facebook_url],
    ['instagram', 'Instagram', member.instagram_url],
  ]

  return <article className={styles.card} dir={ar ? 'rtl' : 'ltr'} aria-roledescription={slide ? (ar ? 'بطاقة عضو' : 'slide') : undefined} aria-label={`${name} · ${index + 1} / ${count}`}>
    <div className={styles.portrait}>
      {portrait && failedPortrait !== portrait
        ? <Image src={portrait} alt={ar && member.slug === 'mohammed-alsolami' && (!member.portrait_alt_ar || member.portrait_alt_ar === member.portrait_alt_en) ? name : boardText(ar, member.portrait_alt_ar, member.portrait_alt_en) || name} width={240} height={240} sizes="144px" unoptimized={!portrait.startsWith('/')} style={{ objectPosition: member.portrait_position || '50% 35%' }} onError={() => setFailedPortrait(portrait)} />
        : <span className={styles.portraitFallback} aria-hidden="true"><UserRound size={46} strokeWidth={1.3} /></span>}
    </div>
    {member.board_term && <span className={styles.term} dir="ltr">{member.board_term}</span>}
    <h3>{name}</h3>
    <p className={styles.position}>{boardText(ar, member.position_ar, member.position_en)}</p>
    <div className={styles.company}>
      {companyRole && <p>{companyRole}</p>}
      {company && <strong>{company}</strong>}
    </div>
    <div className={styles.links} aria-label={ar ? `روابط ${name}` : `${name} links`}>
      {companyUrl && <a href={companyUrl} target="_blank" rel="noopener noreferrer" aria-label={ar ? `موقع شركة ${name} (نافذة جديدة)` : `${name} company website (opens in a new tab)`} title={ar ? 'موقع الشركة' : 'Company website'}><Globe2 size={19} aria-hidden="true" /></a>}
      {socials.map(([kind, label, value]) => {
        const url = boardExternalUrl(value)
        return url ? <a key={kind} href={url} target="_blank" rel="noopener noreferrer" aria-label={ar ? `${name} على ${label} (نافذة جديدة)` : `${name} on ${label} (opens in a new tab)`} title={label}><SocialIcon kind={kind} /></a> : null
      })}
    </div>
  </article>
}

export function EoaBoard({ members, ar, layout = 'carousel' }: { members: EoaBoardMember[]; ar: boolean; layout?: 'carousel' | 'grid' }) {
  const roster = useMemo(() => publishedBoardMembers(members), [members])
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const id = useId()
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedMotionSnapshot, () => true)
  const running = layout === 'carousel' && overflow && !paused && !hovered && !focused && !reducedMotion

  useEffect(() => {
    const element = viewport.current
    const content = track.current
    if (!element || !content) return
    // Keep DOM and keyboard order in roster order; visually start with the first card at the right.
    element.scrollLeft = element.scrollWidth - element.clientWidth
    const measure = () => setOverflow(element.scrollWidth > element.clientWidth + 2)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(content)
    return () => observer.disconnect()
  }, [roster])

  useEffect(() => {
    if (!running) return
    const element = viewport.current
    if (!element) return
    let frame = 0
    let previous = 0
    let boundarySince = 0
    let preciseOffset = element.scrollLeft
    const animate = (time: number) => {
      const elapsed = previous ? Math.min(time - previous, 50) : 0
      previous = time
      if (document.hidden) {
        previous = 0
      } else if (element.scrollLeft <= 1) {
        boundarySince ||= time
        if (time - boundarySince > 2400) {
          preciseOffset = element.scrollWidth - element.clientWidth
          element.scrollLeft = preciseOffset
          boundarySince = 0
        }
      } else {
        boundarySince = 0
        preciseOffset = boardScrollOffset(preciseOffset, element.scrollWidth - element.clientWidth, elapsed * 0.018)
        element.scrollLeft = preciseOffset
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [running, roster])

  function move(direction: 'left' | 'right') {
    const element = viewport.current
    if (!element) return
    setPaused(true)
    const step = (track.current?.firstElementChild?.getBoundingClientRect().width || 280) + 20
    const maximum = element.scrollWidth - element.clientWidth
    let target = boardScrollOffset(element.scrollLeft, maximum, direction === 'right' ? step : -step)
    if (direction === 'right' && element.scrollLeft <= 1) target = maximum
    if (direction === 'left' && element.scrollLeft >= maximum - 1) target = 0
    element.scrollTo({ left: target, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    setPaused(true)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') move(event.key === 'ArrowLeft' ? 'left' : 'right')
    else if (viewport.current) viewport.current.scrollTo({ left: event.key === 'Home' ? viewport.current.scrollWidth : 0, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  if (!roster.length) return null
  return <section className={`eoa-section ${styles.section} ${layout === 'grid' ? styles.gridSection : ''}`} id="board" aria-labelledby={`${id}-title`} aria-roledescription={layout === 'carousel' ? (ar ? 'عارض أعضاء مجلس الإدارة' : 'carousel') : undefined}>
    <div className="eoa-container">
      <div className={styles.heading}>
        <div><span className="eoa-eyebrow">{ar ? 'قيادة المجتمع الريادي' : 'FOUNDERS LEADING FOUNDERS'}</span><h2 id={`${id}-title`}>{ar ? 'مجلس إدارة EO الرياض' : 'EO Riyadh Board'}</h2><p>{ar ? 'تعرّف على رواد الأعمال الذين يقودون مجتمع EO الرياض.' : 'Meet the entrepreneurs leading the EO Riyadh community.'}</p></div>
        {layout === 'carousel' && overflow && <div className={styles.controls} dir="ltr" aria-label={ar ? 'التحكم في عرض أعضاء المجلس' : 'Board carousel controls'}>
          <button type="button" aria-controls={`${id}-cards`} onClick={() => move('left')} aria-label={ar ? 'تحريك البطاقات إلى اليسار' : 'Move cards left'}><ArrowLeft size={20} aria-hidden="true" /></button>
          {!reducedMotion && <button type="button" aria-controls={`${id}-cards`} onClick={() => setPaused(value => !value)} aria-label={paused ? ar ? 'تشغيل الحركة التلقائية' : 'Start automatic movement' : ar ? 'إيقاف الحركة التلقائية' : 'Pause automatic movement'}>{paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}</button>}
          <button type="button" aria-controls={`${id}-cards`} onClick={() => move('right')} aria-label={ar ? 'تحريك البطاقات إلى اليمين' : 'Move cards right'}><ArrowRight size={20} aria-hidden="true" /></button>
        </div>}
      </div>
      <div ref={viewport} id={`${id}-cards`} className={styles.viewport} dir={layout === 'grid' ? (ar ? 'rtl' : 'ltr') : 'ltr'} tabIndex={layout === 'carousel' && overflow ? 0 : undefined} aria-label={ar ? 'أعضاء مجلس الإدارة' : 'Board members'} onKeyDown={layout === 'carousel' ? handleKey : undefined} onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true) }} onPointerLeave={() => setHovered(false)} onPointerDown={() => setPaused(true)} onWheel={() => setPaused(true)} onFocusCapture={() => { setFocused(true); setPaused(true) }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
        <div ref={track} className={layout === 'grid' ? styles.grid : styles.track} aria-live="off">
          {roster.map((member, index) => <BoardCard key={member.id} member={member} ar={ar} index={index} count={roster.length} slide={layout === 'carousel'} />)}
        </div>
      </div>
      <div className={styles.caption}><span>{ar ? `${roster.length} من قادة مجتمع EO الرياض` : `${roster.length} chapter leaders`}</span>{layout === 'carousel' && overflow && <span>{ar ? 'اسحب أو استخدم الأسهم لاستكشاف المجلس' : 'Swipe or use the arrows to explore the board'}</span>}</div>
    </div>
  </section>
}
