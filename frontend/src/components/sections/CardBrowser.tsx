'use client'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import styles from './profile-cards.module.css'

function CardRow({ items, row }: { items: { id: string; content: ReactNode }[]; row: number }) {
  const { locale, direction } = useLocale()
  const ar = locale === 'ar'
  const id = useId()
  const ref = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setEdges({ start: Math.abs(el.scrollLeft) < 2, end: Math.abs(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 2 })
    const observer = new ResizeObserver(update)
    observer.observe(el); el.addEventListener('scroll', update, { passive: true }); update()
    return () => { observer.disconnect(); el.removeEventListener('scroll', update) }
  }, [items.length, direction])
  function move(sign: number) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: sign * ((el.firstElementChild as HTMLElement)?.offsetWidth + 20 || 340), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <div className={styles.row}>
    <div className={styles.controls}><span>{ar ? `الصف ${row}` : `Row ${row}`}</span><div dir="ltr">
      <button type="button" aria-controls={id} aria-label={ar ? `تحريك الصف ${row} لليسار` : `Scroll row ${row} left`} disabled={direction === 'rtl' ? edges.end : edges.start} onClick={() => move(-1)}><ArrowLeft size={19} /></button>
      <button type="button" aria-controls={id} aria-label={ar ? `تحريك الصف ${row} لليمين` : `Scroll row ${row} right`} disabled={direction === 'rtl' ? edges.start : edges.end} onClick={() => move(1)}><ArrowRight size={19} /></button>
    </div></div>
    <ul id={id} ref={ref} tabIndex={0} dir={direction} className={styles.rail} aria-label={ar ? `البطاقات، الصف ${row}` : `Profile cards, row ${row}`}>{items.map(item => <li key={item.id}>{item.content}</li>)}</ul>
  </div>
}

export function CardBrowser({ items }: { items: { id: string; content: ReactNode }[] }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [rows, setRows] = useState(2)
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(items.length / (rows * 3)))
  const current = Math.min(page, pages)
  const visible = items.slice((current - 1) * rows * 3, current * rows * 3)
  return <div className={styles.browser}>
    <div className={styles.toolbar}>
      <p role="status">{items.length ? `${(current - 1) * rows * 3 + 1}–${Math.min(current * rows * 3, items.length)} / ${items.length}` : (ar ? 'لا توجد نتائج مطابقة.' : 'No matching profiles.')}</p>
      <label>{ar ? 'عدد الصفوف' : 'Rows'} <select aria-label={ar ? "عدد الصفوف" : "Rows"} value={rows} onChange={e => { setRows(Number(e.target.value)); setPage(1) }}>{[2,4,6].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
    </div>
    {Array.from({ length: Math.ceil(visible.length / 3) }, (_, i) => <CardRow key={`${current}-${rows}-${i}`} row={i + 1} items={visible.slice(i * 3, i * 3 + 3)} />)}
    {items.length > 0 && <nav className={styles.pagination} aria-label={ar ? 'صفحات البطاقات' : 'Profile pages'}>
      <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>{ar ? 'السابق' : 'Previous'}</button>
      <label>{ar ? 'الصفحة' : 'Page'} <select aria-label={ar ? "الصفحة" : "Page"} value={current} onChange={e => setPage(Number(e.target.value))}>{Array.from({ length: pages }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select> / {pages}</label>
      <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>{ar ? 'التالي' : 'Next'}</button>
    </nav>}
  </div>
}
