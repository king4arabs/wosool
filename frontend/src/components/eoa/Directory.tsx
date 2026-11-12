'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Organization } from '@/lib/eoa'
import { Notice } from './Shared'
import { Search, ArrowUpRight } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { normalizeSearch } from '@/lib/faq-search'
import { eoaOrganizationLogo } from '@/lib/eoa-organizations'
import { publicWebsite } from '@/lib/community-display'
import styles from './PublicDetails.module.css'

export function EoaDirectory({ ar, onOrganizationsChange }: { ar: boolean; onOrganizationsChange?: (organizations: Organization[]) => void }) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const filtered = organizations.filter(organization => normalizeSearch([organization.name_ar, organization.name_en, organization.support_ar, organization.support_en].join(' ')).includes(normalizeSearch(query)))
  const retry = useCallback(() => { setFailed(false); setLoading(true); setAttempt(value => value + 1) }, [])
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    api.get<{ data: Organization[] }>('/eoa/directory', { signal: controller.signal })
      .then(result => { if (active) { setOrganizations(result.data); onOrganizationsChange?.(result.data); setLoading(false) } })
      .catch(() => { if (active) { setFailed(true); setLoading(false) } })
    return () => { active = false; controller.abort() }
  }, [attempt, onOrganizationsChange])

  return <>
    <label className={styles.directorySearch}><Search size={19} aria-hidden="true" /><span className="sr-only">{ar ? 'ابحث عن جهة أو خدمة' : 'Search organizations or services'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={ar ? 'ابحث عن جهة أو خدمة…' : 'Search organizations or services…'} /></label>
    {loading && <Notice>{ar ? 'جارٍ تحميل الدليل…' : 'Loading directory…'}</Notice>}
    {failed && <Notice error>{ar ? 'تعذر تحميل الجهات. يرجى إعادة المحاولة.' : 'Organizations could not be loaded. Please try again.'} <button type="button" className="eoa-text-link" onClick={retry}>{ar ? 'إعادة المحاولة' : 'Try again'}</button></Notice>}
    <div className={styles.directory} data-eoa-directory>
      {filtered.map(o => <article className={`eoa-card ${styles.organization}`} key={o.id}>
        <div className={styles.organizationLogo}><BrandLogo src={eoaOrganizationLogo(o)} name={ar ? o.name_ar : o.name_en} website={o.website} /></div>
        <h3>{ar ? o.name_ar : o.name_en}</h3>
        <p>{ar ? o.support_ar : o.support_en}</p>
        {publicWebsite(o.website) && <a className="eoa-text-link" href={publicWebsite(o.website)} target="_blank" rel="noopener noreferrer" aria-label={`${ar ? 'الموقع الرسمي' : 'Official website'} — ${ar ? o.name_ar : o.name_en}`}>{ar ? 'الموقع الرسمي' : 'Official website'} <ArrowUpRight size={16} aria-hidden="true" /></a>}
      </article>)}
    </div>
    {!loading && !failed && !organizations.length && <Notice>{ar ? 'لا توجد جهات منشورة في الدليل بعد.' : 'No organizations have been published in the directory yet.'}</Notice>}
    {!loading && organizations.length > 0 && !filtered.length && <Notice>{ar ? 'لا توجد جهات مطابقة لبحثك.' : 'No organizations match your search.'} <button type="button" className="eoa-text-link" onClick={() => setQuery('')}>{ar ? 'مسح البحث' : 'Clear search'}</button></Notice>}
  </>
}
