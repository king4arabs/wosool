'use client'

import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react'
import { boardExternalUrl, boardPortraitUrl, boardScrollOffset } from '@/lib/eoa-board'
import { BrandLogo } from '@/components/ui/BrandLogo'
import styles from './PartnerCarousel.module.css'

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
function motionSnapshot() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches }

type PartnerLogo = { id: string | number; name_ar: string; name_en: string; website?: string; logo_path: string }

export function PartnerCarousel({ partners, ar, includeEo = true, headingId, action, emptyState }: { partners: PartnerLogo[]; ar: boolean; includeEo?: boolean; headingId?: string; action?: ReactNode; emptyState?: ReactNode }) {
  const items = useMemo(() => [...new Map([
    ...(includeEo ? [{ id: 0, name_ar: 'EO الرياض', name_en: 'EO Riyadh', website: 'https://eoriyadh.org/', logo_path: '/partners/eo-riyadh.png' }] : []),
    ...partners,
  ].filter(partner => boardPortraitUrl(partner.logo_path)).map(partner => [partner.logo_path, partner])).values()], [includeEo, partners])
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true)
  const running = overflow && !paused && !hovered && !focused && !reducedMotion
  const id = useId()
  const titleId = headingId || `${id}-title`

  useEffect(() => {
    const element = viewport.current
    const content = track.current
    if (!element || !content) return
    element.scrollLeft = element.scrollWidth - element.clientWidth
    const measure = () => setOverflow(element.scrollWidth > element.clientWidth + 2)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(content)
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    if (!running || !viewport.current) return
    const element = viewport.current
    let frame = 0
    let previous = 0
    let boundarySince = 0
    let offset = element.scrollLeft
    function animate(time: number) {
      const elapsed = previous ? Math.min(time - previous, 50) : 0
      previous = time
      if (document.hidden) previous = 0
      else if (element.scrollLeft <= 1) {
        boundarySince ||= time
        if (time - boundarySince > 2200) {
          offset = element.scrollWidth - element.clientWidth
          element.scrollLeft = offset
          boundarySince = 0
        }
      } else {
        boundarySince = 0
        offset = boardScrollOffset(offset, element.scrollWidth - element.clientWidth, elapsed * .021)
        element.scrollLeft = offset
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [running, items])

  function move(direction: 'left' | 'right') {
    const element = viewport.current
    if (!element) return
    setPaused(true)
    const maximum = element.scrollWidth - element.clientWidth
    const gap = track.current ? Number.parseFloat(getComputedStyle(track.current).columnGap) || 20 : 20
    const step = (track.current?.firstElementChild?.getBoundingClientRect().width || 180) + gap
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

  return <section className={styles.section} aria-labelledby={titleId}>
    <div className={styles.container}>
      <div className={styles.heading}>
        <h2 id={titleId}>{ar ? 'نفخر بشركائنا' : 'Proud of Partners'}</h2>
        <div className={styles.headingActions}>{action}{items.length > 0 && overflow && <div className={styles.controls} dir="ltr" aria-label={ar ? 'التحكم بعرض الشركاء' : 'Partner carousel controls'}>
          <button type="button" aria-controls={`${id}-logos`} onClick={() => move('left')} aria-label={ar ? 'تحريك الشعارات إلى اليسار' : 'Move logos left'}><ArrowLeft size={18} aria-hidden="true" /></button>
          {!reducedMotion && <button type="button" aria-controls={`${id}-logos`} onClick={() => setPaused(value => !value)} aria-label={paused ? ar ? 'تشغيل حركة الشعارات' : 'Start logo movement' : ar ? 'إيقاف حركة الشعارات' : 'Pause logo movement'}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>}
          <button type="button" aria-controls={`${id}-logos`} onClick={() => move('right')} aria-label={ar ? 'تحريك الشعارات إلى اليمين' : 'Move logos right'}><ArrowRight size={18} aria-hidden="true" /></button>
        </div>}</div>
      </div>
      {items.length > 0 ? <div ref={viewport} id={`${id}-logos`} className={styles.viewport} dir="ltr" tabIndex={overflow ? 0 : undefined} aria-label={ar ? 'شعارات الشركاء. استخدم السهمين للتنقل.' : 'Partner logos. Use the arrow keys to browse.'} onKeyDown={handleKey} onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true) }} onPointerLeave={() => setHovered(false)} onPointerDown={() => setPaused(true)} onWheel={() => setPaused(true)} onFocusCapture={() => { setFocused(true); setPaused(true) }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
        <div className={styles.track} ref={track}>
          {items.map(partner => {
            const url = boardExternalUrl(partner.website)
            const name = (ar ? partner.name_ar : partner.name_en) || partner.name_en || partner.name_ar
            const artwork = <BrandLogo src={partner.logo_path} name={name} />
            return url ? <a key={partner.logo_path} className={styles.logoFrame} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name}${ar ? ' (نافذة جديدة)' : ' (opens in a new tab)'}`}>{artwork}</a> : <div className={styles.logoFrame} key={partner.logo_path}>{artwork}</div>
          })}
        </div>
      </div> : emptyState}
    </div>
  </section>
}
