'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'
import { normalizeSearch } from '@/lib/faq-search'
import styles from './AdminNavigation.module.css'

const groups = [
  { label: ['الطلبات والمشاركون', 'Applications & participants'], keys: ['overview', 'applications', 'tracks', 'enrollment', 'alumni'] },
  { label: ['تشغيل البرنامج', 'Program operations'], keys: ['readiness', 'program', 'finance', 'inquiries', 'report'] },
  { label: ['المحتوى والشراكات', 'Content & partnerships'], keys: ['partners', 'perks', 'board', 'mentors', 'editorial'] },
  { label: ['الفريق والإعدادات', 'Team & settings'], keys: ['accounts', 'access', 'settings'] },
]

export function EoaAdminNavigation({ ar, current, items, platformAdmin, onChange }: { ar: boolean; current: string; items: string[][]; platformAdmin: boolean; onChange: (key: string) => void }) {
  const [query, setQuery] = useState('')
  const menu = useRef<HTMLDetailsElement>(null)
  const selected = items.find(([key]) => key === current)?.[1]
  const matches = items.filter(([, label]) => normalizeSearch(label).includes(normalizeSearch(query)))
  function select(key: string) { onChange(key); if (menu.current) menu.current.open = false }
  return <nav className={styles.navigation} aria-label={ar ? 'خدمات إدارة المسرّعة' : 'Accelerator management services'}>
    <div className={styles.quickLinks}>
      {items.filter(([key]) => ['overview', 'applications', 'enrollment', 'program', 'inquiries'].includes(key)).map(([key, label]) => <button type="button" key={key} aria-pressed={key === current} onClick={() => select(key)}>{label}</button>)}
      {platformAdmin && <Link href="/admin/services">{ar ? 'إدارة وصول' : 'Wosool administration'}</Link>}
    </div>
    <details ref={menu} className={styles.menu}>
      <summary><span>{ar ? 'جميع خدمات المسرّعة' : 'All Accelerator services'}<strong>{selected}</strong></span><ChevronDown size={20} aria-hidden="true" /></summary>
      <div className={styles.content}>
        <label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={ar ? 'ابحث عن خدمة للمسرّعة' : 'Search Accelerator services'} placeholder={ar ? 'ابحث عن خدمة…' : 'Find a service…'} /></label>
        <div className={styles.groups}>{groups.map(group => {
          const visible = matches.filter(([key]) => group.keys.includes(key))
          return visible.length ? <section key={group.keys[0]}><h2>{group.label[ar ? 0 : 1]}</h2>{visible.map(([key, label]) => <button key={key} type="button" aria-pressed={key === current} onClick={() => select(key)}>{label}</button>)}</section> : null
        })}</div>
        {!matches.length && <p role="status">{ar ? 'لا توجد خدمة مطابقة.' : 'No matching services.'}</p>}
      </div>
    </details>
  </nav>
}
