'use client'

import { ArrowLeft, ArrowRight, LayoutGrid, Pause, Play, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { brandLogoNeedsDarkSurface } from '@/lib/brand-logos'
import { uniquePartnerLogos, type PartnerLogo } from '@/lib/partner-logos'
import styles from './PartnerCarousel.module.css'

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
function motionSnapshot() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches }

export function PartnerCarousel({ partners, ar, includeEo = true, headingId, action, emptyState }: { partners: PartnerLogo[]; ar: boolean; includeEo?: boolean; headingId?: string; action?: ReactNode; emptyState?: ReactNode }) {
  const items = useMemo(() => uniquePartnerLogos(partners, includeEo), [includeEo, partners])
  const viewport = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const cycleWidth = useRef(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false)
  const expanded = showAll || reducedMotion
  const looping = items.length > 1 && !expanded
  const running = looping && !paused && !hovered && !focused
  const id = useId()
  const titleId = headingId || `${id}-title`

  useEffect(() => {
    const element = viewport.current
    const content = group.current
    if (!element || !content || !looping) return
    const measure = () => {
      // Half a gap on each edge keeps spacing at the repeat seam equal to the
      // internal spacing. Every group fills at least one viewport.
      element.style.setProperty('--partner-viewport', `${element.clientWidth}px`)
      const width = content.getBoundingClientRect().width
      if (width !== cycleWidth.current) {
        cycleWidth.current = width
        element.scrollLeft = width
      }
    }
    cycleWidth.current = 0
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(content)
    return () => observer.disconnect()
  }, [items, looping])

  useEffect(() => {
    if (!running || !viewport.current) return
    const element = viewport.current
    let frame = 0
    let previous = 0
    let offset = element.scrollLeft
    let measuredWidth = cycleWidth.current
    function animate(time: number) {
      const elapsed = previous ? Math.min(time - previous, 50) : 0
      previous = time
      const width = cycleWidth.current
      if (width !== measuredWidth) { offset = element.scrollLeft; measuredWidth = width }
      if (document.hidden) previous = 0
      else if (width > 0) {
        // Decreasing the LTR offset moves artwork right in both languages.
        // Identical adjacent groups make wrapping invisible.
        offset -= elapsed * .026
        if (offset < width / 2) offset += width
        if (offset > width * 1.5) offset -= width
        element.scrollLeft = offset
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [running, items])

  function move(direction: 'left' | 'right') {
    const element = viewport.current
    const content = group.current
    const width = cycleWidth.current
    if (!element || !content || !width) return
    setPaused(true)
    const children = content.children
    const step = children.length > 1
      ? children[1].getBoundingClientRect().left - children[0].getBoundingClientRect().left
      : width
    const start = ((element.scrollLeft % width) + width) % width + width
    // Rebase to an identical copy before scrolling past either end.
    element.scrollLeft = start > width * 1.5 ? start - width : start
    element.scrollTo({ left: element.scrollLeft + (direction === 'right' ? -step : step), behavior: 'smooth' })
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    setPaused(true)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') move(event.key === 'ArrowLeft' ? 'left' : 'right')
    else if (viewport.current) viewport.current.scrollTo({ left: cycleWidth.current + (event.key === 'End' ? cycleWidth.current - viewport.current.clientWidth : 0), behavior: 'smooth' })
  }

  function logos(copy = false) {
    return items.map(partner => {
      const name = (ar ? partner.name_ar : partner.name_en) || partner.name_en || partner.name_ar
      const artwork = <BrandLogo src={partner.logo_path} name={name} loading="eager" />
      const dark = brandLogoNeedsDarkSurface(partner.logo_path) || undefined
      return <div role="listitem" className={styles.slot} key={`${partner.id}-${partner.logo_path ?? partner.website}`}>
        {partner.website ? <a className={styles.logoFrame} data-dark={dark} data-partner={partner.id} href={partner.website} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined} aria-label={`${name}${ar ? ' (نافذة جديدة)' : ' (opens in a new tab)'}`} title={name}>{artwork}</a> : <div className={styles.logoFrame} data-dark={dark} data-partner={partner.id}>{artwork}</div>}
      </div>
    })
  }

  return <section className={styles.section} aria-labelledby={titleId} data-partner-carousel>
    <div className={styles.container}>
      <div className={styles.heading}>
        <h2 id={titleId}>{ar ? 'نفخر بشركائنا' : 'Proud of our Partners'}</h2>
        <div className={styles.headingActions}>{action}{items.length > 1 && !reducedMotion && <>
          <button className={styles.viewAll} type="button" aria-expanded={showAll} aria-controls={`${id}-logos`} onClick={() => setShowAll(value => !value)}>{showAll ? <X size={16} aria-hidden="true" /> : <LayoutGrid size={16} aria-hidden="true" />}{showAll ? ar ? 'عرض متحرك' : 'Carousel view' : ar ? 'عرض جميع الشركاء' : 'View all partners'}</button>
          {!expanded && <div className={styles.controls} dir="ltr" aria-label={ar ? 'التحكم بعرض الشركاء' : 'Partner carousel controls'}>
            <button type="button" aria-controls={`${id}-logos`} onClick={() => move('left')} aria-label={ar ? 'تحريك الشعارات إلى اليسار' : 'Move logos left'}><ArrowLeft size={18} aria-hidden="true" /></button>
            <button type="button" aria-controls={`${id}-logos`} onClick={() => setPaused(value => !value)} aria-label={paused ? ar ? 'تشغيل حركة الشعارات' : 'Start logo movement' : ar ? 'إيقاف حركة الشعارات' : 'Pause logo movement'}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>
            <button type="button" aria-controls={`${id}-logos`} onClick={() => move('right')} aria-label={ar ? 'تحريك الشعارات إلى اليمين' : 'Move logos right'}><ArrowRight size={18} aria-hidden="true" /></button>
          </div>}
        </>}</div>
      </div>
      {items.length > 0 ? expanded ? <div id={`${id}-logos`} className={styles.grid} role="list" aria-labelledby={titleId}>{logos()}</div> : <div ref={viewport} id={`${id}-logos`} className={styles.viewport} dir="ltr" tabIndex={looping ? 0 : undefined} aria-label={ar ? 'شعارات الشركاء. استخدم السهمين للتنقل.' : 'Partner logos. Use the arrow keys to browse.'} onKeyDown={handleKey} onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true) }} onPointerLeave={() => setHovered(false)} onPointerDown={() => setPaused(true)} onWheel={() => setPaused(true)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
        <div className={styles.track}>
          {(looping ? [0, 1, 2] : [1]).map(copy => <div key={copy} ref={copy === 1 ? group : undefined} className={styles.group} role="list" aria-label={ar ? 'الشركاء' : 'Partners'} aria-hidden={copy !== 1 ? true : undefined}>{logos(copy !== 1)}</div>)}
        </div>
      </div> : emptyState}
    </div>
  </section>
}
