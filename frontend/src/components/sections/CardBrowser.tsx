"use client"

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale"
import styles from "./profile-cards.module.css"

type CardItem = { id: string; content: ReactNode }

function CardRow({ items, row }: { items: CardItem[]; row: number }) {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const id = useId()
  const ref = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => {
      const container = element.getBoundingClientRect()
      const start = direction === "rtl" ? container.right : container.left
      const children = Array.from(element.children) as HTMLElement[]
      let nextIndex = 0
      let distance = Number.POSITIVE_INFINITY
      children.forEach((child, childIndex) => {
        const rect = child.getBoundingClientRect()
        const childStart = direction === "rtl" ? rect.right : rect.left
        const nextDistance = Math.abs(childStart - start)
        if (nextDistance < distance) {
          distance = nextDistance
          nextIndex = childIndex
        }
      })
      setIndex(nextIndex)
    }
    const observer = new ResizeObserver(update)
    observer.observe(element)
    element.addEventListener("scroll", update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      element.removeEventListener("scroll", update)
    }
  }, [direction, items.length])

  function move(delta: number) {
    const element = ref.current
    if (!element) return
    const children = Array.from(element.children) as HTMLElement[]
    const target = Math.max(0, Math.min(children.length - 1, index + delta))
    children[target]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    })
    setIndex(target)
  }

  const PreviousIcon = direction === "rtl" ? ArrowRight : ArrowLeft
  const NextIcon = direction === "rtl" ? ArrowLeft : ArrowRight

  return (
    <div className={styles.row}>
      <div className={styles.controls}>
        <span>{ar ? `الصف ${row}` : `Row ${row}`}</span>
        <div>
          <button type="button" aria-controls={id} aria-label={ar ? `البطاقة السابقة في الصف ${row}` : `Previous card in row ${row}`} disabled={index === 0} onClick={() => move(-1)}>
            <PreviousIcon size={19} aria-hidden="true" />
          </button>
          <button type="button" aria-controls={id} aria-label={ar ? `البطاقة التالية في الصف ${row}` : `Next card in row ${row}`} disabled={index >= items.length - 1} onClick={() => move(1)}>
            <NextIcon size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul id={id} ref={ref} tabIndex={0} dir={direction} className={styles.rail} aria-label={ar ? `بطاقات الملفات، الصف ${row}` : `Profile cards, row ${row}`}>
        {items.map((item) => <li key={item.id}>{item.content}</li>)}
      </ul>
    </div>
  )
}

export function CardBrowser({ items }: { items: CardItem[] }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [rows, setRows] = useState(2)
  const [page, setPage] = useState(1)
  const pageSize = rows * 3
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, pages)
  const visible = useMemo(() => items.slice((current - 1) * pageSize, current * pageSize), [current, items, pageSize])

  const from = items.length ? (current - 1) * pageSize + 1 : 0
  const to = Math.min(current * pageSize, items.length)

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        <p role="status" aria-live="polite">
          {items.length ? (ar ? `عرض ${from}–${to} من ${items.length}` : `Showing ${from}–${to} of ${items.length}`) : (ar ? "لا توجد نتائج مطابقة." : "No matching profiles.")}
        </p>
        <label>
          {ar ? "عدد الصفوف" : "Rows"}
          <select aria-label={ar ? "عدد الصفوف" : "Rows"} value={rows} onChange={(event) => { setRows(Number(event.target.value)); setPage(1) }}>
            {[2, 4, 6].map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        </label>
      </div>

      {Array.from({ length: Math.ceil(visible.length / 3) }, (_, row) => (
        <CardRow key={`${current}-${rows}-${row}`} row={row + 1} items={visible.slice(row * 3, row * 3 + 3)} />
      ))}

      {items.length > 0 && (
        <nav className={styles.pagination} aria-label={ar ? "صفحات البطاقات" : "Profile pages"}>
          <button type="button" disabled={current === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>{ar ? "السابق" : "Previous"}</button>
          <label>
            {ar ? "الصفحة" : "Page"}
            <select aria-label={ar ? "الصفحة" : "Page"} value={current} onChange={(event) => setPage(Number(event.target.value))}>
              {Array.from({ length: pages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
            </select>
            <span aria-hidden="true">/ {pages}</span>
          </label>
          <button type="button" disabled={current === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>{ar ? "التالي" : "Next"}</button>
        </nav>
      )}
    </div>
  )
}
